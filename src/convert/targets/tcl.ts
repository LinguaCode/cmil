/**
 * Tcl: what a teacher writes, in Tcl 8.6, that prints what the CMIL program prints. Every value of Tcl is a text, so
 * the conversion knows the type of a value from the program, as in a typed language, and prints a real number and a
 * boolean by show(), whose type, number or bool, tells how. Arithmetic is in expr {…}; lists are Tcl's
 * lists, which are values, so a function changes a list it is given by its variable's name, with upvar. Names have
 * only Latin letters, which $name reads, and a function can't have the name of a command of Tcl. The helpers a
 * program needs come first, then its procs, which Tcl needs before it runs them, then the program.
 */
import {COMMAND} from '../../constants/index.ts';
import TRANSLATION from '../../translations/index.ts';
import {Grammar, UNARY, mathOf, type Code} from '../code.ts';
import {
  Helpers,
  Names,
  Trivia,
  Writer,
  changedIn,
  definitionOf,
  isJoined,
  isText,
  joinedParts,
  negation,
  neverEqual,
  stepOf,
  type Converted
} from '../emit.ts';
import {SAME_LINE, branchesOf, doWhileOf, loopOf, statementsOf} from '../statements.ts';
import {isList, type Type, type Types} from '../types.ts';
import type {ProgramTree} from '../../program.ts';
import type {Writers} from '../registry.ts';
import type {Expression, Statement} from '../../core/types.ts';

//the commands of Tcl and the helpers, which a function of the program can't be named, since it would replace them
const COMMANDS = new Set(
  [
    'after append apply array auto_execok auto_import auto_load auto_load_index auto_qualify binary break case catch',
    'cd chan clock close concat continue coroutine dict encoding eof error eval exec exit expr fblocked fconfigure',
    'fcopy file fileevent flush for foreach format gets glob global history if incr info interp join lappend lassign',
    'lindex linsert list llength lmap load lrange lrepeat lreplace lreverse lsearch lset lsort namespace open package',
    'pid proc puts pwd read regexp regsub rename return scan seek set socket source split string subst switch tailcall',
    'tclLog tell throw time trace try unknown unload unset update uplevel upvar variable vwait while yield yieldto zlib',
    'else elseif then show remove_item split_at round_to'
  ]
    .join(' ')
    .split(' ')
);

//the names a variable can't have: those Tcl gives a meaning, like args of a proc, and its global variables
const VARIABLES = new Set(
  'args env argc argv argv0 errorInfo errorCode tcl_platform tcl_version tcl_patchLevel tcl_library tcl_precision tcl_interactive auto_path auto_index'.split(
    ' '
  )
);

