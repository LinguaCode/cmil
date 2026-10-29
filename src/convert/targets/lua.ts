/**
 * Lua: what a teacher writes, in Lua 5.4, that prints what the CMIL program prints. Its lists are tables, which count
 * from 1, as CMIL does; its variables are local, declared where the program first gives them a value, or before the
 * block that does when the program has them after it; its texts are joined with .., and its names have only Latin
 * letters, so a name of another alphabet is written in them, like անուն as anun. The helpers a program needs come
 * first, each with what it is for, then the functions of the program, then the program.
 */
import {COMMAND} from '../../constants/index.ts';
import TRANSLATION from '../../translations/index.ts';
import {Grammar, UNARY, mathOf, type Code} from '../code.ts';
import {
  Helpers,
  Names,
  Trivia,
  Writer,
  changesItsList,
  isJoined,
  isText,
  joinedParts,
  negation,
  quoted,
  stepOf,
  type Converted
} from '../emit.ts';
import {branchesOf, loopOf, loopOverValues, statementsOf, type Braces} from '../statements.ts';
import {isList, type Type, type Types} from '../types.ts';
import type {ProgramTree} from '../../program.ts';
import type {Writers} from '../registry.ts';
import type {Expression, Statement} from '../../core/types.ts';

//the words of Lua, its library and the helpers, which a program's names can't be
const RESERVED = new Set(
  [
    'and break do else elseif end false for function goto if in local nil not or repeat return then true until while',
    'print io math string table os utf8 coroutine debug package type tostring tonumber pairs ipairs next select error',
    'assert pcall xpcall require load dofile setmetatable getmetatable rawget rawset rawequal rawlen unpack arg _G',
    '_ENV continue show round_to letters split join contains remove_item value'
  ]
    .join(' ')
    .split(' ')
);

//the precedence of Lua's operators, from the loosest: not binds more tightly than a comparison, so not (a == b) has
//brackets, and ^ more tightly than - before a number, so -2 ^ 2 is -(2 ^ 2)
const PRECEDENCE: Record<string, number> = {
  or: 1,
  and: 2,
  '==': 3,
  '~=': 3,
  '<': 3,
  '>': 3,
  '<=': 3,
  '>=': 3,
  '..': 4,
  '+': 5,
  '-': 5,
  '*': 6,
  '/': 6,
  '%': 6,
  '^': UNARY + 1
};

const OPERATORS: Record<string, string> = {[COMMAND.AND]: 'and', [COMMAND.OR]: 'or', '!=': '~='};

const lua = new Grammar(PRECEDENCE);
const name = (text: string) => lua.atom(text);

//a power: a value with a sign is in brackets before ^, like (-2) ^ 2, and needn't be after it, like 2 ^ -1
const power = (base: Code, exponent: Code) => lua.binary('^', base, exponent, [PRECEDENCE['^'] + 1, UNARY]);

//a text as Lua writes it, like "a \"b\""
const literal = (text: string) => quoted(text, {'\0': '\\0'});

//the blocks of Lua, ended by end, or by until of a loop that tests its condition after its block
const BLOCKS: Braces = {head: text => text, end: 'end', tail: text => text};

type Helper = {code: (words: [string, string]) => string[]; uses?: string[]};

