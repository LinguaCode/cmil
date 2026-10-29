/**
 * C#: what a teacher writes, that prints what the CMIL program prints, in two shapes. The modern one is C# 12 with
 * top-level statements, as dotnet new console makes a program, with the functions of the program as local functions
 * where it has them; the classic one builds with any C# from 7.3, like the C# of .NET Framework: a class Program with
 * the functions as static methods and the program in Main. Numbers are int or double, texts string, lists List; the
 * helpers a program needs come last, each with what it is for.
 */
import {COMMAND} from '../../constants/index.ts';
import TRANSLATION from '../../translations/index.ts';
import {capitalized, counterTest, fromZero, Grammar, mathOf, POSTFIX, UNARY, type Code} from '../code.ts';
import {
  Helpers,
  Names,
  Trivia,
  Writer,
  changesItsList,
  definitionOf,
  isJoined,
  isSimple,
  isText,
  joinedParts,
  neverEqual,
  quoted,
  stepOf,
  type Converted
} from '../emit.ts';
import {OWN_LINES, branchesOf, loopOf, statementsOf} from '../statements.ts';
import {isList, isNumber, type Type, type Types} from '../types.ts';
import type {ProgramTree} from '../../program.ts';
import type {Writers} from '../registry.ts';
import type {Expression, Statement} from '../../core/types.ts';

//the words of C#, the names of the library the conversion uses and of the helpers, which a program's names can't be
const RESERVED = new Set(
  [
    'abstract as base bool break byte case catch char checked class const continue decimal default delegate do double',
    'else enum event explicit extern false finally fixed float for foreach goto if implicit in int interface internal',
    'is lock long namespace new null object operator out override params private protected public readonly ref return',
    'sbyte sealed short sizeof stackalloc static string struct switch this throw true try typeof uint ulong unchecked',
    'unsafe ushort using virtual void volatile while args async await dynamic global nameof var when yield record',
    'System Console Math Convert Random List CultureInfo StringSplitOptions IEnumerable Show Letters RoundTo Program',
    'Main random'
  ]
    .join(' ')
    .split(' ')
);

//the precedence of C#'s operators, from the loosest
const PRECEDENCE: Record<string, number> = {
  '??': 1,
  '||': 2,
  '&&': 3,
  '==': 4,
  '!=': 4,
  '<': 5,
  '>': 5,
  '<=': 5,
  '>=': 5,
  '+': 6,
  '-': 6,
  '*': 7,
  '/': 7,
  '%': 7
};

const OPERATORS: Record<string, string> = {[COMMAND.AND]: '&&', [COMMAND.OR]: '||'};

//the namespaces of the usings, in the order they are written
const USINGS = ['System', 'System.Collections', 'System.Collections.Generic', 'System.Globalization', 'System.Linq'];

/** The shape of a C# program: top-level statements of C# 12, or a class Program with Main, of any C# from 7.3. */
export type CsharpStyle = 'modern' | 'classic';

type Helper = {
  imports: string[];
  code: (words: {true: string; false: string}, classic: boolean) => string[];
};

//a text as C# writes it, like "a \"b\""
const literal = (text: string) => quoted(text);

//the helpers, by name, in the order they are written: the namespaces of the usings they need and their code
const HELPERS: Record<string, Helper> = {
  Show: {
    imports: [],
    code: (words, classic) => [
      '// an item of a list as CMIL prints it: a number with up to 12 digits, a boolean in the words of the program',
      `${classic ? 'static string Show(object value)' : 'string Show(object? value)'}`,
      '{',
      '    if (value is double number) return number.ToString("G12");',
      `    if (value is bool boolean) return boolean ? ${literal(words.true)} : ${literal(words.false)};`,
      '    return $"{value}";',
      '}'
    ]
  },
  Letters: {
    imports: ['System.Collections.Generic'],
    code: (_words, classic) => [
      '// the letters of a text, each a text of its own',
      `${classic ? 'static ' : ''}List<string> Letters(string text)`,
      '{',
      `    List<string> letters = ${classic ? 'new List<string>()' : '[]'};`,
      '    foreach (char letter in text) letters.Add(letter.ToString());',
      '    return letters;',
      '}'
    ]
  },
  RoundTo: {
    imports: ['System'],
    code: (_words, classic) => [
      '// a number rounded to a count of decimals, a half up, after rounding it like it is printed, so 1.005 is 1.01',
      `${classic ? 'static ' : ''}double RoundTo(double number, int digits)`,
      '{',
      '    double factor = Math.Pow(10, digits);',
      '    return Math.Floor(double.Parse((number * factor).ToString("G12")) + 0.5) / factor;',
      '}'
    ]
  }
};

