/**
 * Swift: what a teacher writes, as a script whose statements are the program, that prints what the CMIL program
 * prints. Numbers are Int or Double, which Swift never mixes, so a whole number meeting a real one becomes
 * Double(n); texts are String, lists arrays, which are values, so a function that changes a list gets it inout; a
 * value is a let unless the program gives it another one, and texts with values in them interpolate them, like
 * "Hi, \(name)!". The functions of the program come first, and the helpers a program needs after the program, each
 * with what it is for.
 */
import {COMMAND} from '../../constants/index.ts';
import TRANSLATION from '../../translations/index.ts';
import {Grammar, POSTFIX, fromZero, mathOf, type Code} from '../code.ts';
import {
  Helpers,
  Names,
  Trivia,
  Writer,
  assignedIn,
  changedIn,
  sharedListsOf,
  definitionOf,
  isJoined,
  isNumeral,
  isSimple,
  isText,
  joinedParts,
  neverEqual,
  quoted,
  readIn,
  stepOf,
  type Converted
} from '../emit.ts';
import {SAME_LINE, branchesOf, loopOf, loopOverValues, statementsOf} from '../statements.ts';
import {isList, isNumber, type Type, type Types} from '../types.ts';
import type {ProgramTree} from '../../program.ts';
import type {Expression, Statement} from '../../core/types.ts';

//the words of Swift, and the functions of its library and of the helpers, which a program's names can't be
const RESERVED = new Set(
  [
    'associatedtype class deinit enum extension fileprivate func import init inout internal let open operator private',
    'precedencegroup protocol public rethrows static struct subscript typealias var break case catch continue default',
    'defer do else fallthrough for guard if in repeat return throw switch where while Any as await false is nil self',
    'Self super throws true try print readLine String Int Double Bool Array Foundation stride show toNumber roundTo',
    'sqrt pow sin cos tan asin acos atan log log10 exp floor ceil abs max min'
  ]
    .join(' ')
    .split(' ')
);

//the precedence of Swift's operators, from the loosest: ?? binds more tightly than a comparison, and a range more
//loosely than arithmetic
const PRECEDENCE: Record<string, number> = {
  '||': 1,
  '&&': 2,
  '==': 3,
  '!=': 3,
  '<': 3,
  '>': 3,
  '<=': 3,
  '>=': 3,
  '??': 4,
  '...': 5,
  '..<': 5,
  '+': 6,
  '-': 6,
  '*': 7,
  '/': 7,
  '%': 7
};

const OPERATORS: Record<string, string> = {[COMMAND.AND]: '&&', [COMMAND.OR]: '||'};

const swift = new Grammar(PRECEDENCE, new Set(['...', '..<']));
const name = (text: string) => swift.atom(text);

//a text as Swift writes it, like "a \"b\""
const literal = (text: string) => quoted(text, {'\0': '\\0'});

type Helper = {
  imports: string[];
  uses?: string[];
  code: (words: [string, string]) => string[];
};

//the helpers, by name, in the order they are written: what they import, the helpers they use, and their code
const HELPERS: Record<string, Helper> = {
  toNumber: {
    imports: ['Foundation'],
    code: () => [
      '// the number in a text',
      'func toNumber(_ text: String) -> Double {',
      '    return Double(text.trimmingCharacters(in: .whitespaces)) ?? 0',
      '}'
    ]
  },
  show: {
    imports: ['Foundation'],
    code: ([yes, no]) => [
      '// a value as CMIL prints it: a real number with up to 12 digits, and a boolean in words',
      'func show(_ value: Any) -> String {',
      '    if let number = value as? Int {',
      '        return String(number)',
      '    }',
      '    if let number = value as? Double {',
      '        return String(format: "%.12g", number)',
      '    }',
      '    if let truth = value as? Bool {',
      `        return truth ? ${literal(yes)} : ${literal(no)}`,
      '    }',
      '    return "\\(value)"',
      '}'
    ]
  },
  roundTo: {
    imports: ['Foundation'],
    uses: ['show'],
    code: () => [
      '// a number rounded to a count of decimals, a half up, after rounding it like it is printed, so 1.005 is 1.01',
      'func roundTo(_ number: Double, _ digits: Int) -> Double {',
      '    let factor = pow(10, Double(digits))',
      '    return floor(Double(show(number * factor))! + 0.5) / factor',
      '}'
    ]
  }
};