//the helpers, by name, in the order they are written: the helpers they use, and their code
const HELPERS: Record<string, Helper> = {
  show: {
    code: ([yes, no]) => [
      '-- a value as CMIL prints it: a real number with up to 12 digits, and a boolean in words',
      'function show(value)',
      '  if math.type(value) == "float" then',
      '    return string.format("%.12g", value)',
      '  elseif type(value) == "boolean" then',
      `    return value and ${literal(yes)} or ${literal(no)}`,
      '  end',
      '  return tostring(value)',
      'end'
    ]
  },
  letters: {
    code: () => [
      '-- the letters of a text, each a text of its own: a letter like ա has more than one byte',
      'function letters(text)',
      '  local result = {}',
      '  for letter in string.gmatch(text, utf8.charpattern) do',
      '    table.insert(result, letter)',
      '  end',
      '  return result',
      'end'
    ]
  },
  split: {
    uses: ['letters'],
    code: () => [
      '-- the parts of a text between a separator, with the empty ones; without one its words, and its letters for ""',
      'function split(text, separator)',
      '  local parts = {}',
      '  if separator == nil then',
      '    for word in string.gmatch(text, "%S+") do',
      '      table.insert(parts, word)',
      '    end',
      '    return parts',
      '  elseif separator == "" then',
      '    return letters(text)',
      '  end',
      '  local start = 1',
      '  while true do',
      '    local first, last = string.find(text, separator, start, true)',
      '    if first == nil then',
      '      break',
      '    end',
      '    table.insert(parts, string.sub(text, start, first - 1))',
      '    start = last + 1',
      '  end',
      '  table.insert(parts, string.sub(text, start))',
      '  return parts',
      'end'
    ]
  },
  join: {
    uses: ['show'],
    code: () => [
      '-- the items of a list as they are printed, with a separator between them',
      'function join(list, separator)',
      '  local items = {}',
      '  for _, item in ipairs(list) do',
      '    table.insert(items, show(item))',
      '  end',
      '  return table.concat(items, separator)',
      'end'
    ]
  },
  contains: {
    code: () => [
      '-- whether a list has an item',
      'function contains(list, value)',
      '  for _, item in ipairs(list) do',
      '    if item == value then',
      '      return true',
      '    end',
      '  end',
      '  return false',
      'end'
    ]
  },
  removeItem: {
    code: () => [
      '-- removes the first item of a list that is a value',
      'function remove_item(list, value)',
      '  for index, item in ipairs(list) do',
      '    if item == value then',
      '      table.remove(list, index)',
      '      return',
      '    end',
      '  end',
      'end'
    ]
  },
  roundTo: {
    uses: ['show'],
    code: () => [
      '-- a number rounded to a count of decimals, a half up, after rounding it like it is printed, so 1.005 is 1.01',
      'function round_to(number, digits)',
      '  local factor = 10 ^ digits',
      '  return math.floor(tonumber(show(number * factor)) + 0.5) / factor',
      'end'
    ]
  }
};

//whether the block of a loop has a continue of its own, rather than of a loop inside it, which goto continue writes
const continuesOut = (statements: Statement[]): boolean =>
  statements.some(
    statement =>
      statement.type === 'continue' ||
      (statement.type === 'if' && [...statement.branches.map(({body}) => body), statement.elseBody].some(continuesOut))
  );

/**
 * Writes a program in Lua.
 */