//the precedence of the operators of expr, from the loosest; a sign and ! bind more tightly than all, so -2 ** 2 is 4
const PRECEDENCE: Record<string, number> = {
  '||': 1,
  '&&': 2,
  '==': 3,
  '!=': 3,
  eq: 3,
  ne: 3,
  in: 3,
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

const OPERATORS: Record<string, string> = {[COMMAND.AND]: '&&', [COMMAND.OR]: '||'};

const tcl = new Grammar(PRECEDENCE);
const name = (text: string) => tcl.atom(text);
//a command, whose value is a word as it is, like [llength $list]
const command = (text: string) => tcl.atom(`[${text}]`);

//a power, whose exponent may have a sign, like 2.0 ** -1
const power = (base: Code, exponent: Code) => tcl.binary('**', base, exponent, [PRECEDENCE['**'] + 1, UNARY]);

//the letters of a text in double quotes, with a \ before those Tcl would read, and \n and \t for a new line and a tab;
//braces too, which a text in the braces of expr {…} must not open or close
const escaped = (text: string) =>
  text.replace(/[\\"$[\]{}\n\t]/g, mark => ({'\n': '\\n', '\t': '\\t'})[mark] ?? `\\${mark}`);
const literal = (text: string) => `"${escaped(text)}"`;

//the type of a value as show() reads it: bool or number
const typeWord = (type: Type): string => (type === 'boolean' ? 'bool' : 'number');

type HelperContext = {words: [string, string]};
type Helper = {code: (context: HelperContext) => string[]};

//the helpers, by name, in the order they are written
const HELPERS: Record<string, Helper> = {
  show: {
    code: ({words: [yes, no]}) => [
      '# a value as CMIL prints it, as its type says, since every value of Tcl is a text: a number with up to 12',
      '# digits, and a boolean in words',
      'proc show {value type} {',
      '    if {$type eq "bool"} {',
      '        if {$value} {',
      `            return ${literal(yes)}`,
      '        }',
      `        return ${literal(no)}`,
      '    }',
      '    if {[string is entier -strict $value]} {',
      '        return $value',
      '    }',
      '    return [format %.12g $value]',
      '}'
    ]
  },
  removeItem: {
    code: () => [
      '# a list without the first item that is a value',
      'proc remove_item {list value} {',
      '    set at [lsearch -exact $list $value]',
      '    if {$at < 0} {',
      '        return $list',
      '    }',
      '    return [lreplace $list $at $at]',
      '}'
    ]
  },
  splitAt: {
    code: () => [
      '# the parts of a text between a separator of more than one letter, with the empty ones, since split cuts at',
      '# each of its letters',
      'proc split_at {text separator} {',
      '    set parts {}',
      '    while {[set at [string first $separator $text]] >= 0} {',
      '        lappend parts [string range $text 0 $at-1]',
      '        set text [string range $text [expr {$at + [string length $separator]}] end]',
      '    }',
      '    lappend parts $text',
      '    return $parts',
      '}'
    ]
  },
  roundTo: {
    code: () => [
      '# a number rounded to a count of decimals, a half up, after rounding it like it is printed, so 1.005 is 1.01',
      'proc round_to {number digits} {',
      '    set factor [expr {10.0 ** $digits}]',
      '    return [expr {floor([format %.12g [expr {$number * $factor}]] + 0.5) / $factor}]',
      '}'
    ]
  },
  pi: {
    code: () => [
      '# pi, for expr, which has no constant of it',
      'proc tcl::mathfunc::pi {} {',
      '    return [expr {acos(-1)}]',
      '}'
    ]
  }
};

/**
 * Writes a program in Tcl.
 */
export const toTcl = (tree: ProgramTree, types: Types, sourceCode: string): Converted => {
  const names = new Names(tree.names, VARIABLES, {latin: true});
  const procs = new Names(tree.names, COMMANDS, {latin: true});
  const trivia = new Trivia(tree.comments, sourceCode, '#', ' ;');
  const helpers = new Helpers(HELPERS);
  const {words: commands} = TRANSLATION[tree.language];
  const words: [string, string] = [commands.true[0], commands.false[0]];
  const definitions = tree.statements.filter(
    (statement): statement is Statement & {type: 'function'} => statement.type === 'function'
  );
  //the lines a statement needs first, like a list a function changes, given in a variable
  let pending: string[] = [];

  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';
  const code = (node: Expression) => tcl.print(expression(node));

  //a value as a word of a command: a variable, a number, a text or a command as it is, else expr {…}
  const word = (node: Expression): string => {
    const value = expression(node);
    return value.kind === 'atom' ? value.text : `[expr {${tcl.print(value)}}]`;
  };

  //a value as CMIL prints it: a whole number and a text as they are, the others by show(), as their type says
  const shown = (node: Expression): string => {
    const type = typeOf(node);
    if (type === 'text' || type === 'whole' || type === 'unknown') return word(node);
    helpers.use('show');
    return `[show ${word(node)} ${typeWord(type)}]`;
  };

  //values joined into a text, in double quotes, like "Hi, $name"; a variable before a letter, a digit, _, ( or :, which
  //it would read as its name, is in braces
  const interpolated = (parts: Expression[]): string =>
    `"${parts
      .map((part, index) => {
        if (isText(part)) return escaped(part.value);
        const piece = shown(part);
        const next = parts[index + 1];
        return piece.startsWith('$') && next && isText(next) && /^[\w(:]/.test(next.value)
          ? `\${${piece.slice(1)}}`
          : piece;
      })
      .join('')}"`;

  //an index from 0 as a word, like $i-1, which Tcl's commands count by
  const indexWord = (node: Expression): string => {
    if (node.type === 'value' && typeof node.value === 'number') return String(node.value - 1);
    if (node.type === 'variable') return `$${names.of(node.name)}-1`;
    return `[expr {${code(node)} - 1}]`;
  };

  //the variable a list or an item of a list is in, and the indexes of the item, like t and 0 1 for t[1][2]
  const placeOf = (node: Expression): {variable: string; indexes: string[]} | null => {
    if (node.type === 'variable') return {variable: names.of(node.name), indexes: []};
    if (node.type === 'index' && isList(typeOf(node.target))) {
      const place = placeOf(node.target);
      return place && {...place, indexes: [...place.indexes, indexWord(node.index)]};
    }
    return null;
  };

  //a real number for / and **, which Tcl computes in whole numbers for two whole numbers, as a real number would be
  //kept in a variable that has a whole one, like an answer of 4
  const real = (node: Expression): Code => {
    if (node.type === 'value' && typeof node.value === 'number') {
      return Number.isInteger(node.value)
        ? tcl.atom(`${node.value}.0`, node.value < 0 ? UNARY : undefined)
        : expression(node);
    }
    return tcl.call('double', [expression(node)]);
  };

  //a list in a variable, for a proc that changes it by its name; a list in no variable is given one first
  const variableOf = (node: Expression): string => {
    if (node.type === 'variable') return names.of(node.name);
    const items = names.fresh(['items', 'list']);
    pending.push(`set ${items} ${word(node)}`);
    return items;
  };

  const expression = (node: Expression): Code => {
    switch (node.type) {
      case 'value':
        if (node.constant === 'pi') {
          helpers.use('pi');
          return tcl.call('pi', []);
        }
        if (node.constant === 'e') return tcl.call('exp', [name('1')]);
        if (typeof node.value === 'string') return name(literal(node.value));
        if (typeof node.value === 'boolean') return name(node.value ? '1' : '0');
        return tcl.atom(String(node.value), node.value < 0 ? UNARY : undefined);
      case 'list':
        return node.items.length ? command(`list ${node.items.map(word).join(' ')}`) : name('{}');
      case 'template':
        return name(interpolated(joinedParts(node, types)));
      case 'variable':
        return name(`$${names.of(node.name)}`);
      case 'index': {
        const place = placeOf(node);
        if (place) return command(`lindex $${place.variable} ${place.indexes.join(' ')}`);
        if (isList(typeOf(node.target))) return command(`lindex ${word(node.target)} ${indexWord(node.index)}`);
        return command(`string index ${word(node.target)} ${indexWord(node.index)}`);
      }
      case 'input':
        return command('gets stdin');
      case 'userCall': {
        const definition = definitionOf(definitions, node.name);
        const changed = changedIn(definition.body);
        const args = node.args.map((arg, index) =>
          changed.has(definition.parameters[index]) ? variableOf(arg) : word(arg)
        );
        return command([procs.of(node.name), ...args].join(' '));
      }
      case 'call':
        return builtIn(node);
      case 'unary':
        return tcl.unary(node.operator === COMMAND.NOT ? '!' : node.operator, expression(node.operand));
      case 'binary':
        return binary(node);
    }
  };

  const binary = (node: Expression & {type: 'binary'}): Code => {
    const left = typeOf(node.left);
    const right = typeOf(node.right);

    if (node.operator === '+' && typeOf(node) === 'text') return name(interpolated(joinedParts(node, types)));
    if (node.operator === COMMAND.IN) {
      if (isList(right)) return tcl.binary('in', expression(node.left), expression(node.right));
      return tcl.binary('>=', command(`string first ${word(node.left)} ${word(node.right)}`), name('0'));
    }
    if (node.operator === '/') return tcl.binary('/', real(node.left), expression(node.right));
    //% of whole numbers in Tcl, as of real ones in fmod(), has the sign of the number it divides by
    if (node.operator === '%' && (left === 'real' || right === 'real')) {
      return tcl.call('fmod', [expression(node.left), expression(node.right)]);
    }
    if (node.operator === '==' || node.operator === '!=') {
      //values of different types are never equal in CMIL
      if (neverEqual(left, right)) return name(node.operator === '==' ? '0' : '1');
      //texts are equal as texts, by eq: == compares texts that look like numbers as numbers
      if (left === 'text') {
        return tcl.binary(node.operator === '==' ? 'eq' : 'ne', expression(node.left), expression(node.right));
      }
    }
    //texts are in order by string compare, since < compares texts that look like numbers as numbers
    if (left === 'text' && right === 'text' && PRECEDENCE[node.operator] === PRECEDENCE['<']) {
      const order = command(`string compare ${word(node.left)} ${word(node.right)}`);
      return tcl.binary(node.operator, order, name('0'));
    }
    const operator = OPERATORS[node.operator] ?? node.operator;
    return tcl.binary(operator, expression(node.left), expression(node.right));
  };

  const builtIn = (node: Expression & {type: 'call'}): Code => {
    const [first] = node.args;
    const args = () => node.args.map(expression);
    switch (node.name) {
      case COMMAND.POW:
        return power(real(first), expression(node.args[1]));
      case COMMAND.SQR:
        return first.type === 'variable' || first.type === 'value'
          ? tcl.binary('*', expression(first), expression(first))
          : power(expression(first), name('2'));
      case COMMAND.ROUND:
        if (node.args.length === 2) {
          helpers.use('roundTo');
          return command(`round_to ${node.args.map(word).join(' ')}`);
        }
        if (typeOf(first) === 'whole') return expression(first);
        //round() of Tcl rounds a half away from zero
        return tcl.call('entier', [tcl.call('floor', [tcl.binary('+', expression(first), name('0.5'))])]);
      case COMMAND.FLOOR:
      case COMMAND.CEIL:
        if (typeOf(first) === 'whole') return expression(first);
        return tcl.call('entier', [tcl.call(node.name === COMMAND.FLOOR ? 'floor' : 'ceil', args())]);
      case COMMAND.ABS:
        return tcl.call('abs', args());
      case COMMAND.RANDOM: {
        const [min, max] = node.args.length === 1 ? [null, first] : node.args;
        const count = min
          ? tcl.binary('+', tcl.binary('-', expression(max), expression(min)), name('1'))
          : expression(max);
        const drawn = tcl.call('int', [tcl.binary('*', tcl.call('rand', []), count)]);
        return tcl.binary('+', drawn, min ? expression(min) : name('1'));
      }
      case COMMAND.LENGTH:
        return command(`${isList(typeOf(first)) ? 'llength' : 'string length'} ${word(first)}`);
      case COMMAND.UPPER:
        return command(`string toupper ${word(first)}`);
      case COMMAND.LOWER:
        return command(`string tolower ${word(first)}`);
      case COMMAND.NUMBER:
        //a text of a number is that number in Tcl
        return expression(first);
      case COMMAND.TEXT:
        return name(shown(first));
      case COMMAND.SPLIT: {
        const [text, separator] = node.args;
        if (!separator) return command(`regexp -all -inline {\\S+} ${word(text)}`);
        //split cuts a text at each letter of its separator, so a separator of more letters needs split_at
        if (isText(separator) && Array.from(separator.value).length <= 1) {
          return command(`split ${word(text)} ${literal(separator.value)}`);
        }
        helpers.use('splitAt');
        return command(`split_at ${word(text)} ${word(separator)}`);
      }
      case COMMAND.JOIN: {
        const list = typeOf(first);
        const item = isList(list) ? list.list : 'unknown';
        const separator = node.args[1] ? word(node.args[1]) : '""';
        if (item === 'text' || item === 'whole') return command(`join ${word(first)} ${separator}`);
        //the items as they are printed
        helpers.use('show');
        const each = names.fresh(['item', 'each']);
        names.release(each);
        return command(`join [lmap ${each} ${word(first)} {show $${each} ${typeWord(item)}}] ${separator}`);
      }
    }
    const formula = mathOf(
      tcl,
      node.name,
      args(),
      (method, values) => tcl.call(method === 'pow' ? 'pow' : method, values),
      () => {
        helpers.use('pi');
        return tcl.call('pi', []);
      }
    );
    if (formula) return formula;
    throw new Error(`No Tcl for ${node.name}`);
  };

  //what puts prints
  const printed = (node: Expression): string => {
    if (isText(node) && node.value === '') return 'puts ""';
    return `puts ${isJoined(node, types) ? interpolated(joinedParts(node, types)) : shown(node)}`;
  };

  //the lines a statement needs first, then the statement
  const flushed = (texts: string[]) => {
    const all = [...pending, ...texts];
    pending = [];
    return all;
  };

  const block = statementsOf({
    trivia,
    names,
    braces: SAME_LINE,
    write: (statement, context) => {
      const {comment} = context;
      //writes the lines a statement needs first, then the statement, with the comment after its last line
      const lines = (texts: string[]) => {
        texts[texts.length - 1] += comment;
        flushed(texts).forEach(text => context.line(text));
      };
      //writes the lines the head of a block needs first
      const before = () => flushed([]).forEach(text => context.line(text));
      //a bound of a loop the loop changes, kept in a variable first, since CMIL reads it once
      const once = (bound: Expression, candidates: string[]): string => {
        const kept = context.keep(bound, candidates, variable => `set ${variable} ${word(bound)}`);
        return kept ? `$${kept}` : word(bound);
      };
      switch (statement.type) {
        case 'print':
          lines([printed(statement.expression)]);
          return;
        case 'assign': {
          const variable = names.of(statement.name);
          const value = statement.expression;
          //a whole number one more or less, or more by a whole number, by incr
          if (
            value.type === 'binary' &&
            (value.operator === '+' || value.operator === '-') &&
            value.left.type === 'variable' &&
            value.left.name === statement.name &&
            typeOf(value) === 'whole' &&
            typeOf(value.right) === 'whole'
          ) {
            const by = value.right.type === 'value' && value.right.value === 1 ? '' : ` ${word(value.right)}`;
            if (value.operator === '+') {
              lines([`incr ${variable}${by}`]);
              return;
            }
            if (value.right.type === 'value' && typeof value.right.value === 'number') {
              lines([`incr ${variable} -${value.right.value}`]);
              return;
            }
          }
          lines([`set ${variable} ${word(value)}`]);
          return;
        }
        case 'setItem': {
          const place = placeOf(statement.target);
          const item = indexWord(statement.index);
          if (!place) throw new Error('No Tcl for an item of a list in no variable');
          lines([`lset ${place.variable} ${[...place.indexes, item].join(' ')} ${word(statement.expression)}`]);
          return;
        }
        case 'add': {
          const place = placeOf(statement.target)!;
          const value = word(statement.expression);
          lines([
            place.indexes.length
              ? `lset ${place.variable} ${place.indexes.join(' ')} end+1 ${value}`
              : `lappend ${place.variable} ${value}`
          ]);
          return;
        }
        case 'remove': {
          helpers.use('removeItem');
          const place = placeOf(statement.target)!;
          const value = word(statement.expression);
          const list = place.indexes.length
            ? `[lindex $${place.variable} ${place.indexes.join(' ')}]`
            : `$${place.variable}`;
          const rest = `[remove_item ${list} ${value}]`;
          lines([
            place.indexes.length
              ? `lset ${place.variable} ${place.indexes.join(' ')} ${rest}`
              : `set ${place.variable} ${rest}`
          ]);
          return;
        }
        case 'call':
          lines([code(statement.call).slice(1, -1)]);
          return;
        case 'return':
          lines([statement.expression ? `return ${word(statement.expression)}` : 'return']);
          return;
        case 'if': {
          const heads = branchesOf(statement, (condition, index) => `${index ? 'elseif' : 'if'} {${code(condition)}}`);
          before();
          context.blocks(heads);
          return;
        }
        case 'while': {
          const head = loopOf(statement, `while {${code(statement.condition)}}`);
          before();
          context.blocks([head]);
          return;
        }
        case 'doWhile': {
          const test = `if {${code(negation(statement.condition, types))}}`;
          before();
          context.blocks([doWhileOf(context, statement, 'while 1', test, 'break', {oneLine: true})]);
          return;
        }
        case 'repeat': {
          const count = once(statement.count, ['times', 'count']);
          const counter = context.fresh(['i', 'j', 'k']);
          before();
          context.blocks([loopOf(statement, `for {set ${counter} 0} {$${counter} < ${count}} {incr ${counter}}`)]);
          return;
        }
        case 'for': {
          const counter = names.of(statement.name);
          const {down, size, signed} = stepOf(statement);
          //the first value too, when it asks and a later bound is kept, so the program asks in CMIL's order
          const first = once(statement.from, ['first', 'start']);
          const last = once(statement.to, ['last', 'stop']);
          const whole = typeOf(statement.from) === 'whole' && (!size || typeOf(size) === 'whole');
          const kept = size && context.keep(size, ['step', 'by'], variable => `set ${variable} ${word(size)}`);
          const by = kept ? `$${kept}` : size ? word(size) : '1';
          //the step in expr, as it is in the test of a step whose sign shows only as the program runs
          const step = kept ? by : size ? code(size) : '1';
          //incr counts whole numbers, and set with expr real ones
          const next = whole
            ? `incr ${counter}${down ? ` -${by}` : size ? ` ${by}` : ''}`
            : `set ${counter} [expr {$${counter} ${down ? '-' : '+'} ${step}}]`;
          const test = signed
            ? `${step} > 0 ? $${counter} <= ${last} : $${counter} >= ${last}`
            : `$${counter} ${down ? '>=' : '<='} ${last}`;
          before();
          context.blocks([loopOf(statement, `for {set ${counter} ${first}} {${test}} {${next}}`)]);
          return;
        }
        case 'forEach': {
          const type = typeOf(statement.expression);
          //foreach goes over the items a list has when it starts, as CMIL does; the letters of a text by split
          const items = isList(type) ? word(statement.expression) : `[split ${word(statement.expression)} ""]`;
          before();
          context.blocks([loopOf(statement, `foreach ${names.of(statement.name)} ${items}`)]);
          return;
        }
        case 'break':
          lines(['break']);
          return;
        case 'continue':
          context.next();
          lines(['continue']);
          return;
      }
    }
  });

  //the procs of the program: a list a proc changes is given by its variable's name, which upvar makes its own
  const functions = new Writer('    ');
  for (const definition of definitions) {
    const changed = changedIn(definition.body);
    const links: string[] = [];
    const parameters = definition.parameters.map(parameter => {
      const variable = names.of(parameter);
      if (!changed.has(parameter)) return variable;
      const given = names.fresh([`${variable}Var`, `${variable}Name`]);
      names.release(given);
      links.push(`upvar 1 $${given} ${variable}`);
      return given;
    });
    trivia.before(functions, definition.line);
    functions.line(
      `proc ${procs.of(definition.name)} {${parameters.join(' ')}} {${trivia.after(definition.line)}`,
      definition.line
    );
    functions.block(() => {
      links.forEach(link => functions.line(link));
      block(functions, definition.body, types.variables.get(definition.name)!, new Set(definition.parameters));
    });
    functions.line('}');
    functions.blank();
  }
  const main = new Writer('    ');
  block(main, tree.statements, types.variables.get('')!, new Set());
  trivia.rest(main);

  const out = new Writer('    ');
  helpers.write(out, helper => helper.code({words}));
  out.blank();
  out.append(functions);
  out.blank();
  out.append(main);
  return out.converted();
};

/** The writer of Tcl: its targets, which cmil/convert/tcl gives convert(). */
export const WRITERS: Writers = {tcl: {typed: true, write: toTcl}};
