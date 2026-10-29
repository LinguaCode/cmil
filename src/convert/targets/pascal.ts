/**
 * Pascal: what a teacher writes, in Free Pascal, that prints what the CMIL program prints. Numbers are Integer or
 * Double, texts string, lists dynamic arrays of a type named like TIntegerArray; every variable is declared in the
 * var of its program or function, and names have only Latin letters, so a name of another alphabet is written in
 * them, like անուն as anun. The helpers a program needs come first, each with what it is for.
 */
import {COMMAND} from '../../constants/index.ts';
import TRANSLATION from '../../translations/index.ts';
import {Grammar, fromZero, mathOf, signedTest, type Code} from '../code.ts';
import {
  Helpers,
  Names,
  Trivia,
  Writer,
  assignedIn,
  callsIn,
  changedIn,
  sharedListsOf,
  changesItsList,
  isJoined,
  joinedParts,
  negation,
  neverEqual,
  stepOf,
  type Converted
} from '../emit.ts';
import {branchesOf, loopOf, statementsOf, type Braces} from '../statements.ts';
import {isList, isNumber, type Type, type Types} from '../types.ts';
import type {ProgramTree} from '../../program.ts';
import type {Writers} from '../registry.ts';
import type {Expression, Statement} from '../../core/types.ts';

//the words of Pascal and the names of its units and of the helpers, in small letters, which a program's names can't
//be, whatever their case
const RESERVED = new Set(
  [
    'and array as asm begin case class const constructor destructor div do downto else end except exports file',
    'finalization finally for function goto if implementation in inherited initialization inline interface is label',
    'library mod nil not object of on operator or out packed procedure program property raise record repeat',
    'resourcestring set shl shr string then threadvar to try type unit until uses var while with xor result exit',
    'true false integer double boolean char main sysutils math writeln write readln length setlength high low copy',
    'pos random randomize round floor ceil abs sqr sqrt sin cos tan arctan arcsin arccos cot ln log10 logn power exp',
    'pi fmod inttostr floattostrf strtofloat uppercase lowercase delete insert break continue show letters',
    'lettercount letterof contains removeitem join roundto readtext readnumber tstringarray'
  ]
    .join(' ')
    .split(' ')
);

//the precedence of Pascal's operators, from the loosest: a comparison binds more loosely than and and or
const PRECEDENCE: Record<string, number> = {
  '=': 1,
  '<>': 1,
  '<': 1,
  '>': 1,
  '<=': 1,
  '>=': 1,
  or: 2,
  '+': 2,
  '-': 2,
  and: 3,
  '*': 3,
  '/': 3,
  mod: 3
};
//not binds more tightly than and and or
const NOT = 4;

const OPERATORS: Record<string, string> = {
  [COMMAND.AND]: 'and',
  [COMMAND.OR]: 'or',
  '==': '=',
  '!=': '<>',
  '%': 'mod'
};

//a text as Pascal writes it, in single quotes with '' for a quote, and #10 for a new line and #9 for a tab
const literal = (text: string): string => {
  if (!text) return "''";
  return text
    .split(/([\n\t])/)
    .filter(part => part !== '')
    .map(part => (part === '\n' ? '#10' : part === '\t' ? '#9' : `'${part.replaceAll("'", "''")}'`))
    .join('');
};

const pas = new Grammar(PRECEDENCE);
const name = (text: string) => pas.atom(text);

//Pascal's blocks, between begin and end;, which is end before else
const BLOCKS: Braces = {head: text => text, open: 'begin', close: 'end;', tail: text => text};

//the functions of math by the names most languages give them, as Pascal names them, and whether they are in its unit
//Math rather than in the language
const PASCAL_MATH: Record<string, [string, boolean]> = {
  sqrt: ['Sqrt', false],
  pow: ['Power', true],
  sin: ['Sin', false],
  cos: ['Cos', false],
  tan: ['Tan', true],
  asin: ['ArcSin', true],
  acos: ['ArcCos', true],
  atan: ['ArcTan', false],
  log: ['Ln', false],
  log10: ['Log10', true]
};

