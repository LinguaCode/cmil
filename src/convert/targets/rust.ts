/**
 * Rust: what a teacher writes, that prints what the CMIL program prints and builds with rustc alone. Numbers are i64
 * or f64, which Rust never mixes, so a whole number meeting a real one becomes n as f64, and an index is a usize;
 * texts are String, lists Vec, given to a function by reference, &mut when it changes them, and copied with clone()
 * where the program keeps them too; a variable is mut when the program gives it another value or changes it; print
 * is println! with a format, like "Hi, {name}!". The functions of the program come before main, and the helpers a
 * program needs after it, each with what it is for.
 */
import {COMMAND} from '../../constants/index.ts';
import TRANSLATION from '../../translations/index.ts';
import {Grammar, POSTFIX, fromZero, mathOf, signedTest, type Code} from '../code.ts';
import {
  Helpers,
  Names,
  Trivia,
  Writer,
  assignedIn,
  changedIn,
  changesItsList,
  definitionOf,
  isJoined,
  isNumeral,
  isSimple,
  isText,
  joinedParts,
  negation,
  neverEqual,
  quoted,
  readIn,
  stepOf,
  variablesIn,
  type Converted
} from '../emit.ts';
import {SAME_LINE, branchesOf, doWhileOf, loopOf, loopOverValues, statementsOf} from '../statements.ts';
import {isList, isNumber, type Type, type Types} from '../types.ts';
import type {ProgramTree} from '../../program.ts';
import type {Expression, Statement} from '../../core/types.ts';

//the words of Rust, and the names of its library and of the helpers, which a program's names can't be
const RESERVED = new Set(
  [
    'as break const continue crate else enum extern false fn for if impl in let loop match mod move mut pub ref return',
    'self Self static struct super trait true type unsafe use where while async await dyn abstract become box do final',
    'macro override priv typeof unsized virtual yield try union main std String Vec Some None Ok Err i64 f64 bool usize',
    'print println format vec Show show item read_text read_number random round_to PI E'
  ]
    .join(' ')
    .split(' ')
);

//the precedence of Rust's operators, from the loosest: a range binds most loosely, and as more tightly than * and
//the like
const PRECEDENCE: Record<string, number> = {
  '..': 1,
  '..=': 1,
  '||': 2,
  '&&': 3,
  '==': 4,
  '!=': 4,
  '<': 4,
  '>': 4,
  '<=': 4,
  '>=': 4,
  '+': 5,
  '-': 5,
  '*': 6,
  '/': 6,
  '%': 6,
  as: 7
};

const OPERATORS: Record<string, string> = {[COMMAND.AND]: '&&', [COMMAND.OR]: '||'};

const rust = new Grammar(PRECEDENCE, new Set(['..', '..=']));
const name = (text: string) => rust.atom(text);

//a value as another type, like n as f64
const cast = (value: Code, type: string) => rust.binary('as', value, name(type));

//a comparison, whose operands Rust compares only in brackets when they are comparisons or casts, since n as f64 < x
//reads < as the start of a type
const compare = (operator: string, left: Code, right: Code) => {
  const inBrackets = (side: Code) =>
    side.kind === 'binary' && (PRECEDENCE[side.operator] === PRECEDENCE['=='] || side.operator === 'as')
      ? ({kind: 'paren', inner: side} as Code)
      : side;
  return rust.binary(operator, inBrackets(left), inBrackets(right));
};

//a text as Rust writes it, like "a \"b\""
const literal = (text: string) => quoted(text, {'\0': '\\0'});

type Helper = {
  imports: string[];
  uses?: string[];
  code: (words: [string, string]) => string[];
};

