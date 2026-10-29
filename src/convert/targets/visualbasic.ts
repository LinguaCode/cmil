/**
 * Visual Basic: what a teacher writes, in Visual Basic .NET, that prints what the CMIL program prints, as dotnet new
 * console -lang VB makes a program: a Module Program with the functions of the program and Sub Main, under Option
 * Strict On, which checks types as C# does. Numbers are Integer or Double, texts String, lists List(Of T), as in C#;
 * names are whatever their case, so a name like math, which would hide Math, gets a _. The helpers a program needs
 * come last, each with what it is for.
 */
import {COMMAND} from '../../constants/index.ts';
import TRANSLATION from '../../translations/index.ts';
import {Grammar, POSTFIX, UNARY, capitalized, fromZero, mathOf, type Code} from '../code.ts';
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
  stepOf,
  type Converted
} from '../emit.ts';
import {branchesOf, loopOf, statementsOf, type Braces} from '../statements.ts';
import {isList, isNumber, type Type, type Types} from '../types.ts';
import type {ProgramTree} from '../../program.ts';
import type {Writers} from '../registry.ts';
import type {Expression, Statement} from '../../core/types.ts';

//the words of Visual Basic, in small letters, which a program's names can't be whatever their case: its keywords,
//Mid, which is a statement before (, and the names of the library the conversion uses and of the helpers, which a
//name of the program would hide, like math, which would hide Math, and vblf, which would take the place of vbLf in a
//text; List isn't one, since a name of the program doesn't hide a type where Visual Basic expects one
const RESERVED = new Set(
  [
    'addhandler addressof alias and andalso as boolean byref byte byval call case catch cbool cbyte cchar cdate cdbl',
    'cdec char cint class clng cobj console const continue convert csbyte cshort csng cstr ctype cuint culng',
    'cultureinfo cushort date decimal declare default delegate dim directcast do double each else elseif end endif',
    'enum erase error event exit false finally for friend function get gettype getxmlnamespace global gosub goto',
    'handles if implements imports in inherits integer interface is isnot let letters lib like long loop main math',
    'me mid mod module mustinherit mustoverride mybase myclass nameof namespace narrowing new next not nothing',
    'notinheritable notoverridable object of on operator option optional or orelse overloads overridable overrides',
    'paramarray partial private property protected public raiseevent random readonly redim rem removehandler resume',
    'return roundto sbyte select set shadows shared short show single static step stop string stringsplitoptions',
    'structure sub synclock then throw to true try trycast typeof uinteger ulong ushort using variant vblf vbtab',
    'wend when while widening with withevents writeonly xor'
  ]
    .join(' ')
    .split(' ')
);

//the precedence of Visual Basic's operators, from the loosest: Not binds more loosely than a comparison, so Not a = b
//is Not (a = b), Mod more loosely than * and /, so a Mod b * c is a Mod (b * c), & more loosely than + and -, and ^
//more tightly than - before a number, so -2 ^ 2 is -(2 ^ 2)
const PRECEDENCE: Record<string, number> = {
  OrElse: 1,
  AndAlso: 2,
  '=': 4,
  '<>': 4,
  '<': 4,
  '>': 4,
  '<=': 4,
  '>=': 4,
  '&': 5,
  '+': 6,
  '-': 6,
  Mod: 7,
  '*': 8,
  '/': 8,
  '^': UNARY + 1
};
const NOT = 3;

const OPERATORS: Record<string, string> = {
  [COMMAND.AND]: 'AndAlso',
  [COMMAND.OR]: 'OrElse',
  '==': '=',
  '!=': '<>',
  '%': 'Mod'
};

//the namespaces of the Imports, in the order they are written
const IMPORTS = ['System', 'System.Collections', 'System.Collections.Generic', 'System.Globalization', 'System.Linq'];

const vb = new Grammar(PRECEDENCE, new Set(), ['(', ')']);
const name = (text: string) => vb.atom(text);

//a power: a value with a sign is in brackets before ^, like (-2) ^ 2, and needn't be after it, like 2 ^ -1
const power = (base: Code, exponent: Code) => vb.binary('^', base, exponent, [PRECEDENCE['^'] + 1, UNARY]);

