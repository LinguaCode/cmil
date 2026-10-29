/**
 * Kotlin: what a teacher writes, that prints what the CMIL program prints. Numbers are Int or Double, which Kotlin
 * converts only when asked, like n.toDouble(); texts are String, lists MutableList; a value is a val unless the
 * program gives it another one; print is println, with values in string templates, like "Hi, $name!". The functions
 * of the program come before main, and the helpers a program needs after it, each with what it is for.
 */
import {COMMAND} from '../../constants/index.ts';
import TRANSLATION from '../../translations/index.ts';
import {Grammar, fromZero, mathOf, type Code} from '../code.ts';
import {
  Helpers,
  Names,
  Trivia,
  Writer,
  assignedIn,
  breaksOut,
  changesItsList,
  definitionOf,
  isJoined,
  isNumeral,
  isSimple,
  isText,
  joinedParts,
  neverEqual,
  quoted,
  stepOf,
  type Converted
} from '../emit.ts';
import {SAME_LINE, branchesOf, loopOf, loopOverValues, statementsOf} from '../statements.ts';
import {isList, isNumber, type Type, type Types} from '../types.ts';
import type {ProgramTree} from '../../program.ts';
import type {Writers} from '../registry.ts';
import type {Expression, Statement} from '../../core/types.ts';

//the words of Kotlin, and the functions of its library and of the helpers, which a program's names can't be
const RESERVED = new Set(
  [
    'as break class continue do else false for fun if in interface is null object package return super this throw',
    'true try typealias typeof val var when while main println print readln mutableListOf listOf repeat show',
    'roundTo sqrt pow sin cos tan asin acos atan ln log10 log floor ceil abs roundToInt PI E it'
  ]
    .join(' ')
    .split(' ')
);

//the precedence of Kotlin's operators, from the loosest: in binds more loosely than .. and arithmetic, and step and
//downTo, functions written between their operands, more loosely than ..
const PRECEDENCE: Record<string, number> = {
  '||': 1,
  '&&': 2,
  '==': 3,
  '!=': 3,
  '<': 4,
  '>': 4,
  '<=': 4,
  '>=': 4,
  in: 5,
  step: 6,
  downTo: 6,
  '..': 7,
  '+': 8,
  '-': 8,
  '*': 9,
  '/': 9,
  '%': 9
};

const OPERATORS: Record<string, string> = {[COMMAND.AND]: '&&', [COMMAND.OR]: '||'};

const kotlin = new Grammar(PRECEDENCE, new Set(['..']));
const name = (text: string) => kotlin.atom(text);

//a text as Kotlin writes it, like "a \"b\"", with \$ for a $, which would start a value
const literal = (text: string) => quoted(text, {$: '\\$'});

type Helper = {
  imports: string[];
  uses?: string[];
  code: (words: [string, string]) => string[];
};

//the helpers, by name, in the order they are written: what they import, the helpers they use, and their code
const HELPERS: Record<string, Helper> = {
  show: {
    imports: ['java.math.BigDecimal', 'java.math.MathContext'],
    code: ([yes, no]) => [
      '// a value as CMIL prints it: a real number with up to 12 digits, and a boolean in words',
      'fun show(value: Any?): String {',
      '    if (value is Double) return BigDecimal(value).round(MathContext(12)).stripTrailingZeros().toPlainString()',
      `    if (value is Boolean) return if (value) ${literal(yes)} else ${literal(no)}`,
      '    return value.toString()',
      '}'
    ]
  },
  roundTo: {
    imports: ['kotlin.math.floor', 'kotlin.math.pow'],
    uses: ['show'],
    code: () => [
      '// a number rounded to a count of decimals, a half up, after rounding it like it is printed, so 1.005 is 1.01',
      'fun roundTo(number: Double, digits: Int): Double {',
      '    val factor = 10.0.pow(digits)',
      '    return floor(show(number * factor).toDouble() + 0.5) / factor',
      '}'
    ]
  }
};

/** The Kotlin type of a value: Int, Double, String, Boolean or a MutableList; Int when nothing says. */
export const kotlinType = (type: Type): string => {
  if (isList(type)) return `MutableList<${kotlinType(type.list)}>`;
  return type === 'real' ? 'Double' : type === 'text' ? 'String' : type === 'boolean' ? 'Boolean' : 'Int';
};

