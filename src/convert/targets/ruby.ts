/**
 * Ruby: what a teacher writes, that prints what the CMIL program prints, laid out as RuboCop lays it out. Its texts
 * with values in them have the values in them, like "Hi, #{name}!", and it repeats with times and goes over a list
 * with each; a loop that makes a variable the program has after it, which the block of each would keep to itself, is
 * a for. A name starts with a small letter, since a name with a capital first is a constant. Ruby runs a program
 * from its top, so the helpers a program needs come first, each with what it is for, then the functions of the
 * program, then the program.
 */
import {COMMAND} from '../../constants/index.ts';
import TRANSLATION from '../../translations/index.ts';
import {Grammar, UNARY, fromZero, mathOf, type Code} from '../code.ts';
import {
  Helpers,
  Names,
  Trivia,
  Writer,
  assignedIn,
  changesItsList,
  isJoined,
  isNumeral,
  isText,
  joinedParts,
  quoted,
  readIn,
  stepOf,
  type Converted
} from '../emit.ts';
import {branchesOf, loopOf, statementsOf, type Braces, type Context} from '../statements.ts';
import {isList, type Type, type Types} from '../types.ts';
import type {ProgramTree} from '../../program.ts';
import type {Writers} from '../registry.ts';
import type {Expression, Statement} from '../../core/types.ts';

//the words of Ruby, and the methods of its library and of the helpers, which a program's names can't be
const RESERVED = new Set(
  [
    'BEGIN END alias and begin break case class def defined do else elsif end ensure false for if in module next nil',
    'not or redo rescue retry return self super then true undef unless until when while yield puts print p pp gets',
    'rand format loop raise require exit abort sleep lambda proc show round_to'
  ]
    .join(' ')
    .split(' ')
);

//the precedence of Ruby's operators, from the loosest: a range binds most loosely, and ** more tightly than - before
//a number, so -2**2 is -(2**2)
const PRECEDENCE: Record<string, number> = {
  '..': 1,
  '||': 2,
  '&&': 3,
  '==': 4,
  '!=': 4,
  '<': 5,
  '>': 5,
  '<=': 5,
  '>=': 5,
  '<<': 6,
  '+': 7,
  '-': 7,
  '*': 8,
  '/': 8,
  '%': 8,
  '**': UNARY + 1
};

const OPERATORS: Record<string, string> = {[COMMAND.AND]: '&&', [COMMAND.OR]: '||'};

//a range and a power without spaces around them, as RuboCop writes them, like 1..10 and x**2
const ruby = new Grammar(PRECEDENCE, new Set(['..', '**']));
const name = (text: string) => ruby.atom(text);

//a comparison, which Ruby doesn't chain, so a comparison in it is in brackets
const compare = (operator: string, left: Code, right: Code) => {
  const precedence = PRECEDENCE[operator];
  return ruby.binary(operator, left, right, [precedence + 1, precedence + 1]);
};

//a power: a value with a sign is in brackets before **, like (-2)**2, and needn't be after it, like 2**-1
const power = (base: Code, exponent: Code) => ruby.binary('**', base, exponent, [PRECEDENCE['**'] + 1, UNARY]);