//the text of a text in an interpolated string, with "" for a quote and {{ and }} for braces, and a new line and a tab,
//which a text of Visual Basic can't have, as {vbLf} and {vbTab}
const inside = (text: string): string =>
  text
    .replaceAll('"', '""')
    .replace(/[{}]/g, brace => brace + brace)
    .replaceAll('\n', '{vbLf}')
    .replaceAll('\t', '{vbTab}');

//a text as Visual Basic writes it: in double quotes, with "" for a quote; one with a new line or a tab is an
//interpolated string, like $"one{vbLf}two"
const literal = (text: string): string =>
  /[\n\t]/.test(text) ? `$"${inside(text)}"` : `"${text.replaceAll('"', '""')}"`;

//the blocks of Visual Basic, ended by End If, Loop, Next and End Function, or by Loop While of a loop that tests its
//condition after its block
const BLOCKS: Braces = {head: text => text, tail: text => text};

type Helper = {
  imports: string[];
  code: (words: {true: string; false: string}) => string[];
};

//the helpers, by name, in the order they are written: the namespaces of the Imports they need and their code
const HELPERS: Record<string, Helper> = {
  Show: {
    imports: [],
    code: words => [
      "' an item of a list as CMIL prints it: a number with up to 12 digits, a boolean in the words of the program",
      'Function Show(value As Object) As String',
      '    If TypeOf value Is Double Then Return DirectCast(value, Double).ToString("G12")',
      `    If TypeOf value Is Boolean Then Return If(DirectCast(value, Boolean), ${literal(words.true)}, ${literal(words.false)})`,
      '    Return value.ToString()',
      'End Function'
    ]
  },
  Letters: {
    imports: ['System.Collections.Generic'],
    code: () => [
      "' the letters of a text, each a text of its own",
      'Function Letters(text As String) As List(Of String)',
      '    Dim result As New List(Of String)',
      '    For Each letter As Char In text',
      '        result.Add(letter.ToString())',
      '    Next',
      '    Return result',
      'End Function'
    ]
  },
  RoundTo: {
    imports: ['System'],
    code: () => [
      "' a number rounded to a count of decimals, a half up, after rounding it like it is printed, so 1.005 is 1.01",
      'Function RoundTo(number As Double, digits As Integer) As Double',
      '    Dim factor As Double = 10 ^ digits',
      '    Return Math.Floor(Double.Parse((number * factor).ToString("G12")) + 0.5) / factor',
      'End Function'
    ]
  }
};

/** The Visual Basic type of a value: Integer, Double, String, Boolean or a List; Integer when nothing says. */
const vbType = (type: Type): string => {
  if (isList(type)) return `List(Of ${vbType(type.list)})`;
  switch (type) {
    case 'real':
      return 'Double';
    case 'text':
      return 'String';
    case 'boolean':
      return 'Boolean';
    default:
      return 'Integer';
  }
};

//the value a variable declared before it gets one starts with, since a String would else be Nothing
const initial = (type: Type): string => {
  if (isList(type)) return `New ${vbType(type)}`;
  return type === 'text' ? '""' : type === 'boolean' ? 'False' : '0';
};

/**
 * Writes a program in Visual Basic.
 */
