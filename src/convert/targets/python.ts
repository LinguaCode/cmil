/**
 * Python: nearly the program as it is, in Python's words, printing what the CMIL program prints. Lists count from 0,
 * and real numbers are printed with up to 12 digits.
 */
import {COMMAND} from '../../constants/index.ts';
import {Grammar, POSTFIX, UNARY, fromZero, mathOf, type Code} from '../code.ts';
import {
  Helpers,
  Names,
  Trivia,
  Writer,
  changesItsList,
  isText,
  joinedParts,
  negation,
  quoted,
  stepOf,
  type Converted
} from '../emit.ts';
import {branchesOf, doWhileOf, loopOf, statementsOf, type Braces} from '../statements.ts';
import {isList, isNumber, type Type, type Types} from '../types.ts';
import type {ProgramTree} from '../../program.ts';
import type {Expression} from '../../core/types.ts';

//the words of Python, and the functions the conversion uses, which a program's names can't be
const RESERVED = new Set(
  [
    'False None True and as assert async await break class continue def del elif else except finally for from global',
    'if import in is lambda nonlocal not or pass raise return try while with yield print input len range str float int',
    'list abs math random show round_to _'
  ]
    .join(' ')
    .split(' ')
);

//the precedence of Python's operators, from the loosest
const PRECEDENCE: Record<string, number> = {
  or: 1,
  and: 2,
  not: 3,
  '==': 4,
  '!=': 4,
  '<': 4,
  '>': 4,
  '<=': 4,
  '>=': 4,
  in: 4,
  '+': 5,
  '-': 5,
  '*': 6,
  '/': 6,
  '%': 6,
  //above -, which Python writes before a number: -x ** 2 is -(x ** 2)
  '**': UNARY + 1
};

const HELPERS: Record<string, {imports: string[]; code: () => string[]}> = {
  show: {
    imports: [],
    code: () => [
      '# a value of a variable that has values of more than one type, as CMIL prints it: a boolean in small letters,',
      '# and a number with up to 12 digits',
      'def show(value):',
      '    if isinstance(value, bool):',
      '        return str(value).lower()',
      '    if isinstance(value, float):',
      '        return f"{value:.12g}"',
      '    return str(value)'
    ]
  },
  round_to: {
    imports: ['math'],
    code: () => [
      '# a number rounded to a count of decimals, a half up, after rounding it like it is printed, so 1.005 is 1.01',
      'def round_to(number, digits):',
      '    return math.floor(float(f"{number * 10 ** digits:.12g}") + 0.5) / 10 ** digits'
    ]
  }
};

const py = new Grammar(PRECEDENCE);
const name = (text: string) => py.atom(text);

//a power: a value with a sign is in brackets before **, like (-2) ** 2, and needn't be after it, like 2 ** -1
const power = (base: Code, exponent: Code) => py.binary('**', base, exponent, [PRECEDENCE['**'] + 1, UNARY]);

//Python's blocks: indented after a :, with pass for a block without statements
const BLOCKS: Braces = {head: text => `${text}:`, tail: text => text, empty: 'pass'};

/**
 * Writes a program in Python.
 */