//the Pascal type of a value that isn't a list
const scalar = (type: Type): string =>
  type === 'real' ? 'Double' : type === 'text' ? 'string' : type === 'boolean' ? 'Boolean' : 'Integer';

/**
 * Writes a program in Pascal.
 */
export const toPascal = (tree: ProgramTree, types: Types, sourceCode: string): Converted => {
  const names = new Names(tree.names, RESERVED, {caseless: true, latin: true});
  const trivia = new Trivia(tree.comments, sourceCode, '//');
  const helpers = new Helpers(HELPERS);
  //the list types each helper of lists is written for, like join(TIntegerArray)
  const forLists = new Map<string, Set<string>>();
  const units = new Set<string>();
  //the types of the lists of the program, like TIntegerArray, which Pascal names to pass and give them
  const arrays = new Map<string, string>();
  const {words: commands} = TRANSLATION[tree.language];
  const words: [string, string] = [commands.true[0], commands.false[0]];
  let random = false;
  //whether the program writes a real number, which Free Pascal may keep as a Single
  let reals = false;
  //the variables the conversion adds to the function being written, like the counter of a repeat
  let locals = new Map<string, string>();

  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';
  const code = (node: Expression, typed = false) => pas.print(expression(node, typed));

  //the name of a type, declaring the type of a list
  const typeName = (type: Type): string => {
    if (!isList(type)) return scalar(type);
    const item = type.list === 'unknown' ? 'whole' : type.list;
    const list = `T${isList(item) ? typeName(item).slice(1) : scalar(item)}Array`.replace(
      'TstringArray',
      'TStringArray'
    );
    if (list === 'TStringArray') {
      units.add('SysUtils');
      return list;
    }
    if (!arrays.has(list)) arrays.set(list, `array of ${typeName(item)}`);
    return list;
  };

  //a helper of lists for the type of a list
  const listHelper = (helper: string, type: Type) => {
    helpers.use(helper);
    if (!forLists.has(helper)) forLists.set(helper, new Set());
    forLists.get(helper)!.add(typeName(type));
  };

  //a variable the conversion adds, like the counter of a repeat, declared in the var of its function
  const local = (candidates: string[], type: string) => {
    const variable = names.fresh(candidates);
    locals.set(variable, type);
    return variable;
  };

  const math = (method: string, args: Code[]) => {
    units.add('Math');
    return pas.call(method, args);
  };

  //a value as a text: a number by IntToStr, a real number and a boolean as CMIL prints them
  const asText = (node: Expression): Code => {
    const type = typeOf(node);
    if (type === 'text') return pas.bracketed(expression(node), PRECEDENCE['+'] + 1);
    if (type === 'whole') {
      units.add('SysUtils');
      return pas.call('IntToStr', [expression(node)]);
    }
    helpers.use('show');
    units.add('SysUtils');
    return pas.call('show', [expression(node)]);
  };

  //values joined into a text with +, each a text
  const joinText = (parts: Expression[]): Code =>
    parts.map(asText).reduce((left, right) => pas.binary('+', left, right));

  //an expression; a list in a place of its type, like a variable, is written [1, 2], and elsewhere, where [1, 2]
  //would be a set, TIntegerArray.Create(1, 2)
  const expression = (node: Expression, typed = false): Code => {
    switch (node.type) {
      case 'value':
        if (node.constant === 'pi') return name('Pi');
        if (node.constant === 'e') return pas.call('Exp', [name('1')]);
        if (typeof node.value === 'string') return name(literal(node.value));
        if (typeof node.value === 'boolean') return name(node.value ? 'True' : 'False');
        if (!Number.isInteger(node.value)) reals = true;
        return name(String(node.value));
      case 'list': {
        const items = node.items.map(item => expression(item, true));
        if (typed) return pas.items('[', items, ']');
        //an empty list in no place of a type is a variable with no items, since Create() needs one
        if (!items.length) return name(local(['empty', 'none'], typeName(typeOf(node))));
        return pas.call(`${typeName(typeOf(node))}.Create`, items);
      }
      case 'template':
        return joinText(joinedParts(node, types));
      case 'variable':
        return name(names.of(node.name));
      case 'index': {
        if (isList(typeOf(node.target))) {
          const index = fromZero(pas, node.index, position => pas.bracketed(expression(position), PRECEDENCE['-'] + 1));
          return pas.index(expression(node.target), index);
        }
        //a letter of a text, with all its bytes
        helpers.use('letterOf');
        const place = node.index.type === 'value' ? name(String(node.index.value)) : expression(node.index);
        return pas.call('letterOf', [expression(node.target), place]);
      }
      case 'input':
        if (typeOf(node) === 'real') {
          helpers.use('readNumber');
          return name('readNumber');
        }
        helpers.use('readText');
        return name('readText');
      case 'userCall':
        return pas.call(
          names.of(node.name),
          node.args.map(arg => expression(arg, true))
        );
      case 'call':
        return builtIn(node);
      case 'unary':
        if (node.operator === COMMAND.NOT) return pas.unary('not ', expression(node.operand), NOT);
        //a sign binds like + in Pascal, so it is before a product, and before a sum in brackets
        return pas.unary(node.operator, pas.bracketed(expression(node.operand), PRECEDENCE['*']), PRECEDENCE['+']);
      case 'binary':
        return binary(node);
    }
  };

  const binary = (node: Expression & {type: 'binary'}): Code => {
    const left = typeOf(node.left);
    const right = typeOf(node.right);

    if (node.operator === '+' && typeOf(node) === 'text') return joinText(joinedParts(node, types));
    if (node.operator === COMMAND.IN) {
      if (isList(right)) {
        listHelper('contains', right);
        return pas.call('contains', [expression(node.right), expression(node.left)]);
      }
      return pas.binary('>', pas.call('Pos', [expression(node.left), expression(node.right)]), name('0'));
    }
    if (node.operator === '%' && (left === 'real' || right === 'real')) {
      return math('FMod', [expression(node.left), expression(node.right)]);
    }
    const operator = OPERATORS[node.operator] ?? node.operator;
    if (node.operator === '==' || node.operator === '!=') {
      //values of different types are never equal in CMIL; Pascal doesn't compare them
      if (neverEqual(left, right)) return name(node.operator === '==' ? 'False' : 'True');
    }
    return pas.binary(operator, expression(node.left), expression(node.right));
  };

  const builtIn = (node: Expression & {type: 'call'}): Code => {
    const args = node.args.map(arg => expression(arg));
    const [first] = node.args;
    const rounded = (method: string): Code => (typeOf(first) === 'whole' ? expression(first) : math(method, args));
    switch (node.name) {
      case COMMAND.SQR:
        return pas.call('Sqr', args);
      case COMMAND.ROUND:
        if (args.length === 2) {
          helpers.use('roundTo');
          units.add('SysUtils');
          units.add('Math');
          return pas.call('roundTo', args);
        }
        //Round() rounds a half to even
        if (typeOf(first) === 'whole') return expression(first);
        return math('Floor', [pas.binary('+', args[0], name('0.5'))]);
      case COMMAND.FLOOR:
        return rounded('Floor');
      case COMMAND.CEIL:
        return rounded('Ceil');
      case COMMAND.ABS:
        return pas.call('Abs', args);
      case COMMAND.COT:
        return math('Cot', args);
      case COMMAND.LOG:
        return math('LogN', args);
      case COMMAND.RANDOM: {
        random = true;
        const [min, max] = node.args.length === 1 ? [null, first] : node.args;
        if (!min) return pas.binary('+', pas.call('Random', [expression(max)]), name('1'));
        const count = pas.binary('+', pas.binary('-', expression(max), expression(min)), name('1'));
        return pas.binary('+', pas.call('Random', [count]), expression(min));
      }
      case COMMAND.LENGTH:
        if (isList(typeOf(first))) return pas.call('Length', args);
        helpers.use('letterCount');
        return pas.call('letterCount', args);
      case COMMAND.UPPER:
      case COMMAND.LOWER:
        units.add('SysUtils');
        return pas.call(node.name === COMMAND.UPPER ? 'UpperCase' : 'LowerCase', args);
      case COMMAND.NUMBER:
        if (isNumber(typeOf(first))) return expression(first);
        units.add('SysUtils');
        return pas.call('StrToFloat', args);
      case COMMAND.TEXT:
        return asText(first);
      case COMMAND.SPLIT: {
        units.add('SysUtils');
        const separator = node.args[1];
        if (!separator) return pas.member(args[0], 'Split', [name("[' ']"), name('TStringSplitOptions.ExcludeEmpty')]);
        if (separator.type === 'value' && separator.value === '') {
          helpers.use('letters');
          return pas.call('letters', [args[0]]);
        }
        return pas.member(args[0], 'Split', [pas.items('[', [args[1]], ']')]);
      }
      case COMMAND.JOIN: {
        listHelper('join', typeOf(first));
        helpers.use('show');
        units.add('SysUtils');
        return pas.call('join', [args[0], args[1] ?? name("''")]);
      }
    }
    const formula = mathOf(
      pas,
      node.name,
      args,
      (method, values) => {
        const [function_, unit] = PASCAL_MATH[method];
        if (unit) units.add('Math');
        return pas.call(function_, values);
      },
      () => name('Pi')
    );
    if (formula) return formula;
    throw new Error(`No Pascal for ${node.name}`);
  };

  //what writeln writes: the values of a text with values in it each by itself, as writeln can
  const printed = (node: Expression): string[] =>
    (isJoined(node, types) ? joinedParts(node, types) : [node]).map(part => {
      const type = typeOf(part);
      return type === 'text' || type === 'whole' ? code(part) : pas.print(asText(part));
    });

  const block = statementsOf({
    trivia,
    names,
    braces: BLOCKS,
    write: (statement, context) => {
      const {comment} = context;
      //CMIL reads the bounds of a loop once; when the loop changes them, Pascal keeps them in a variable first
      const once = (bound: Expression, candidates: string[]): Code => {
        const kept = context.keep(bound, candidates, variable => {
          locals.set(variable, scalar(typeOf(bound)));
          return `${variable} := ${code(bound)};`;
        });
        return kept ? name(kept) : expression(bound);
      };
      switch (statement.type) {
        case 'print': {
          const {expression: value} = statement;
          if (value.type === 'value' && value.value === '') context.line(`writeln;${comment}`);
          else context.line(`writeln(${printed(value).join(', ')});${comment}`);
          return;
        }
        case 'assign': {
          const variable = names.of(statement.name);
          if (statement.expression.type === 'input') {
            context.line(`readln(${variable});${comment}`);
            return;
          }
          context.line(`${variable} := ${code(statement.expression, true)};${comment}`);
          return;
        }
        case 'setItem': {
          const index = fromZero(pas, statement.index, position =>
            pas.bracketed(expression(position), PRECEDENCE['-'] + 1)
          );
          const item = pas.index(expression(statement.target), index);
          context.line(`${pas.print(item)} := ${code(statement.expression, true)};${comment}`);
          return;
        }
        case 'add': {
          const list = code(statement.target);
          context.line(`SetLength(${list}, Length(${list}) + 1);`);
          context.line(`${list}[High(${list})] := ${code(statement.expression, true)};${comment}`);
          return;
        }
        case 'remove':
          listHelper('removeItem', typeOf(statement.target));
          context.line(`removeItem(${code(statement.target)}, ${code(statement.expression)});${comment}`);
          return;
        case 'call':
          context.line(`${code(statement.call)};${comment}`);
          return;
        case 'return':
          context.line(`Exit${statement.expression ? `(${code(statement.expression, true)})` : ''};${comment}`);
          return;
        case 'if': {
          //a block before an else ends with end, not end;
          const heads = branchesOf(
            statement,
            (condition, index) => `${index ? 'else ' : ''}if ${code(condition)} then`
          );
          context.blocks(heads.map((head, index) => (index < heads.length - 1 ? {...head, close: 'end'} : head)));
          return;
        }
        case 'while':
          context.blocks([loopOf(statement, `while ${code(statement.condition)} do`)]);
          return;
        case 'doWhile':
          context.blocks([{text: 'repeat', line: statement.doLine, body: statement.body, bare: true}], {
            text: `until ${code(negation(statement.condition, types))};`,
            line: statement.line
          });
          return;
        case 'repeat': {
          const count = once(statement.count, ['times', 'count']);
          const counter = local(['i', 'j', 'k'], 'Integer');
          const last = typeOf(statement.count) === 'real' ? pas.call('Trunc', [count]) : count;
          context.blocks([loopOf(statement, `for ${counter} := 1 to ${pas.print(last)} do`)]);
          return;
        }
        case 'for': {
          const counter = names.of(statement.name);
          const {down, size, signed} = stepOf(statement);
          const whole = typeOf(statement.from) === 'whole' && (!statement.step || typeOf(statement.step) === 'whole');
          //the first value too, when it asks and a later bound is kept, so the program asks in CMIL's order
          const first = once(statement.from, ['first', 'start']);
          const last = once(statement.to, ['last', 'stop']);
          //Pascal's for counts by 1, up with to or down with downto, and its counter isn't changed in the loop
          if (!size && whole && !assignedIn(statement.body).has(statement.name)) {
            //a real last value, like Sqrt(n), is the whole number the counter reaches
            const reached = typeOf(statement.to) === 'real' ? math(down ? 'Ceil' : 'Floor', [last]) : last;
            const range = `${pas.print(first)} ${down ? 'downto' : 'to'} ${pas.print(reached)}`;
            context.blocks([loopOf(statement, `for ${counter} := ${range} do`)]);
            return;
          }
          context.line(`${counter} := ${pas.print(first)};`);
          const by = size && once(size, ['step', 'by']);
          const step = by ? pas.print(pas.bracketed(by, PRECEDENCE['+'] + 1)) : '1';
          const compare = (operator: string) => pas.binary(operator, name(counter), last);
          const test = pas.print(signed ? signedTest(pas, compare, by!, ['and', 'or']) : compare(down ? '>=' : '<='));
          //the step, after the block and before a continue
          const next = () => context.line(`${counter} := ${counter} ${down ? '-' : '+'} ${step};`);
          context.blocks([loopOf(statement, `while ${test} do`, {last: next, next})]);
          return;
        }
        case 'forEach': {
          const type = typeOf(statement.expression);
          let items = code(statement.expression);
          if (!isList(type)) {
            helpers.use('letters');
            units.add('SysUtils');
            items = `letters(${items})`;
          } else if (changesItsList(statement)) {
            //the loop changes the list, so it goes over a copy: the items the list had when the loop started
            items = `Copy(${items})`;
          }
          context.blocks([loopOf(statement, `for ${names.of(statement.name)} in ${items} do`)]);
          return;
        }
        case 'break':
          context.line(`Break;${comment}`);
          return;
        case 'continue':
          context.next();
          context.line(`Continue;${comment}`);
          return;
      }
    }
  });

  //the var of a program or a function: its variables, those the conversion adds, with their types
  const variables = (out: Writer, scope: Map<string, Type>, parameters: string[]) => {
    const declared = [...scope]
      .filter(([variable]) => !parameters.includes(variable))
      .map(([variable, type]): [string, string] => [names.of(variable), typeName(type)]);
    declared.push(...locals);
    if (!declared.length) return;
    out.line('var');
    out.block(() => declared.forEach(([variable, type]) => out.line(`${variable}: ${type};`)));
  };

  //a function of the program: a list it reads is const, one it changes var
  const definitions = tree.statements.filter(
    (statement): statement is Statement & {type: 'function'} => statement.type === 'function'
  );
  const signature = (definition: Statement & {type: 'function'}) => {
    const scope = types.variables.get(definition.name)!;
    const result = types.results.get(definition.name)!;
    const changed = changedIn(definition.body);
    const shared = sharedListsOf(tree.statements, definition);
    const assigned = assignedIn(definition.body);
    const parameters = definition.parameters.map(parameter => {
      const type = scope.get(parameter)!;
      //a list the caller sees changed is var, one the function changes that no caller sees its own copy
      const own = changed.has(parameter) || assigned.has(parameter);
      const kind = !isList(type) ? '' : shared.has(parameter) ? 'var ' : own ? '' : 'const ';
      return `${kind}${names.of(parameter)}: ${typeName(type)}`;
    });
    const list = parameters.length ? `(${parameters.join('; ')})` : '';
    return result === 'unknown'
      ? `procedure ${names.of(definition.name)}${list};`
      : `function ${names.of(definition.name)}${list}: ${typeName(result)};`;
  };

  const functions = new Writer('  ');
  for (const definition of definitions) {
    locals = new Map();
    const scope = types.variables.get(definition.name)!;
    trivia.before(functions, definition.line);
    const body = new Writer('  ');
    body.line('begin');
    body.block(() => block(body, definition.body, scope, new Set(definition.parameters)));
    body.line('end;');
    functions.line(`${signature(definition)}${trivia.after(definition.line)}`, definition.line);
    variables(functions, scope, definition.parameters);
    functions.append(body);
    functions.blank();
  }
  locals = new Map();
  const main = new Writer('  ');
  main.line('begin');
  main.block(() => {
    if (random) main.line('Randomize; // other random numbers each time');
    block(main, tree.statements, types.variables.get('')!, new Set());
    trivia.rest(main);
  });
  main.line('end.');
  const mainVariables = new Writer('  ');
  variables(mainVariables, types.variables.get('')!, []);

  //a function called by one written before it needs its forward declaration first
  const forwards = definitions.filter((definition, index) =>
    definitions.slice(0, index).some(earlier => callsIn(earlier).has(definition.name))
  );

  const out = new Writer('  ');
  out.line('program Main;');
  out.blank();
  out.line('{$mode objfpc}{$H+}');
  if (reals) out.line('{$minfpconstprec 64} // numbers like 0.5 are Double, not Single');
  if (helpers.has('show') || helpers.has('join') || helpers.has('roundTo')) units.add('SysUtils');
  const used = ['SysUtils', 'Math'].filter(unit => units.has(unit));
  if (used.length) {
    out.blank();
    out.line('uses');
    out.block(() => out.line(`${used.join(', ')};`));
  }
  if (arrays.size) {
    out.blank();
    out.line('type');
    out.block(() => [...arrays].forEach(([list, type]) => out.line(`${list} = ${type};`)));
  }
  helpers.write(out, (helper, helperName) => helper.code({words, lists: [...(forLists.get(helperName) ?? [])]}));
  if (forwards.length) {
    out.blank();
    forwards.forEach(definition => out.line(`${signature(definition)} forward;`));
  }
  out.blank();
  out.append(functions);
  out.blank();
  out.append(mainVariables);
  out.append(main);
  return out.converted();
};