//the value a variable declared before it gets one starts with, since Kotlin reads only variables that have one
const initial = (type: Type): string => {
  if (isList(type)) return `mutableListOf<${kotlinType(type.list)}>()`;
  return type === 'real' ? '0.0' : type === 'text' ? '""' : type === 'boolean' ? 'false' : '0';
};

/**
 * Writes a program in Kotlin.
 */
export const toKotlin = (tree: ProgramTree, types: Types, sourceCode: string): Converted => {
  const names = new Names(tree.names, RESERVED);
  const trivia = new Trivia(tree.comments, sourceCode, '//');
  const imports = new Set<string>();
  const helpers = new Helpers(HELPERS, imports);
  const {words: commands} = TRANSLATION[tree.language];
  const words: [string, string] = [commands.true[0], commands.false[0]];
  const english = tree.language === 'en';
  //how often each variable of the scope being written gets a value, for val
  let assignments = new Map<string, number>();
  //the type of the value the function being written returns
  let returns: Type | undefined;

  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';
  const code = (node: Expression, place?: Type) => kotlin.print(expression(node, place));

  //a function of Kotlin's math, which it imports
  const math = (method: string, args: Code[]): Code => {
    imports.add(`kotlin.math.${method}`);
    return kotlin.call(method, args);
  };

  //a boolean in the words of the program's language, as CMIL prints it
  const inWords = (node: Expression) =>
    kotlin.atom(`if (${code(node)}) ${literal(words[0])} else ${literal(words[1])}`, 0);

  //a value Kotlin doesn't print as CMIL does: a real number, and a boolean in another language than English
  const shown = (type: Type): boolean => type === 'real' || type === 'mixed' || (type === 'boolean' && !english);

  //a value as a text, like text() gives it
  const asText = (node: Expression): Code => {
    if (isJoined(node, types)) return template(joinedParts(node, types));
    const type = typeOf(node);
    if (type === 'text') return expression(node);
    if (type === 'boolean' && !english) return inWords(node);
    if (shown(type)) {
      helpers.use('show');
      return kotlin.call('show', [expression(node)]);
    }
    return kotlin.member(expression(node), 'toString', []);
  };

  //values joined into a text, as a string template, like "Hi, $name!": a variable as $name, unless a letter of a
  //name follows it, and any other value in braces
  const template = (parts: Expression[]): Code => {
    const text = parts.map((part, index) => {
      if (isText(part)) return literal(part.value).slice(1, -1);
      const type = typeOf(part);
      const value =
        type === 'boolean' && !english
          ? inWords(part)
          : shown(type)
            ? (helpers.use('show'), kotlin.call('show', [expression(part)]))
            : expression(part);
      const next = parts[index + 1];
      const joins = next && isText(next) && /^[\p{L}\p{N}_]/u.test(next.value);
      if (value.kind === 'atom' && part.type === 'variable' && !joins) return `$${value.text}`;
      return `\${${kotlin.print(value)}}`;
    });
    return name(`"${text.join('')}"`);
  };

  //an expression; a whole number in the place of a real one, like a Double variable, becomes a real one: 1.0, or
  //n.toDouble(), which Kotlin doesn't do itself
  const expression = (node: Expression, place?: Type): Code => {
    const type = typeOf(node);
    if (place === 'real' && type === 'whole') {
      return isNumeral(node) ? name(`${node.value}.0`) : kotlin.member(expression(node), 'toDouble', []);
    }
    if (place === 'whole' && type === 'real') return kotlin.member(expression(node), 'toInt', []);
    return write(node, place);
  };
  const real = (node: Expression) => expression(node, 'real');
  const whole = (node: Expression) => expression(node, 'whole');

  const write = (node: Expression, place?: Type): Code => {
    switch (node.type) {
      case 'value':
        if (node.constant) {
          imports.add(`kotlin.math.${node.constant === 'pi' ? 'PI' : 'E'}`);
          return name(node.constant === 'pi' ? 'PI' : 'E');
        }
        if (typeof node.value === 'string') return name(literal(node.value));
        return name(String(node.value));
      case 'list': {
        const type = place && isList(place) ? place : typeOf(node);
        const item = isList(type) ? type.list : 'unknown';
        if (!node.items.length) return name(`mutableListOf<${kotlinType(item)}>()`);
        return kotlin.call(
          'mutableListOf',
          node.items.map(each => expression(each, item))
        );
      }
      case 'template':
        return template(joinedParts(node, types));
      case 'variable':
        return name(names.of(node.name));
      case 'index': {
        const item = kotlin.index(expression(node.target), fromZero(kotlin, node.index, whole));
        //a letter of a text is a Char, which is a text by toString()
        return isList(typeOf(node.target)) ? item : kotlin.member(item, 'toString', []);
      }
      case 'input': {
        const answer = kotlin.call('readln', []);
        return typeOf(node) === 'real' ? kotlin.member(answer, 'toDouble', []) : answer;
      }
      case 'userCall': {
        const definition = definitionOf(tree.statements, node.name);
        const scope = types.variables.get(node.name)!;
        return kotlin.call(
          names.of(node.name),
          node.args.map((arg, index) => expression(arg, scope.get(definition.parameters[index])))
        );
      }
      case 'call':
        return builtIn(node);
      case 'unary':
        return kotlin.unary(node.operator === COMMAND.NOT ? '!' : node.operator, expression(node.operand));
      case 'binary':
        return binary(node);
    }
  };

  const binary = (node: Expression & {type: 'binary'}): Code => {
    const left = typeOf(node.left);
    const right = typeOf(node.right);

    if (node.operator === '+' && typeOf(node) === 'text') return template(joinedParts(node, types));
    if (node.operator === COMMAND.IN) {
      const item = isList(right) ? right.list : undefined;
      return kotlin.binary('in', expression(node.left, item), expression(node.right));
    }
    //a whole number divided by a whole number is a whole number in Kotlin, so the first one becomes a real one
    if (node.operator === '/' && left === 'whole' && right === 'whole') {
      return kotlin.binary('/', real(node.left), expression(node.right));
    }
    const operator = OPERATORS[node.operator] ?? node.operator;
    if (node.operator === '==' || node.operator === '!=') {
      //values of different types are never equal in CMIL; Kotlin doesn't compare them
      if (neverEqual(left, right)) return name(node.operator === '==' ? 'false' : 'true');
      //nor an Int with a Double
      if (isNumber(left) && isNumber(right) && left !== right) {
        return kotlin.binary(operator, real(node.left), real(node.right));
      }
    }
    return kotlin.binary(operator, expression(node.left), expression(node.right));
  };

  const builtIn = (node: Expression & {type: 'call'}): Code => {
    const [first] = node.args;
    //a whole number is its own floor, ceiling and rounding
    const rounded = (method: string): Code =>
      typeOf(first) === 'whole' ? expression(first) : kotlin.member(math(method, [real(first)]), 'toInt', []);
    switch (node.name) {
      case COMMAND.POW:
        imports.add('kotlin.math.pow');
        return kotlin.member(real(first), 'pow', [expression(node.args[1])]);
      case COMMAND.SQR: {
        if (isSimple(first)) return kotlin.binary('*', expression(first), expression(first));
        imports.add('kotlin.math.pow');
        const square = kotlin.member(real(first), 'pow', [name('2')]);
        return typeOf(node) === 'whole' ? kotlin.member(square, 'toInt', []) : square;
      }
      case COMMAND.ROUND:
        if (node.args.length === 2) {
          helpers.use('roundTo');
          return kotlin.call('roundTo', [real(first), whole(node.args[1])]);
        }
        if (typeOf(first) === 'whole') return expression(first);
        imports.add('kotlin.math.roundToInt');
        return kotlin.member(expression(first), 'roundToInt', []);
      case COMMAND.FLOOR:
        return rounded('floor');
      case COMMAND.CEIL:
        return rounded('ceil');
      case COMMAND.ABS:
        return math('abs', [expression(first)]);
      case COMMAND.LOG:
        return math('log', [real(node.args[1]), real(first)]);
      case COMMAND.RANDOM: {
        const [min, max] = node.args.length === 1 ? [null, first] : node.args;
        const range = kotlin.binary('..', min ? whole(min) : name('1'), whole(max));
        return kotlin.member(range, 'random', []);
      }
      case COMMAND.LENGTH:
        return kotlin.member(expression(first), isList(typeOf(first)) ? 'size' : 'length');
      case COMMAND.UPPER:
        return kotlin.member(expression(first), 'uppercase', []);
      case COMMAND.LOWER:
        return kotlin.member(expression(first), 'lowercase', []);
      case COMMAND.NUMBER:
        if (typeOf(first) === 'real') return expression(first);
        return kotlin.member(expression(first), 'toDouble', []);
      case COMMAND.TEXT:
        return asText(first);
      case COMMAND.SPLIT: {
        const separator = node.args[1];
        const text = expression(first);
        //the words of a text, between its spaces, and its letters, each a text of its own
        const parts = !separator
          ? kotlin.member(kotlin.member(text, 'split', [name('Regex("\\\\s+")')]), 'filter', [
              name('{ it.isNotEmpty() }')
            ])
          : isText(separator) && separator.value === ''
            ? kotlin.member(text, 'chunked', [name('1')])
            : kotlin.member(text, 'split', [expression(separator)]);
        return kotlin.member(parts, 'toMutableList', []);
      }
      case COMMAND.JOIN: {
        const separator = node.args[1] ? expression(node.args[1]) : name('""');
        const list = typeOf(first);
        if (!isList(list) || !shown(list.list)) return kotlin.member(expression(first), 'joinToString', [separator]);
        helpers.use('show');
        return name(`${kotlin.print(kotlin.member(expression(first), 'joinToString', [separator]))} { show(it) }`);
      }
    }
    const formula = mathOf(
      kotlin,
      node.name,
      node.args.map(real),
      (method, values) => math(method === 'log' ? 'ln' : method, values),
      () => {
        imports.add('kotlin.math.PI');
        return name('PI');
      }
    );
    if (formula) return formula;
    throw new Error(`No Kotlin for ${node.name}`);
  };

  //what println prints: a value as it is, or as CMIL prints it
  const printed = (node: Expression): string => {
    if (isText(node) && node.value === '') return '';
    const type = typeOf(node);
    if (isJoined(node, types) || shown(type) || (type === 'boolean' && !english)) return kotlin.print(asText(node));
    return code(node);
  };

  const itemOf = (list: Expression) => {
    const type = typeOf(list);
    return isList(type) ? type.list : undefined;
  };

  //a variable with the value it is first given: a val unless the program gives it another
  const declaration = (variable: string) => (assignments.get(variable) === 1 ? 'val' : 'var');

  const block = statementsOf({
    trivia,
    names,
    braces: SAME_LINE,
    declare: (variable, type) => [`var ${names.of(variable)} = ${initial(type)}`],
    write: (statement, context) => {
      const {comment, declares, scope} = context;
      //a loop over a range or a list, whose variable is the loop's own
      const each = (loop: Statement & {type: 'for' | 'forEach'}, items: string) => {
        const own = names.of(loop.name);
        const assign = (value: string) => `${declares ? 'var ' : ''}${own} = ${value}`;
        return loopOverValues(context, loop, own, variable => `for (${variable} in ${items})`, assign);
      };
      switch (statement.type) {
        case 'print':
          context.line(`println(${printed(statement.expression)})${comment}`);
          return;
        case 'assign': {
          const type = scope.get(statement.name)!;
          const keyword = declares ? `${declaration(statement.name)} ` : '';
          context.line(`${keyword}${names.of(statement.name)} = ${code(statement.expression, type)}${comment}`);
          return;
        }
        case 'setItem': {
          const item = kotlin.index(expression(statement.target), fromZero(kotlin, statement.index, whole));
          context.line(`${kotlin.print(item)} = ${code(statement.expression, itemOf(statement.target))}${comment}`);
          return;
        }
        case 'add':
        case 'remove': {
          const value = expression(statement.expression, itemOf(statement.target));
          context.line(
            `${kotlin.print(kotlin.member(expression(statement.target), statement.type, [value]))}${comment}`
          );
          return;
        }
        case 'call':
          context.line(`${code(statement.call)}${comment}`);
          return;
        case 'return':
          context.line(`return${statement.expression ? ` ${code(statement.expression, returns)}` : ''}${comment}`);
          return;
        case 'if':
          context.blocks(branchesOf(statement, (condition, index) => `${index ? 'else ' : ''}if (${code(condition)})`));
          return;
        case 'while':
          context.blocks([loopOf(statement, `while (${code(statement.condition)})`)]);
          return;
        case 'doWhile':
          context.blocks([{text: 'do', line: statement.doLine, body: statement.body}], {
            text: `while (${code(statement.condition)})`,
            line: statement.line
          });
          return;
        case 'repeat': {
          const count = code(statement.count, 'whole');
          //a break or a continue of the loop needs a loop, which the block of repeat() isn't
          if (breaksOut(statement.body)) {
            const counter = context.fresh(['i', 'j', 'k']);
            context.blocks([loopOf(statement, `for (${counter} in 1..${count})`)]);
          } else {
            context.blocks([loopOf(statement, `repeat(${count})`)]);
          }
          return;
        }
        case 'for': {
          const type = scope.get(statement.name)!;
          const {down, size, signed} = stepOf(statement);
          //a range takes a step above 0 alone, so a step whose sign shows only as the program runs counts with while
          if (type === 'whole' && (!size || typeOf(size) === 'whole') && !signed) {
            //a real last value, like sqrt(n), is the whole number the counter reaches
            const last =
              typeOf(statement.to) === 'real'
                ? kotlin.member(math(down ? 'ceil' : 'floor', [expression(statement.to)]), 'toInt', [])
                : expression(statement.to);
            let range = kotlin.binary(down ? 'downTo' : '..', expression(statement.from), last);
            if (size) range = kotlin.binary('step', range, expression(size));
            context.blocks([each(statement, kotlin.print(range))]);
            return;
          }
          //a real number counts with while, which reads its step and its last value once, and tests the step's sign
          const counter = names.of(statement.name);
          context.line(`${declares ? 'var ' : ''}${counter} = ${code(statement.from, type)}`);
          //a bound the loop changes is kept in a variable first
          const once = (bound: Expression, candidates: string[], place?: Type) =>
            context.keep(bound, candidates, kept => `val ${kept} = ${code(bound, place)}`);
          const last = once(statement.to, ['last', 'stop']);
          const step = size ? (once(size, ['by', 'stepSize'], type) ?? code(size, type)) : '1';
          const compare = (operator: string) =>
            kotlin.print(kotlin.binary(operator, name(counter), last ? name(last) : expression(statement.to)));
          const test = signed ? `if (${step} > 0) ${compare('<=')} else ${compare('>=')}` : compare(down ? '>=' : '<=');
          //the step, after the block and before a continue
          const next = () => context.line(`${counter} ${down ? '-=' : '+='} ${step}`);
          context.blocks([loopOf(statement, `while (${test})`, {last: next, next})]);
          return;
        }
        case 'forEach': {
          const type = typeOf(statement.expression);
          let items = expression(statement.expression);
          //the letters of a text, each a text of its own
          if (!isList(type)) items = kotlin.member(items, 'chunked', [name('1')]);
          //the loop changes the list, so it goes over a copy: the items the list had when the loop started
          else if (changesItsList(statement)) items = kotlin.member(items, 'toList', []);
          context.blocks([each(statement, kotlin.print(items))]);
          return;
        }
        case 'break':
        case 'continue':
          context.next();
          context.line(`${statement.type}${comment}`);
          return;
      }
    }
  });

  //the functions of the program, before main; a parameter the function gives another value is a var of its own
  const functions = new Writer('    ');
  for (const statement of tree.statements) {
    if (statement.type !== 'function') continue;
    const scope = types.variables.get(statement.name)!;
    const result = types.results.get(statement.name)!;
    assignments = assignedIn(statement.body);
    trivia.before(functions, statement.line);
    const parameters = statement.parameters.map(
      parameter => `${names.of(parameter)}: ${kotlinType(scope.get(parameter)!)}`
    );
    functions.line(
      `fun ${names.of(statement.name)}(${parameters.join(', ')})${result === 'unknown' ? '' : `: ${kotlinType(result)}`} {${trivia.after(statement.line)}`,
      statement.line
    );
    returns = result;
    functions.block(() => {
      for (const parameter of statement.parameters.filter(each => assignments.has(each))) {
        functions.line(`var ${names.of(parameter)} = ${names.of(parameter)}`, statement.line);
      }
      block(functions, statement.body, scope, new Set(statement.parameters));
    });
    returns = undefined;
    functions.line('}');
    functions.blank();
  }
  assignments = assignedIn(tree.statements.filter(statement => statement.type !== 'function'));
  const main = new Writer('    ');
  main.block(() => {
    block(main, tree.statements, types.variables.get('')!, new Set());
    trivia.rest(main);
  });

  const out = new Writer('    ');
  [...imports].sort().forEach(item => out.line(`import ${item}`));
  out.blank();
  out.append(functions);
  out.blank();
  out.line('fun main() {');
  out.append(main);
  out.line('}');
  helpers.write(out, helper => helper.code(words));
  return out.converted();
};

/** The writer of Kotlin: its targets, which cmil/convert/kotlin gives convert(). */
export const WRITERS: Writers = {kotlin: {typed: true, write: toKotlin}};