export const toPython = (tree: ProgramTree, types: Types, sourceCode: string): Converted => {
  const names = new Names(tree.names, RESERVED);
  const trivia = new Trivia(tree.comments, sourceCode, '#', '  ');
  const imports = new Set<string>();
  const helpers = new Helpers(HELPERS, imports);

  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';
  const code = (node: Expression) => py.print(expression(node));

  const math = (method: string, args: Code[]): Code => {
    imports.add('math');
    return py.call(`math.${method}`, args);
  };

  //a value of a variable that has values of more than one type, which show() prints as CMIL does
  const shown = (type: Type): boolean => type === 'mixed';

  //a real number with up to 12 digits, in an f-string unless the number has a text in quotes
  const real = (node: Expression): string => {
    const text = code(node);
    return /["\\]/.test(text) ? `format(${text}, ".12g")` : `f"{${text}:.12g}"`;
  };

  //a value written in an f-string: a real number with up to 12 digits, a value of more than one type by show()
  const inText = (node: Expression): string => {
    const type = typeOf(node);
    if (type === 'real') return `{${code(node)}:.12g}`;
    if (shown(type)) {
      helpers.use('show');
      return `{show(${code(node)})}`;
    }
    return `{${code(node)}}`;
  };

  //values joined into a text, as an f-string; with "a + b" when a part has a text in quotes of its own
  const joined = (parts: Expression[]): string => {
    const inside = parts.filter(part => !isText(part));
    if (inside.some(part => /["\\{}]/.test(code(part)))) {
      return parts
        .map(part =>
          typeOf(part) === 'text' ? py.print(py.bracketed(expression(part), PRECEDENCE['+'] + 1)) : asText(part)
        )
        .join(' + ');
    }
    const text = parts
      .map(part =>
        isText(part)
          ? quoted(part.value)
              .slice(1, -1)
              .replace(/[{}]/g, brace => brace + brace)
          : inText(part)
      )
      .join('');
    return `f"${text}"`;
  };

  //a value as a text: str() of a whole number, a real number with up to 12 digits, a value of more than one type by
  //show()
  const asText = (node: Expression): string => {
    const type = typeOf(node);
    if (type === 'text') return code(node);
    if (type === 'real') return real(node);
    if (shown(type)) {
      helpers.use('show');
      return `show(${code(node)})`;
    }
    return `str(${code(node)})`;
  };

  const expression = (node: Expression): Code => {
    switch (node.type) {
      case 'value':
        if (node.constant) {
          imports.add('math');
          return py.atom(`math.${node.constant}`, POSTFIX);
        }
        if (typeof node.value === 'string') return name(quoted(node.value));
        if (typeof node.value === 'boolean') return name(node.value ? 'True' : 'False');
        return name(String(node.value));
      case 'list':
        return py.items('[', node.items.map(expression), ']');
      case 'template':
        return name(joined(joinedParts(node, types)));
      case 'variable':
        return name(names.of(node.name));
      case 'index':
        return py.index(expression(node.target), fromZero(py, node.index, expression));
      case 'input':
        return typeOf(node) === 'real' ? py.call('float', [py.call('input', [])]) : py.call('input', []);
      case 'userCall':
        return py.call(names.of(node.name), node.args.map(expression));
      case 'call':
        return builtIn(node);
      case 'unary':
        if (node.operator === COMMAND.NOT) return py.unary('not ', expression(node.operand), PRECEDENCE.not);
        return py.unary(node.operator, expression(node.operand));
      case 'binary': {
        if (node.operator === '+' && typeOf(node) === 'text') return name(joined(joinedParts(node, types)));
        const operator = node.operator === COMMAND.AND ? 'and' : node.operator === COMMAND.OR ? 'or' : node.operator;
        return py.binary(operator, expression(node.left), expression(node.right));
      }
    }
  };

  const builtIn = (node: Expression & {type: 'call'}): Code => {
    const args = node.args.map(expression);
    switch (node.name) {
      case COMMAND.POW:
        return power(args[0], args[1]);
      case COMMAND.SQR:
        return power(args[0], name('2'));
      case COMMAND.ROUND:
        if (args.length === 1) return math('floor', [py.binary('+', args[0], name('0.5'))]);
        helpers.use('round_to');
        return py.call('round_to', args);
      case COMMAND.FLOOR:
      case COMMAND.CEIL:
        return math(node.name, args);
      case COMMAND.ABS:
        return py.call('abs', args);
      case COMMAND.LOG:
        return math('log', [args[1], args[0]]);
      case COMMAND.RANDOM:
        imports.add('random');
        return py.call('random.randint', args.length === 1 ? [name('1'), args[0]] : args);
      case COMMAND.LENGTH:
        return py.call('len', args);
      case COMMAND.UPPER:
        return py.member(args[0], 'upper', []);
      case COMMAND.LOWER:
        return py.member(args[0], 'lower', []);
      case COMMAND.NUMBER:
        return isNumber(typeOf(node.args[0])) ? args[0] : py.call('float', args);
      case COMMAND.TEXT:
        return py.atom(asText(node.args[0]), POSTFIX);
      case COMMAND.SPLIT: {
        if (args.length === 1) return py.member(args[0], 'split', []);
        const separator = node.args[1];
        if (separator.type === 'value' && separator.value === '') return py.call('list', [args[0]]);
        return py.member(args[0], 'split', [args[1]]);
      }
      case COMMAND.JOIN: {
        const separator = args[1] ?? name('""');
        const list = typeOf(node.args[0]);
        const items =
          isList(list) && list.list === 'text'
            ? args[0]
            : name(`${asTextOf('item', list)} for item in ${py.print(args[0])}`);
        return py.member(separator, 'join', [items]);
      }
    }
    const formula = mathOf(py, node.name, args, math, () => name('math.pi'));
    if (formula) return formula;
    throw new Error(`No Python for ${node.name}`);
  };

  //an item of a list as a text, by the type of the list's items
  const asTextOf = (item: string, list: Type): string => {
    const type = isList(list) ? list.list : 'unknown';
    if (type === 'real') return `f"{${item}:.12g}"`;
    return `str(${item})`;
  };

  //what print prints: a value, an f-string of values joined into a text, a value of more than one type by show()
  const printed = (node: Expression): string => {
    const type = typeOf(node);
    if (type === 'real') return real(node);
    if (shown(type)) {
      helpers.use('show');
      return `show(${code(node)})`;
    }
    return code(node);
  };

  const block = statementsOf({
    trivia,
    names,
    braces: BLOCKS,
    write: (statement, context) => {
      const {comment} = context;
      switch (statement.type) {
        case 'print':
          context.line(`print(${printed(statement.expression)})${comment}`);
          return;
        case 'assign':
          context.line(`${names.of(statement.name)} = ${code(statement.expression)}${comment}`);
          return;
        case 'setItem': {
          const item = py.index(expression(statement.target), fromZero(py, statement.index, expression));
          context.line(`${py.print(item)} = ${code(statement.expression)}${comment}`);
          return;
        }
        case 'add':
        case 'remove': {
          const method = statement.type === 'add' ? 'append' : 'remove';
          const changed = py.member(expression(statement.target), method, [expression(statement.expression)]);
          context.line(`${py.print(changed)}${comment}`);
          return;
        }
        case 'call':
          context.line(`${code(statement.call)}${comment}`);
          return;
        case 'return':
          context.line(`return${statement.expression ? ` ${code(statement.expression)}` : ''}${comment}`);
          return;
        case 'if':
          context.blocks(branchesOf(statement, (condition, index) => `${index ? 'elif' : 'if'} ${code(condition)}`));
          return;
        case 'while':
          context.blocks([loopOf(statement, `while ${code(statement.condition)}`)]);
          return;
        case 'doWhile':
          context.blocks([
            doWhileOf(context, statement, 'while True', `if ${code(negation(statement.condition, types))}`, 'break')
          ]);
          return;
        case 'repeat': {
          const count = typeOf(statement.count) === 'whole' ? code(statement.count) : `int(${code(statement.count)})`;
          context.blocks([loopOf(statement, `for _ in range(${count})`)]);
          return;
        }
        case 'for': {
          const counter = names.of(statement.name);
          const whole = [statement.from, statement.step].every(bound => !bound || typeOf(bound) === 'whole');
          const step = statement.step;
          const {down, signed} = stepOf(statement);
          //a bound kept in a variable first, as readsOnce() tells
          const once = (bound: Expression, candidates: string[]) =>
            context.keep(bound, candidates, kept => `${kept} = ${code(bound)}`);
          if (whole) {
            const to = statement.to;
            //the end range() stops before: one after the last value counting up, one before it counting down
            const endOf = (down: boolean): Code => {
              if (to.type === 'value' && typeof to.value === 'number') {
                return name(String(down ? Math.ceil(to.value) - 1 : Math.floor(to.value) + 1));
              }
              const last =
                typeOf(to) === 'whole'
                  ? py.bracketed(expression(to), PRECEDENCE['+'])
                  : math(down ? 'ceil' : 'floor', [expression(to)]);
              return py.binary(down ? '-' : '+', last, name('1'));
            };
            //a step whose sign shows only as the program runs, used twice, is kept first when it asks
            const by = signed ? (once(step!, ['by', 'step_size']) ?? code(step!)) : step && code(step);
            const end = signed
              ? `${py.print(endOf(false))} if ${py.print(py.binary('>', name(by!), name('0')))} else ${py.print(endOf(true))}`
              : py.print(endOf(down));
            const args = [code(statement.from), end, ...(by ? [by] : [])];
            if (args[0] === '0' && args.length === 2) args.shift();
            context.blocks([loopOf(statement, `for ${counter} in range(${args.join(', ')})`)]);
            return;
          }
          //a real number counts with while, which reads its step and its last value once
          context.line(`${counter} = ${code(statement.from)}${comment}`);
          const last = once(statement.to, ['last', 'stop']);
          const compare = (operator: string) =>
            py.print(py.binary(operator, name(counter), last ? name(last) : expression(statement.to)));
          const by = step && (once(step, ['by', 'step_size']) ?? code(step));
          const test = signed
            ? `(${compare('<=')} if ${py.print(py.binary('>', name(by!), name('0')))} else ${compare('>=')})`
            : compare(down ? '>=' : '<=');
          //the step, after the block and before a continue
          const next = () => context.line(`${counter} += ${by || '1'}`);
          context.blocks([loopOf(statement, `while ${test}`, {comment: '', last: next, next})]);
          return;
        }
        case 'forEach': {
          let items = py.print(py.bracketed(expression(statement.expression), POSTFIX));
          //the loop changes the list, so it passes a copy: the items the list had when the loop started
          if (changesItsList(statement) && isList(typeOf(statement.expression))) items += '.copy()';
          context.blocks([loopOf(statement, `for ${names.of(statement.name)} in ${items}`)]);
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

  const out = new Writer('    ');
  const program = new Writer('    ');
  for (const statement of tree.statements) {
    if (statement.type !== 'function') continue;
    trivia.before(program, statement.line);
    const parameters = statement.parameters.map(parameter => names.of(parameter));
    program.line(
      `def ${names.of(statement.name)}(${parameters.join(', ')}):${trivia.after(statement.line)}`,
      statement.line
    );
    program.block(() => {
      if (!statement.body.length) program.line('pass');
      block(program, statement.body, new Map(), new Set());
    });
    program.blank();
  }
  program.blank();
  block(program, tree.statements, new Map(), new Set());
  trivia.rest(program);

  for (const module of [...imports].sort()) out.line(`import ${module}`);
  helpers.write(out, helper => helper.code());
  out.blank();
  out.append(program);
  return out.converted();
};
