/**
 * Go: what a teacher writes, that prints what the CMIL program prints, as gofmt lays it out. Numbers are int or
 * float64, which Go never mixes, so a whole number meeting a real one becomes float64(…); texts are string, lists
 * slices; print is fmt.Println or fmt.Printf with a format. The functions of the program come before main, and the
 * helpers a program needs after it, each with what it is for.
 */
import {COMMAND} from '../../constants/index.ts';
import TRANSLATION from '../../translations/index.ts';
import {Grammar, capitalized, fromZero, mathOf, signedTest, type Code} from '../code.ts';
import {
  Helpers,
  Names,
  Trivia,
  Writer,
  changedIn,
  changesItsList,
  definitionOf,
  isJoined,
  isNumeral,
  isText,
  joinedParts,
  negation,
  neverEqual,
  quoted,
  readIn,
  stepOf,
  type Converted
} from '../emit.ts';
import {SAME_LINE, branchesOf, doWhileOf, loopOf, statementsOf} from '../statements.ts';
import {isList, isNumber, type Type, type Types} from '../types.ts';
import type {ProgramTree} from '../../program.ts';
import type {Writers} from '../registry.ts';
import type {Expression} from '../../core/types.ts';

//the words of Go, its predeclared names and packages, and the helpers, which a program's names can't be
const RESERVED = new Set(
  [
    'break case chan const continue default defer else fallthrough for func go goto if import interface map package',
    'range return select struct switch type var append cap close complex copy delete imag len make new panic print',
    'println real recover bool byte int float64 string rune error any true false nil iota min max clear main fmt',
    'math strings strconv slices rand bufio os show inWords join roundTo toNumber readText readNumber scanner'
  ]
    .join(' ')
    .split(' ')
);

//the precedence of Go's operators, from the loosest
const PRECEDENCE: Record<string, number> = {
  '||': 1,
  '&&': 2,
  '==': 3,
  '!=': 3,
  '<': 3,
  '>': 3,
  '<=': 3,
  '>=': 3,
  '+': 4,
  '-': 4,
  '*': 5,
  '/': 5,
  '%': 5
};
const OPERATORS: Record<string, string> = {[COMMAND.AND]: '&&', [COMMAND.OR]: '||'};

//a text as Go writes it, like "a \"b\"", which can't have a NUL
const literal = (text: string) => quoted(text, {'\0': '\\x00'});

type Helper = {
  imports: string[];
  uses?: string[];
  code: (words: [string, string]) => string[];
};

//the helpers, by name, in the order they are written: the packages they import, the helpers they use, and their code
const HELPERS: Record<string, Helper> = {
  readText: {
    imports: ['bufio', 'os'],
    code: () => [
      '// the answers of the user, a line at a time',
      'var scanner = bufio.NewScanner(os.Stdin)',
      '',
      '// an answer of the user, as a text',
      'func readText() string {',
      '\tscanner.Scan()',
      '\treturn scanner.Text()',
      '}'
    ]
  },
  readNumber: {
    imports: ['strconv', 'strings'],
    uses: ['readText'],
    code: () => [
      '// an answer of the user, as a number',
      'func readNumber() float64 {',
      '\tnumber, _ := strconv.ParseFloat(strings.TrimSpace(readText()), 64)',
      '\treturn number',
      '}'
    ]
  },
  toNumber: {
    imports: ['strconv', 'strings'],
    code: () => [
      '// the number in a text',
      'func toNumber(text string) float64 {',
      '\tnumber, _ := strconv.ParseFloat(strings.TrimSpace(text), 64)',
      '\treturn number',
      '}'
    ]
  },
  inWords: {
    imports: [],
    code: ([yes, no]) => [
      '// a boolean as CMIL prints it, in the words of the program',
      'func inWords(value bool) string {',
      '\tif value {',
      `\t\treturn ${literal(yes)}`,
      '\t}',
      `\treturn ${literal(no)}`,
      '}'
    ]
  },
  show: {
    imports: ['strconv'],
    code: ([yes, no]) => [
      '// a value as CMIL prints it: a real number with up to 12 digits, and a boolean in words',
      'func show(value any) string {',
      '\tswitch item := value.(type) {',
      '\tcase float64:',
      "\t\treturn strconv.FormatFloat(item, 'g', 12, 64)",
      '\tcase bool:',
      '\t\tif item {',
      `\t\t\treturn ${literal(yes)}`,
      '\t\t}',
      `\t\treturn ${literal(no)}`,
      '\tcase int:',
      '\t\treturn strconv.Itoa(item)',
      '\t}',
      '\treturn value.(string)',
      '}'
    ]
  },
  join: {
    imports: ['strings'],
    uses: ['show'],
    code: () => [
      '// the items of a list as they are printed, with a separator between them',
      'func join[T any](list []T, separator string) string {',
      '\titems := []string{}',
      '\tfor _, item := range list {',
      '\t\titems = append(items, show(item))',
      '\t}',
      '\treturn strings.Join(items, separator)',
      '}'
    ]
  },
  roundTo: {
    imports: ['math', 'strconv'],
    uses: ['show'],
    code: () => [
      '// a number rounded to a count of decimals, a half up, after rounding it like it is printed, so 1.005 is 1.01',
      'func roundTo(number float64, digits int) float64 {',
      '\tfactor := math.Pow(10, float64(digits))',
      "\tprinted, _ := strconv.ParseFloat(strconv.FormatFloat(number*factor, 'g', 12, 64), 64)",
      '\treturn math.Floor(printed+0.5) / factor',
      '}'
    ]
  }
};

