/**
 * JavaScript: what a teacher writes, a script for the browser that prints what the CMIL program prints, with
 * console.log() and prompt(). Its texts with values in them are template literals, and a helper prints real numbers
 * as CMIL does, whose numbers are JavaScript's.
 */
import {COMMAND} from '../../constants/index.ts';
import TRANSLATION from '../../translations/index.ts';
import {counterTest, fromZero, Grammar, mathOf, POSTFIX, UNARY, type Code} from '../code.ts';
import {
  Helpers,
  Names,
  Trivia,
  Writer,
  assignedIn,
  changesItsList,
  isJoined,
  isText,
  joinedParts,
  quoted,
  stepOf,
  type Converted
} from '../emit.ts';
import {SAME_LINE, branchesOf, loopOf, statementsOf} from '../statements.ts';
import {isList, type Type, type Types} from '../types.ts';
import type {ProgramTree} from '../../program.ts';
import type {Expression} from '../../core/types.ts';

//the words of JavaScript, the names a page already has, and the names the conversion uses, which a program's names
//can't be
const RESERVED = new Set(
  [
    'break case catch class const continue debugger default delete do else export extends false finally for function',
    'if import in instanceof new null return super switch this throw true try typeof var void while with yield let',
    'static enum await implements package protected interface private public arguments eval undefined NaN Infinity',
    'window document location top self parent frames console prompt Math Number String JSON Array show roundTo'
  ]
    .join(' ')
    .split(' ')
);

//the precedence of JavaScript's operators, from the loosest
const PRECEDENCE: Record<string, number> = {
  '||': 1,
  '&&': 2,
  '===': 3,
  '!==': 3,
  '<': 4,
  '>': 4,
  '<=': 4,
  '>=': 4,
  '+': 5,
  '-': 5,
  '*': 6,
  '/': 6,
  '%': 6,
  '**': 7
};

const OPERATORS: Record<string, string> = {[COMMAND.AND]: '&&', [COMMAND.OR]: '||', '==': '===', '!=': '!=='};

const js = new Grammar(PRECEDENCE);
const name = (text: string) => js.atom(text);