//a text as Ruby writes it, in double quotes, with \# before a #{, #@ or #$, which would put a value in it
const literal = (text: string) => quoted(text).replace(/#(?=[{@$])/g, '\\#');

//the blocks of Ruby, ended by end, or by end while of a loop that tests its condition after its block
const BLOCKS: Braces = {head: text => text, end: 'end', tail: text => text};

type Helper = {code: (words: [string, string]) => string[]; uses?: string[]};

//the helpers, by name, in the order they are written: the helpers they use, and their code
const HELPERS: Record<string, Helper> = {
  show: {
    code: ([yes, no]) => [
      '# a value as CMIL prints it: a real number with up to 12 digits, and a boolean in words',
      'def show(value)',
      '  if value.is_a?(Float)',
      "    format('%.12g', value)",
      '  elsif value == true || value == false',
      `    value ? ${literal(yes)} : ${literal(no)}`,
      '  else',
      '    value.to_s',
      '  end',
      'end'
    ]
  },
  roundTo: {
    uses: ['show'],
    code: () => [
      '# a number rounded to a count of decimals, a half up, after rounding it like it is printed, so 1.005 is 1.01',
      'def round_to(number, digits)',
      '  factor = 10.0**digits',
      '  (show(number * factor).to_f + 0.5).floor / factor',
      'end'
    ]
  }
};

//a name that starts with a small letter, since a name with a capital first is a constant in Ruby, like X
const smallFirst = (spelling: string) => spelling.charAt(0).toLowerCase() + spelling.slice(1);

/**
 * Writes a program in Ruby.
 */
export const toRuby = (tree: ProgramTree, types: Types, sourceCode: string): Converted => {
  const names = new Names(tree.names, RESERVED, {rewrite: smallFirst});
  const trivia = new Trivia(tree.comments, sourceCode, '#');
  const helpers = new Helpers(HELPERS);
  const {words: commands} = TRANSLATION[tree.language];
  const words: [string, string] = [commands.true[0], commands.false[0]];
  const english = tree.language === 'en';

  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';
  const code = (node: Expression) => ruby.print(expression(node));

  //a boolean in the words of the program's language, as CMIL prints it
  const inWords = (node: Expression) =>
    ruby.atom(
      `${ruby.print(ruby.bracketed(expression(node), PRECEDENCE['||'] + 1))} ? ${literal(words[0])} : ${literal(words[1])}`,
      0
    );

  //a value Ruby prints as CMIL does: a whole number, a text and a boolean in English
  const native = (type: Type): boolean => type === 'whole' || type === 'text' || (type === 'boolean' && english);

  //a value as CMIL prints it, in a text
  const asText = (node: Expression): Code => {
    const type = typeOf(node);
    if (type === 'boolean' && !english) return inWords(node);
    if (native(type)) return expression(node);
    helpers.use('show');
    return ruby.call('show', [expression(node)]);
  };

  //values joined into a text, each in #{ }, like "Hi, #{name}!"
  const interpolated = (parts: Expression[]): Code => {
    if (parts.length === 1 && isText(parts[0])) return name(literal(parts[0].value));
    const text = parts.map(part =>
      isText(part) ? literal(part.value).slice(1, -1) : `#{${ruby.print(asText(part))}}`
    );
    return name(`"${text.join('')}"`);
  };

  //a number in the place of a real one, which ** of whole numbers would make a fraction, like 2**-1, 1/2
  const real = (node: Expression): Code =>
    typeOf(node) !== 'whole'
      ? expression(node)
      : isNumeral(node)
        ? name(`${node.value}.0`)
        : ruby.member(expression(node), 'to_f');

  const expression = (node: Expression): Code => {
    switch (node.type) {
      case 'value':
        if (node.constant) return name(node.constant === 'pi' ? 'Math::PI' : 'Math::E');
        if (typeof node.value === 'string') return name(literal(node.value));
        if (typeof node.value === 'number' && node.value < 0) return ruby.unary('-', name(String(-node.value)));
        return name(String(node.value));
      case 'list':
        return ruby.items('[', node.items.map(expression), ']');
      case 'template':
        return interpolated(joinedParts(node, types));
      case 'variable':
        return name(names.of(node.name));
      case 'index':
        //a letter of a text is a text too
        return ruby.index(expression(node.target), fromZero(ruby, node.index, expression));
      case 'input':
        return ruby.member(name('gets'), typeOf(node) === 'real' ? 'to_f' : 'chomp');
      case 'userCall':
        return ruby.call(names.of(node.name), node.args.map(expression));
      case 'call':
        return builtIn(node);
      case 'unary':
        return ruby.unary(node.operator === COMMAND.NOT ? '!' : node.operator, expression(node.operand));
      case 'binary':
        return binary(node);
    }
  };

  const binary = (node: Expression & {type: 'binary'}): Code => {
    const left = typeOf(node.left);
    const right = typeOf(node.right);

    if (node.operator === '+' && typeOf(node) === 'text') return interpolated(joinedParts(node, types));
    if (node.operator === COMMAND.IN) return ruby.member(expression(node.right), 'include?', [expression(node.left)]);
    //a whole number divided by a whole number is a whole number in Ruby, and fdiv() a real one
    if (node.operator === '/' && left === 'whole' && right === 'whole') {
      return ruby.member(expression(node.left), 'fdiv', [expression(node.right)]);
    }
    const operator = OPERATORS[node.operator] ?? node.operator;
    if (PRECEDENCE[operator] === PRECEDENCE['=='] || PRECEDENCE[operator] === PRECEDENCE['<']) {
      return compare(operator, expression(node.left), expression(node.right));
    }
    return ruby.binary(operator, expression(node.left), expression(node.right));
  };

  const builtIn = (node: Expression & {type: 'call'}): Code => {
    const args = node.args.map(expression);
    const [first] = node.args;
    //a whole number is its own floor, ceiling and rounding
    const rounded = (method: string): Code => (typeOf(first) === 'whole' ? args[0] : ruby.member(args[0], method));
    switch (node.name) {
      case COMMAND.POW:
        return power(real(first), args[1]);
      case COMMAND.SQR:
        return power(args[0], name('2'));
      case COMMAND.ROUND:
        if (args.length === 2) {
          helpers.use('roundTo');
          return ruby.call('round_to', args);
        }
        if (typeOf(first) === 'whole') return args[0];
        //round rounds a half away from zero
        return ruby.member({kind: 'paren', inner: ruby.binary('+', args[0], name('0.5'))}, 'floor');
      case COMMAND.FLOOR:
        return rounded('floor');
      case COMMAND.CEIL:
        return rounded('ceil');
      case COMMAND.ABS:
        return ruby.member(args[0], 'abs');
      case COMMAND.LOG:
        return ruby.call('Math.log', [args[1], args[0]]);
      case COMMAND.RANDOM: {
        const [min, max] = args.length === 1 ? [name('1'), args[0]] : args;
        return ruby.call('rand', [ruby.binary('..', min, max)]);
      }
      case COMMAND.LENGTH:
        return ruby.member(args[0], 'length');
      case COMMAND.UPPER:
        return ruby.member(args[0], 'upcase');
      case COMMAND.LOWER:
        return ruby.member(args[0], 'downcase');
      case COMMAND.NUMBER:
        return typeOf(first) === 'real' ? args[0] : ruby.member(args[0], 'to_f');
      case COMMAND.TEXT: {
        const type = typeOf(first);
        if (type === 'text') return args[0];
        if (type === 'boolean' && !english) return inWords(first);
        if (native(type)) return ruby.member(args[0], 'to_s');
        return asText(first);
      }
      case COMMAND.SPLIT: {
        const separator = node.args[1];
        //the words of a text, between its spaces, its letters, each a text of its own, and its parts, with the empty
        //ones at its end too, which split drops without -1
        if (!separator) return ruby.member(args[0], 'split');
        if (isText(separator) && separator.value === '') return ruby.member(args[0], 'chars');
        return ruby.member(args[0], 'split', [args[1], name('-1')]);
      }
      case COMMAND.JOIN: {
        const separator = args[1] ?? name('""');
        const list = typeOf(first);
        const item = isList(list) ? list.list : 'unknown';
        if (item === 'text' || item === 'whole' || (item === 'boolean' && english)) {
          return ruby.member(args[0], 'join', [separator]);
        }
        helpers.use('show');
        return name(`${ruby.print(ruby.member(args[0], 'map'))} { |item| show(item) }.join(${ruby.print(separator)})`);
      }
    }
    const formula = mathOf(
      ruby,
      node.name,
      args,
      (method, values) => ruby.call(`Math.${method}`, values),
      () => name('Math::PI')
    );
    if (formula) return formula;
    throw new Error(`No Ruby for ${node.name}`);
  };

  //what puts prints
  const printed = (node: Expression): string => {
    if (isText(node) && node.value === '') return 'puts';
    if (isJoined(node, types)) return `puts ${ruby.print(interpolated(joinedParts(node, types)))}`;
    return `puts ${ruby.print(asText(node))}`;
  };

  //whether a loop can be a block, like 3.times do, whose variables are its own: when the loop gives a value only to
  //variables the program has before it
  const asBlock = (context: Context, body: Statement[]) =>
    [...assignedIn(body).keys()].every(variable => context.declared.has(variable));

  const block = statementsOf({
    trivia,
    names,
    braces: BLOCKS,
    write: (statement, context) => {
      const {comment, declares} = context;
      switch (statement.type) {
        case 'print':
          context.line(`${printed(statement.expression)}${comment}`);
          return;
        case 'assign':
          context.line(`${names.of(statement.name)} = ${code(statement.expression)}${comment}`);
          return;
        case 'setItem': {
          const item = ruby.index(expression(statement.target), fromZero(ruby, statement.index, expression));
          context.line(`${ruby.print(item)} = ${code(statement.expression)}${comment}`);
          return;
        }
        case 'add':
          context.line(
            `${ruby.print(ruby.binary('<<', expression(statement.target), expression(statement.expression)))}${comment}`
          );
          return;
        case 'remove': {
          const list = expression(statement.target);
          const found = ruby.member(list, 'index', [expression(statement.expression)]);
          context.line(`${ruby.print(ruby.member(list, 'delete_at', [found]))}${comment}`);
          return;
        }
        case 'call':
          context.line(`${code(statement.call)}${comment}`);
          return;
        case 'return':
          context.line(`return${statement.expression ? ` ${code(statement.expression)}` : ''}${comment}`);
          return;
        case 'if':
          context.blocks(branchesOf(statement, (condition, index) => `${index ? 'elsif' : 'if'} ${code(condition)}`));
          return;
        case 'while':
          context.blocks([loopOf(statement, `while ${code(statement.condition)}`)]);
          return;
        case 'doWhile':
          //a loop that tests its condition after its block, whose variables are the program's
          context.blocks([{text: 'begin', line: statement.doLine, body: statement.body}], {
            text: `end while ${code(statement.condition)}`,
            line: statement.line
          });
          return;
        case 'repeat': {
          const count =
            typeOf(statement.count) === 'whole'
              ? expression(statement.count)
              : ruby.member(expression(statement.count), 'to_i');
          if (asBlock(context, statement.body)) {
            context.blocks([loopOf(statement, `${ruby.print(ruby.member(count, 'times'))} do`)]);
          } else {
            context.blocks([loopOf(statement, `for _ in ${ruby.print(ruby.binary('..', name('1'), count))}`)]);
          }
          return;
        }
        case 'for': {
          const counter = names.of(statement.name);
          const {down, size, signed} = stepOf(statement);
          const from = expression(statement.from);
          const to = expression(statement.to);
          const whole = typeOf(statement.from) === 'whole' && (!size || typeOf(size) === 'whole');
          //step of a whole counter to a real last value would give real numbers, so it goes to the whole number the
          //counter reaches: by the sign of a step that shows only as the program runs
          const reached = (down: boolean) => ruby.member(to, down ? 'ceil' : 'floor');
          const limit = !(whole && typeOf(statement.to) === 'real')
            ? to
            : signed
              ? name(
                  `${ruby.print(ruby.binary('>', expression(size!), name('0')))} ? ${ruby.print(reached(false))} : ${ruby.print(reached(true))}`
                )
              : reached(down);
          //the values of the counter: a range up by 1, downto, or step, with the sign of the step, which a real counter
          //always takes, since a range of real numbers has no each
          const by = size ? expression(size) : name('1');
          const values =
            whole && !size && !down
              ? ruby.binary('..', from, to)
              : whole && !size
                ? ruby.member(from, 'downto', [to])
                : ruby.member(from, 'step', [limit, down ? ruby.unary('-', by) : by]);
          //a block, like (1..10).each do |i|, whose counter is its own, when the program has the counter nowhere else,
          //else a for, whose counter keeps its last value after it
          const unused = !readIn(statement.body).has(statement.name) && !assignedIn(statement.body).has(statement.name);
          if (declares && asBlock(context, statement.body)) {
            const each = values.kind === 'binary' ? ruby.member(values, 'each') : values;
            context.blocks([loopOf(statement, `${ruby.print(each)} do${unused ? '' : ` |${counter}|`}`)]);
          } else {
            context.blocks([loopOf(statement, `for ${counter} in ${ruby.print(values)}`)]);
          }
          return;
        }
        case 'forEach': {
          const type = typeOf(statement.expression);
          let items = expression(statement.expression);
          //the letters of a text, each a text of its own
          if (!isList(type)) items = ruby.member(items, 'chars');
          //the loop changes the list, so it goes over a copy: the items the list had when the loop started
          else if (changesItsList(statement)) items = ruby.member(items, 'dup');
          const variable = names.of(statement.name);
          if (declares && asBlock(context, statement.body)) {
            context.blocks([loopOf(statement, `${ruby.print(ruby.member(items, 'each'))} do |${variable}|`)]);
          } else {
            context.blocks([loopOf(statement, `for ${variable} in ${ruby.print(items)}`)]);
          }
          return;
        }
        case 'break':
          context.line(`break${comment}`);
          return;
        case 'continue':
          context.line(`next${comment}`);
          return;
      }
    }
  });

  //the functions of the program first, then the program
  const program = new Writer('  ');
  for (const statement of tree.statements) {
    if (statement.type !== 'function') continue;
    trivia.before(program, statement.line);
    const parameters = statement.parameters.map(parameter => names.of(parameter));
    program.line(
      `def ${names.of(statement.name)}${parameters.length ? `(${parameters.join(', ')})` : ''}${trivia.after(statement.line)}`,
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

/** The writer of Ruby: its targets, which cmil/convert/ruby gives convert(). */
export const WRITERS: Writers = {ruby: {typed: false, write: toRuby}};