/** The Go type of a value: int, float64, string, bool or a slice; int when nothing says. */
export const goType = (type: Type): string => {
  if (isList(type)) return `[]${goType(type.list)}`;
  return type === 'real' ? 'float64' : type === 'text' ? 'string' : type === 'boolean' ? 'bool' : 'int';
};

/**
 * Go's operators, and its expressions as gofmt writes them: with spaces around an operator at the top of an
 * expression, but none around * and the like next to + and the like, like i*10 + j, and deeper, like in a call of
 * more arguments, without spaces around any but the loosest, like f(i*10+j, 1).
 */
class Gofmt extends Grammar {
  constructor() {
    super(PRECEDENCE);
  }

  //whether an expression has + or - (4) and * or / (5) not in brackets, and a pair like - -x, which needs spaces
  #operatorsOf(code: Code & {kind: 'binary'}): {has4: boolean; has5: boolean; problem: number} {
    const precedence = this.operators[code.operator];
    const found = {has4: precedence === 4, has5: precedence === 5, problem: 0};
    const add = (inner: Code & {kind: 'binary'}) => {
      const {has4, has5, problem} = this.#operatorsOf(inner);
      found.has4 ||= has4;
      found.has5 ||= has5;
      found.problem = Math.max(found.problem, problem);
    };
    if (code.left.kind === 'binary') add(code.left);
    if (code.right.kind === 'binary') add(code.right);
    else if (code.right.kind === 'unary') {
      const pair = code.operator + code.right.operator;
      if (pair === '/*' || pair === '&&' || pair === '&^') found.problem = 5;
      else if (pair === '++' || pair === '--') found.problem = Math.max(found.problem, 4);
    }
    return found;
  }

  //the precedence from which gofmt writes an operator without spaces
  #cutoffOf(code: Code & {kind: 'binary'}, depth: number) {
    const {has4, has5, problem} = this.#operatorsOf(code);
    if (problem > 0) return problem + 1;
    if (has4 && has5) return depth === 1 ? 5 : 4;
    return depth === 1 ? 6 : 4;
  }

  //at the depth of its place: 1 for a statement's, one more in a call of more arguments, an index or the right of an
  //operator, one less in brackets
  override print(code: Code, depth = 1): string {
    const all = (codes: Code[]) => {
      const inner = codes.length > 1 ? depth + 1 : depth;
      return codes.map(each => this.print(each, inner)).join(', ');
    };
    switch (code.kind) {
      case 'atom':
        return code.text;
      case 'paren':
        return code.inner.kind === 'paren'
          ? this.print(code.inner, depth)
          : `(${this.print(code.inner, Math.max(depth - 1, 1))})`;
      case 'binary': {
        const precedence = this.operators[code.operator];
        const space = precedence < this.#cutoffOf(code, depth) ? ' ' : '';
        const same = code.left.kind === 'binary' && this.operators[code.left.operator] === precedence;
        const left = this.print(code.left, same ? depth : depth + 1);
        return `${left}${space}${code.operator}${space}${this.print(code.right, depth + 1)}`;
      }
      case 'unary':
        return code.operator === '*' ? `*${this.print(code.operand)}` : code.operator + this.print(code.operand, depth);
      case 'call':
        return `${code.callee}(${all(code.args)})`;
      case 'member':
        return `${this.print(code.target)}${code.separator}${code.name}${code.args ? `(${all(code.args)})` : ''}`;
      case 'index':
        return `${this.print(code.target)}[${this.print(code.index, depth + 1)}]`;
      case 'items':
        return `${code.open}${code.items.map(item => this.print(item)).join(', ')}${code.close}`;
    }
  }
}