/** The Swift type of a value: Int, Double, String, Bool or an array; Int when nothing says. */
export const swiftType = (type: Type): string => {
  if (isList(type)) return `[${swiftType(type.list)}]`;
  return type === 'real' ? 'Double' : type === 'text' ? 'String' : type === 'boolean' ? 'Bool' : 'Int';
};

//the value a variable declared before it gets one starts with, since Swift reads only variables that have one
const initial = (type: Type): string => {
  if (isList(type)) return `${swiftType(type)}()`;
  return type === 'real' ? '0.0' : type === 'text' ? '""' : type === 'boolean' ? 'false' : '0';
};

/**
 * Writes a program in Swift.
 */
export const toSwift = (tree: ProgramTree, types: Types, sourceCode: string): Converted => {
  const names = new Names(tree.names, RESERVED);
  const trivia = new Trivia(tree.comments, sourceCode, '//');
  const imports = new Set<string>();
  const helpers = new Helpers(HELPERS, imports);
  const {words: commands} = TRANSLATION[tree.language];
  const words: [string, string] = [commands.true[0], commands.false[0]];
  const english = tree.language === 'en';
  //how often each variable of the scope being written gets a value, and the lists it changes, which are values: a
  //let has one value, which it doesn't change
  let assignments = new Map<string, number>();
  let changes = new Set<string>();
  //the lists of the function being written that it changes, which it gets inout
  let changing = new Set<string>();
  //the type of the value the function being written returns
  let returns: Type | undefined;

  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';
  const code = (node: Expression, place?: Type) => swift.print(expression(node, place));

  //the math of Foundation, which a program imports
  const foundation = (method: string, args: Code[]): Code => {
    imports.add('Foundation');
    return swift.call(method, args);
  };

  //a boolean in the words of the program's language, as CMIL prints it
  const inWords = (node: Expression) =>
    swift.atom(
      `${swift.print(swift.bracketed(expression(node), PRECEDENCE['||'] + 1))} ? ${literal(words[0])} : ${literal(words[1])}`,
      0
    );

  //a value Swift prints as CMIL does: a whole number, a text and a boolean in English
  const native = (type: Type): boolean => type === 'whole' || type === 'text' || (type === 'boolean' && english);

  //a value as CMIL prints it
  const shown = (node: Expression): Code => {
    helpers.use('show');
    return swift.call('show', [expression(node)]);
  };

  //a value as a text, like text() gives it
  const asText = (node: Expression): Code => {
    if (isJoined(node, types)) return interpolated(joinedParts(node, types));
    const type = typeOf(node);
    if (type === 'text') return expression(node);
    if (type === 'boolean' && !english) return inWords(node);
    if (!native(type)) return shown(node);
    return swift.call('String', [expression(node)]);
  };

  //values joined into a text, each in \( ), like "Hi, \(name)!"
  const interpolated = (parts: Expression[]): Code => {
    const text = parts.map(part => {
      if (isText(part)) return literal(part.value).slice(1, -1);
      const type = typeOf(part);
      const value = type === 'boolean' && !english ? inWords(part) : native(type) ? expression(part) : shown(part);
      return `\\(${swift.print(value)})`;
    });
    return name(`"${text.join('')}"`);
  };

  //an expression; a whole number in the place of a real one, like a Double variable, becomes a real one: 1.0, or
  //Double(n), which Swift doesn't do itself
  const expression = (node: Expression, place?: Type): Code => {
    const type = typeOf(node);
    if (place === 'real' && type === 'whole') {
      return isNumeral(node) ? name(`${node.value}.0`) : swift.call('Double', [expression(node)]);
    }
    if (place === 'whole' && type === 'real') return swift.call('Int', [expression(node)]);
    return write(node, place);
  };
  const real = (node: Expression) => expression(node, 'real');
  const whole = (node: Expression) => expression(node, 'whole');

  const write = (node: Expression, place?: Type): Code => {
    switch (node.type) {
      case 'value':
        if (node.constant === 'pi') return name('Double.pi');
        if (node.constant === 'e') return foundation('exp', [name('1.0')]);
        if (typeof node.value === 'string') return name(literal(node.value));
        //a negative number is Swift's - before it
        if (typeof node.value === 'number' && node.value < 0) return swift.unary('-', name(String(-node.value)));
        return name(String(node.value));
      case 'list': {
        const type = place && isList(place) ? place : typeOf(node);
        if (!node.items.length) return name(`${swiftType(type)}()`);
        const item = isList(type) ? type.list : 'unknown';
        return swift.items(
          '[',
          node.items.map(each => expression(each, item)),
          ']'
        );
      }
      case 'template':
        return interpolated(joinedParts(node, types));
      case 'variable':
        return name(names.of(node.name));
      case 'index': {
        if (isList(typeOf(node.target)))
          return swift.index(expression(node.target), fromZero(swift, node.index, whole));
        //a letter of a text, which an array of its letters has
        const letters = swift.call('Array', [expression(node.target)]);
        return swift.call('String', [swift.index(letters, fromZero(swift, node.index, whole))]);
      }
      case 'input': {
        const answer = swift.binary('??', swift.call('readLine', []), name('""'));
        return typeOf(node) === 'real' ? swift.binary('??', swift.call('Double', [answer]), name('0')) : answer;
      }
      case 'userCall': {
        const definition = definitionOf(tree.statements, node.name);
        const scope = types.variables.get(node.name)!;
        const shared = sharedListsOf(tree.statements, definition);
        return swift.call(
          names.of(node.name),
          node.args.map((arg, index) => {
            const parameter = definition.parameters[index];
            const value = expression(arg, scope.get(parameter));
            //a list the caller sees changed is inout
            return shared.has(parameter) && isList(scope.get(parameter)!) ? swift.unary('&', value) : value;
          })
        );
      }
      case 'call':
        return builtIn(node);
      case 'unary':
        if (node.operator === COMMAND.NOT) return swift.unary('!', expression(node.operand));
        return swift.unary(node.operator, expression(node.operand, typeOf(node) === 'real' ? 'real' : undefined));
      case 'binary':
        return binary(node);
    }
  };

  const binary = (node: Expression & {type: 'binary'}): Code => {
    const left = typeOf(node.left);
    const right = typeOf(node.right);
    //a number written in the program is a Double where Swift needs one, and any other whole number becomes one
    const asReal = (operand: Expression) => (isNumeral(operand) ? write(operand) : real(operand));

    if (node.operator === '+' && typeOf(node) === 'text') return interpolated(joinedParts(node, types));
    if (node.operator === COMMAND.IN) {
      if (!isList(right)) imports.add('Foundation');
      const item = isList(right) ? right.list : undefined;
      return swift.member(expression(node.right), 'contains', [expression(node.left, item)]);
    }
    //a real number divided by a real number, which Swift needs of two whole numbers too: 7 / 2 written in the program
    //is a whole number, 7.0 / 2 a real one
    if (node.operator === '/') {
      if (isNumeral(node.left) && isNumeral(node.right) && left === 'whole' && right === 'whole') {
        return swift.binary('/', real(node.left), write(node.right));
      }
      return swift.binary('/', asReal(node.left), asReal(node.right));
    }
    //the remainder of real numbers, which % gives only of whole numbers
    if (node.operator === '%' && (left === 'real' || right === 'real')) {
      return swift.member(asReal(node.left), 'truncatingRemainder', [
        name(`dividingBy: ${swift.print(asReal(node.right))}`)
      ]);
    }
    const operator = OPERATORS[node.operator] ?? node.operator;
    //values of different types are never equal in CMIL; Swift doesn't compare them
    if ((node.operator === '==' || node.operator === '!=') && neverEqual(left, right)) {
      return name(node.operator === '==' ? 'false' : 'true');
    }
    //a whole number with a real one is a real number
    if (isNumber(left) && isNumber(right) && left !== right) {
      return swift.binary(operator, asReal(node.left), asReal(node.right));
    }
    return swift.binary(operator, expression(node.left), expression(node.right));
  };

  const builtIn = (node: Expression & {type: 'call'}): Code => {
    const [first] = node.args;
    //a whole number is its own floor, ceiling and rounding
    const rounded = (method: string): Code =>
      typeOf(first) === 'whole' ? expression(first) : swift.call('Int', [foundation(method, [real(first)])]);
    switch (node.name) {
      case COMMAND.SQR: {
        if (isSimple(first)) return swift.binary('*', expression(first), expression(first));
        const square = foundation('pow', [real(first), name('2')]);
        return typeOf(node) === 'whole' ? swift.call('Int', [square]) : square;
      }
      case COMMAND.ROUND:
        if (node.args.length === 2) {
          helpers.use('roundTo');
          return swift.call('roundTo', [real(first), whole(node.args[1])]);
        }
        if (typeOf(first) === 'whole') return expression(first);
        return swift.call('Int', [foundation('floor', [swift.binary('+', real(first), name('0.5'))])]);
      case COMMAND.FLOOR:
        return rounded('floor');
      case COMMAND.CEIL:
        return rounded('ceil');
      case COMMAND.ABS:
        return swift.call('abs', [expression(first)]);
      case COMMAND.RANDOM: {
        const [min, max] = node.args.length === 1 ? [null, first] : node.args;
        const range = swift.binary('...', min ? whole(min) : name('1'), whole(max));
        return swift.call('Int.random', [name(`in: ${swift.print(range)}`)]);
      }
      case COMMAND.LENGTH:
        return swift.member(expression(first), 'count');
      case COMMAND.UPPER:
        return swift.member(expression(first), 'uppercased', []);
      case COMMAND.LOWER:
        return swift.member(expression(first), 'lowercased', []);
      case COMMAND.NUMBER:
        if (typeOf(first) === 'whole') return swift.call('Double', [expression(first)]);
        if (isNumber(typeOf(first))) return expression(first);
        helpers.use('toNumber');
        return swift.call('toNumber', [expression(first)]);
      case COMMAND.TEXT:
        return asText(first);
      case COMMAND.SPLIT: {
        const separator = node.args[1];
        const text = expression(first);
        //the words of a text, between its spaces, and its letters, each a text of its own
        const target = swift.print(swift.bracketed(text, POSTFIX));
        if (!separator) return name(`${target}.split(whereSeparator: \\.isWhitespace).map(String.init)`);
        if (isText(separator) && separator.value === '') return name(`${target}.map(String.init)`);
        imports.add('Foundation');
        return swift.member(text, 'components', [name(`separatedBy: ${code(separator)}`)]);
      }
      case COMMAND.JOIN: {
        const separator = node.args[1] ? code(node.args[1]) : '""';
        const list = typeOf(first);
        const item = isList(list) ? list.list : 'unknown';
        const items = swift.print(swift.bracketed(expression(first), POSTFIX));
        if (item === 'text') return name(`${items}.joined(separator: ${separator})`);
        const each = item === 'whole' ? 'String($0)' : (helpers.use('show'), 'show($0)');
        return name(`${items}.map { ${each} }.joined(separator: ${separator})`);
      }
    }
    const formula = mathOf(swift, node.name, node.args.map(real), foundation, () => name('Double.pi'));
    if (formula) return formula;
    throw new Error(`No Swift for ${node.name}`);
  };

  //what print prints: a value as it is, or as CMIL prints it
  const printed = (node: Expression): string => {
    if (isText(node) && node.value === '') return '';
    const type = typeOf(node);
    if (isJoined(node, types) || !native(type) || type === 'boolean') return swift.print(asText(node));
    return code(node);
  };

  const itemOf = (list: Expression) => {
    const type = typeOf(list);
    return isList(type) ? type.list : undefined;
  };

  const block = statementsOf({
    trivia,
    names,
    braces: SAME_LINE,
    declare: (variable, type) => [`var ${names.of(variable)} = ${initial(type)}`],
    write: (statement, context) => {
      const {comment, declares, scope} = context;
      //a loop over a range or a list, whose variable is the loop's own, or _ when the program has it nowhere else
      const each = (loop: Statement & {type: 'for' | 'forEach'}, items: string) => {
        const unused = declares && !readIn(loop.body).has(loop.name) && !assignedIn(loop.body).has(loop.name);
        const own = unused ? '_' : names.of(loop.name);
        const assign = (value: string) => `${declares ? 'var ' : ''}${own} = ${value}`;
        return loopOverValues(context, loop, own, variable => `for ${variable} in ${items}`, assign);
      };
      switch (statement.type) {
        case 'print':
          context.line(`print(${printed(statement.expression)})${comment}`);
          return;
        case 'assign': {
          const type = scope.get(statement.name)!;
          const once = assignments.get(statement.name) === 1 && !changes.has(statement.name);
          const keyword = declares ? (once ? 'let ' : 'var ') : '';
          context.line(`${keyword}${names.of(statement.name)} = ${code(statement.expression, type)}${comment}`);
          return;
        }
        case 'setItem': {
          const item = swift.index(expression(statement.target), fromZero(swift, statement.index, whole));
          context.line(`${swift.print(item)} = ${code(statement.expression, itemOf(statement.target))}${comment}`);
          return;
        }
        case 'add': {
          const value = expression(statement.expression, itemOf(statement.target));
          context.line(`${swift.print(swift.member(expression(statement.target), 'append', [value]))}${comment}`);
          return;
        }
        case 'remove': {
          const list = expression(statement.target);
          const found = swift.member(list, 'firstIndex', [
            name(`of: ${code(statement.expression, itemOf(statement.target))}`)
          ]);
          const at = context.fresh(['index', 'place']);
          context.blocks([
            {
              text: `if let ${at} = ${swift.print(found)}`,
              line: statement.line,
              body: [],
              first: [swift.print(swift.member(list, 'remove', [name(`at: ${at}`)]))]
            }
          ]);
          return;
        }
        case 'call': {
          //a function that gives a value, which the program doesn't use
          const call = statement.call;
          const gives = call.type === 'userCall' && types.results.get(call.name) !== 'unknown';
          context.line(`${gives ? '_ = ' : ''}${code(call)}${comment}`);
          return;
        }
        case 'return':
          context.line(`return${statement.expression ? ` ${code(statement.expression, returns)}` : ''}${comment}`);
          return;
        case 'if':
          context.blocks(branchesOf(statement, (condition, index) => `${index ? 'else ' : ''}if ${code(condition)}`));
          return;
        case 'while':
          context.blocks([loopOf(statement, `while ${code(statement.condition)}`)]);
          return;
        case 'doWhile':
          context.blocks([{text: 'repeat', line: statement.doLine, body: statement.body}], {
            text: `while ${code(statement.condition)}`,
            line: statement.line
          });
          return;
        case 'repeat': {
          const {count} = statement;
          //a count written in the program counts from 1, any other from 0, below it
          const range =
            isNumeral(count) && count.value >= 1
              ? `1...${count.value}`
              : `0..<${swift.print(swift.bracketed(whole(count), PRECEDENCE['..<'] + 1))}`;
          context.blocks([loopOf(statement, `for _ in ${range}`)]);
          return;
        }
        case 'for': {
          const type = scope.get(statement.name)!;
          const {down, size, signed} = stepOf(statement);
          const place = type === 'real' ? 'real' : 'whole';
          //a real last value of a whole counter, like sqrt(n), is the whole number the counter reaches: by the sign
          //of a step that shows only as the program runs
          const reached = (down: boolean) =>
            swift.call('Int', [foundation(down ? 'ceil' : 'floor', [expression(statement.to)])]);
          const last =
            type !== 'whole' || typeOf(statement.to) !== 'real'
              ? expression(statement.to, place)
              : signed
                ? name(
                    `${swift.print(swift.binary('>', expression(size!, place), name('0')))} ? ${swift.print(reached(false))} : ${swift.print(reached(true))}`
                  )
                : reached(down);
          const from = expression(statement.from, place);
          //a number written in the program, like 1 or -1
          const numberOf = (value: Expression) =>
            isNumeral(value)
              ? value.value
              : value.type === 'unary' && isNumeral(value.operand)
                ? -value.operand.value
                : NaN;
          const range =
            !size && !down && type === 'whole' && numberOf(statement.from) <= numberOf(statement.to)
              ? swift.binary('...', from, last)
              : name(
                  `stride(from: ${swift.print(from)}, through: ${swift.print(last)}, by: ${down ? '-' : ''}${size ? swift.print(swift.bracketed(expression(size, place), PRECEDENCE['*'])) : '1'})`
                );
          context.blocks([each(statement, swift.print(range))]);
          return;
        }
        case 'forEach': {
          const type = typeOf(statement.expression);
          //a list is a value, so the loop goes over the items it had when the loop started, as in CMIL
          let items = code(statement.expression);
          //the letters of a text, each a text of its own
          if (!isList(type))
            items = `${swift.print(swift.bracketed(expression(statement.expression), POSTFIX))}.map(String.init)`;
          context.blocks([each(statement, items)]);
          return;
        }
        case 'break':
        case 'continue':
          context.line(`${statement.type}${comment}`);
          return;
      }
    }
  });

  //the functions of the program, first; a list a function changes is inout, and a parameter it gives another value
  //is a var of its own
  const program = new Writer('    ');
  for (const statement of tree.statements) {
    if (statement.type !== 'function') continue;
    const scope = types.variables.get(statement.name)!;
    const result = types.results.get(statement.name)!;
    //a list the caller sees changed is inout, and one the function changes that no caller sees a variable of its own
    const shared = sharedListsOf(tree.statements, statement);
    changing = new Set(
      statement.parameters.filter(parameter => isList(scope.get(parameter)!) && shared.has(parameter))
    );
    assignments = assignedIn(statement.body);
    changes = changedIn(statement.body);
    trivia.before(program, statement.line);
    const parameters = statement.parameters.map(
      parameter =>
        `_ ${names.of(parameter)}: ${changing.has(parameter) ? 'inout ' : ''}${swiftType(scope.get(parameter)!)}`
    );
    program.line(
      `func ${names.of(statement.name)}(${parameters.join(', ')})${result === 'unknown' ? '' : ` -> ${swiftType(result)}`} {${trivia.after(statement.line)}`,
      statement.line
    );
    returns = result;
    program.block(() => {
      const own = (parameter: string) =>
        assignments.has(parameter) || (isList(scope.get(parameter)!) && changes.has(parameter));
      for (const parameter of statement.parameters.filter(each => own(each) && !changing.has(each))) {
        program.line(`var ${names.of(parameter)} = ${names.of(parameter)}`, statement.line);
      }
      block(program, statement.body, scope, new Set(statement.parameters));
    });
    returns = undefined;
    program.line('}');
    program.blank();
  }
  changing = new Set();
  const statements = tree.statements.filter(statement => statement.type !== 'function');
  assignments = assignedIn(statements);
  changes = changedIn(statements);
  block(program, tree.statements, types.variables.get('')!, new Set());
  trivia.rest(program);

  const out = new Writer('    ');
  [...imports].sort().forEach(item => out.line(`import ${item}`));
  out.blank();
  out.append(program);
  helpers.write(out, helper => helper.code(words));
  return out.converted();
};