/** The C# type of a value: int, double, string, bool or a List; int when nothing says. */
export const csType = (type: Type): string => {
  if (isList(type)) return `List<${csType(type.list)}>`;
  switch (type) {
    case 'real':
      return 'double';
    case 'text':
      return 'string';
    case 'boolean':
      return 'bool';
    default:
      return 'int';
  }
};

//the value a variable declared before it gets one starts with, since C# reads only variables that have a value
const initial = (type: Type, classic: boolean): string => {
  if (isList(type)) return classic ? `new ${csType(type)}()` : '[]';
  return type === 'text' ? '""' : type === 'boolean' ? 'false' : '0';
};

const cs = new Grammar(PRECEDENCE);
const name = (text: string) => cs.atom(text);

/**
 * Writes a program in C#, in the modern or the classic shape.
 */
export const toCsharp = (tree: ProgramTree, types: Types, sourceCode: string, style: CsharpStyle): Converted => {
  const classic = style === 'classic';
  const names = new Names(tree.names, RESERVED);
  const trivia = new Trivia(tree.comments, sourceCode, '//');
  const usings = new Set<string>();
  const helpers = new Helpers(HELPERS, usings);
  const {words} = TRANSLATION[tree.language];
  //whether the program prints or reads a real number, which C# writes with the computer's decimal separator
  let real = false;
  //whether a classic program has random numbers, from the Random of its class
  let random = false;
  //the type of the value a function of the program returns, while it is written
  let returns: Type | undefined;

  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';
  const code = (node: Expression, place?: Type) => cs.print(expression(node, place));

  //the name of a type, with the using a List needs
  const typeName = (type: Type): string => {
    if (isList(type)) usings.add('System.Collections.Generic');
    return csType(type);
  };

  //the type of the items of a list
  const itemOf = (type: Type | undefined): Type | undefined => (type && isList(type) ? type.list : undefined);

  const math = (method: string, args: Code[]): Code => {
    usings.add('System');
    return cs.call(`Math.${method}`, args);
  };

  //a boolean in the words of the program's language, as CMIL prints it
  const inWords = (node: Expression) => `(${code(node)} ? ${literal(words.true[0])} : ${literal(words.false[0])})`;

  //a real number with up to 12 digits, as CMIL prints it
  const twelve = (node: Expression): Code => {
    real = true;
    return cs.member(expression(node), 'ToString', [name('"G12"')]);
  };

  //values joined into a text, as an interpolated string, like $"Hi, {name}"
  const interpolated = (parts: Expression[]): string => {
    if (parts.length === 1 && isText(parts[0])) return literal(parts[0].value);
    const text = parts
      .map(part => {
        if (isText(part))
          return literal(part.value)
            .slice(1, -1)
            .replace(/[{}]/g, brace => brace + brace);
        const type = typeOf(part);
        if (type === 'real') {
          real = true;
          return `{${code(part)}:G12}`;
        }
        if (type === 'boolean') return `{${inWords(part)}}`;
        return `{${code(part)}}`;
      })
      .join('');
    return `$"${text}"`;
  };

  //a value as a text, like text() gives it
  const asText = (node: Expression): string => {
    if (isJoined(node, types)) return interpolated(joinedParts(node, types));
    const type = typeOf(node);
    if (type === 'text') return code(node);
    if (type === 'real') return cs.print(twelve(node));
    if (type === 'boolean') return inWords(node);
    return cs.print(cs.member(expression(node), 'ToString', []));
  };

  //what print prints: a whole number and a text as they are, the others as CMIL prints them
  const printed = (node: Expression): string => {
    if (isText(node) && node.value === '') return '';
    const type = typeOf(node);
    return type === 'whole' && !isJoined(node, types) ? code(node) : asText(node);
  };

  //a number C# reads as an index or a count, which must be whole
  const whole = (node: Expression): Code =>
    typeOf(node) === 'real' ? cs.unary('(int)', expression(node)) : expression(node);

  //an expression; a list in a place that has a type, like a variable, has that type, and is written [1, 2] in the
  //modern shape
  const expression = (node: Expression, place?: Type, inBraces = false): Code => {
    switch (node.type) {
      case 'value':
        if (node.constant) {
          usings.add('System');
          return cs.atom(`Math.${node.constant.toUpperCase()}`, POSTFIX);
        }
        if (typeof node.value === 'string') return name(literal(node.value));
        return cs.atom(
          String(node.value),
          node.value === true || node.value === false || node.value >= 0 ? undefined : UNARY
        );
      case 'list': {
        usings.add('System.Collections.Generic');
        const type = place && isList(place) ? place : typeOf(node);
        //in the braces of new List<…> { … }, [1] would be an index, so the lists in it are written the same way
        const brackets = place !== undefined && !classic && !inBraces;
        const items = node.items.map(item => expression(item, itemOf(type), !brackets));
        if (brackets) return cs.items('[', items, ']');
        const list = typeName(type);
        return items.length ? cs.items(`new ${list} { `, items, ' }') : name(`new ${list}()`);
      }
      case 'template':
        return name(interpolated(joinedParts(node, types)));
      case 'variable':
        return name(names.of(node.name));
      case 'index': {
        const item = cs.index(expression(node.target), fromZero(cs, node.index, whole));
        return isList(typeOf(node.target)) ? item : cs.member(item, 'ToString', []);
      }
      case 'input':
        usings.add('System');
        if (typeOf(node) === 'real') {
          real = true;
          return cs.call('Convert.ToDouble', [cs.call('Console.ReadLine', [])]);
        }
        //C# 8 and later warn of an answer that may be null, at the end of the input
        return classic ? cs.call('Console.ReadLine', []) : cs.binary('??', cs.call('Console.ReadLine', []), name('""'));
      case 'userCall': {
        const definition = definitionOf(tree.statements, node.name);
        const parameters = types.variables.get(node.name)!;
        return cs.call(
          names.of(node.name),
          node.args.map((arg, index) => expression(arg, parameters.get(definition.parameters[index])))
        );
      }
      case 'call':
        return builtIn(node);
      case 'unary':
        return cs.unary(node.operator === COMMAND.NOT ? '!' : node.operator, expression(node.operand));
      case 'binary':
        return binary(node);
    }
  };

  const binary = (node: Expression & {type: 'binary'}): Code => {
    const left = typeOf(node.left);
    const right = typeOf(node.right);

    if (node.operator === '+' && typeOf(node) === 'text') return name(interpolated(joinedParts(node, types)));
    if (node.operator === COMMAND.IN) return cs.member(expression(node.right), 'Contains', [expression(node.left)]);
    //a whole number divided by a whole number is a whole number in C#, so the first one becomes a double
    if (node.operator === '/' && left === 'whole' && right === 'whole') {
      const dividend =
        node.left.type === 'value' ? name(`${node.left.value}.0`) : cs.unary('(double)', expression(node.left));
      return cs.binary('/', dividend, expression(node.right));
    }
    const operator = OPERATORS[node.operator] ?? node.operator;
    if (node.operator === '==' || node.operator === '!=') {
      //values of different types are never equal in CMIL; C# doesn't compare them
      if (neverEqual(left, right)) return name(node.operator === '==' ? 'false' : 'true');
    }
    //texts are compared letter by letter, as CMIL compares them
    if (left === 'text' && right === 'text' && PRECEDENCE[operator] === PRECEDENCE['<']) {
      const order = cs.call('string.CompareOrdinal', [expression(node.left), expression(node.right)]);
      return cs.binary(operator, order, name('0'));
    }
    return cs.binary(operator, expression(node.left), expression(node.right));
  };

  const builtIn = (node: Expression & {type: 'call'}): Code => {
    const args = node.args.map(arg => expression(arg));
    const [first] = node.args;
    //a whole number is its own floor, ceiling and rounding
    const rounded = (method: string): Code =>
      typeOf(first) === 'whole' ? expression(first) : cs.unary('(int)', math(method, args));
    switch (node.name) {
      case COMMAND.SQR: {
        if (isSimple(first)) return cs.binary('*', args[0], args[0]);
        const square = math('Pow', [args[0], name('2')]);
        return typeOf(node) === 'whole' ? cs.unary('(int)', square) : square;
      }
      case COMMAND.ROUND:
        if (args.length === 2) {
          helpers.use('RoundTo');
          real = true;
          return cs.call('RoundTo', args);
        }
        if (typeOf(first) === 'whole') return expression(first);
        return cs.unary('(int)', math('Floor', [cs.binary('+', args[0], name('0.5'))]));
      case COMMAND.FLOOR:
        return rounded('Floor');
      case COMMAND.CEIL:
        return rounded('Ceiling');
      case COMMAND.ABS:
        return math('Abs', args);
      case COMMAND.LOG:
        return math('Log', [args[1], args[0]]);
      case COMMAND.RANDOM: {
        usings.add('System');
        const [min, max] = node.args.length === 1 ? [null, first] : node.args;
        const last =
          max.type === 'value' && typeof max.value === 'number'
            ? name(String(max.value + 1))
            : cs.binary('+', whole(max), name('1'));
        if (classic) random = true;
        return cs.call(classic ? 'random.Next' : 'Random.Shared.Next', [min ? whole(min) : name('1'), last]);
      }
      case COMMAND.LENGTH:
        return cs.member(args[0], isList(typeOf(first)) ? 'Count' : 'Length');
      case COMMAND.UPPER:
        return cs.member(args[0], 'ToUpper', []);
      case COMMAND.LOWER:
        return cs.member(args[0], 'ToLower', []);
      case COMMAND.NUMBER:
        if (isNumber(typeOf(first))) return expression(first);
        usings.add('System');
        real = true;
        return cs.call('Convert.ToDouble', args);
      case COMMAND.TEXT:
        return cs.atom(asText(first), PRECEDENCE['+']);
      case COMMAND.SPLIT: {
        usings.add('System.Linq');
        //.NET Framework splits only at the separators of an array
        if (args.length === 1) {
          usings.add('System');
          const spaces = name(classic ? "new[] { ' ' }" : "' '");
          const split = cs.member(args[0], 'Split', [spaces, name('StringSplitOptions.RemoveEmptyEntries')]);
          return cs.member(split, 'ToList', []);
        }
        const separator = node.args[1];
        if (isText(separator) && separator.value === '') {
          helpers.use('Letters');
          return cs.call('Letters', [args[0]]);
        }
        if (classic) {
          usings.add('System');
          const separators = cs.items('new[] { ', [args[1]], ' }');
          return cs.member(cs.member(args[0], 'Split', [separators, name('StringSplitOptions.None')]), 'ToList', []);
        }
        return cs.member(cs.member(args[0], 'Split', [args[1]]), 'ToList', []);
      }
      case COMMAND.JOIN: {
        const separator = args[1] ?? name('""');
        const list = typeOf(first);
        const item = isList(list) ? list.list : 'unknown';
        if (item === 'text' || item === 'whole') return cs.call('string.Join', [separator, args[0]]);
        //a real number is shown with up to 12 digits, which C# writes with the computer's decimal separator
        if (item === 'real') real = true;
        helpers.use('Show');
        usings.add('System.Linq');
        //the parameter of the lambda can't have the name of a variable of the program before C# 8
        const each = names.fresh(['item', 'each']);
        names.release(each);
        return cs.call('string.Join', [separator, cs.member(args[0], 'Select', [name(`${each} => Show(${each})`)])]);
      }
    }
    const formula = mathOf(
      cs,
      node.name,
      args,
      (method, values) => math(capitalized(method), values),
      () => name('Math.PI')
    );
    if (formula) return formula;
    throw new Error(`No C# for ${node.name}`);
  };

  const block = statementsOf({
    trivia,
    names,
    braces: OWN_LINES,
    declare: (variable, type) => [`${typeName(type)} ${names.of(variable)} = ${initial(type, classic)};`],
    //the functions of a modern program are local functions where it has them, those of a classic one methods
    functionsInPlace: !classic,
    write: (statement, context) => {
      const {comment, declares, scope} = context;
      //CMIL reads the bounds of a loop once; when the loop changes them, C# keeps them in a variable first
      const once = (bound: Expression, candidates: string[]): Code => {
        const kept = context.keep(
          bound,
          candidates,
          variable => `${typeName(typeOf(bound))} ${variable} = ${code(bound)};`
        );
        return kept ? name(kept) : expression(bound);
      };
      switch (statement.type) {
        case 'print':
          usings.add('System');
          context.line(`Console.WriteLine(${printed(statement.expression)});${comment}`);
          return;
        case 'assign': {
          const type = declares ? `${typeName(scope.get(statement.name)!)} ` : '';
          const value = code(statement.expression, scope.get(statement.name));
          context.line(`${type}${names.of(statement.name)} = ${value};${comment}`);
          return;
        }
        case 'setItem': {
          const item = cs.index(expression(statement.target), fromZero(cs, statement.index, whole));
          const value = code(statement.expression, itemOf(typeOf(statement.target)));
          context.line(`${cs.print(item)} = ${value};${comment}`);
          return;
        }
        case 'add':
        case 'remove': {
          const value = expression(statement.expression, itemOf(typeOf(statement.target)));
          const method = statement.type === 'add' ? 'Add' : 'Remove';
          context.line(`${cs.print(cs.member(expression(statement.target), method, [value]))};${comment}`);
          return;
        }
        case 'call':
          context.line(`${code(statement.call)};${comment}`);
          return;
        case 'return':
          context.line(`return${statement.expression ? ` ${code(statement.expression, returns)}` : ''};${comment}`);
          return;
        case 'if':
          context.blocks(branchesOf(statement, (condition, index) => `${index ? 'else ' : ''}if (${code(condition)})`));
          return;
        case 'while':
          context.blocks([loopOf(statement, `while (${code(statement.condition)})`)]);
          return;
        case 'doWhile':
          context.blocks([{text: 'do', line: statement.doLine, body: statement.body}], {
            text: `while (${code(statement.condition)});`,
            line: statement.line
          });
          return;
        case 'repeat': {
          const count = once(statement.count, ['times', 'count']);
          const counter = context.fresh(['i', 'j', 'k']);
          const test = cs.print(cs.binary('<', name(counter), count));
          context.blocks([loopOf(statement, `for (int ${counter} = 0; ${test}; ${counter}++)`)]);
          return;
        }
        case 'for': {
          const counter = names.of(statement.name);
          const type = typeName(scope.get(statement.name)!);
          const {down, size, signed} = stepOf(statement);
          //the first value too, when it asks and a later bound is kept, so the program asks in CMIL's order
          const first = once(statement.from, ['first', 'start']);
          const last = once(statement.to, ['last', 'end']);
          const by = size && once(size, ['step', 'by']);
          const test = counterTest(cs, operator => cs.binary(operator, name(counter), last), {down, signed}, by);
          const next = !by
            ? `${counter}${down ? '--' : '++'}`
            : `${counter} ${down ? '-=' : '+='} ${cs.print(cs.bracketed(by, PRECEDENCE['+'] + 1))}`;
          const start = `${declares ? `${type} ` : ''}${counter} = ${cs.print(first)}`;
          context.blocks([loopOf(statement, `for (${start}; ${test}; ${next})`)]);
          return;
        }
        case 'forEach': {
          const type = typeOf(statement.expression);
          let items = code(statement.expression);
          if (!isList(type)) {
            helpers.use('Letters');
            items = `Letters(${items})`;
          } else if (changesItsList(statement)) {
            //the loop changes the list, so it goes over a copy: the items the list had when the loop started
            usings.add('System.Linq');
            items = cs.print(cs.member(expression(statement.expression), 'ToList', []));
          }
          const item = typeName(scope.get(statement.name)!);
          if (declares) {
            context.blocks([loopOf(statement, `foreach (${item} ${names.of(statement.name)} in ${items})`)]);
          } else {
            //the variable is used after the loop too, so it gets each item
            const each = context.fresh(['item', 'each']);
            context.blocks([
              loopOf(statement, `foreach (${item} ${each} in ${items})`, {
                first: [`${names.of(statement.name)} = ${each};`]
              })
            ]);
          }
          return;
        }
        case 'break':
        case 'continue':
          context.line(`${statement.type};${comment}`);
          return;
        case 'function':
          context.blocks([{text: signature(statement), line: statement.line, ...method(statement)}]);
          returns = undefined;
          context.blank();
          return;
      }
    }
  });

  //a function of the program: a local function in the modern shape, a static method in the classic one
  const signature = (statement: Statement & {type: 'function'}) => {
    const own = types.variables.get(statement.name)!;
    const result = types.results.get(statement.name)!;
    const parameters = statement.parameters.map(parameter => `${typeName(own.get(parameter)!)} ${names.of(parameter)}`);
    return `${classic ? 'static ' : ''}${result === 'unknown' ? 'void' : typeName(result)} ${names.of(statement.name)}(${parameters.join(', ')})`;
  };
  //the block of a function, whose return gives a value of its result's type
  const method = (statement: Statement & {type: 'function'}) => {
    returns = types.results.get(statement.name)!;
    return {
      body: statement.body,
      scope: types.variables.get(statement.name)!,
      declared: new Set(statement.parameters)
    };
  };

  //the functions of a classic program, first, as methods of its class
  const functions = new Writer('    ');
  if (classic) {
    for (const statement of tree.statements) {
      if (statement.type !== 'function') continue;
      trivia.before(functions, statement.line);
      functions.line(`${signature(statement)}${trivia.after(statement.line)}`, statement.line);
      functions.line('{');
      const {body, scope, declared} = method(statement);
      functions.block(() => block(functions, body, scope, declared));
      returns = undefined;
      functions.line('}');
      functions.blank();
    }
  }
  const program = new Writer('    ');
  block(program, tree.statements, types.variables.get('')!, new Set());
  trivia.rest(program);

  if (real) usings.add('System.Globalization');
  const out = new Writer('    ');
  for (const namespace of USINGS.filter(namespace => usings.has(namespace))) out.line(`using ${namespace};`);
  out.blank();
  const main = () => {
    if (real) {
      out.line('// numbers with a point, like 2.5, whatever the language of the computer');
      out.line('CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;');
      out.blank();
    }
    out.append(program);
  };
  const methods = () =>
    helpers.write(out, helper => helper.code({true: words.true[0], false: words.false[0]}, classic));
  if (!classic) {
    main();
    methods();
    return out.converted();
  }
  out.line('class Program');
  out.line('{');
  out.block(() => {
    if (random) {
      out.line('// the random numbers of the program');
      out.line('static Random random = new Random();');
      out.blank();
    }
    out.append(functions);
    out.blank();
    out.line('static void Main(string[] args)');
    out.line('{');
    out.block(main);
    out.line('}');
    methods();
  });
  out.line('}');
  return out.converted();
};

/** The writer of C#, in its modern and its classic style: its targets, which cmil/convert/csharp gives convert(). */
export const WRITERS: Writers = {
  csharp: {typed: true, write: (tree, types, sourceCode) => toCsharp(tree, types, sourceCode, 'modern')},
  'csharp-classic': {typed: true, write: (tree, types, sourceCode) => toCsharp(tree, types, sourceCode, 'classic')}
};