//the helpers, by name, in the order they are written: what they use of the library, the helpers they use, and their
//code
const HELPERS: Record<string, Helper> = {
  readText: {
    imports: [],
    code: () => [
      '// an answer of the user, as a text',
      'fn read_text() -> String {',
      '    let mut answer = String::new();',
      '    std::io::stdin().read_line(&mut answer).unwrap();',
      "    answer.trim_end_matches(&['\\r', '\\n'][..]).to_string()",
      '}'
    ]
  },
  readNumber: {
    imports: [],
    uses: ['readText'],
    code: () => [
      '// an answer of the user, as a number',
      'fn read_number() -> f64 {',
      '    read_text().trim().parse().unwrap_or(0.0)',
      '}'
    ]
  },
  random: {
    imports: ['std::collections::hash_map::RandomState', 'std::hash::{BuildHasher, Hasher}'],
    code: () => [
      "// a random whole number from min to max; Rust's library has no random numbers, so a hasher with keys of its",
      '// own, which it makes at random, gives one',
      'fn random(min: i64, max: i64) -> i64 {',
      '    let value = RandomState::new().build_hasher().finish();',
      '    min + (value % (max - min + 1) as u64) as i64',
      '}'
    ]
  },
  show: {
    imports: [],
    code: ([yes, no]) => [
      '// a value as CMIL prints it: a real number with up to 12 digits, and all of them, and a boolean in words',
      'trait Show {',
      '    fn show(&self) -> String;',
      '}',
      '',
      'impl Show for i64 {',
      '    fn show(&self) -> String {',
      '        self.to_string()',
      '    }',
      '}',
      '',
      'impl Show for f64 {',
      '    fn show(&self) -> String {',
      '        // 12 digits, like 1.50000000000e25, which Rust then prints with all its digits',
      '        let rounded: f64 = format!("{:.11e}", self).parse().unwrap();',
      '        if rounded == 0.0 {',
      '            "0".to_string()',
      '        } else {',
      '            rounded.to_string()',
      '        }',
      '    }',
      '}',
      '',
      'impl Show for bool {',
      '    fn show(&self) -> String {',
      '        if *self {',
      `            ${literal(yes)}.to_string()`,
      '        } else {',
      `            ${literal(no)}.to_string()`,
      '        }',
      '    }',
      '}'
    ]
  },
  roundTo: {
    imports: [],
    uses: ['show'],
    code: () => [
      '// a number rounded to a count of decimals, a half up, after rounding it like it is printed, so 1.005 is 1.01',
      'fn round_to(number: f64, digits: i64) -> f64 {',
      '    let factor = 10_f64.powi(digits as i32);',
      '    ((number * factor).show().parse::<f64>().unwrap() + 0.5).floor() / factor',
      '}'
    ]
  }
};

/** The Rust type of a value: i64, f64, String, bool or a Vec; i64 when nothing says. */
export const rustType = (type: Type): string => {
  if (isList(type)) return `Vec<${rustType(type.list)}>`;
  return type === 'real' ? 'f64' : type === 'text' ? 'String' : type === 'boolean' ? 'bool' : 'i64';
};

//the value a variable declared before it gets one starts with, since Rust reads only variables that have one
const initial = (type: Type): string => {
  if (isList(type)) return 'Vec::new()';
  return type === 'real' ? '0.0' : type === 'text' ? 'String::new()' : type === 'boolean' ? 'false' : '0';
};

//a value Rust copies, which it gives without clone()
const isCopy = (type: Type) => isNumber(type) || type === 'boolean';

/**
 * Writes a program in Rust.
 */