type HelperContext = {words: [string, string]; lists: string[]};

//the helpers, by name, in the order they are written: the helpers they use, and their code, for the lists they are
//written for, like join(TIntegerArray)
const HELPERS: Record<string, {uses?: string[]; code: (context: HelperContext) => string[]}> = {
  readText: {
    code: () => [
      '// an answer of the user, as a text',
      'function readText: string;',
      'begin',
      '  readln(Result);',
      'end;'
    ]
  },
  readNumber: {
    code: () => [
      '// an answer of the user, as a number',
      'function readNumber: Double;',
      'begin',
      '  readln(Result);',
      'end;'
    ]
  },
  letterCount: {
    code: () => [
      '// the letters of a text: a char is a byte, and a letter like ա has more than one',
      'function letterCount(const text: string): Integer;',
      'var',
      '  letter: Char;',
      'begin',
      '  Result := 0;',
      '  for letter in text do',
      '    if (Ord(letter) and $C0) <> $80 then',
      '      Result := Result + 1;',
      'end;'
    ]
  },
  letterOf: {
    code: () => [
      '// the letter of a text at a place, from 1, with all the bytes of a letter like ա',
      'function letterOf(const text: string; place: Integer): string;',
      'var',
      '  letter: Char;',
      '  count: Integer;',
      'begin',
      "  Result := '';",
      '  count := 0;',
      '  for letter in text do',
      '  begin',
      '    if (Ord(letter) and $C0) <> $80 then',
      '      count := count + 1;',
      '    if count = place then',
      '      Result := Result + letter;',
      '  end;',
      'end;'
    ]
  },
  letters: {
    code: () => [
      '// the letters of a text, each a text of its own',
      'function letters(const text: string): TStringArray;',
      'var',
      '  letter: Char;',
      'begin',
      '  Result := [];',
      '  for letter in text do',
      '    if (Ord(letter) and $C0) <> $80 then',
      '    begin',
      '      SetLength(Result, Length(Result) + 1);',
      '      Result[High(Result)] := letter;',
      '    end',
      '    else',
      '      Result[High(Result)] := Result[High(Result)] + letter;',
      'end;'
    ]
  },
  show: {
    code: ({words: [yes, no]}) => [
      '// a value as CMIL prints it: a real number with up to 12 digits, and a boolean in words',
      'function show(value: Double): string; overload;',
      'begin',
      '  Result := FloatToStrF(value, ffGeneral, 12, 0);',
      'end;',
      '',
      'function show(value: Boolean): string; overload;',
      'begin',
      '  if value then',
      `    Result := ${literal(yes)}`,
      '  else',
      `    Result := ${literal(no)};`,
      'end;',
      '',
      'function show(value: Integer): string; overload;',
      'begin',
      '  Result := IntToStr(value);',
      'end;'
    ]
  },
  join: {
    code: ({lists}) =>
      lists.flatMap(list => [
        `// the items of a list as they are printed, with a separator between them`,
        `function join(const list: ${list}; const separator: string): string; overload;`,
        'var',
        '  i: Integer;',
        'begin',
        "  Result := '';",
        '  for i := 0 to High(list) do',
        '  begin',
        '    if i > 0 then',
        '      Result := Result + separator;',
        `    Result := Result + ${list === 'TStringArray' ? 'list[i]' : 'show(list[i])'};`,
        '  end;',
        'end;',
        ''
      ])
  },
  roundTo: {
    uses: ['show'],
    code: () => [
      '// a number rounded to a count of decimals, a half up, after rounding it like it is printed, so 1.005 is 1.01',
      'function roundTo(number: Double; digits: Integer): Double;',
      'begin',
      '  Result := Floor(StrToFloat(show(number * Power(10, digits))) + 0.5) / Power(10, digits);',
      'end;'
    ]
  },
  contains: {
    code: ({lists}) =>
      lists.flatMap(list => [
        `// whether a list has an item`,
        `function contains(const list: ${list}; item: ${itemOf(list)}): Boolean; overload;`,
        'var',
        `  each: ${itemOf(list)};`,
        'begin',
        '  for each in list do',
        '    if each = item then',
        '      Exit(True);',
        '  Result := False;',
        'end;',
        ''
      ])
  },
  removeItem: {
    code: ({lists}) =>
      lists.flatMap(list => [
        `// removes the first item of a list that equals a value`,
        `procedure removeItem(var list: ${list}; item: ${itemOf(list)}); overload;`,
        'var',
        '  i: Integer;',
        'begin',
        '  for i := 0 to High(list) do',
        '    if list[i] = item then',
        '    begin',
        '      Delete(list, i, 1);',
        '      Exit;',
        '    end;',
        'end;',
        ''
      ])
  }
};

//the type of the items of a list type, like Integer for TIntegerArray
const itemOf = (list: string) => {
  const item = list.replace(/^T/, '').replace(/Array$/, '');
  return item === 'String' ? 'string' : item;
};

/** The writer of Pascal: its targets, which cmil/convert/pascal gives convert(). */
export const WRITERS: Writers = {pascal: {typed: true, write: toPascal}};