const go = new Gofmt();
const name = (text: string) => go.atom(text);

//what marks the comment after the code of a line until lineUp lines it up
const MARK = '\0';

//gofmt lines up the comments after the code of lines in a row of a block, a space after the longest code; a line
//without one, a blank line, and a } line, which is alone, end a row
const lineUp = (code: string): string => {
  const lines = code.split('\n');
  const indent = (text: string) => /^\t*/.exec(text)![0].length;
  const joins = (text: string) => text.includes(MARK) && !text.trimStart().startsWith('}');
  const width = (text: string) => [...text.slice(0, text.indexOf(MARK))].length;
  for (let start = 0; start < lines.length;) {
    let end = start + 1;
    if (joins(lines[start])) {
      while (end < lines.length && joins(lines[end]) && indent(lines[end]) === indent(lines[start])) end++;
    }
    const longest = Math.max(...lines.slice(start, end).map(width));
    for (let at = start; at < end; at++) {
      const text = lines[at];
      if (text.includes(MARK)) lines[at] = text.replace(MARK, ' '.repeat(longest - width(text)));
    }
    start = end;
  }
  return lines.join('\n');
};

/**
 * Writes a program in Go.
 */
export const toGo = (tree: ProgramTree, types: Types, sourceCode: string): Converted => {
  const names = new Names(tree.names, RESERVED);
  //the comment after the code of a line is marked, to be lined up with the comments of the lines around it
  const trivia = new Trivia(tree.comments, sourceCode, '//', `${MARK} `);
  const imports = new Set<string>();
  const helpers = new Helpers(HELPERS, imports);
  const {words: commands} = TRANSLATION[tree.language];
  const words: [string, string] = [commands.true[0], commands.false[0]];
  const english = tree.language === 'en';
  //the lists of the function being written that it changes, which it gets as a pointer, like *[]int
  let pointers = new Set<string>();
  //the variables the scope being written reads, which Go needs of every variable it declares
  let read = new Set<string>();
  //the type of the value the function being written returns
  let returns: Type | undefined;

  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';

  //an expression; a whole number in the place of a real one, like a float64 variable, becomes float64(…), which a
  //number written in the program needn't
  const expression = (node: Expression, place?: Type): Code => {
    if (place === 'real' && typeOf(node) === 'whole' && !isNumeral(node)) return go.call('float64', [expression(node)]);
    if (place === 'whole' && typeOf(node) === 'real') return go.call('int', [expression(node)]);
    return write(node, place);
  };
  const real = (node: Expression) => expression(node, 'real');
  const whole = (node: Expression) => expression(node, 'whole');
  //an expression as the code of a statement
  const code = (node: Expression, place?: Type) => go.print(expression(node, place));

  const math = (method: string, args: Expression[]): Code => {
    imports.add('math');
    return go.call(`math.${method}`, args.map(real));
  };

  //the format of fmt.Printf and its values, for values joined into a text
  const format = (parts: Expression[]): {format: string; args: Code[]} => {
    let text = '';
    const args: Code[] = [];
    for (const part of parts) {
      const type = typeOf(part);
      if (isText(part)) {
        text += literal(part.value).slice(1, -1).replaceAll('%', '%%');
      } else if (type === 'text') {
        text += '%s';
        args.push(expression(part));
      } else if (type === 'whole') {
        text += '%d';
        args.push(expression(part));
      } else if (type === 'real') {
        text += '%.12g';
        args.push(real(part));
      } else if (type === 'boolean' && english) {
        text += '%t';
        args.push(expression(part));
      } else if (type === 'boolean') {
        helpers.use('inWords');
        text += '%s';
        args.push(go.call('inWords', [expression(part)]));
      } else {
        helpers.use('show');
        text += '%s';
        args.push(go.call('show', [expression(part)]));
      }
    }
    return {format: text, args};
  };

  //values joined into one text: texts with +, else fmt.Sprintf with a format
  const joinText = (parts: Expression[]): Code => {
    if (parts.every(part => typeOf(part) === 'text')) {
      return parts.map(part => expression(part)).reduce((left, right) => go.binary('+', left, right));
    }
    imports.add('fmt');
    const {format: text, args} = format(parts);
    return go.call('fmt.Sprintf', [name(`"${text}"`), ...args]);
  };

  //a value as a text, like text() gives it
  const asText = (node: Expression): Code => {
    if (isJoined(node, types)) return joinText(joinedParts(node, types));
    const type = typeOf(node);
    if (type === 'text') return expression(node);
    if (type === 'whole') {
      imports.add('strconv');
      return go.call('strconv.Itoa', [expression(node)]);
    }
    if (type === 'boolean' && english) {
      imports.add('strconv');
      return go.call('strconv.FormatBool', [expression(node)]);
    }
    if (type === 'boolean') {
      helpers.use('inWords');
      return go.call('inWords', [expression(node)]);
    }
    helpers.use('show');
    return go.call('show', [type === 'real' ? real(node) : expression(node)]);
  };

  const write = (node: Expression, place?: Type): Code => {
    switch (node.type) {
      case 'value':
        if (node.constant) {
          imports.add('math');
          return name(`math.${node.constant === 'pi' ? 'Pi' : 'E'}`);
        }
        if (typeof node.value === 'string') return name(literal(node.value));
        //a negative number is Go's - before it, which gofmt spaces like an operator
        if (typeof node.value === 'number' && node.value < 0) return go.unary('-', name(String(-node.value)));
        return name(String(node.value));
      case 'list': {
        const type = place && isList(place) ? place : typeOf(node);
        const item = isList(type) ? type.list : 'unknown';
        return go.items(
          `${goType(type)}{`,
          node.items.map(each => expression(each, item)),
          '}'
        );
      }
      case 'template':
        return joinText(joinedParts(node, types));
      case 'variable':
        return pointers.has(node.name) ? go.unary('*', name(names.of(node.name))) : name(names.of(node.name));
      case 'index':
        if (isList(typeOf(node.target))) return go.index(expression(node.target), fromZero(go, node.index, whole));
        //a letter of a text, which a string has as bytes and a []rune as letters
        return go.call('string', [
          go.index(go.call('[]rune', [expression(node.target)]), fromZero(go, node.index, whole))
        ]);
      case 'input':
        if (typeOf(node) === 'real') {
          helpers.use('readNumber');
          return go.call('readNumber', []);
        }
        helpers.use('readText');
        return go.call('readText', []);
      case 'userCall': {
        const definition = definitionOf(tree.statements, node.name);
        const scope = types.variables.get(node.name)!;
        const changed = changedIn(definition.body);
        return go.call(
          names.of(node.name),
          node.args.map((arg, position) => {
            const parameter = definition.parameters[position];
            if (!changed.has(parameter) || !isList(scope.get(parameter)!)) return expression(arg, scope.get(parameter));
            //a list the function changes is its pointer
            return arg.type === 'variable' && pointers.has(arg.name)
              ? name(names.of(arg.name))
              : go.unary('&', expression(arg));
          })
        );
      }
      case 'call':
        return builtIn(node);
      case 'unary':
        if (node.operator === COMMAND.NOT) return go.unary('!', expression(node.operand));
        return go.unary(node.operator, expression(node.operand, typeOf(node) === 'real' ? 'real' : undefined));
      case 'binary':
        return operation(node);
    }
  };

  const operation = (node: Expression & {type: 'binary'}): Code => {
    const left = typeOf(node.left);
    const right = typeOf(node.right);

    if (node.operator === '+' && typeOf(node) === 'text') return joinText(joinedParts(node, types));
    if (node.operator === COMMAND.IN) {
      if (isList(right)) {
        imports.add('slices');
        return go.call('slices.Contains', [expression(node.right), expression(node.left, right.list)]);
      }
      imports.add('strings');
      return go.call('strings.Contains', [expression(node.right), expression(node.left)]);
    }
    //a real number divided by a real number, which Go needs of two whole numbers too; of two written in the program,
    //like 7 / 2, which Go divides as whole numbers, the first is written as a real one, 7.0
    if (node.operator === '/') {
      const {left: dividend, right: divisor} = node;
      const written = (operand: Expression) => isNumeral(operand) && Number.isInteger(operand.value);
      if (isNumeral(dividend) && written(dividend) && written(divisor)) {
        const digits = String(Math.abs(dividend.value));
        const value = name(digits.includes('e') ? digits : `${digits}.0`);
        return go.binary('/', dividend.value < 0 ? go.unary('-', value) : value, real(divisor));
      }
      return go.binary('/', real(dividend), real(divisor));
    }
    if (node.operator === '%' && (left === 'real' || right === 'real')) {
      imports.add('math');
      return go.call('math.Mod', [real(node.left), real(node.right)]);
    }
    const operator = OPERATORS[node.operator] ?? node.operator;
    if (node.operator === '==' || node.operator === '!=') {
      //values of different types are never equal in CMIL; Go doesn't compare them
      if (neverEqual(left, right)) return name(node.operator === '==' ? 'false' : 'true');
    }
    //a whole number with a real one is a real number
    const mixed = isNumber(left) && isNumber(right) && (left === 'real' || right === 'real');
    const place = mixed ? 'real' : undefined;
    return go.binary(operator, expression(node.left, place), expression(node.right, place));
  };

  const builtIn = (node: Expression & {type: 'call'}): Code => {
    const [first] = node.args;
    //a whole number is its own floor, ceiling and rounding
    const rounded = (method: string): Code =>
      typeOf(first) === 'whole' ? write(first) : go.call('int', [math(method, [first])]);
    switch (node.name) {
      case COMMAND.SQR: {
        if (first.type === 'variable' || first.type === 'value') {
          const factor = expression(first, typeOf(node) === 'real' ? 'real' : undefined);
          return go.binary('*', factor, factor);
        }
        const power = go.call('math.Pow', [real(first), name('2')]);
        imports.add('math');
        return typeOf(node) === 'whole' ? go.call('int', [power]) : power;
      }
      case COMMAND.ROUND:
        if (node.args.length === 2) {
          helpers.use('roundTo');
          return go.call('roundTo', [real(first), whole(node.args[1])]);
        }
        if (typeOf(first) === 'whole') return write(first);
        imports.add('math');
        return go.call('int', [go.call('math.Floor', [go.binary('+', real(first), name('0.5'))])]);
      case COMMAND.FLOOR:
        return rounded('Floor');
      case COMMAND.CEIL:
        return rounded('Ceil');
      case COMMAND.ABS:
        return typeOf(first) === 'whole' ? go.call('int', [math('Abs', [first])]) : math('Abs', [first]);
      case COMMAND.RANDOM: {
        imports.add('math/rand');
        const [min, max] = node.args.length === 1 ? [null, first] : node.args;
        const count = min ? go.binary('+', go.binary('-', whole(max), whole(min)), name('1')) : whole(max);
        return go.binary('+', go.call('rand.Intn', [count]), min ? whole(min) : name('1'));
      }
      case COMMAND.LENGTH:
        if (isList(typeOf(first))) return go.call('len', [expression(first)]);
        return go.call('len', [go.call('[]rune', [expression(first)])]);
      case COMMAND.UPPER:
      case COMMAND.LOWER:
        imports.add('strings');
        return go.call(node.name === COMMAND.UPPER ? 'strings.ToUpper' : 'strings.ToLower', [expression(first)]);
      case COMMAND.NUMBER:
        if (typeOf(first) === 'whole') return go.call('float64', [expression(first)]);
        if (isNumber(typeOf(first))) return write(first);
        helpers.use('toNumber');
        return go.call('toNumber', [expression(first)]);
      case COMMAND.TEXT:
        return asText(first);
      case COMMAND.SPLIT:
        imports.add('strings');
        if (!node.args[1]) return go.call('strings.Fields', [expression(first)]);
        return go.call('strings.Split', [expression(first), expression(node.args[1])]);
      case COMMAND.JOIN: {
        const list = typeOf(first);
        const separator = node.args[1] ? expression(node.args[1]) : name('""');
        if (isList(list) && list.list === 'text') {
          imports.add('strings');
          return go.call('strings.Join', [expression(first), separator]);
        }
        helpers.use('join');
        return go.call('join', [expression(first), separator]);
      }
    }
    const formula = mathOf(
      go,
      node.name,
      node.args.map(real),
      (method, values) => {
        imports.add('math');
        return go.call(`math.${capitalized(method)}`, values);
      },
      () => name('math.Pi')
    );
    if (formula) return formula;
    throw new Error(`No Go for ${node.name}`);
  };

  //what print prints, by fmt.Println or fmt.Printf
  const printed = (node: Expression): Code => {
    imports.add('fmt');
    if (isText(node) && node.value === '') return go.call('fmt.Println', []);
    const type = typeOf(node);
    if (isJoined(node, types) || type === 'real' || (type === 'boolean' && !english)) {
      const {format: text, args} = format(isJoined(node, types) ? joinedParts(node, types) : [node]);
      return go.call('fmt.Printf', [name(`"${text}\\n"`), ...args]);
    }
    return go.call('fmt.Println', [expression(node)]);
  };

  const itemOf = (list: Expression) => {
    const type = typeOf(list);
    return isList(type) ? type.list : undefined;
  };

  const block = statementsOf({
    trivia,
    names,
    braces: SAME_LINE,
    //a variable declared first has its type and no value yet; one the program never reads is read by _
    declare: (variable, type) => [
      `var ${names.of(variable)} ${goType(type)}`,
      ...(read.has(variable) ? [] : [`_ = ${names.of(variable)}`])
    ],
    write: (statement, context) => {
      const {comment, declares, scope} = context;
      //CMIL reads the bounds of a loop once; when the loop changes them, Go keeps them in a variable first
      const once = (bound: Expression, place: Type, candidates: string[]): Code => {
        const kept = context.keep(bound, candidates, variable => `${variable} := ${code(bound, place)}`);
        return kept ? name(kept) : expression(bound, place);
      };
      switch (statement.type) {
        case 'print':
          context.line(`${go.print(printed(statement.expression))}${comment}`);
          return;
        case 'assign': {
          const type = scope.get(statement.name)!;
          const variable = names.of(statement.name);
          const value = code(statement.expression, type);
          if (!declares) {
            context.line(`${pointers.has(statement.name) ? `*${variable}` : variable} = ${value}${comment}`);
            return;
          }
          //a whole number written in the program is an int to :=, so a real variable given one declares its type
          const {expression: given} = statement;
          const written = isNumeral(given) && Number.isInteger(given.value) && type === 'real';
          context.line(written ? `var ${variable} float64 = ${value}${comment}` : `${variable} := ${value}${comment}`);
          if (!read.has(statement.name)) context.line(`_ = ${variable}`);
          return;
        }
        case 'setItem': {
          const item = go.index(expression(statement.target), fromZero(go, statement.index, whole));
          context.line(`${go.print(item)} = ${code(statement.expression, itemOf(statement.target))}${comment}`);
          return;
        }
        case 'add': {
          const list = expression(statement.target);
          const added = go.call('append', [list, expression(statement.expression, itemOf(statement.target))]);
          context.line(`${go.print(list)} = ${go.print(added)}${comment}`);
          return;
        }
        case 'remove': {
          imports.add('slices');
          const list = expression(statement.target);
          const found = go.call('slices.Index', [list, expression(statement.expression, itemOf(statement.target))]);
          const at = context.fresh(['i', 'j', 'k']);
          const removed = go.call('slices.Delete', [list, name(at), go.binary('+', name(at), name('1'))]);
          context.blocks([
            {
              text: `if ${at} := ${go.print(found)}; ${at} >= 0`,
              line: statement.line,
              body: [],
              first: [`${go.print(list)} = ${go.print(removed)}`]
            }
          ]);
          return;
        }
        case 'call':
          context.line(`${code(statement.call)}${comment}`);
          return;
        case 'return':
          context.line(`return${statement.expression ? ` ${code(statement.expression, returns)}` : ''}${comment}`);
          return;
        case 'if':
          context.blocks(branchesOf(statement, (condition, index) => `${index ? 'else ' : ''}if ${code(condition)}`));
          return;
        case 'while':
          context.blocks([loopOf(statement, `for ${code(statement.condition)}`)]);
          return;
        case 'doWhile':
          context.blocks([
            doWhileOf(context, statement, 'for', `if ${code(negation(statement.condition, types))}`, 'break')
          ]);
          return;
        case 'repeat':
          context.blocks([
            loopOf(statement, `for range ${go.print(once(statement.count, 'whole', ['times', 'count']))}`)
          ]);
          return;
        case 'for': {
          const counter = names.of(statement.name);
          const type = scope.get(statement.name)!;
          const {down, size, signed} = stepOf(statement);
          //a whole counter up to a real last value is compared as a real number
          const reals = type === 'real' || typeOf(statement.to) === 'real';
          //the first value too, when it asks and a later bound is kept, so the program asks in CMIL's order
          const first = once(statement.from, type, ['first', 'start']);
          const last = once(statement.to, reals ? 'real' : 'whole', ['last', 'end']);
          const by = size && once(size, type, ['step', 'by']);
          const next = !by ? `${counter}${down ? '--' : '++'}` : `${counter} ${down ? '-=' : '+='} ${go.print(by)}`;
          const compared =
            type === 'whole' && typeOf(statement.to) === 'real' ? go.call('float64', [name(counter)]) : name(counter);
          const start = !declares
            ? `${counter} = ${go.print(first)}`
            : type === 'real' && isNumeral(statement.from)
              ? `${counter} := ${go.print(go.call('float64', [expression(statement.from)]))}`
              : `${counter} := ${go.print(first)}`;
          const compare = (operator: string) => go.binary(operator, compared, last);
          const condition = go.print(signed ? signedTest(go, compare, by!, ['&&', '||']) : compare(down ? '>=' : '<='));
          context.blocks([loopOf(statement, `for ${start}; ${condition}; ${next}`)]);
          return;
        }
        case 'forEach': {
          const type = typeOf(statement.expression);
          //the letters of a text, each a text of its own
          let items = isList(type)
            ? expression(statement.expression)
            : go.call('strings.Split', [expression(statement.expression), name('""')]);
          if (isList(type) && changesItsList(statement)) {
            imports.add('slices');
            items = go.call('slices.Clone', [items]);
          }
          if (!isList(type)) imports.add('strings');
          const variable = names.of(statement.name);
          if (!read.has(statement.name)) context.blocks([loopOf(statement, `for range ${go.print(items)}`)]);
          else if (declares) context.blocks([loopOf(statement, `for _, ${variable} := range ${go.print(items)}`)]);
          else {
            //the variable is used after the loop too, so it gets each item
            const each = context.fresh(['item', 'each']);
            context.blocks([
              loopOf(statement, `for _, ${each} := range ${go.print(items)}`, {first: [`${variable} = ${each}`]})
            ]);
          }
          return;
        }
        case 'break':
        case 'continue':
          if (statement.type === 'continue') context.next();
          context.line(`${statement.type}${comment}`);
          return;
      }
    }
  });

  const functions = new Writer('\t');
  for (const statement of tree.statements) {
    if (statement.type !== 'function') continue;
    const scope = types.variables.get(statement.name)!;
    const result = types.results.get(statement.name)!;
    const changed = changedIn(statement.body);
    pointers = new Set(
      statement.parameters.filter(parameter => isList(scope.get(parameter)!) && changed.has(parameter))
    );
    read = readIn(statement.body);
    trivia.before(functions, statement.line);
    const parameters = statement.parameters.map(
      parameter => `${names.of(parameter)} ${pointers.has(parameter) ? '*' : ''}${goType(scope.get(parameter)!)}`
    );
    functions.line(
      `func ${names.of(statement.name)}(${parameters.join(', ')})${result === 'unknown' ? '' : ` ${goType(result)}`} {${trivia.after(statement.line)}`,
      statement.line
    );
    returns = result;
    functions.block(() => block(functions, statement.body, scope, new Set(statement.parameters)));
    returns = undefined;
    functions.line('}');
    functions.blank();
  }
  pointers = new Set();
  read = readIn(tree.statements.filter(statement => statement.type !== 'function'));
  const main = new Writer('\t');
  main.block(() => {
    block(main, tree.statements, types.variables.get('')!, new Set());
    trivia.rest(main);
  });

  const out = new Writer('\t');
  out.line('package main');
  out.blank();
  const sorted = [...imports].sort();
  if (sorted.length === 1) out.line(`import "${sorted[0]}"`);
  else if (sorted.length) {
    out.line('import (');
    out.block(() => sorted.forEach(name => out.line(`"${name}"`)));
    out.line(')');
  }
  out.blank();
  out.append(functions);
  out.blank();
  out.line('func main() {');
  out.append(main);
  out.line('}');
  helpers.write(out, helper => helper.code(words));
  const converted = out.converted();
  return {...converted, code: lineUp(converted.code)};
};

/** The writer of Go: its targets, which cmil/convert/go gives convert(). */
export const WRITERS: Writers = {go: {typed: true, write: toGo}};