//a text in a template literal, with \ before a ` and a ${
const inTemplate = (text: string) =>
  text.replace(/[\\`\n\t]|\$\{/g, symbol => ({'\\': '\\\\', '`': '\\`', '\n': '\\n', '\t': '\\t'})[symbol] ?? '\\${');

type Helper = {code: (words: [string, string]) => string[]};

const HELPERS: Record<string, Helper> = {
  show: {
    code: ([yes, no]) => [
      '// a value as CMIL prints it: a number with up to 12 digits, and all of them, like 0.3 and 1000000000000000000000,',
      '// and a boolean in the words of the program',
      'function show(value) {',
      '  if (typeof value === "number") {',
      '    const number = Number.isSafeInteger(value) ? value : Number(value.toPrecision(12));',
      '    return (number || 0).toLocaleString("en-US", {useGrouping: false, maximumSignificantDigits: 21});',
      '  }',
      '  if (typeof value === "boolean") {',
      `    return value ? ${quoted(yes)} : ${quoted(no)};`,
      '  }',
      '  return value;',
      '}'
    ]
  },
  roundTo: {
    code: () => [
      '// a number rounded to a count of decimals, a half up, after rounding it like it is printed, so 1.005 is 1.01',
      'function roundTo(number, digits) {',
      '  return Math.round(Number((number * 10 ** digits).toPrecision(12))) / 10 ** digits;',
      '}'
    ]
  }
};

/**
 * Writes a program in JavaScript.
 */
export const toJavascript = (tree: ProgramTree, types: Types, sourceCode: string): Converted => {
  const names = new Names(tree.names, RESERVED);
  const trivia = new Trivia(tree.comments, sourceCode, '//');
  const helpers = new Helpers(HELPERS);
  const {words: commands} = TRANSLATION[tree.language];
  const words: [string, string] = [commands.true[0], commands.false[0]];
  const english = tree.language === 'en';
  //how often each variable of the scope being written gets a value, for const
  let assignments = new Map<string, number>();

  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';
  const code = (node: Expression) => js.print(expression(node));
  const math = (method: string, args: Code[]) => js.call(`Math.${method}`, args);

  //a boolean in the words of the program's language, as CMIL prints it
  const inWords = (node: Expression) =>
    `${js.print(js.bracketed(expression(node), PRECEDENCE['||'] + 1))} ? ${quoted(words[0])} : ${quoted(words[1])}`;

  //a value as CMIL prints it: JavaScript prints a real number with all its digits, like 0.30000000000000004, and a
  //boolean in English
  const asText = (node: Expression): string => {
    const type = typeOf(node);
    if (type === 'boolean' && !english) return inWords(node);
    if (type === 'real' || type === 'mixed') {
      helpers.use('show');
      return `show(${code(node)})`;
    }
    return code(node);
  };

  //values joined into a text, as a template literal, like `Hi, ${name}`
  const template = (parts: Expression[]): string => {
    if (parts.length === 1 && isText(parts[0])) return quoted(parts[0].value);
    return `\`${parts.map(part => (isText(part) ? inTemplate(part.value) : `\${${asText(part)}}`)).join('')}\``;
  };

  const expression = (node: Expression): Code => {
    switch (node.type) {
      case 'value':
        if (node.constant) return js.atom(`Math.${node.constant.toUpperCase()}`, POSTFIX);
        if (typeof node.value === 'string') return name(quoted(node.value));
        return js.atom(String(node.value), typeof node.value === 'number' && node.value < 0 ? UNARY : undefined);
      case 'list':
        return js.items('[', node.items.map(expression), ']');
      case 'template':
        return name(template(joinedParts(node, types)));
      case 'variable':
        return name(names.of(node.name));
      case 'index':
        return js.index(expression(node.target), fromZero(js, node.index, expression));
      case 'input':
        return typeOf(node) === 'real' ? js.call('Number', [js.call('prompt', [])]) : js.call('prompt', []);
      case 'userCall':
        return js.call(names.of(node.name), node.args.map(expression));
      case 'call':
        return builtIn(node);
      case 'unary':
        return js.unary(node.operator === COMMAND.NOT ? '!' : node.operator, expression(node.operand));
      case 'binary': {
        if (node.operator === '+' && typeOf(node) === 'text') return name(template(joinedParts(node, types)));
        if (node.operator === COMMAND.IN) return js.member(expression(node.right), 'includes', [expression(node.left)]);
        return js.binary(OPERATORS[node.operator] ?? node.operator, expression(node.left), expression(node.right));
      }
    }
  };

  const builtIn = (node: Expression & {type: 'call'}): Code => {
    const args = node.args.map(expression);
    const [first] = args;
    switch (node.name) {
      case COMMAND.POW:
        //-2 ** 2 isn't JavaScript, so a value with a sign is in brackets
        return js.binary('**', js.bracketed(first, POSTFIX), js.bracketed(args[1], UNARY));
      case COMMAND.SQR:
        return js.binary('**', js.bracketed(first, POSTFIX), name('2'));
      case COMMAND.ROUND:
        if (args.length === 2) {
          helpers.use('roundTo');
          return js.call('roundTo', args);
        }
        return math('round', args);
      case COMMAND.FLOOR:
      case COMMAND.CEIL:
      case COMMAND.ABS:
        return math(node.name, args);
      case COMMAND.RANDOM: {
        const [min, max] = node.args.length === 1 ? [null, first] : args;
        const count = !min ? max : {kind: 'paren' as const, inner: js.binary('+', js.binary('-', max, min), name('1'))};
        const random = math('floor', [js.binary('*', math('random', []), count)]);
        return js.binary('+', random, min ?? name('1'));
      }
      case COMMAND.LENGTH:
        return js.member(first, 'length');
      case COMMAND.UPPER:
        return js.member(first, 'toUpperCase', []);
      case COMMAND.LOWER:
        return js.member(first, 'toLowerCase', []);
      case COMMAND.NUMBER:
        return typeOf(node.args[0]) === 'text' ? js.call('Number', args) : first;
      case COMMAND.TEXT: {
        const type = typeOf(node.args[0]);
        if (type === 'text') return first;
        if (type === 'whole' || (type === 'boolean' && english)) return js.call('String', args);
        return js.atom(asText(node.args[0]), POSTFIX);
      }
      case COMMAND.SPLIT: {
        if (!node.args[1]) return js.member(js.member(first, 'split', [name('/\\s+/')]), 'filter', [name('Boolean')]);
        const separator = node.args[1];
        //the letters of a text, each a letter of its own, also an emoji
        if (isText(separator) && separator.value === '') return js.items('[...', [js.bracketed(first, POSTFIX)], ']');
        return js.member(first, 'split', [args[1]]);
      }
      case COMMAND.JOIN: {
        const separator = args[1] ?? name('""');
        const list = typeOf(node.args[0]);
        const item = isList(list) ? list.list : 'unknown';
        if (item === 'text' || item === 'whole' || (item === 'boolean' && english)) {
          return js.member(first, 'join', [separator]);
        }
        helpers.use('show');
        return js.member(js.member(first, 'map', [name('item => show(item)')]), 'join', [separator]);
      }
    }
    const formula = mathOf(js, node.name, args, math, () => name('Math.PI'));
    if (formula) return formula;
    throw new Error(`No JavaScript for ${node.name}`);
  };

  //what console.log prints
  const printed = (node: Expression): string => {
    if (isText(node) && node.value === '') return '';
    if (isJoined(node, types)) return template(joinedParts(node, types));
    return asText(node);
  };

  const block = statementsOf({
    trivia,
    names,
    braces: SAME_LINE,
    declare: variable => [`let ${names.of(variable)};`],
    functionsInPlace: true,
    write: (statement, context) => {
      const {comment, declares} = context;
      //CMIL reads the bounds of a loop once; when the loop changes them, JavaScript keeps them in a variable first
      const once = (bound: Expression, candidates: string[]): Code => {
        const kept = context.keep(bound, candidates, variable => `const ${variable} = ${code(bound)};`);
        return kept ? name(kept) : expression(bound);
      };
      switch (statement.type) {
        case 'print':
          context.line(`console.log(${printed(statement.expression)});${comment}`);
          return;
        case 'assign': {
          const keyword = declares ? (assignments.get(statement.name) === 1 ? 'const ' : 'let ') : '';
          context.line(`${keyword}${names.of(statement.name)} = ${code(statement.expression)};${comment}`);
          return;
        }
        case 'setItem': {
          const item = js.index(expression(statement.target), fromZero(js, statement.index, expression));
          context.line(`${js.print(item)} = ${code(statement.expression)};${comment}`);
          return;
        }
        case 'add':
          context.line(
            `${js.print(js.member(expression(statement.target), 'push', [expression(statement.expression)]))};${comment}`
          );
          return;
        case 'remove': {
          const list = expression(statement.target);
          const at = js.member(list, 'indexOf', [expression(statement.expression)]);
          context.line(`${js.print(js.member(list, 'splice', [at, name('1')]))};${comment}`);
          return;
        }
        case 'call':
          context.line(`${code(statement.call)};${comment}`);
          return;
        case 'return':
          context.line(`return${statement.expression ? ` ${code(statement.expression)}` : ''};${comment}`);
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
          const test = js.print(js.binary('<', name(counter), count));
          context.blocks([loopOf(statement, `for (let ${counter} = 0; ${test}; ${counter}++)`)]);
          return;
        }
        case 'for': {
          const counter = names.of(statement.name);
          const {down, size, signed} = stepOf(statement);
          //the first value too, when it asks and a later bound is kept, so the program asks in CMIL's order
          const first = once(statement.from, ['first', 'start']);
          const last = once(statement.to, ['last', 'end']);
          const by = size && once(size, ['step', 'by']);
          const test = counterTest(js, operator => js.binary(operator, name(counter), last), {down, signed}, by);
          const next = !by
            ? `${counter}${down ? '--' : '++'}`
            : `${counter} ${down ? '-=' : '+='} ${js.print(js.bracketed(by, PRECEDENCE['+'] + 1))}`;
          const start = `${declares ? 'let ' : ''}${counter} = ${js.print(first)}`;
          context.blocks([loopOf(statement, `for (${start}; ${test}; ${next})`)]);
          return;
        }
        case 'forEach': {
          let items = js.print(js.bracketed(expression(statement.expression), POSTFIX));
          //the loop changes the list, so it goes over a copy: the items the list had when the loop started
          if (changesItsList(statement) && isList(typeOf(statement.expression))) items = `[...${items}]`;
          const variable = names.of(statement.name);
          const keyword = !declares ? '' : assignedIn(statement.body).has(statement.name) ? 'let ' : 'const ';
          context.blocks([loopOf(statement, `for (${keyword}${variable} of ${items})`)]);
          return;
        }
        case 'break':
        case 'continue':
          context.line(`${statement.type};${comment}`);
          return;
        case 'function': {
          const parameters = statement.parameters.map(parameter => names.of(parameter));
          const saved = assignments;
          assignments = assignedIn(statement.body);
          context.blocks([
            loopOf(statement, `function ${names.of(statement.name)}(${parameters.join(', ')})`, {
              scope: types.variables.get(statement.name)!,
              declared: new Set(statement.parameters)
            })
          ]);
          assignments = saved;
          context.blank();
          return;
        }
      }
    }
  });

  const program = new Writer('  ');
  assignments = assignedIn(tree.statements.filter(statement => statement.type !== 'function'));
  block(program, tree.statements, types.variables.get('')!, new Set());
  trivia.rest(program);

  const out = new Writer('  ');
  out.append(program);
  helpers.write(out, helper => helper.code(words));
  return out.converted();
};