export const toLua = (tree: ProgramTree, types: Types, sourceCode: string): Converted => {
  const names = new Names(tree.names, RESERVED, {latin: true});
  const trivia = new Trivia(tree.comments, sourceCode, '--');
  const helpers = new Helpers(HELPERS);
  const {words: commands} = TRANSLATION[tree.language];
  const words: [string, string] = [commands.true[0], commands.false[0]];
  const english = tree.language === 'en';

  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';
  const code = (node: Expression) => lua.print(expression(node));
  const math = (method: string, args: Code[]) => lua.call(`math.${method}`, args);

  //a boolean in the words of the program's language, as CMIL prints it
  const inWords = (node: Expression) =>
    lua.atom(
      `${lua.print(lua.bracketed(expression(node), PRECEDENCE.and + 1))} and ${literal(words[0])} or ${literal(words[1])}`,
      0
    );

  //a value as a text: a whole number and a text as they are, a boolean in words, and a real number, which Lua
  //would print like 3.0, as CMIL prints it
  const asText = (node: Expression): Code => {
    const type = typeOf(node);
    if (type === 'whole' || type === 'text') return expression(node);
    if (type === 'boolean') return english ? lua.call('tostring', [expression(node)]) : inWords(node);
    helpers.use('show');
    return lua.call('show', [expression(node)]);
  };

  //values joined into a text with .., like "Hi, " .. name
  //a whole number alone, like "{1 + 1}", is no text without a .. to join it
  const joinText = (parts: Expression[]): Code =>
    parts.length === 1 && typeOf(parts[0]) === 'whole'
      ? lua.call('tostring', [expression(parts[0])])
      : parts.map(asText).reduce((left, right) => lua.binary('..', left, right));

  const expression = (node: Expression): Code => {
    switch (node.type) {
      case 'value':
        if (node.constant) return node.constant === 'pi' ? name('math.pi') : math('exp', [name('1')]);
        if (typeof node.value === 'string') return name(literal(node.value));
        if (typeof node.value === 'number' && node.value < 0) return lua.unary('-', name(String(-node.value)));
        return name(String(node.value));
      case 'list':
        return lua.items('{', node.items.map(expression), '}');
      case 'template':
        return joinText(joinedParts(node, types));
      case 'variable':
        return name(names.of(node.name));
      case 'index':
        //a list counts from 1, as CMIL does, a list written in place is in brackets, like ({5, 6})[2], and a text has
        //bytes, so its letters are a list
        if (isList(typeOf(node.target))) {
          const list = expression(node.target);
          return lua.index(list.kind === 'items' ? {kind: 'paren', inner: list} : list, expression(node.index));
        }
        helpers.use('letters');
        return lua.index(lua.call('letters', [expression(node.target)]), expression(node.index));
      case 'input':
        return typeOf(node) === 'real' ? lua.call('tonumber', [lua.call('io.read', [])]) : lua.call('io.read', []);
      case 'userCall':
        return lua.call(names.of(node.name), node.args.map(expression));
      case 'call':
        return builtIn(node);
      case 'unary':
        if (node.operator === COMMAND.NOT) return lua.unary('not ', expression(node.operand));
        //Lua has no + of one number, which is the number
        if (node.operator === '+') return expression(node.operand);
        return lua.unary(node.operator, expression(node.operand));
      case 'binary':
        return binary(node);
    }
  };

  const binary = (node: Expression & {type: 'binary'}): Code => {
    if (node.operator === '+' && typeOf(node) === 'text') return joinText(joinedParts(node, types));
    if (node.operator === COMMAND.IN) {
      if (isList(typeOf(node.right))) {
        helpers.use('contains');
        return lua.call('contains', [expression(node.right), expression(node.left)]);
      }
      //a text in a text, found as it is, true for plain, not as a pattern
      const found = lua.call('string.find', [expression(node.right), expression(node.left), name('1'), name('true')]);
      return lua.binary('~=', found, name('nil'));
    }
    const operator = OPERATORS[node.operator] ?? node.operator;
    return lua.binary(operator, expression(node.left), expression(node.right));
  };

  const builtIn = (node: Expression & {type: 'call'}): Code => {
    const args = node.args.map(expression);
    const [first] = node.args;
    switch (node.name) {
      case COMMAND.POW:
        return power(args[0], args[1]);
      case COMMAND.SQR: {
        if (first.type === 'variable' || first.type === 'value') return lua.binary('*', args[0], args[0]);
        //^ gives a real number, also of whole ones
        const square = power(args[0], name('2'));
        return typeOf(node) === 'whole' ? math('tointeger', [square]) : square;
      }
      case COMMAND.ROUND:
        if (args.length === 2) {
          helpers.use('roundTo');
          return lua.call('round_to', args);
        }
        if (typeOf(first) === 'whole') return args[0];
        return math('floor', [lua.binary('+', args[0], name('0.5'))]);
      case COMMAND.FLOOR:
      case COMMAND.CEIL:
        return typeOf(first) === 'whole' ? args[0] : math(node.name, args);
      case COMMAND.ABS:
        return math('abs', args);
      case COMMAND.LG:
        return math('log', [args[0], name('10')]);
      case COMMAND.LOG:
        return math('log', [args[1], args[0]]);
      case COMMAND.RANDOM:
        return math('random', args.length === 1 ? [name('1'), args[0]] : args);
      case COMMAND.LENGTH:
        return isList(typeOf(first)) ? lua.unary('#', args[0]) : lua.call('utf8.len', args);
      case COMMAND.UPPER:
        return lua.call('string.upper', args);
      case COMMAND.LOWER:
        return lua.call('string.lower', args);
      case COMMAND.NUMBER:
        return typeOf(first) === 'text' ? lua.call('tonumber', args) : args[0];
      case COMMAND.TEXT: {
        const type = typeOf(first);
        if (type === 'text') return args[0];
        if (type === 'whole') return lua.call('tostring', args);
        return asText(first);
      }
      case COMMAND.SPLIT:
        helpers.use('split');
        return lua.call('split', args);
      case COMMAND.JOIN: {
        const separator = args[1] ?? name('""');
        const list = typeOf(first);
        const item = isList(list) ? list.list : 'unknown';
        if (item === 'text' || item === 'whole') return lua.call('table.concat', [args[0], separator]);
        helpers.use('join');
        return lua.call('join', [args[0], separator]);
      }
    }
    const formula = mathOf(
      lua,
      node.name,
      args,
      (method, values) => math(method, values),
      () => name('math.pi')
    );
    if (formula) return formula;
    throw new Error(`No Lua for ${node.name}`);
  };

  //what print prints: a value as it is, or as CMIL prints it
  const printed = (node: Expression): string => {
    if (isText(node) && node.value === '') return '';
    if (isJoined(node, types)) return lua.print(joinText(joinedParts(node, types)));
    const type = typeOf(node);
    return type === 'boolean' && english ? code(node) : lua.print(asText(node));
  };

  const block = statementsOf({
    trivia,
    names,
    braces: BLOCKS,
    declare: variable => [`local ${names.of(variable)}`],
    write: (statement, context) => {
      const {comment, declares} = context;
      //a loop over a range or a list, whose variable is the loop's own
      const each = (
        loop: Statement & {type: 'for' | 'forEach'},
        head: (variable: string) => string,
        more: {last?: () => void}
      ) => {
        const own = names.of(loop.name);
        const assign = (value: string) => `${declares ? 'local ' : ''}${own} = ${value}`;
        return loopOverValues(context, loop, own, head, assign, more);
      };
      //the label goto continue goes to, at the end of the block of a loop with a continue
      const continued = (body: Statement[]) => (continuesOut(body) ? {last: () => context.line('::continue::')} : {});
      switch (statement.type) {
        case 'print':
          context.line(`print(${printed(statement.expression)})${comment}`);
          return;
        case 'assign':
          context.line(
            `${declares ? 'local ' : ''}${names.of(statement.name)} = ${code(statement.expression)}${comment}`
          );
          return;
        case 'setItem':
          context.line(
            `${lua.print(lua.index(expression(statement.target), expression(statement.index)))} = ${code(statement.expression)}${comment}`
          );
          return;
        case 'add':
          context.line(
            `${lua.print(lua.call('table.insert', [expression(statement.target), expression(statement.expression)]))}${comment}`
          );
          return;
        case 'remove':
          helpers.use('removeItem');
          context.line(
            `${lua.print(lua.call('remove_item', [expression(statement.target), expression(statement.expression)]))}${comment}`
          );
          return;
        case 'call':
          context.line(`${code(statement.call)}${comment}`);
          return;
        case 'return':
          context.line(`return${statement.expression ? ` ${code(statement.expression)}` : ''}${comment}`);
          return;
        case 'if':
          context.blocks(
            branchesOf(statement, (condition, index) => `${index ? 'elseif' : 'if'} ${code(condition)} then`)
          );
          return;
        case 'while':
          context.blocks([loopOf(statement, `while ${code(statement.condition)} do`, continued(statement.body))]);
          return;
        case 'doWhile':
          //a loop that ends when its condition is false at the end of its block
          context.blocks(
            [{text: 'repeat', line: statement.doLine, body: statement.body, ...continued(statement.body)}],
            {text: `until ${code(negation(statement.condition, types))}`, line: statement.line}
          );
          return;
        case 'repeat':
          context.blocks([loopOf(statement, `for _ = 1, ${code(statement.count)} do`, continued(statement.body))]);
          return;
        case 'for': {
          const {down, size} = stepOf(statement);
          const step = size
            ? `, ${down ? '-' : ''}${lua.print(lua.bracketed(expression(size), UNARY))}`
            : down
              ? ', -1'
              : '';
          const range = `${code(statement.from)}, ${code(statement.to)}${step}`;
          context.blocks([each(statement, variable => `for ${variable} = ${range} do`, continued(statement.body))]);
          return;
        }
        case 'forEach': {
          const type = typeOf(statement.expression);
          let head: (variable: string) => string;
          if (!isList(type)) {
            //the letters of a text, each a text of its own
            const text = code(statement.expression);
            head = variable => `for ${variable} in string.gmatch(${text}, utf8.charpattern) do`;
          } else {
            //the loop changes the list, so it goes over a copy: the items the list had when the loop started
            let items = code(statement.expression);
            if (changesItsList(statement)) items = `{table.unpack(${items})}`;
            head = variable => `for _, ${variable} in ipairs(${items}) do`;
          }
          context.blocks([each(statement, head, continued(statement.body))]);
          return;
        }
        case 'break':
          context.line(`break${comment}`);
          return;
        case 'continue':
          context.line(`goto continue${comment}`);
          return;
      }
    }
  });

  //the functions of the program, then the program
  const program = new Writer('  ');
  for (const statement of tree.statements) {
    if (statement.type !== 'function') continue;
    trivia.before(program, statement.line);
    const parameters = statement.parameters.map(parameter => names.of(parameter));
    program.line(
      `function ${names.of(statement.name)}(${parameters.join(', ')})${trivia.after(statement.line)}`,
      statement.line
    );
    program.block(() =>
      block(program, statement.body, types.variables.get(statement.name)!, new Set(statement.parameters))
    );
    program.line('end');
    program.blank();
  }
  block(program, tree.statements, types.variables.get('')!, new Set());
  trivia.rest(program);

  const out = new Writer('  ');
  helpers.write(out, helper => helper.code(words));
  out.blank();
  out.append(program);
  return out.converted();
};

/** The writer of Lua: its targets, which cmil/convert/lua gives convert(). */
export const WRITERS: Writers = {lua: {typed: false, write: toLua}};