export const toVisualBasic = (tree: ProgramTree, types: Types, sourceCode: string): Converted => {
  const names = new Names(tree.names, RESERVED, {caseless: true});
  const trivia = new Trivia(tree.comments, sourceCode, "'");
  const imports = new Set<string>();
  const helpers = new Helpers(HELPERS, imports);
  const {words} = TRANSLATION[tree.language];
  //whether the program prints or reads a real number, which .NET writes with the computer's decimal separator
  let real = false;
  //the type of the value a function of the program returns, while it is written
  let returns: Type | undefined;
  //the loops around the statement being written, innermost last, which Exit and Continue name
  const loops: ('For' | 'Do')[] = [];

  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';
  const code = (node: Expression, place?: Type) => vb.print(expression(node, place));

  //the name of a type, with the Imports a List needs
  const typeName = (type: Type): string => {
    if (isList(type)) imports.add('System.Collections.Generic');
    return vbType(type);
  };

  //the type of the items of a list
  const itemOf = (type: Type | undefined): Type | undefined => (type && isList(type) ? type.list : undefined);

  const math = (method: string, args: Code[]): Code => {
    imports.add('System');
    return vb.call(`Math.${method}`, args);
  };

  //a boolean in the words of the program's language, as CMIL prints it
  const inWords = (node: Expression): Code =>
    vb.call('If', [expression(node), name(literal(words.true[0])), name(literal(words.false[0]))]);

  //a real number with up to 12 digits, as CMIL prints it
  const twelve = (node: Expression): Code => {
    real = true;
    return vb.member(expression(node), 'ToString', [name('"G12"')]);
  };

  //values joined into a text, as an interpolated string, like $"Hi, {name}"
  const interpolated = (parts: Expression[]): string => {
    if (parts.length === 1 && isText(parts[0])) return literal(parts[0].value);
    const text = parts
      .map(part => {
        if (isText(part)) return inside(part.value);
        const type = typeOf(part);
        if (type === 'real') {
          real = true;
          return `{${code(part)}:G12}`;
        }
        if (type === 'boolean') return `{${vb.print(inWords(part))}}`;
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
    if (type === 'real') return vb.print(twelve(node));
    if (type === 'boolean') return vb.print(inWords(node));
    return vb.print(vb.member(expression(node), 'ToString', []));
  };

  //what print prints: a whole number and a text as they are, the others as CMIL prints them
  const printed = (node: Expression): string => {
    if (isText(node) && node.value === '') return '';
    const type = typeOf(node);
    return type === 'whole' && !isJoined(node, types) ? code(node) : asText(node);
  };

  //a number Visual Basic reads as an index or a count, which must be whole
  const whole = (node: Expression): Code =>
    typeOf(node) === 'real' ? vb.call('CInt', [expression(node)]) : expression(node);

  //an expression; a list in a place that has a type, like a variable, has that type
  const expression = (node: Expression, place?: Type): Code => {
    switch (node.type) {
      case 'value':
        if (node.constant) {
          imports.add('System');
          return vb.atom(`Math.${node.constant.toUpperCase()}`, POSTFIX);
        }
        if (typeof node.value === 'string') return name(literal(node.value));
        if (typeof node.value === 'boolean') return name(node.value ? 'True' : 'False');
        return vb.atom(String(node.value), node.value >= 0 ? undefined : UNARY);
      case 'list': {
        imports.add('System.Collections.Generic');
        const type = place && isList(place) ? place : typeOf(node);
        const items = node.items.map(item => expression(item, itemOf(type)));
        const list = typeName(type);
        //a new list is in brackets before a dot, like (New List(Of Integer) From {1, 2}).Count
        return vb.atom(items.length ? vb.print(vb.items(`New ${list} From {`, items, '}')) : `New ${list}`, UNARY);
      }
      case 'template':
        return name(interpolated(joinedParts(node, types)));
      case 'variable':
        return name(names.of(node.name));
      case 'index': {
        const item = vb.index(expression(node.target), fromZero(vb, node.index, whole));
        return isList(typeOf(node.target)) ? item : vb.member(item, 'ToString', []);
      }
      case 'input':
        imports.add('System');
        if (typeOf(node) === 'real') {
          real = true;
          return vb.call('Convert.ToDouble', [vb.call('Console.ReadLine', [])]);
        }
        return vb.call('Console.ReadLine', []);
      case 'userCall': {
        const definition = definitionOf(tree.statements, node.name);
        const parameters = types.variables.get(node.name)!;
        return vb.call(
          names.of(node.name),
          node.args.map((arg, index) => expression(arg, parameters.get(definition.parameters[index])))
        );
      }
      case 'call':
        return builtIn(node);
      case 'unary':
        if (node.operator === COMMAND.NOT) return vb.unary('Not ', expression(node.operand), NOT);
        return vb.unary(node.operator, expression(node.operand));
      case 'binary':
        return binary(node);
    }
  };

  const binary = (node: Expression & {type: 'binary'}): Code => {
    const left = typeOf(node.left);
    const right = typeOf(node.right);

    if (node.operator === '+' && typeOf(node) === 'text') return name(interpolated(joinedParts(node, types)));
    if (node.operator === COMMAND.IN) return vb.member(expression(node.right), 'Contains', [expression(node.left)]);
    const operator = OPERATORS[node.operator] ?? node.operator;
    if (node.operator === '==' || node.operator === '!=') {
      //values of different types are never equal in CMIL; Visual Basic doesn't compare them
      if (neverEqual(left, right)) return name(node.operator === '==' ? 'False' : 'True');
    }
    return vb.binary(operator, expression(node.left), expression(node.right));
  };

  const builtIn = (node: Expression & {type: 'call'}): Code => {
    const args = node.args.map(arg => expression(arg));
    const [first] = node.args;
    //a whole number is its own floor, ceiling and rounding
    const rounded = (method: string): Code =>
      typeOf(first) === 'whole' ? expression(first) : vb.call('CInt', [math(method, args)]);
    switch (node.name) {
      case COMMAND.POW:
        return power(args[0], args[1]);
      case COMMAND.SQR: {
        if (isSimple(first)) return vb.binary('*', args[0], args[0]);
        const square = power(args[0], name('2'));
        return typeOf(node) === 'whole' ? vb.call('CInt', [square]) : square;
      }
      case COMMAND.ROUND:
        if (args.length === 2) {
          helpers.use('RoundTo');
          real = true;
          return vb.call('RoundTo', args);
        }
        if (typeOf(first) === 'whole') return expression(first);
        return vb.call('CInt', [math('Floor', [vb.binary('+', args[0], name('0.5'))])]);
      case COMMAND.FLOOR:
        return rounded('Floor');
      case COMMAND.CEIL:
        return rounded('Ceiling');
      case COMMAND.ABS:
        return math('Abs', args);
      case COMMAND.LOG:
        return math('Log', [args[1], args[0]]);
      case COMMAND.RANDOM: {
        imports.add('System');
        const [min, max] = node.args.length === 1 ? [null, first] : node.args;
        const last =
          max.type === 'value' && typeof max.value === 'number'
            ? name(String(max.value + 1))
            : vb.binary('+', whole(max), name('1'));
        return vb.call('Random.Shared.Next', [min ? whole(min) : name('1'), last]);
      }
      case COMMAND.LENGTH:
        return vb.member(args[0], isList(typeOf(first)) ? 'Count' : 'Length');
      case COMMAND.UPPER:
        return vb.member(args[0], 'ToUpper', []);
      case COMMAND.LOWER:
        return vb.member(args[0], 'ToLower', []);
      case COMMAND.NUMBER:
        if (isNumber(typeOf(first))) return expression(first);
        imports.add('System');
        real = true;
        return vb.call('Convert.ToDouble', args);
      case COMMAND.TEXT:
        return vb.atom(asText(first), PRECEDENCE['+']);
      case COMMAND.SPLIT: {
        imports.add('System.Linq');
        if (args.length === 1) {
          imports.add('System');
          const split = vb.member(args[0], 'Split', [name('" "c'), name('StringSplitOptions.RemoveEmptyEntries')]);
          return vb.member(split, 'ToList', []);
        }
        const separator = node.args[1];
        if (isText(separator) && separator.value === '') {
          helpers.use('Letters');
          return vb.call('Letters', [args[0]]);
        }
        return vb.member(vb.member(args[0], 'Split', [args[1]]), 'ToList', []);
      }
      case COMMAND.JOIN: {
        const separator = args[1] ?? name('""');
        const list = typeOf(first);
        const item = isList(list) ? list.list : 'unknown';
        if (item === 'text' || item === 'whole') return vb.call('String.Join', [separator, args[0]]);
        //a real number is shown with up to 12 digits, which .NET writes with the computer's decimal separator
        if (item === 'real') real = true;
        helpers.use('Show');
        imports.add('System.Linq');
        //the parameter of the lambda can't have the name of a variable of the program
        const each = names.fresh(['item', 'each']);
        names.release(each);
        const lambda = name(`Function(${each}) Show(${each})`);
        return vb.call('String.Join', [separator, vb.member(args[0], 'Select', [lambda])]);
      }
    }
    const formula = mathOf(
      vb,
      node.name,
      args,
      (method, values) => math(capitalized(method), values),
      () => name('Math.PI')
    );
    if (formula) return formula;
    throw new Error(`No Visual Basic for ${node.name}`);
  };

  const block = statementsOf({
    trivia,
    names,
    braces: BLOCKS,
    declare: (variable, type) => [
      isList(type)
        ? `Dim ${names.of(variable)} As ${initial(type)}`
        : `Dim ${names.of(variable)} As ${typeName(type)} = ${initial(type)}`
    ],
    write: (statement, context) => {
      const {comment, declares, scope} = context;
      //writes a loop, which Exit and Continue in it name
      const loop = (kind: 'For' | 'Do', write: () => void) => {
        loops.push(kind);
        write();
        loops.pop();
      };
      switch (statement.type) {
        case 'print':
          imports.add('System');
          context.line(`Console.WriteLine(${printed(statement.expression)})${comment}`);
          return;
        case 'assign': {
          const value = code(statement.expression, scope.get(statement.name));
          const variable = names.of(statement.name);
          const type = typeName(scope.get(statement.name)!);
          //a new list is declared with it, like Dim scores As New List(Of Integer) From {7, 9}
          if (declares && statement.expression.type === 'list') context.line(`Dim ${variable} As ${value}${comment}`);
          else context.line(`${declares ? `Dim ${variable} As ${type}` : variable} = ${value}${comment}`);
          return;
        }
        case 'setItem': {
          const item = vb.index(expression(statement.target), fromZero(vb, statement.index, whole));
          const value = code(statement.expression, itemOf(typeOf(statement.target)));
          context.line(`${vb.print(item)} = ${value}${comment}`);
          return;
        }
        case 'add':
        case 'remove': {
          const value = expression(statement.expression, itemOf(typeOf(statement.target)));
          const method = statement.type === 'add' ? 'Add' : 'Remove';
          context.line(`${vb.print(vb.member(expression(statement.target), method, [value]))}${comment}`);
          return;
        }
        case 'call':
          context.line(`${code(statement.call)}${comment}`);
          return;
        case 'return':
          context.line(`Return${statement.expression ? ` ${code(statement.expression, returns)}` : ''}${comment}`);
          return;
        case 'if':
          context.blocks(
            branchesOf(statement, (condition, index) => `${index ? 'ElseIf' : 'If'} ${code(condition)} Then`, 'Else'),
            undefined,
            'End If'
          );
          return;
        case 'while':
          loop('Do', () =>
            context.blocks([loopOf(statement, `Do While ${code(statement.condition)}`)], undefined, 'Loop')
          );
          return;
        case 'doWhile':
          loop('Do', () =>
            context.blocks([{text: 'Do', line: statement.doLine, body: statement.body}], {
              text: `Loop While ${code(statement.condition)}`,
              line: statement.line
            })
          );
          return;
        case 'repeat':
          loop('For', () => {
            const counter = context.fresh(['i', 'j', 'k']);
            const head = `For ${counter} As Integer = 1 To ${vb.print(whole(statement.count))}`;
            context.blocks([loopOf(statement, head)], undefined, 'Next');
          });
          return;
        case 'for':
          loop('For', () => {
            const counter = names.of(statement.name);
            const {down, size, signed} = stepOf(statement);
            const step = size
              ? ` Step ${down ? '-' : ''}${vb.print(vb.bracketed(expression(size), UNARY))}`
              : down
                ? ' Step -1'
                : '';
            const type = scope.get(statement.name)!;
            const start = declares ? `${counter} As ${typeName(type)}` : counter;
            //a real last value, like Math.Sqrt(n), is the whole number a whole counter reaches: by the sign of a step
            //that shows only as the program runs
            const reached = (down: boolean) =>
              vb.call('CInt', [math(down ? 'Ceiling' : 'Floor', [expression(statement.to)])]);
            const last =
              type !== 'whole' || typeOf(statement.to) !== 'real'
                ? expression(statement.to)
                : signed
                  ? vb.call('If', [vb.binary('>', expression(size!), name('0')), reached(false), reached(true)])
                  : reached(down);
            const head = `For ${start} = ${code(statement.from)} To ${vb.print(last)}${step}`;
            context.blocks([loopOf(statement, head)], undefined, 'Next');
          });
          return;
        case 'forEach':
          loop('For', () => {
            const type = typeOf(statement.expression);
            let items = code(statement.expression);
            if (!isList(type)) {
              helpers.use('Letters');
              items = `Letters(${items})`;
            } else if (changesItsList(statement)) {
              //the loop changes the list, so it goes over a copy: the items the list had when the loop started
              imports.add('System.Linq');
              items = vb.print(vb.member(expression(statement.expression), 'ToList', []));
            }
            const item = typeName(scope.get(statement.name)!);
            if (declares) {
              const head = `For Each ${names.of(statement.name)} As ${item} In ${items}`;
              context.blocks([loopOf(statement, head)], undefined, 'Next');
              return;
            }
            //the variable is used after the loop too, so it gets each item
            const each = context.fresh(['item', 'each']);
            context.blocks(
              [
                loopOf(statement, `For Each ${each} As ${item} In ${items}`, {
                  first: [`${names.of(statement.name)} = ${each}`]
                })
              ],
              undefined,
              'Next'
            );
          });
          return;
        case 'break':
          context.line(`Exit ${loops[loops.length - 1]}${comment}`);
          return;
        case 'continue':
          context.line(`Continue ${loops[loops.length - 1]}${comment}`);
          return;
      }
    }
  });

  //a function of the program, a Sub when it gives no value; a list is given as it is, so the function changes it
  const signature = (statement: Statement & {type: 'function'}) => {
    const own = types.variables.get(statement.name)!;
    const result = types.results.get(statement.name)!;
    const parameters = statement.parameters.map(
      parameter => `${names.of(parameter)} As ${typeName(own.get(parameter)!)}`
    );
    const head = `${names.of(statement.name)}(${parameters.join(', ')})`;
    return result === 'unknown' ? `Sub ${head}` : `Function ${head} As ${typeName(result)}`;
  };

  const functions = new Writer('    ');
  for (const statement of tree.statements) {
    if (statement.type !== 'function') continue;
    returns = types.results.get(statement.name)!;
    trivia.before(functions, statement.line);
    functions.line(`${signature(statement)}${trivia.after(statement.line)}`, statement.line);
    functions.block(() =>
      block(functions, statement.body, types.variables.get(statement.name)!, new Set(statement.parameters))
    );
    functions.line(returns === 'unknown' ? 'End Sub' : 'End Function');
    functions.blank();
    returns = undefined;
  }
  const program = new Writer('    ');
  block(program, tree.statements, types.variables.get('')!, new Set());
  trivia.rest(program);

  if (real) imports.add('System.Globalization');
  const out = new Writer('    ');
  out.line('Option Strict On');
  out.blank();
  for (const namespace of IMPORTS.filter(namespace => imports.has(namespace))) out.line(`Imports ${namespace}`);
  out.blank();
  out.line('Module Program');
  out.block(() => {
    out.append(functions);
    out.blank();
    out.line('Sub Main()');
    out.block(() => {
      if (real) {
        out.line("' numbers with a point, like 2.5, whatever the language of the computer");
        out.line('CultureInfo.CurrentCulture = CultureInfo.InvariantCulture');
        out.blank();
      }
      out.append(program);
    });
    out.line('End Sub');
    helpers.write(out, helper => helper.code({true: words.true[0], false: words.false[0]}));
  });
  out.line('End Module');
  return out.converted();
};

/** The writer of Visual Basic: its targets, which cmil/convert/visualbasic gives convert(). */
export const WRITERS: Writers = {visualbasic: {typed: true, write: toVisualBasic}};