export const toRust = (tree: ProgramTree, types: Types, sourceCode: string): Converted => {
  const names = new Names(tree.names, RESERVED);
  const trivia = new Trivia(tree.comments, sourceCode, '//');
  const imports = new Set<string>();
  const helpers = new Helpers(HELPERS, imports);
  const {words: commands} = TRANSLATION[tree.language];
  const words: [string, string] = [commands.true[0], commands.false[0]];
  const english = tree.language === 'en';
  //how often each variable of the scope being written gets a value, and the lists it changes: mut has more values,
  //or changes
  let assignments = new Map<string, number>();
  let changes = new Set<string>();
  //the parameters of the function being written that it borrows: a text as &str, a list as &Vec, or as &mut Vec
  let borrowed = new Map<string, 'text' | 'list' | 'mutable'>();
  //the type of the value the function being written returns
  let returns: Type | undefined;

  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';
  const code = (node: Expression, place?: Type) => rust.print(expression(node, place));

  //a function of the numbers of a type, like f64::sqrt(x), which a method like (2.0 * 2.0).sqrt() can't be of numbers
  //written in the program, whose type Rust doesn't know
  const method = (value: Code, method: string, args: Code[], type = 'f64'): Code =>
    rust.call(`${type}::${method}`, [value, ...args]);

  //a boolean in the words of the program's language, as CMIL prints it
  const inWords = (node: Expression) =>
    rust.atom(`if ${code(node)} { ${literal(words[0])} } else { ${literal(words[1])} }`, 0);

  //a value Rust prints as CMIL does: a whole number, a text and a boolean in English
  const native = (type: Type): boolean => type === 'whole' || type === 'text' || (type === 'boolean' && english);

  //a value as CMIL prints it, by the method of the helper Show; a real number of numbers written in the program is an
  //f64 first, whose type Rust doesn't know
  const shown = (node: Expression): Code => {
    helpers.use('show');
    const constant = typeOf(node) === 'real' && !variablesIn(node).size && !hasCall(node);
    return rust.member(constant ? cast(expression(node), 'f64') : expression(node), 'show', []);
  };

  //the format of println! and format!, and its values: a variable in the braces, like {name}, any other value after
  //the format, and a value that Rust doesn't print as CMIL does, like a real number it computes, by show()
  const format = (parts: Expression[]): {format: string; args: Code[]} => {
    let text = '';
    const args: Code[] = [];
    for (const part of parts) {
      if (isText(part)) {
        text += literal(part.value)
          .slice(1, -1)
          .replace(/[{}]/g, brace => brace + brace);
        continue;
      }
      const type = typeOf(part);
      if (type === 'boolean' && !english) {
        text += '{}';
        args.push(inWords(part));
      } else if (type === 'real' ? !isNumeral(part) || part.constant : !native(type)) {
        text += '{}';
        args.push(shown(part));
      } else if (part.type === 'variable') {
        text += `{${names.of(part.name)}}`;
      } else {
        text += '{}';
        args.push(expression(part));
      }
    }
    return {format: text, args};
  };

  //a text of values joined, made by format!
  const formatted = (parts: Expression[]): Code => {
    const {format: text, args} = format(parts);
    return name(`format!(${[`"${text}"`, ...args.map(arg => rust.print(arg))].join(', ')})`);
  };

  //a value as a text, like text() gives it, which is a String
  const asText = (node: Expression): Code => {
    if (isJoined(node, types)) return formatted(joinedParts(node, types));
    const type = typeOf(node);
    if (type === 'text') return owned(node);
    if (type === 'boolean' && !english) return rust.member(inWords(node), 'to_string', []);
    if (type === 'real' || !native(type)) return shown(node);
    return rust.member(expression(node), 'to_string', []);
  };

  //a text or a list as a value of its own, where Rust moves it: a text in quotes by to_string(), and a variable or an
  //item of a list, which the program keeps, by clone()
  const owned = (node: Expression, place?: Type): Code => {
    const type = typeOf(node);
    const value = expression(node, place);
    if (isCopy(type) || (node.type !== 'variable' && node.type !== 'index' && !isText(node))) return value;
    if (type === 'text' && (isText(node) || (node.type === 'variable' && borrowed.has(node.name)))) {
      return rust.member(value, 'to_string', []);
    }
    return rust.member(value, 'clone', []);
  };

  //a text or a list a function borrows: by &, unless it is a text in quotes, or a parameter the function borrows
  const borrow = (node: Expression, mutable = false): Code => {
    const value = expression(node);
    if (isText(node) || (node.type === 'variable' && borrowed.has(node.name))) return value;
    return rust.unary(mutable ? '&mut ' : '&', value);
  };

  //a text as a &str, for a comparison of texts
  const asStr = (node: Expression): Code =>
    isText(node) || (node.type === 'variable' && borrowed.has(node.name))
      ? expression(node)
      : rust.member(expression(node), 'as_str', []);

  //an expression; a whole number in the place of a real one, like an f64 variable, becomes a real one: 1.0, or
  //n as f64, which Rust doesn't do itself
  const expression = (node: Expression, place?: Type): Code => {
    const type = typeOf(node);
    if (place === 'real' && type === 'whole') {
      return isNumeral(node) ? name(`${node.value}.0`) : cast(expression(node), 'f64');
    }
    if (place === 'whole' && type === 'real') return cast(expression(node), 'i64');
    return write(node, place);
  };
  const real = (node: Expression) => expression(node, 'real');
  const whole = (node: Expression) => expression(node, 'whole');

  //a place in a list or a text, which Rust counts from 0 as a usize
  const at = (node: Expression): Code => {
    const index = fromZero(rust, node, whole);
    return index.kind === 'atom' ? index : cast(index, 'usize');
  };

  const write = (node: Expression, place?: Type): Code => {
    switch (node.type) {
      case 'value':
        if (node.constant) {
          imports.add(`std::f64::consts::${node.constant.toUpperCase()}`);
          return name(node.constant.toUpperCase());
        }
        if (typeof node.value === 'string') return name(literal(node.value));
        if (typeof node.value === 'number' && node.value < 0) return rust.unary('-', name(String(-node.value)));
        //a whole number past an i32, which Rust makes a number written in the program, is an i64
        if (typeof node.value === 'number' && Number.isInteger(node.value) && node.value > 2147483647) {
          return name(`${node.value}_i64`);
        }
        return name(String(node.value));
      case 'list': {
        const type = place && isList(place) ? place : typeOf(node);
        const item = isList(type) ? type.list : 'unknown';
        //an empty list in no place of a type, like the list of a loop, names the type of its items
        if (!node.items.length) return name(place ? 'Vec::new()' : `Vec::<${rustType(item)}>::new()`);
        return rust.items(
          'vec![',
          node.items.map(each => owned(each, item)),
          ']'
        );
      }
      case 'template':
        return formatted(joinedParts(node, types));
      case 'variable':
        return name(names.of(node.name));
      case 'index':
        if (isList(typeOf(node.target))) return rust.index(expression(node.target), at(node.index));
        //a letter of a text, which its chars have
        return rust.member(
          rust.member(
            rust.member(rust.member(expression(node.target), 'chars', []), 'nth', [at(node.index)]),
            'unwrap',
            []
          ),
          'to_string',
          []
        );
      case 'input':
        helpers.use(typeOf(node) === 'real' ? 'readNumber' : 'readText');
        return rust.call(typeOf(node) === 'real' ? 'read_number' : 'read_text', []);
      case 'userCall': {
        const definition = definitionOf(tree.statements, node.name);
        const scope = types.variables.get(node.name)!;
        const changed = changedIn(definition.body);
        return rust.call(
          names.of(node.name),
          node.args.map((arg, index) => {
            const parameter = definition.parameters[index];
            const type = scope.get(parameter)!;
            if (type === 'text' || isList(type)) return borrow(arg, isList(type) && changed.has(parameter));
            return expression(arg, type);
          })
        );
      }
      case 'call':
        return builtIn(node);
      case 'unary':
        if (node.operator === COMMAND.NOT) return rust.unary('!', expression(node.operand));
        //Rust has no + of one number, which is the number
        if (node.operator === '+') return expression(node.operand, typeOf(node) === 'real' ? 'real' : undefined);
        return rust.unary(node.operator, expression(node.operand, typeOf(node) === 'real' ? 'real' : undefined));
      case 'binary':
        return binary(node);
    }
  };

  const binary = (node: Expression & {type: 'binary'}): Code => {
    const left = typeOf(node.left);
    const right = typeOf(node.right);

    if (node.operator === '+' && typeOf(node) === 'text') return formatted(joinedParts(node, types));
    if (node.operator === COMMAND.IN) {
      if (!isList(right)) return rust.member(expression(node.right), 'contains', [borrow(node.left)]);
      //a text is found among Strings by comparing it with each
      if (right.list === 'text') {
        return rust.member(rust.member(expression(node.right), 'iter', []), 'any', [
          name(`|item| *item == ${code(node.left)}`)
        ]);
      }
      return rust.member(expression(node.right), 'contains', [rust.unary('&', expression(node.left, right.list))]);
    }
    //a real number divided by a real number, which Rust needs of two whole numbers too
    if (node.operator === '/') return rust.binary('/', real(node.left), real(node.right));
    const operator = OPERATORS[node.operator] ?? node.operator;
    const comparison = PRECEDENCE[operator] === PRECEDENCE['=='];
    if (node.operator === '==' || node.operator === '!=') {
      //values of different types are never equal in CMIL; Rust doesn't compare them
      if (neverEqual(left, right)) return name(node.operator === '==' ? 'false' : 'true');
    }
    //texts are put in order as &str
    if (left === 'text' && right === 'text' && comparison && operator !== '==' && operator !== '!=') {
      return compare(operator, asStr(node.left), asStr(node.right));
    }
    //a whole number with a real one is a real number
    const place = isNumber(left) && isNumber(right) && left !== right ? 'real' : undefined;
    const sides = [expression(node.left, place), expression(node.right, place)] as const;
    return comparison ? compare(operator, ...sides) : rust.binary(operator, ...sides);
  };

  const builtIn = (node: Expression & {type: 'call'}): Code => {
    const [first] = node.args;
    //a whole number is its own floor, ceiling and rounding
    const rounded = (name: string): Code =>
      typeOf(first) === 'whole' ? expression(first) : cast(method(real(first), name, []), 'i64');
    switch (node.name) {
      case COMMAND.POW:
        return method(real(first), 'powf', [real(node.args[1])]);
      case COMMAND.SQR: {
        if (isSimple(first)) return rust.binary('*', expression(first), expression(first));
        const square = method(real(first), 'powi', [name('2')]);
        return typeOf(node) === 'whole' ? cast(square, 'i64') : square;
      }
      case COMMAND.ROUND:
        if (node.args.length === 2) {
          helpers.use('roundTo');
          return rust.call('round_to', [real(first), whole(node.args[1])]);
        }
        if (typeOf(first) === 'whole') return expression(first);
        //round() rounds a half away from zero
        return cast(method(rust.binary('+', real(first), name('0.5')), 'floor', []), 'i64');
      case COMMAND.FLOOR:
        return rounded('floor');
      case COMMAND.CEIL:
        return rounded('ceil');
      case COMMAND.ABS:
        return typeOf(first) === 'whole' ? method(expression(first), 'abs', [], 'i64') : method(real(first), 'abs', []);
      case COMMAND.LOG:
        return method(real(node.args[1]), 'log', [real(first)]);
      case COMMAND.RANDOM: {
        helpers.use('random');
        const [min, max] = node.args.length === 1 ? [null, first] : node.args;
        return rust.call('random', [min ? whole(min) : name('1'), whole(max)]);
      }
      case COMMAND.LENGTH:
        if (isList(typeOf(first))) return cast(rust.member(expression(first), 'len', []), 'i64');
        return cast(rust.member(rust.member(expression(first), 'chars', []), 'count', []), 'i64');
      case COMMAND.UPPER:
        return rust.member(expression(first), 'to_uppercase', []);
      case COMMAND.LOWER:
        return rust.member(expression(first), 'to_lowercase', []);
      case COMMAND.NUMBER:
        if (typeOf(first) === 'whole') return cast(expression(first), 'f64');
        if (isNumber(typeOf(first))) return expression(first);
        return name(`${rust.print(rust.bracketed(expression(first), POSTFIX))}.trim().parse::<f64>().unwrap_or(0.0)`);
      case COMMAND.TEXT:
        return asText(first);
      case COMMAND.SPLIT: {
        const separator = node.args[1];
        const text = rust.print(rust.bracketed(expression(first), POSTFIX));
        //the words of a text, between its spaces, and its letters, each a text of its own
        const parts = !separator
          ? `${text}.split_whitespace()`
          : isText(separator) && separator.value === ''
            ? `${text}.chars()`
            : `${text}.split(${rust.print(borrow(separator))})`;
        return name(`${parts}.map(String::from).collect::<Vec<String>>()`);
      }
      case COMMAND.JOIN: {
        const separator = node.args[1] ? rust.print(borrow(node.args[1])) : '""';
        const list = typeOf(first);
        const item = isList(list) ? list.list : 'unknown';
        const items = rust.print(rust.bracketed(expression(first), POSTFIX));
        if (item === 'text') return name(`${items}.join(${separator})`);
        const each = item === 'whole' ? 'item.to_string()' : (helpers.use('show'), 'item.show()');
        return name(`${items}.iter().map(|item| ${each}).collect::<Vec<String>>().join(${separator})`);
      }
    }
    const formula = mathOf(
      rust,
      node.name,
      node.args.map(real),
      (math, [value, ...rest]) => method(value, math === 'pow' ? 'powf' : math === 'log' ? 'ln' : math, rest),
      () => {
        imports.add('std::f64::consts::PI');
        return name('PI');
      },
      value => name(`${value}.0`)
    );
    if (formula) return formula;
    throw new Error(`No Rust for ${node.name}`);
  };

  //what println! prints
  const printed = (node: Expression): string => {
    if (isText(node) && node.value === '') return '';
    const {format: text, args} = format(isJoined(node, types) ? joinedParts(node, types) : [node]);
    return [`"${text}"`, ...args.map(arg => rust.print(arg))].join(', ');
  };

  const itemOf = (list: Expression) => {
    const type = typeOf(list);
    return isList(type) ? type.list : undefined;
  };

  const block = statementsOf({
    trivia,
    names,
    braces: SAME_LINE,
    declare: (variable, type) => [`let mut ${names.of(variable)}: ${rustType(type)} = ${initial(type)};`],
    write: (statement, context) => {
      const {comment, declares, scope} = context;
      //a loop over a range or a list, whose variable is the loop's own, or _ when the program has it nowhere else;
      //a list of numbers or booleans is borrowed, like &numbers, whose items are copied, &n
      const each = (loop: Statement & {type: 'for' | 'forEach'}, items: string, copied = false) => {
        const unused = declares && !readIn(loop.body).has(loop.name) && !assignedIn(loop.body).has(loop.name);
        const own = names.of(loop.name);
        const assign = (value: string) => `${declares ? 'let mut ' : ''}${own} = ${value};`;
        const head = (variable: string) => `for ${copied && variable !== '_' ? '&' : ''}${variable} in ${items}`;
        return loopOverValues(context, loop, unused ? '_' : own, head, assign);
      };
      switch (statement.type) {
        case 'print':
          context.line(`println!(${printed(statement.expression)});${comment}`);
          return;
        case 'assign': {
          const type = scope.get(statement.name)!;
          const variable = names.of(statement.name);
          const value = rust.print(owned(statement.expression, type));
          if (!declares) {
            context.line(`${variable} = ${value};${comment}`);
            return;
          }
          const mutable = (assignments.get(statement.name) ?? 0) > 1 || changes.has(statement.name) ? 'mut ' : '';
          //a number of numbers written in the program names its type, an i64, which Rust would make an i32, or an f64,
          //which Rust would know too late for its methods, and an empty list names the type of its items
          const constant = isNumber(type) && !variablesIn(statement.expression).size && !hasCall(statement.expression);
          const empty = statement.expression.type === 'list' && !statement.expression.items.length;
          const annotation = constant || empty ? `: ${rustType(type)}` : '';
          context.line(`let ${mutable}${variable}${annotation} = ${value};${comment}`);
          return;
        }
        case 'setItem': {
          const item = rust.index(expression(statement.target), at(statement.index));
          const value = rust.print(owned(statement.expression, itemOf(statement.target)));
          context.line(`${rust.print(item)} = ${value};${comment}`);
          return;
        }
        case 'add': {
          const value = owned(statement.expression, itemOf(statement.target));
          context.line(`${rust.print(rust.member(expression(statement.target), 'push', [value]))};${comment}`);
          return;
        }
        case 'remove': {
          const list = expression(statement.target);
          const item = code(statement.expression, itemOf(statement.target));
          const found = rust.member(rust.member(list, 'iter', []), 'position', [name(`|item| *item == ${item}`)]);
          const place = context.fresh(['index', 'place']);
          context.blocks([
            {
              text: `if let Some(${place}) = ${rust.print(found)}`,
              line: statement.line,
              body: [],
              first: [`${rust.print(rust.member(list, 'remove', [name(place)]))};`]
            }
          ]);
          return;
        }
        case 'call':
          context.line(`${code(statement.call)};${comment}`);
          return;
        case 'return': {
          const {expression: value} = statement;
          //a variable of the function, which it no longer needs, is given as it is
          const given =
            value && value.type === 'variable' && !borrowed.has(value.name)
              ? code(value, returns)
              : value && rust.print(owned(value, returns));
          context.line(`return${given ? ` ${given}` : ''};${comment}`);
          return;
        }
        case 'if':
          context.blocks(branchesOf(statement, (condition, index) => `${index ? 'else ' : ''}if ${code(condition)}`));
          return;
        case 'while':
          context.blocks([loopOf(statement, `while ${code(statement.condition)}`)]);
          return;
        case 'doWhile':
          context.blocks([
            doWhileOf(context, statement, 'loop', `if ${code(negation(statement.condition, types))}`, 'break;')
          ]);
          return;
        case 'repeat':
          context.blocks([
            loopOf(statement, `for _ in ${rust.print(rust.binary('..', name('0'), whole(statement.count)))}`)
          ]);
          return;
        case 'for': {
          const type = scope.get(statement.name)!;
          const {down, size, signed} = stepOf(statement);
          //a range steps by a usize, so a step whose sign shows only as the program runs counts with while
          if (type === 'whole' && (!size || typeOf(size) === 'whole') && !signed) {
            //a real last value, like sqrt(n), is the whole number the counter reaches
            const last =
              typeOf(statement.to) === 'real'
                ? cast(method(expression(statement.to), down ? 'ceil' : 'floor', []), 'i64')
                : expression(statement.to);
            const from = expression(statement.from);
            //a range counts up by 1, so one down counts it from its end, rev(), and a step skips its values, step_by()
            let range = down ? rust.binary('..=', last, from) : rust.binary('..=', from, last);
            if (down) range = rust.member(range, 'rev', []);
            if (size)
              range = rust.member(range, 'step_by', [
                isNumeral(size) ? name(String(size.value)) : cast(whole(size), 'usize')
              ]);
            context.blocks([each(statement, rust.print(range))]);
            return;
          }
          //a real number counts with while, which reads its step and its last value once, and tests the step's sign
          const counter = names.of(statement.name);
          context.line(
            `${declares ? `let mut ${counter}: ${rustType(type)}` : counter} = ${code(statement.from, type)};`
          );
          //a bound the loop changes is kept in a variable first
          const once = (bound: Expression, candidates: string[], place: Type = type) =>
            context.keep(bound, candidates, kept => `let ${kept} = ${code(bound, place)};`);
          //a whole counter is compared with a real last value as a real number
          const realLast = type === 'whole' && typeOf(statement.to) === 'real';
          const place = realLast ? 'real' : type;
          const last = once(statement.to, ['last', 'stop'], place);
          const step = size ? (once(size, ['by', 'step_size']) ?? code(size, type)) : type === 'real' ? '1.0' : '1';
          const counted = (operator: string) =>
            compare(
              operator,
              realLast ? cast(name(counter), 'f64') : name(counter),
              last ? name(last) : expression(statement.to, place)
            );
          const test = rust.print(
            signed
              ? signedTest(rust, counted, name(step), ['&&', '||'], type === 'real' ? '0.0' : '0')
              : counted(down ? '>=' : '<=')
          );
          //the step, after the block and before a continue
          const next = () => context.line(`${counter} ${down ? '-=' : '+='} ${step};`);
          context.blocks([loopOf(statement, `while ${test}`, {last: next, next})]);
          return;
        }
        case 'forEach': {
          const list = statement.expression;
          const type = typeOf(list);
          //the letters of a text, each a text of its own
          if (!isList(type)) {
            const text = rust.print(rust.bracketed(expression(list), POSTFIX));
            context.blocks([each(statement, `${text}.chars().map(String::from)`)]);
            return;
          }
          //a list of numbers or booleans the loop doesn't change is borrowed; any other is copied, the items it had
          //when the loop started, which the loop can change
          if (isCopy(type.list) && !changesItsList(statement) && list.type === 'variable') {
            const kind = borrowed.get(list.name);
            const items = kind === 'mutable' ? `${code(list)}.iter()` : kind ? code(list) : `&${code(list)}`;
            context.blocks([each(statement, items, true)]);
            return;
          }
          const items = list.type === 'variable' ? `${code(list)}.clone()` : code(list);
          context.blocks([each(statement, items)]);
          return;
        }
        case 'break':
        case 'continue':
          context.next();
          context.line(`${statement.type};${comment}`);
          return;
      }
    }
  });

  //whether an expression calls a function, of the program or of CMIL
  const hasCall = (node: Expression): boolean => {
    switch (node.type) {
      case 'call':
      case 'userCall':
      case 'input':
        return true;
      case 'unary':
        return hasCall(node.operand);
      case 'binary':
        return hasCall(node.left) || hasCall(node.right);
      default:
        return false;
    }
  };

  //the functions of the program, before main: a text as &str, a list as &Vec, &mut when the function changes it, and
  //a parameter it gives another value a variable of its own
  const functions = new Writer('    ');
  for (const statement of tree.statements) {
    if (statement.type !== 'function') continue;
    const scope = types.variables.get(statement.name)!;
    const result = types.results.get(statement.name)!;
    assignments = assignedIn(statement.body);
    changes = changedIn(statement.body);
    borrowed = new Map();
    const parameters = statement.parameters.map(parameter => {
      const type = scope.get(parameter)!;
      const own = names.of(parameter);
      if (type === 'text' && !assignments.has(parameter)) {
        borrowed.set(parameter, 'text');
        return `${own}: &str`;
      }
      if (isList(type) && changes.has(parameter)) {
        borrowed.set(parameter, 'mutable');
        return `${own}: &mut ${rustType(type)}`;
      }
      if (isList(type) && !assignments.has(parameter)) {
        borrowed.set(parameter, 'list');
        return `${own}: &${rustType(type)}`;
      }
      return `${own}: ${type === 'text' ? '&str' : isList(type) ? `&${rustType(type)}` : rustType(type)}`;
    });
    trivia.before(functions, statement.line);
    functions.line(
      `fn ${names.of(statement.name)}(${parameters.join(', ')})${result === 'unknown' ? '' : ` -> ${rustType(result)}`} {${trivia.after(statement.line)}`,
      statement.line
    );
    returns = result;
    functions.block(() => {
      //a parameter the function gives another value is a variable of its own, with a copy of a text or a list
      for (const parameter of statement.parameters.filter(each => assignments.has(each) && !borrowed.has(each))) {
        const type = scope.get(parameter)!;
        const own = names.of(parameter);
        const copy = type === 'text' ? `${own}.to_string()` : isList(type) ? `${own}.clone()` : own;
        functions.line(`let mut ${own} = ${copy};`, statement.line);
      }
      block(functions, statement.body, scope, new Set(statement.parameters));
    });
    returns = undefined;
    functions.line('}');
    functions.blank();
  }
  borrowed = new Map();
  const statements = tree.statements.filter(statement => statement.type !== 'function');
  assignments = assignedIn(statements);
  changes = changedIn(statements);
  const main = new Writer('    ');
  main.block(() => {
    block(main, tree.statements, types.variables.get('')!, new Set());
    trivia.rest(main);
  });

  const out = new Writer('    ');
  [...imports].sort().forEach(item => out.line(`use ${item};`));
  out.blank();
  out.append(functions);
  out.blank();
  out.line('fn main() {');
  out.append(main);
  out.line('}');
  helpers.write(out, helper => helper.code(words));
  return out.converted();
};
