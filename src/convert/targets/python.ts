/**
 * Python: nearly the program as it is, in Python's words, printing what the CMIL program prints. Lists count from 0,
 * real numbers are printed with up to 12 digits, and a helper prints a list as CMIL does.
 */
import {COMMAND} from '../../constants/index.ts';
import TRANSLATION from '../../translations/index.ts';
import {
  Names,
  Trivia,
  Writer,
  assignedIn,
  changedIn,
  fromZero,
  joinedParts,
  variablesIn,
  type Converted
} from '../emit.ts';
import {isList, isNumber, type Type, type Types} from '../types.ts';
import type {ProgramTree} from '../../program.ts';
import type {Expression, Statement} from '../../core/types.ts';

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
  '%': 6
};
const UNARY = 7;
const POWER = 8;
const POSTFIX = 9;
const ATOM = 10;

const HELPERS: Record<string, {imports: string[]; code: (quotes: [string, string]) => string[]}> = {
  show: {
    imports: [],
    code: ([open, close]) => [
      '# a value as CMIL prints it: a list like [1, 2, "a"], with its texts in quotes, a list inside itself as [...],',
      '# and numbers with up to 12 digits',
      'def show(value, inside=False, around=()):',
      '    if isinstance(value, list):',
      '        if any(value is outer for outer in around):',
      '            return "[...]"',
      '        return "[" + ", ".join(show(item, True, (*around, value)) for item in value) + "]"',
      '    if isinstance(value, bool):',
      '        return str(value).lower()',
      '    if isinstance(value, float):',
      '        return f"{value:.12g}"',
      '    if inside and isinstance(value, str):',
      `        escaped = value.replace('\\\\', '\\\\\\\\').replace(${single(close)}, ${single('\\' + close)})`,
      `        return ${single(open)} + escaped.replace('\\n', '\\\\n').replace('\\t', '\\\\t') + ${single(close)}`,
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

//a text in single quotes, for the helpers, where it has double ones
const single = (text: string) => `'${text.replace(/[\\']/g, symbol => `\\${symbol}`)}'`;

//a text as Python writes it, in double quotes
const quoted = (text: string) =>
  `"${text.replace(/[\\"\n\t]/g, symbol => ({'\\': '\\\\', '"': '\\"', '\n': '\\n', '\t': '\\t'})[symbol]!)}"`;

/**
 * Writes a program in Python.
 */
export const toPython = (tree: ProgramTree, types: Types, sourceCode: string): Converted => {
  const names = new Names(tree.names, RESERVED);
  const trivia = new Trivia(tree.comments, sourceCode, '#', '  ');
  const imports = new Set<string>();
  const helpers = new Set<string>();
  const [quotes] = TRANSLATION[tree.language].quotes;

  const use = (helper: string) => {
    helpers.add(helper);
    HELPERS[helper].imports.forEach(module => imports.add(module));
  };

  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';

  const expression = (node: Expression, need = 0): string => {
    const [text, precedence] = write(node);
    return precedence < need ? `(${text})` : text;
  };

  const call = (name: string, args: string[]): [string, number] => [`${name}(${args.join(', ')})`, POSTFIX];
  const math = (name: string, args: string[]): [string, number] => {
    imports.add('math');
    return call(`math.${name}`, args);
  };

  //a value that needs CMIL's way of printing: a list, unless of whole numbers, which Python prints the same way
  const shown = (type: Type): boolean =>
    type === 'mixed' || (isList(type) && type.list !== 'whole' && !(isList(type.list) && !shown(type.list)));

  //a real number with up to 12 digits, in an f-string unless the number has a text in quotes
  const real = (node: Expression): string => {
    const text = expression(node);
    return /["\\]/.test(text) ? `format(${text}, ".12g")` : `f"{${text}:.12g}"`;
  };

  //a value written in an f-string: a real number with up to 12 digits, a list as CMIL prints it
  const inText = (node: Expression): string => {
    const type = typeOf(node);
    if (type === 'real') return `{${expression(node)}:.12g}`;
    if (shown(type)) {
      use('show');
      return `{show(${expression(node)})}`;
    }
    return `{${expression(node)}}`;
  };

  //values joined into a text, as an f-string; with "a + b" when a part has a text in quotes of its own
  const joined = (parts: Expression[]): string => {
    const inside = parts.filter(part => !(part.type === 'value' && typeof part.value === 'string'));
    if (inside.some(part => /["\\{}]/.test(expression(part)))) {
      return parts
        .map(part => (typeOf(part) === 'text' ? expression(part, PRECEDENCE['+'] + 1) : asText(part)))
        .join(' + ');
    }
    const text = parts
      .map(part =>
        part.type === 'value' && typeof part.value === 'string'
          ? quoted(part.value)
              .slice(1, -1)
              .replace(/[{}]/g, brace => brace + brace)
          : inText(part)
      )
      .join('');
    return `f"${text}"`;
  };

  //a value as a text: str() of a whole number, a real number with up to 12 digits, a list as CMIL prints it
  const asText = (node: Expression): string => {
    const type = typeOf(node);
    if (type === 'text') return expression(node);
    if (type === 'real') return real(node);
    if (shown(type)) {
      use('show');
      return `show(${expression(node)})`;
    }
    return `str(${expression(node)})`;
  };

  const write = (node: Expression): [string, number] => {
    switch (node.type) {
      case 'value':
        if (node.constant) {
          imports.add('math');
          return [`math.${node.constant}`, POSTFIX];
        }
        if (typeof node.value === 'string') return [quoted(node.value), ATOM];
        if (typeof node.value === 'boolean') return [node.value ? 'True' : 'False', ATOM];
        return [String(node.value), ATOM];
      case 'list':
        return [`[${node.items.map(item => expression(item)).join(', ')}]`, ATOM];
      case 'variable':
        return [names.of(node.name), ATOM];
      case 'index':
        return [
          `${expression(node.target, POSTFIX)}[${fromZero(node.index, position => expression(position, PRECEDENCE['-']))}]`,
          POSTFIX
        ];
      case 'input':
        return typeOf(node) === 'real' ? ['float(input())', POSTFIX] : ['input()', POSTFIX];
      case 'userCall':
        return call(
          names.of(node.name),
          node.args.map(arg => expression(arg))
        );
      case 'call':
        return builtIn(node);
      case 'unary':
        if (node.operator === COMMAND.NOT) return [`not ${expression(node.operand, PRECEDENCE.not)}`, PRECEDENCE.not];
        return [`${node.operator}${expression(node.operand, UNARY)}`, UNARY];
      case 'binary': {
        if (node.operator === '+' && typeOf(node) === 'text') return [joined(joinedParts(node, types)), ATOM];
        const operator = node.operator === COMMAND.AND ? 'and' : node.operator === COMMAND.OR ? 'or' : node.operator;
        const precedence = PRECEDENCE[operator];
        return [
          `${expression(node.left, precedence)} ${operator} ${expression(node.right, precedence + 1)}`,
          precedence
        ];
      }
    }
  };

  const builtIn = (node: Expression & {type: 'call'}): [string, number] => {
    const args = node.args.map(arg => expression(arg));
    switch (node.name) {
      case COMMAND.POW:
        return [`${expression(node.args[0], POWER + 1)} ** ${expression(node.args[1], UNARY)}`, POWER];
      case COMMAND.SQR:
        return [`${expression(node.args[0], POWER + 1)} ** 2`, POWER];
      case COMMAND.SQRT:
        return math('sqrt', args);
      case COMMAND.ROUND:
        if (args.length === 1) {
          imports.add('math');
          return [`math.floor(${expression(node.args[0], PRECEDENCE['+'])} + 0.5)`, POSTFIX];
        }
        use('round_to');
        return call('round_to', args);
      case COMMAND.FLOOR:
      case COMMAND.CEIL:
      case COMMAND.SIN:
      case COMMAND.COS:
      case COMMAND.TAN:
        return math(node.name, args);
      case COMMAND.ABS:
        return call('abs', args);
      case COMMAND.ARCSIN:
      case COMMAND.ARCCOS:
      case COMMAND.ARCTAN:
        return math(`a${node.name.slice(3)}`, args);
      case COMMAND.COT:
        imports.add('math');
        return [`1 / math.tan(${args[0]})`, PRECEDENCE['/']];
      case COMMAND.ARCCOT:
        imports.add('math');
        return [`math.pi / 2 - math.atan(${args[0]})`, PRECEDENCE['-']];
      case COMMAND.LN:
        return math('log', args);
      case COMMAND.LG:
        return math('log10', args);
      case COMMAND.LOG:
        return math('log', [args[1], args[0]]);
      case COMMAND.RANDOM:
        imports.add('random');
        return call('random.randint', args.length === 1 ? ['1', args[0]] : args);
      case COMMAND.LENGTH:
        return call('len', args);
      case COMMAND.UPPER:
        return [`${expression(node.args[0], POSTFIX)}.upper()`, POSTFIX];
      case COMMAND.LOWER:
        return [`${expression(node.args[0], POSTFIX)}.lower()`, POSTFIX];
      case COMMAND.NUMBER:
        return isNumber(typeOf(node.args[0])) ? write(node.args[0]) : call('float', args);
      case COMMAND.TEXT:
        return [asText(node.args[0]), POSTFIX];
      case COMMAND.SPLIT: {
        if (args.length === 1) return [`${expression(node.args[0], POSTFIX)}.split()`, POSTFIX];
        const separator = node.args[1];
        if (separator.type === 'value' && separator.value === '') return call('list', [args[0]]);
        return [`${expression(node.args[0], POSTFIX)}.split(${args[1]})`, POSTFIX];
      }
      case COMMAND.JOIN: {
        const separator = args[1] ?? '""';
        const list = typeOf(node.args[0]);
        const items =
          isList(list) && list.list === 'text' ? args[0] : `${asTextOf('item', list)} for item in ${args[0]}`;
        return [`${separator}.join(${items})`, POSTFIX];
      }
    }
    throw new Error(`No Python for ${node.name}`);
  };

  //an item of a list as a text, by the type of the list's items
  const asTextOf = (item: string, list: Type): string => {
    const type = isList(list) ? list.list : 'unknown';
    if (type === 'real') return `f"{${item}:.12g}"`;
    if (isList(type)) {
      use('show');
      return `show(${item})`;
    }
    return `str(${item})`;
  };

  //what print prints: a value, an f-string of values joined into a text, a list as CMIL prints it
  const printed = (node: Expression): string => {
    const type = typeOf(node);
    if (type === 'real') return real(node);
    if (shown(type)) {
      use('show');
      return `show(${expression(node)})`;
    }
    return expression(node);
  };

  //the opposite of a condition: a comparison turned around, like == for !=, else with not
  const negated = (node: Expression): string => {
    const opposite: Record<string, string> = {'==': '!=', '!=': '==', '<': '>=', '>=': '<', '>': '<=', '<=': '>'};
    if (node.type === 'binary' && Object.hasOwn(opposite, node.operator)) {
      return expression({...node, operator: opposite[node.operator]});
    }
    if (node.type === 'unary' && node.operator === COMMAND.NOT) return expression(node.operand);
    return `not ${expression(node, PRECEDENCE.not)}`;
  };

  const block = (out: Writer, statements: Statement[]) => {
    if (!statements.length) out.line('pass');
    statements.forEach(statement => {
      trivia.before(out, statement.type === 'doWhile' ? statement.doLine : statement.line);
      emit(out, statement);
    });
  };

  const emit = (out: Writer, statement: Statement) => {
    const {line} = statement;
    const after = trivia.after(line);
    const body = (statements: Statement[]) => out.block(() => block(out, statements));

    switch (statement.type) {
      case 'print':
        out.line(`print(${printed(statement.expression)})${after}`, line);
        return;
      case 'assign':
        out.line(`${names.of(statement.name)} = ${expression(statement.expression)}${after}`, line);
        return;
      case 'setItem': {
        const index = fromZero(statement.index, position => expression(position, PRECEDENCE['-']));
        out.line(
          `${expression(statement.target, POSTFIX)}[${index}] = ${expression(statement.expression)}${after}`,
          line
        );
        return;
      }
      case 'add':
      case 'remove':
        out.line(
          `${expression(statement.target, POSTFIX)}.${statement.type === 'add' ? 'append' : 'remove'}(${expression(statement.expression)})${after}`,
          line
        );
        return;
      case 'call':
        out.line(`${expression(statement.call)}${after}`, line);
        return;
      case 'return':
        out.line(`return${statement.expression ? ` ${expression(statement.expression)}` : ''}${after}`, line);
        return;
      case 'if':
        statement.branches.forEach((branch, index) => {
          if (index) trivia.before(out, branch.line);
          out.line(
            `${index ? 'elif' : 'if'} ${expression(branch.condition)}:${trivia.after(branch.line)}`,
            branch.line
          );
          body(branch.body);
        });
        if (statement.elseLine) {
          trivia.before(out, statement.elseLine);
          out.line(`else:${trivia.after(statement.elseLine)}`, statement.elseLine);
          body(statement.elseBody);
        }
        return;
      case 'while':
        out.line(`while ${expression(statement.condition)}:${after}`, line);
        body(statement.body);
        return;
      case 'doWhile':
        out.line(`while True:${trivia.after(statement.doLine)}`, statement.doLine);
        out.block(() => {
          block(out, statement.body);
          trivia.before(out, line);
          out.line(`if ${negated(statement.condition)}:${after}`, line);
          out.block(() => out.line('break', line));
        });
        return;
      case 'repeat': {
        const count =
          typeOf(statement.count) === 'whole' ? expression(statement.count) : `int(${expression(statement.count)})`;
        out.line(`for _ in range(${count}):${after}`, line);
        body(statement.body);
        return;
      }
      case 'for': {
        const name = names.of(statement.name);
        const whole = [statement.from, statement.step].every(bound => !bound || typeOf(bound) === 'whole');
        if (whole) {
          const step = statement.step;
          const negative = step?.type === 'unary' && step.operator === '-';
          const to = statement.to;
          let last = expression(to, PRECEDENCE['+']);
          if (typeOf(to) !== 'whole') {
            imports.add('math');
            last = `math.${negative ? 'ceil' : 'floor'}(${expression(to)})`;
          }
          const end =
            to.type === 'value' && typeof to.value === 'number'
              ? String(to.value + (negative ? -1 : 1))
              : `${last} ${negative ? '-' : '+'} 1`;
          const args = [expression(statement.from), end, ...(step ? [expression(step)] : [])];
          if (args[0] === '0' && args.length === 2) args.shift();
          out.line(`for ${name} in range(${args.join(', ')}):${after}`, line);
          body(statement.body);
          return;
        }
        //a real number counts with while, which reads its step and its last value once
        const step = statement.step ? expression(statement.step) : '1';
        const negative = statement.step?.type === 'unary' && statement.step.operator === '-';
        out.line(`${name} = ${expression(statement.from)}${after}`, line);
        out.line(`while ${name} ${negative ? '>=' : '<='} ${expression(statement.to, PRECEDENCE['<'] + 1)}:`, line);
        out.block(() => {
          block(out, statement.body);
          out.line(`${name} += ${step}`, line);
        });
        return;
      }
      case 'forEach': {
        let items = expression(statement.expression, POSTFIX);
        const changed = [...variablesIn(statement.expression)].some(
          name => changedIn(statement.body).has(name) || assignedIn(statement.body).has(name)
        );
        //the loop changes the list, so it passes a copy: the items the list had when the loop started
        if (changed && isList(typeOf(statement.expression))) items += '.copy()';
        out.line(`for ${names.of(statement.name)} in ${items}:${after}`, line);
        body(statement.body);
        return;
      }
      case 'break':
      case 'continue':
        out.line(`${statement.type}${after}`, line);
        return;
    }
  };

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
    program.block(() => block(program, statement.body));
    program.blank();
  }
  program.blank();
  tree.statements
    .filter(statement => statement.type !== 'function')
    .forEach(statement => {
      trivia.before(program, statement.type === 'doWhile' ? statement.doLine : statement.line);
      emit(program, statement);
    });
  trivia.rest(program);

  for (const module of [...imports].sort()) out.line(`import ${module}`);
  for (const helper of Object.keys(HELPERS).filter(helper => helpers.has(helper))) {
    out.blank();
    HELPERS[helper].code(quotes).forEach(text => out.line(text));
  }
  out.blank();
  out.append(program);
  return out.converted();
};
