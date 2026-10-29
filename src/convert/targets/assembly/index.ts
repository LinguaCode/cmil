/**
 * x86-64 assembly: what an assembly course writes, on Linux, linked by gcc with the C library, which prints, reads and
 * keeps texts, as most courses do, in the Intel or AT&T syntax of the GNU assembler or in NASM's. Every variable of a
 * function has 8 bytes of its frame, named at the start of the function, like [rbp + total]; a whole number, a
 * boolean, a text and a list are in rax, a real number in xmm0. A text is the address of its letters, ended by a 0; a
 * list the address of its count and of the address of its items, which grow by realloc and are shared, as CMIL shares
 * a list. A value is kept in a variable of the conversion, like temp, while another one is computed; functions follow
 * the calling convention of Linux, and the helpers a program needs come after it. A syntax writes the instructions,
 * their operands, labels and directives, the same in each.
 */
import {COMMAND} from '../../../constants/index.ts';
import TRANSLATION from '../../../translations/index.ts';
import {
  Helpers,
  Names,
  Trivia,
  Writer,
  assignedIn,
  changesItsList,
  definitionOf,
  isJoined,
  isNumeral,
  isText,
  joinedParts,
  neverEqual,
  readsOnce,
  stepOf,
  variablesIn,
  type Converted
} from '../../emit.ts';
import {isList, isNumber, type Type, type Types} from '../../types.ts';
import type {ProgramTree} from '../../../program.ts';
import type {Writers} from '../../registry.ts';
import type {Expression, Statement} from '../../../core/types.ts';
import {
  AL,
  AT_AND_T,
  EAX,
  INTEL,
  LIBRARY,
  type Operand,
  RAX,
  RCX,
  RDI,
  RDX,
  REAL_REGISTERS,
  RESERVED,
  RSP,
  type Register,
  type Syntax,
  WHOLE_REGISTERS,
  XMM0,
  XMM1,
  at,
  data,
  external,
  item,
  local,
  NASM,
  number,
  register
} from './syntax.ts';
import {type Assembler, HELPERS, type Helper, type Kind, PLURAL, compared, enter, leave} from './helpers.ts';

//the condition codes of a comparison, of whole numbers and of real numbers, and their opposites
const WHOLE_CODES: Record<string, string> = {'<': 'l', '>': 'g', '<=': 'le', '>=': 'ge', '==': 'e', '!=': 'ne'};
const REAL_CODES: Record<string, string> = {'<': 'b', '>': 'a', '<=': 'be', '>=': 'ae', '==': 'e', '!=': 'ne'};
const OPPOSITE: Record<string, string> = {
  l: 'ge',
  ge: 'l',
  g: 'le',
  le: 'g',
  e: 'ne',
  ne: 'e',
  b: 'ae',
  ae: 'b',
  a: 'be',
  be: 'a'
};

//the instructions of the operators of whole and real numbers
const ARITHMETIC: Record<string, {whole: string; real: string}> = {
  '+': {whole: 'add', real: 'addsd'},
  '-': {whole: 'sub', real: 'subsd'},
  '*': {whole: 'imul', real: 'mulsd'},
  '/': {whole: 'idiv', real: 'divsd'}
};

//the functions of the C library for the math of CMIL, of real numbers
const MATH: Record<string, string> = {
  [COMMAND.POW]: 'pow',
  [COMMAND.SIN]: 'sin',
  [COMMAND.COS]: 'cos',
  [COMMAND.TAN]: 'tan',
  [COMMAND.ARCSIN]: 'asin',
  [COMMAND.ARCCOS]: 'acos',
  [COMMAND.ARCTAN]: 'atan',
  [COMMAND.LN]: 'log',
  [COMMAND.LG]: 'log10',
  [COMMAND.FLOOR]: 'floor',
  [COMMAND.CEIL]: 'ceil',
  [COMMAND.ABS]: 'fabs'
};

//where a value of a type is: a real number in xmm0, any other in rax
type Place = 'whole' | 'real';
const placeOf = (type: Type): Place => (type === 'real' ? 'real' : 'whole');
const valueIn = (place: Place) => (place === 'real' ? XMM0 : RAX);
const moveOf = (place: Place) => (place === 'real' ? 'movsd' : 'mov');

/**
 * An argument of a call: where it goes, and its value: an operand, an address, which lea gives, or what computes it
 * into rax or xmm0.
 */
type Argument = {place: Place; operand?: Operand; address?: Operand; compute?: () => void};

//the kind of the items of a list
const kindOf = (list: Type): Kind => {
  const item = isList(list) ? list.list : 'unknown';
  return item === 'real' ? 'real' : item === 'text' ? 'text' : item === 'boolean' ? 'boolean' : 'whole';
};

/**
 * An assembler in a syntax, which writes lines, and labels in a helper, whose name they have, and notes the functions
 * and the symbols of the C library it uses.
 */
const assemblerOf = (
  syntax: Syntax,
  write: {line: (text: string) => void; label: (text: string) => void},
  library: Set<string>,
  helper?: string
): Assembler => ({
  ins: (mnemonic, ...parts) => {
    const note = typeof parts[parts.length - 1] === 'string' ? ` ${syntax.comment} ${parts.pop()}` : '';
    write.line(`${syntax.instruction(mnemonic, parts as Operand[])}${note}`);
  },
  entry: name => write.label(`${name}:`),
  label: name => write.label(`${syntax.local(name, helper)}:`),
  to: name => ({label: syntax.local(name, helper)}),
  fn: name => ({label: name}),
  lib: name => {
    library.add(name);
    return {label: syntax.library(name)};
  },
  data,
  external: name => {
    library.add(name);
    return external(name);
  },
  note: text => write.label(`${syntax.comment} ${text}`)
});

//the lines of a helper: its instructions indented, its labels and comments not
const helperLines = (syntax: Syntax, name: string, helper: Helper, library: Set<string>): string[] => {
  const lines: string[] = [];
  helper.code(
    assemblerOf(syntax, {line: text => lines.push(`    ${text}`), label: text => lines.push(text)}, library, name)
  );
  return lines;
};

/**
 * Writes a program in x86-64 assembly, in a syntax.
 */
export const toAssembly = (tree: ProgramTree, types: Types, sourceCode: string, syntax: Syntax = INTEL): Converted => {
  const names = new Names(tree.names, RESERVED, {caseless: true});
  const trivia = new Trivia(tree.comments, sourceCode, syntax.comment);
  const helpers = new Helpers(HELPERS);
  const {words: commands} = TRANSLATION[tree.language];
  const words: [string, string] = [commands.true[0], commands.false[0]];
  const definitions = tree.statements.filter(
    (statement): statement is Statement & {type: 'function'} => statement.type === 'function'
  );
  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';

  //the data of the program, by its labels: its texts, the formats of printf and asprintf, and its real numbers
  const texts = new Map<string, string>();
  const formats = new Map<string, string>();
  const reals = new Map<number, string>();
  const labelOf = <Value>(values: Map<Value, string>, value: Value, prefix: string) => {
    if (!values.has(value)) values.set(value, `${prefix}${values.size + 1}`);
    return values.get(value)!;
  };
  const textOfData = (value: string) => data(labelOf(texts, value, 'text'), null);
  const formatOfData = (value: string) => data(labelOf(formats, value, 'format'), null);
  const realOfData = (value: number) => data(labelOf(reals, value, 'number'));
  //pi and e, by their names
  const constants = new Map<string, number>();
  const constantOfData = (constant: string) => {
    constants.set(constant, constant === 'pi' ? Math.PI : Math.E);
    return data(constant);
  };

  //the labels of the statements, numbered by their kind, like .Lwhile1
  const counts = new Map<string, number>();
  const numbered = (kind: string) => {
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
    return `${kind}${counts.get(kind)}`;
  };
  let random = false;

  //the function being written: its lines, its scope, its variables by their offsets in its frame, and the variables
  //of the conversion it has; line is the line of the program the instructions come from, and comment the comment
  //after its code, which the first of them gets
  let out = new Writer('    ');
  let scope = new Map<string, Type>();
  let result: Type = 'unknown';
  let frame = new Map<string, number>();
  let temps: string[] = [];
  let depth = 0;
  let line = 0;
  let comment = '';
  //the loops around the statement being written: where a continue and a break of each go
  let loops: {next: string; end: string}[] = [];

  //the functions and the symbols of the C library the program uses, which NASM declares
  const linked = new Set<string>();
  //the comment after the code of a line goes after its first instruction or label
  const a = assemblerOf(
    syntax,
    {
      line: text => {
        out.line(text + comment, line);
        comment = '';
      },
      label: text => {
        out.label(text + comment, line);
        comment = '';
      }
    },
    linked
  );
  const {ins} = a;
  const store = (place: Place, target: Operand) => ins(moveOf(place), target, valueIn(place));

  //a variable of the frame, 8 bytes below the one before
  const slot = (name: string) => {
    if (!frame.has(name)) frame.set(name, -8 * ([...frame.values()].filter(offset => offset < 0).length + 1));
    return local(name);
  };
  //a variable of the conversion that a statement or a value takes while it computes another one, and gives back
  const take = (): Operand => {
    temps[depth] ??= names.fresh(['temp']);
    return slot(temps[depth++]);
  };
  const give = (count = 1) => {
    depth -= count;
  };
  //keeps the value in rax or xmm0 in a variable of the conversion
  const keep = (place: Place): Operand => {
    const temp = take();
    store(place, temp);
    return temp;
  };

  //a number written in the program, like 2 or -2.5, but not a constant like pi
  const numberOf = (node: Expression): number | null => {
    if (isNumeral(node) && !node.constant) return node.value;
    if (node.type === 'unary' && node.operator === '-') {
      const value = numberOf(node.operand);
      return value === null ? null : -value;
    }
    return null;
  };

  //a value an instruction reads as it is: a variable, a whole number of 32 bits, or a real number of the data
  const operandOf = (node: Expression, place: Place): Operand | null => {
    const value = numberOf(node);
    if (value !== null) {
      if (place === 'real') return realOfData(value);
      return Number.isInteger(value) && Math.abs(value) < 2 ** 31 ? number(value) : null;
    }
    if (node.type === 'value' && typeof node.value === 'boolean') return place === 'whole' ? number(+node.value) : null;
    if (node.type === 'variable' && placeOf(typeOf(node)) === place) return local(names.of(node.name));
    return null;
  };

  //puts the value of an expression into rax, or into xmm0 as a real number
  const load = (node: Expression, place: Place = placeOf(typeOf(node))): void => {
    const value = numberOf(node);
    if (value !== null) {
      if (place === 'real') ins('movsd', XMM0, realOfData(value));
      else ins('mov', RAX, number(Math.trunc(value)));
      return;
    }
    const own = placeOf(typeOf(node));
    compute(node);
    if (place === 'real' && own === 'whole') ins('cvtsi2sd', XMM0, RAX);
    if (place === 'whole' && own === 'real') ins('cvttsd2si', RAX, XMM0);
  };

  //an argument of a call, of an expression
  const argumentOf = (node: Expression, place: Place = placeOf(typeOf(node))): Argument => {
    if (isText(node)) return {place: 'whole', address: textOfData(node.value)};
    const operand = operandOf(node, place);
    return operand ? {place, operand} : {place, compute: () => load(node, place)};
  };
  //an item of a list as an argument: its 8 bytes in a register of whole numbers, also those of a real number
  const itemArgument = (node: Expression, list: Type): Argument => {
    if (kindOf(list) !== 'real') return argumentOf(node, 'whole');
    const operand = operandOf(node, 'real');
    if (operand) return {place: 'whole', operand};
    return {
      place: 'whole',
      compute: () => {
        load(node, 'real');
        ins('movq', RAX, XMM0);
      }
    };
  };

  /**
   * Calls a function with arguments, in registers and on the stack, as the calling convention of Linux has them:
   * computed in their order, or in another, like the item of add before its list, as CMIL computes them; a variadic
   * function, like printf, gets the count of its real numbers in al.
   */
  const call = (
    target: string,
    args: Argument[],
    {variadic = false, order}: {variadic?: boolean; order?: number[]} = {}
  ) => {
    let wholes = 0;
    let realCount = 0;
    const registers = args.map(arg => {
      if (arg.place === 'real') return realCount < REAL_REGISTERS.length ? REAL_REGISTERS[realCount++] : null;
      return wholes < WHOLE_REGISTERS.length ? WHOLE_REGISTERS[wholes++] : null;
    });
    const computed = (order ?? args.map((_, index) => index)).filter(index => args[index].compute);
    const held = new Map<number, Operand>();
    const given = depth;
    const stacked = args.map((_, index) => index).filter(index => !registers[index]);
    //an address put on the stack goes through rax, which a value computed at once would be in
    if (computed.length === 1 && registers[computed[0]] && !stacked.some(index => args[index].address)) {
      //one value to compute goes to its register at once, before the others, which are only read
      const index = computed[0];
      const {place} = args[index];
      args[index].compute!();
      held.set(index, valueIn(place));
    } else {
      for (const index of computed) {
        args[index].compute!();
        held.set(index, keep(args[index].place));
      }
    }
    //the stack is a multiple of 16 bytes at the call
    if (stacked.length % 2) ins('sub', RSP, number(8));
    for (const index of [...stacked].reverse()) {
      const {address, operand} = args[index];
      if (address) {
        ins('lea', RAX, address);
        ins('push', RAX);
      } else {
        ins('push', held.get(index) ?? operand!);
      }
    }
    //the value computed in rax or xmm0 goes to its register first, before another one replaces it
    const sequence = args
      .map((_, index) => index)
      .sort((x, y) => +(held.get(y) === valueIn(args[y].place)) - +(held.get(x) === valueIn(args[x].place)));
    for (const index of sequence) {
      const destination = registers[index];
      if (!destination) continue;
      const {place, address, operand} = args[index];
      const source = held.get(index) ?? address ?? operand!;
      if (source === valueIn(place) && destination === (place === 'real' ? 'xmm0' : 'rax')) continue;
      if (source === valueIn(place)) ins(place === 'real' ? 'movapd' : 'mov', register(destination), source);
      else ins(address ? 'lea' : moveOf(place), register(destination), source);
    }
    if (variadic) ins('mov', EAX, number(realCount));
    ins('call', LIBRARY.includes(target) ? a.lib(target) : a.fn(target));
    if (stacked.length) ins('add', RSP, number(8 * (stacked.length + (stacked.length % 2))));
    give(depth - given);
  };

  //the format of printf and its values, for values joined into a text; a boolean is in the words of the program
  const formatOf = (parts: Expression[]): {format: string; args: Argument[]} => {
    let format = '';
    const args: Argument[] = [];
    for (const part of parts) {
      const type = typeOf(part);
      if (isText(part)) {
        format += part.value.replaceAll('%', '%%');
      } else if (part.type === 'call' && part.name === COMMAND.TEXT) {
        const inner = formatOf(isJoined(part.args[0], types) ? joinedParts(part.args[0], types) : [part.args[0]]);
        format += inner.format;
        args.push(...inner.args);
      } else if (type === 'boolean') {
        helpers.use('in_words');
        format += '%s';
        args.push({
          place: 'whole',
          compute: () => call('in_words', [argumentOf(part, 'whole')])
        });
      } else {
        format += type === 'text' ? '%s' : type === 'real' ? '%.12g' : '%lld';
        args.push(argumentOf(part));
      }
    }
    return {format, args};
  };

  //values joined into a text, which asprintf makes
  const textOf = (parts: Expression[]) => {
    const {format, args} = formatOf(parts);
    if (!args.length) {
      ins('lea', RAX, textOfData(format.replaceAll('%%', '%')));
      return;
    }
    const text = take();
    call(
      'asprintf',
      [{place: 'whole', address: {...text, size: null}}, {place: 'whole', address: formatOfData(format)}, ...args],
      {variadic: true}
    );
    ins('mov', RAX, text);
    give();
  };

  //a new list with items, at an address in a variable, which gets each item
  const listInto = (target: Operand, node: Expression & {type: 'list'}) => {
    helpers.use('list_new');
    call('list_new', []);
    ins('mov', target, RAX);
    for (const each of node.items) {
      helpers.use('list_add');
      call('list_add', [{place: 'whole', operand: target}, itemArgument(each, typeOf(node))]);
    }
  };

  //the address of the items of a list, in a variable or in rax, into a register
  const itemsOf = (list: Operand | null, into: Register) => {
    if (list && list !== into) ins('mov', into, list);
    else if (!list && into !== RAX) ins('mov', into, RAX);
    ins('mov', into, at(into.register, 8));
  };

  const compute = (node: Expression): void => {
    switch (node.type) {
      case 'value':
        if (typeof node.value === 'string') ins('lea', RAX, textOfData(node.value));
        else if (typeof node.value === 'boolean') ins('mov', RAX, number(+node.value));
        else if (node.constant) ins('movsd', XMM0, constantOfData(node.constant));
        else load(node);
        return;
      case 'variable':
        ins(moveOf(placeOf(typeOf(node))), valueIn(placeOf(typeOf(node))), local(names.of(node.name)));
        return;
      case 'index':
        index(node);
        return;
      case 'input': {
        const helper = typeOf(node) === 'real' ? 'read_number' : 'read_text';
        helpers.use(helper);
        call(helper, []);
        return;
      }
      case 'userCall':
        userCall(node);
        return;
      case 'call':
        builtIn(node);
        return;
      case 'unary':
        if (node.operator === COMMAND.NOT) {
          load(node.operand, 'whole');
          ins('xor', RAX, number(1));
        } else if (typeOf(node) === 'real') {
          load(node.operand, 'real');
          if (node.operator === '-') {
            //0 - x, which is 0 for 0, as CMIL prints it
            ins('pxor', XMM1, XMM1);
            ins('subsd', XMM1, XMM0);
            ins('movapd', XMM0, XMM1);
          }
        } else {
          load(node.operand, 'whole');
          if (node.operator === '-') ins('neg', RAX);
        }
        return;
      case 'template':
        textOf(joinedParts(node, types));
        return;
      case 'list': {
        const list = take();
        listInto(list, node);
        ins('mov', RAX, list);
        give();
        return;
      }
      case 'binary':
        binary(node);
        return;
    }
  };

  //an item of a list, counted from 1, or a letter of a text
  const index = (node: Expression & {type: 'index'}) => {
    const target = typeOf(node.target);
    if (!isList(target)) {
      helpers.use('letter_of');
      call('letter_of', [argumentOf(node.target, 'whole'), argumentOf(node.index, 'whole')]);
      return;
    }
    const place = placeOf(target.list);
    const list = operandOf(node.target, 'whole');
    const position = numberOf(node.index);
    if (position !== null) {
      if (!list) load(node.target, 'whole');
      itemsOf(list, RAX);
      ins(moveOf(place), valueIn(place), at('rax', 8 * (position - 1)));
      return;
    }
    if (list) {
      load(node.index, 'whole');
      itemsOf(list, RCX);
    } else {
      load(node.target, 'whole');
      const kept = keep('whole');
      load(node.index, 'whole');
      itemsOf(kept, RCX);
      give();
    }
    ins(moveOf(place), valueIn(place), item('rcx', 'rax', -8));
  };

  const userCall = (node: Expression & {type: 'userCall'}) => {
    const definition = definitionOf(definitions, node.name);
    const parameters = types.variables.get(node.name)!;
    call(
      names.of(node.name),
      node.args.map((arg, position) => argumentOf(arg, placeOf(parameters.get(definition.parameters[position])!)))
    );
  };

  /**
   * The two values of an operator, computed in their order: the left one in rax or xmm0, and the right one an operand,
   * in rcx or xmm1 when it isn't one itself.
   */
  const sides = (node: Expression & {type: 'binary'}, place: Place): Operand => {
    const right = operandOf(node.right, place);
    if (right) {
      load(node.left, place);
      return right;
    }
    //a whole number of a variable is made real as it is read
    const whole = operandOf(node.right, 'whole');
    if (place === 'real' && whole && 'base' in whole) {
      load(node.left, place);
      ins('cvtsi2sd', XMM1, whole);
      return XMM1;
    }
    const other = place === 'real' ? XMM1 : RCX;
    const copy = place === 'real' ? 'movapd' : 'mov';
    const left = operandOf(node.left, place);
    if (left) {
      load(node.right, place);
      ins(copy, other, valueIn(place));
      ins(moveOf(place), valueIn(place), left);
      return other;
    }
    load(node.left, place);
    const kept = keep(place);
    load(node.right, place);
    ins(copy, other, valueIn(place));
    ins(moveOf(place), valueIn(place), kept);
    give();
    return other;
  };

  const binary = (node: Expression & {type: 'binary'}) => {
    const type = typeOf(node);
    if (node.operator === '+' && type === 'text') {
      textOf(joinedParts(node, types));
      return;
    }
    if (type === 'boolean') {
      truth(node);
      return;
    }
    if (node.operator === '%' && type === 'real') {
      call('fmod', [argumentOf(node.left, 'real'), argumentOf(node.right, 'real')]);
      return;
    }
    if (node.operator === '%') {
      //idiv divides rdx:rax, and its remainder, in rdx, has the sign of the number divided, as in CMIL
      const right = sides(node, 'whole');
      if (right !== RCX) ins('mov', RCX, right);
      ins('cqo');
      ins('idiv', RCX);
      ins('mov', RAX, RDX);
      return;
    }
    const place = placeOf(type);
    const right = sides(node, place);
    ins(ARITHMETIC[node.operator][place], valueIn(place), right);
  };

  //compares the sides of a comparison, and gives the condition code that holds when it is true, like l for <
  const compare = (node: Expression & {type: 'binary'}): string => {
    const [left, right] = [typeOf(node.left), typeOf(node.right)];
    if (left === 'text' && right === 'text') {
      call('strcmp', [argumentOf(node.left), argumentOf(node.right)]);
      ins('cmp', EAX, number(0));
      return WHOLE_CODES[node.operator];
    }
    if (left === 'real' || right === 'real') {
      ins('ucomisd', XMM0, sides(node, 'real'));
      return REAL_CODES[node.operator];
    }
    //a variable and a number are compared as they are
    const [variable, value] = [operandOf(node.left, 'whole'), operandOf(node.right, 'whole')];
    if (variable && 'base' in variable && value && 'number' in value) {
      ins('cmp', variable, value);
      return WHOLE_CODES[node.operator];
    }
    ins('cmp', RAX, sides(node, 'whole'));
    return WHOLE_CODES[node.operator];
  };
  const isComparison = (node: Expression): boolean =>
    node.type === 'binary' && Object.hasOwn(WHOLE_CODES, node.operator);

  //whether a value is in a list, by a helper, or a text in a text, by strstr, in rax
  const contains = (node: Expression & {type: 'binary'}) => {
    const list = typeOf(node.right);
    if (isList(list)) {
      const helper = `contains_${compared(kindOf(list))}`;
      helpers.use(helper);
      call(helper, [argumentOf(node.right, 'whole'), itemArgument(node.left, list)], {order: [1, 0]});
      return;
    }
    call('strstr', [argumentOf(node.right, 'whole'), argumentOf(node.left, 'whole')], {order: [1, 0]});
  };

  /** Goes to a label when a condition is true, or when it is false. */
  const jumpIf = (node: Expression, target: string, when: boolean): void => {
    if (node.type === 'value' && typeof node.value === 'boolean') {
      if (node.value === when) ins('jmp', a.to(target));
      return;
    }
    if (isComparison(node)) {
      const comparison = node as Expression & {type: 'binary'};
      if (neverEqual(typeOf(comparison.left), typeOf(comparison.right))) {
        if ((comparison.operator === '!=') === when) ins('jmp', a.to(target));
        return;
      }
      const code = compare(comparison);
      ins(`j${when ? code : OPPOSITE[code]}`, a.to(target));
      return;
    }
    if (node.type === 'binary' && (node.operator === COMMAND.AND || node.operator === COMMAND.OR)) {
      //and is false when its left side is, or is what its right side is; or is true when its left side is
      if ((node.operator === COMMAND.AND) !== when) {
        jumpIf(node.left, target, when);
        jumpIf(node.right, target, when);
        return;
      }
      const skip = numbered('skip');
      jumpIf(node.left, skip, !when);
      jumpIf(node.right, target, when);
      a.label(skip);
      return;
    }
    if (node.type === 'unary' && node.operator === COMMAND.NOT) {
      jumpIf(node.operand, target, !when);
      return;
    }
    if (node.type === 'binary' && node.operator === COMMAND.IN) contains(node);
    else load(node, 'whole');
    ins('test', RAX, RAX);
    ins(when ? 'jnz' : 'jz', a.to(target));
  };

  //a boolean of a comparison, of in, and of and and or, as 1 or 0 in rax
  const truth = (node: Expression & {type: 'binary'}) => {
    if (isComparison(node)) {
      if (neverEqual(typeOf(node.left), typeOf(node.right))) {
        ins('mov', RAX, number(node.operator === '!=' ? 1 : 0));
        return;
      }
      ins(`set${compare(node)}`, AL);
      ins('movzx', EAX, AL);
      return;
    }
    if (node.operator === COMMAND.IN) {
      contains(node);
      ins('test', RAX, RAX);
      ins('setnz', AL);
      ins('movzx', EAX, AL);
      return;
    }
    const no = numbered('false');
    jumpIf(node, no, false);
    ins('mov', RAX, number(1));
    ins('jmp', a.to(`${no}_end`));
    a.label(no);
    ins('mov', RAX, number(0));
    a.label(`${no}_end`);
  };

  //a function of the C library of real numbers, with its result in xmm0, or in rax as a whole number
  const library = (name: string, node: Expression & {type: 'call'}) => {
    call(
      name,
      node.args.map(arg => argumentOf(arg, 'real'))
    );
    if (typeOf(node) === 'whole') ins('cvttsd2si', RAX, XMM0);
  };

  const builtIn = (node: Expression & {type: 'call'}) => {
    const [first, second] = node.args;
    const whole = typeOf(first) === 'whole';
    switch (node.name) {
      case COMMAND.SQR:
        load(first);
        ins(whole ? 'imul' : 'mulsd', valueIn(placeOf(typeOf(first))), valueIn(placeOf(typeOf(first))));
        return;
      case COMMAND.SQRT:
        load(first, 'real');
        ins('sqrtsd', XMM0, XMM0);
        return;
      case COMMAND.ROUND:
        if (second) {
          helpers.use('round_to');
          call('round_to', [argumentOf(first, 'real'), argumentOf(second, 'whole')]);
        } else if (whole) {
          load(first);
        } else {
          //a half up: the floor of the number and a half
          load(first, 'real');
          ins('addsd', XMM0, realOfData(0.5));
          ins('call', a.lib('floor'));
          ins('cvttsd2si', RAX, XMM0);
        }
        return;
      case COMMAND.FLOOR:
      case COMMAND.CEIL:
        if (whole) load(first);
        else library(MATH[node.name], node);
        return;
      case COMMAND.ABS:
        if (!whole) {
          library('fabs', node);
          return;
        }
        load(first);
        ins('mov', RCX, RAX);
        ins('neg', RAX);
        ins('cmovl', RAX, RCX);
        return;
      case COMMAND.COT:
      case COMMAND.ARCCOT: {
        //1 / tan x, and pi / 2 - atan x
        const cot = node.name === COMMAND.COT;
        call(cot ? 'tan' : 'atan', [argumentOf(first, 'real')]);
        ins('movapd', XMM1, XMM0);
        ins('movsd', XMM0, realOfData(cot ? 1 : Math.PI / 2));
        ins(cot ? 'divsd' : 'subsd', XMM0, XMM1);
        return;
      }
      case COMMAND.LOG: {
        //the log of a base is ln x / ln base
        call('log', [argumentOf(first, 'real')]);
        const base = keep('real');
        call('log', [argumentOf(second, 'real')]);
        ins('divsd', XMM0, base);
        give();
        return;
      }
      case COMMAND.RANDOM: {
        //the remainder of rand() by the count of the numbers, after the least
        random = true;
        const given = depth;
        const [least, most] = second ? [first, second] : [null, first];
        const below = least ? (operandOf(least, 'whole') ?? (load(least, 'whole'), keep('whole'))) : null;
        load(most, 'whole');
        if (below) ins('sub', RAX, below);
        ins('inc', RAX);
        const count = keep('whole');
        ins('call', a.lib('rand'));
        ins('cdqe');
        ins('cqo');
        ins('idiv', count);
        ins('mov', RAX, RDX);
        if (below) ins('add', RAX, below);
        else ins('inc', RAX);
        give(depth - given);
        return;
      }
      case COMMAND.LENGTH:
        if (isList(typeOf(first))) {
          load(first, 'whole');
          ins('mov', RAX, at('rax', 0));
          return;
        }
        helpers.use('letter_count');
        call('letter_count', [argumentOf(first, 'whole')]);
        return;
      case COMMAND.UPPER:
      case COMMAND.LOWER: {
        const helper = node.name === COMMAND.UPPER ? 'uppercase' : 'lowercase';
        helpers.use(helper);
        call(helper, [argumentOf(first, 'whole')]);
        return;
      }
      case COMMAND.NUMBER:
        if (isNumber(typeOf(first))) load(first, 'real');
        else call('atof', [argumentOf(first, 'whole')]);
        return;
      case COMMAND.TEXT:
        if (typeOf(first) === 'text') load(first);
        else textOf([first]);
        return;
      case COMMAND.SPLIT: {
        const helper = !second ? 'split_words' : isText(second) && second.value === '' ? 'split_letters' : 'split_at';
        helpers.use(helper);
        call(helper, helper === 'split_at' ? [argumentOf(first), argumentOf(second)] : [argumentOf(first)]);
        return;
      }
      case COMMAND.JOIN: {
        const helper = `join_${PLURAL[kindOf(typeOf(first))]}`;
        helpers.use(helper);
        const separator: Expression = second ?? {type: 'value', value: ''};
        call(helper, [argumentOf(first, 'whole'), argumentOf(separator, 'whole')]);
        return;
      }
    }
    if (Object.hasOwn(MATH, node.name)) {
      library(MATH[node.name], node);
      return;
    }
    throw new Error(`No assembly for ${node.name}`);
  };

  //the statements of a block, each giving back the variables of the conversion it took
  const block = (statements: Statement[]) => {
    for (const statement of statements) {
      if (statement.type === 'function') continue;
      const first = statement.type === 'doWhile' ? statement.doLine : statement.line;
      trivia.before(out, first);
      line = first;
      comment = trivia.after(first);
      const given = depth;
      write(statement);
      depth = given;
      comment = '';
    }
  };

  //the body of a loop, with where a continue and a break of it go
  const loop = (body: Statement[], next: string, end: string) => {
    loops.push({next, end});
    block(body);
    loops.pop();
  };

  //the variables of the conversion a loop takes with a name, like the counter of repeat, free again after it
  const named = (taken: string[]) => (candidates: string[]) => {
    const name = names.fresh(candidates);
    taken.push(name);
    return slot(name);
  };
  const scoped = (write: (name: (candidates: string[]) => Operand) => void) => {
    const taken: string[] = [];
    write(named(taken));
    taken.forEach(name => names.release(name));
  };

  //a value CMIL reads once, before a loop: a number, a variable the loop doesn't change, or a variable that keeps it
  const once = (
    node: Expression,
    place: Place,
    loop: Statement & {body: Statement[]},
    name: (candidates: string[]) => Operand,
    candidates: string[]
  ): Operand => {
    const operand = operandOf(node, place);
    if (operand && !readsOnce(node, loop)) return operand;
    load(node, place);
    const kept = name(candidates);
    store(place, kept);
    return kept;
  };

  //the end of a loop: the label continue goes to, what it does there, and the label after the loop
  const ending = (statement: Statement, name: string, next: () => void) => {
    line = statement.line;
    a.label(`${name}_next`);
    next();
    ins('jmp', a.to(name));
    a.label(`${name}_end`);
  };

  const write = (statement: Statement): void => {
    switch (statement.type) {
      case 'print': {
        const {expression} = statement;
        const parts = isJoined(expression, types) ? joinedParts(expression, types) : [expression];
        const [only] = parts;
        if (parts.length === 1 && typeOf(only) === 'text' && !(only.type === 'call' && only.name === COMMAND.TEXT)) {
          call('puts', [argumentOf(only)]);
          return;
        }
        const {format, args} = formatOf(parts);
        call('printf', [{place: 'whole', address: formatOfData(`${format}\n`)}, ...args], {variadic: true});
        return;
      }
      case 'assign': {
        const type = scope.get(statement.name)!;
        const place = placeOf(type);
        const target = local(names.of(statement.name));
        const value = statement.expression;
        const operand = operandOf(value, place);
        if (operand && 'number' in operand) {
          ins('mov', target, operand);
          return;
        }
        //a list of items goes into its variable at once, unless they read the variable
        if (value.type === 'list' && !variablesIn(value).has(statement.name)) {
          types.expressions.set(value, type);
          listInto(target, value);
          return;
        }
        load(value, place);
        store(place, target);
        return;
      }
      case 'setItem': {
        //the list, the place of its item and the value, in this order
        const list = typeOf(statement.target);
        const place = isList(list) ? placeOf(list.list) : 'whole';
        const target = operandOf(statement.target, 'whole') ?? (load(statement.target, 'whole'), keep('whole'));
        const position = numberOf(statement.index);
        const counted =
          position === null
            ? (operandOf(statement.index, 'whole') ?? (load(statement.index, 'whole'), keep('whole')))
            : null;
        load(statement.expression, place);
        itemsOf(target, RCX);
        if (counted) ins('mov', RDX, counted);
        store(place, counted ? item('rcx', 'rdx', -8) : at('rcx', 8 * (position! - 1)));
        return;
      }
      case 'add':
      case 'remove': {
        const list = typeOf(statement.target);
        const helper = statement.type === 'add' ? 'list_add' : `remove_${compared(kindOf(list))}`;
        helpers.use(helper);
        call(helper, [argumentOf(statement.target, 'whole'), itemArgument(statement.expression, list)], {
          order: [1, 0]
        });
        return;
      }
      case 'call':
        userCall(statement.call);
        return;
      case 'return':
        if (statement.expression) load(statement.expression, placeOf(result));
        leave(a);
        return;
      case 'if': {
        const name = numbered('if');
        const heads = statement.branches.map(({condition, line: at, body}, index) => ({
          condition: condition as Expression | null,
          at,
          body,
          label: `${name}_elif${index + 1}`
        }));
        if (statement.elseLine) {
          heads.push({condition: null, at: statement.elseLine, body: statement.elseBody, label: `${name}_else`});
        }
        heads.forEach((head, position) => {
          if (position) {
            trivia.before(out, head.at);
            line = head.at;
            comment = trivia.after(head.at);
            a.label(head.label);
          }
          const last = position === heads.length - 1;
          if (head.condition) jumpIf(head.condition, last ? `${name}_end` : heads[position + 1].label, false);
          block(head.body);
          line = head.at;
          if (!last) ins('jmp', a.to(`${name}_end`));
        });
        line = statement.line;
        a.label(`${name}_end`);
        return;
      }
      case 'while': {
        const name = numbered('while');
        a.label(name);
        jumpIf(statement.condition, `${name}_end`, false);
        loop(statement.body, name, `${name}_end`);
        line = statement.line;
        ins('jmp', a.to(name));
        a.label(`${name}_end`);
        return;
      }
      case 'doWhile': {
        const name = numbered('do');
        a.label(name);
        loop(statement.body, `${name}_test`, `${name}_end`);
        trivia.before(out, statement.line);
        line = statement.line;
        comment = trivia.after(statement.line);
        a.label(`${name}_test`);
        jumpIf(statement.condition, name, true);
        a.label(`${name}_end`);
        return;
      }
      case 'repeat':
        scoped(name => {
          const repeatName = numbered('repeat');
          const count = once(statement.count, 'whole', statement, name, ['times', 'count']);
          const counter = name(['i', 'j', 'k']);
          ins('mov', counter, number(0));
          a.label(repeatName);
          if ('number' in count) {
            ins('cmp', counter, count);
          } else {
            ins('mov', RAX, counter);
            ins('cmp', RAX, count);
          }
          ins('jge', a.to(`${repeatName}_end`));
          loop(statement.body, `${repeatName}_next`, `${repeatName}_end`);
          ending(statement, repeatName, () => ins('inc', counter));
        });
        return;
      case 'for':
        scoped(name => forLoop(statement, name));
        return;
      case 'forEach':
        scoped(name => forEach(statement, name));
        return;
      case 'break':
        ins('jmp', a.to(loops[loops.length - 1].end));
        return;
      case 'continue':
        ins('jmp', a.to(loops[loops.length - 1].next));
        return;
    }
  };

  /**
   * A for: each value is counted from the start, a whole one by its step and a real one as start + passes * step,
   * so a step like 0.1 doesn't add up errors; the variable gets a value only when the loop has a pass with it, so it
   * keeps the last one, as in CMIL; a whole counter ends at the last whole number before a real end.
   */
  const forLoop = (statement: Statement & {type: 'for'}, name: (candidates: string[]) => Operand) => {
    const loopName = numbered('for');
    const variable = local(names.of(statement.name));
    const {body} = statement;
    const {down, size, signed} = stepOf(statement);
    //past the last value: by the jumps of counting up and down, after compare tests the counter as counting down or
    //up, or, for a step whose sign shows only as the program runs, by the one of its sign, after a jump to counting up
    //when the step isn't below 0
    const past = (up: string, under: string, compare: (down: boolean) => void, upward: () => void) => {
      if (!signed) {
        compare(down);
        ins(down ? under : up, a.to(`${loopName}_end`));
        return;
      }
      upward();
      compare(true);
      ins(under, a.to(`${loopName}_end`));
      ins('jmp', a.to(`${loopName}_pass`));
      a.label(`${loopName}_up`);
      compare(false);
      ins(up, a.to(`${loopName}_end`));
      a.label(`${loopName}_pass`);
    };
    if (scope.get(statement.name) === 'real') {
      const start = once(statement.from, 'real', statement, name, ['start', 'first']);
      const last = once(statement.to, 'real', statement, name, ['last', 'end']);
      const step = statement.step ? once(statement.step, 'real', statement, name, ['step']) : realOfData(1);
      const passes = name(['passes', 'count']);
      ins('mov', passes, number(0));
      a.label(loopName);
      ins('cvtsi2sd', XMM0, passes);
      ins('mulsd', XMM0, step);
      ins('addsd', XMM0, start);
      past(
        'ja',
        'jb',
        () => ins('ucomisd', XMM0, last),
        () => {
          ins('pxor', XMM1, XMM1);
          ins('ucomisd', XMM1, step);
          ins('jbe', a.to(`${loopName}_up`));
        }
      );
      ins('movsd', variable, XMM0);
      loop(body, `${loopName}_next`, `${loopName}_end`);
      ending(statement, loopName, () => ins('inc', passes));
      return;
    }
    //the first value first, when it asks and a later bound is kept, so the program asks in CMIL's order
    let first: Operand | null = null;
    if (readsOnce(statement.from, statement)) {
      load(statement.from, 'whole');
      first = name(['first', 'start']);
      ins('mov', first, RAX);
    }
    //a real end is the last whole number the counter reaches: its floor counting up, its ceiling counting down
    const bound = numberOf(statement.to);
    //the last value, counting down or up: of a real one, its ceiling or its floor, both of them for a step whose sign
    //shows only as the program runs, of the value kept once
    let lastOf: (down: boolean) => Operand;
    if (bound !== null) {
      lastOf = down => number(down ? Math.ceil(bound) : Math.floor(bound));
    } else if (typeOf(statement.to) === 'real') {
      const real = signed ? once(statement.to, 'real', statement, name, ['limit']) : null;
      const reached = (down: boolean) => {
        call(down ? 'ceil' : 'floor', [real ? {place: 'real', operand: real} : argumentOf(statement.to, 'real')]);
        ins('cvttsd2si', RAX, XMM0);
        const last = name(['last', 'end']);
        ins('mov', last, RAX);
        return last;
      };
      if (signed) {
        const [below, above] = [reached(true), reached(false)];
        lastOf = down => (down ? below : above);
      } else {
        const last = reached(down);
        lastOf = () => last;
      }
    } else {
      const last = once(statement.to, 'whole', statement, name, ['last', 'end']);
      lastOf = () => last;
    }
    const step = size ? once(size, 'whole', statement, name, ['step']) : null;
    //the value of a counter the loop changes is kept apart
    const value = assignedIn(body).has(statement.name) ? name(['value']) : variable;
    if (first) ins('mov', RAX, first);
    else load(statement.from, 'whole');
    a.label(loopName);
    past(
      'jg',
      'jl',
      down => ins('cmp', RAX, lastOf(down)),
      () => {
        ins('cmp', step!, number(0));
        ins('jge', a.to(`${loopName}_up`));
      }
    );
    if (value !== variable) ins('mov', value, RAX);
    ins('mov', variable, RAX);
    loop(body, `${loopName}_next`, `${loopName}_end`);
    ending(statement, loopName, () => {
      ins('mov', RAX, value);
      if (step) ins(down ? 'sub' : 'add', RAX, step);
      else ins(down ? 'dec' : 'inc', RAX);
    });
  };

  /**
   * A for … in: the items are taken once, from a copy of the list when the loop changes it; the letters of a text are
   * a list of texts first.
   */
  const forEach = (statement: Statement & {type: 'forEach'}, name: (candidates: string[]) => Operand) => {
    const loopName = numbered('for');
    const type = typeOf(statement.expression);
    let list: Operand;
    if (!isList(type) || changesItsList(statement)) {
      const helper = isList(type) ? 'list_copy' : 'split_letters';
      helpers.use(helper);
      call(helper, [argumentOf(statement.expression, 'whole')]);
      list = name(isList(type) ? ['items'] : ['letters']);
      ins('mov', list, RAX);
    } else {
      list = once(statement.expression, 'whole', statement, name, ['items']);
    }
    const place = isList(type) ? placeOf(type.list) : 'whole';
    const position = name(['k', 'place']);
    ins('mov', position, number(0));
    a.label(loopName);
    ins('mov', RAX, list);
    ins('mov', RCX, position);
    ins('cmp', RCX, at('rax', 0));
    ins('jge', a.to(`${loopName}_end`));
    ins('mov', RAX, at('rax', 8));
    ins(moveOf(place), valueIn(place), item('rax', 'rcx'));
    store(place, local(names.of(statement.name)));
    loop(statement.body, `${loopName}_next`, `${loopName}_end`);
    ending(statement, loopName, () => ins('inc', position));
  };

  /**
   * A function, or the program as main: its variables by .set, then its frame, below rbp, with its parameters from
   * their registers, or above it, on the stack, then its statements.
   */
  const functionOf = (title: string, scopeName: string, parameters: string[], body: Statement[], at: number | null) => {
    out = new Writer('    ');
    scope = types.variables.get(scopeName)!;
    result = types.results.get(scopeName) ?? 'unknown';
    frame = new Map();
    temps = [];
    depth = 0;
    loops = [];
    let wholes = 0;
    let realCount = 0;
    const given: [Operand, string, Place][] = [];
    let above = 16;
    for (const parameter of parameters) {
      const place = placeOf(scope.get(parameter)!);
      const written = names.of(parameter);
      if (place === 'real' ? realCount < REAL_REGISTERS.length : wholes < WHOLE_REGISTERS.length) {
        given.push([slot(written), place === 'real' ? REAL_REGISTERS[realCount++] : WHOLE_REGISTERS[wholes++], place]);
      } else {
        frame.set(written, above);
        above += 8;
      }
    }
    for (const name of scope.keys()) slot(names.of(name));
    const statements = out;
    statements.block(() => {
      block(body);
      if (!scopeName) {
        trivia.rest(statements);
        line = 0;
        ins('mov', EAX, number(0));
      }
      line = at ?? 0;
      if (body[body.length - 1]?.type !== 'return') leave(a);
    });
    temps.forEach(name => names.release(name));
    //the head of the function, which the frame its statements need gives
    const head = new Writer('    ');
    out = head;
    line = at ?? 0;
    head.label(`${title}:${at ? trivia.after(at) : ''}`, at);
    head.block(() => {
      for (const [name, offset] of frame) head.line(syntax.set(name, offset), at);
      enter(a, Math.ceil(-Math.min(0, ...frame.values()) / 16) * 16);
      for (const [target, from, place] of given) ins(moveOf(place), target, register(from));
      if (!scopeName && random) {
        //other random numbers each time: srand(time(NULL))
        ins('mov', RDI, number(0));
        ins('call', a.lib('time'));
        ins('mov', register('edi'), EAX);
        ins('call', a.lib('srand'));
      }
    });
    head.append(statements);
    return head;
  };

  //the functions of the program, then main, with the comments before each
  const code = new Writer('    ');
  for (const definition of definitions) {
    trivia.before(code, definition.line);
    code.append(
      functionOf(names.of(definition.name), definition.name, definition.parameters, definition.body, definition.line)
    );
    code.blank();
  }
  code.append(functionOf('main', '', [], tree.statements, null));

  //the helpers first, for the functions of the C library they call
  const helperCode = new Map(
    Object.keys(HELPERS)
      .filter(name => helpers.has(name))
      .map(name => [name, helperLines(syntax, name, HELPERS[name], linked)])
  );
  const program = new Writer('    ');
  program.block(() => syntax.start([...linked]).forEach(text => program.line(text)));
  const helperData = Object.keys(HELPERS)
    .filter(name => helpers.has(name))
    .flatMap(name => HELPERS[name].data?.(words) ?? []);
  const textData = [
    ...[...texts].map(([value, name]): [string, string] => [name, value]),
    ...[...formats].map(([value, name]): [string, string] => [name, value]),
    ...helperData.filter((each): each is [string, string] => typeof each[1] === 'string')
  ];
  const realData = [
    ...[...reals].map(([value, name]): [string, number] => [name, value]),
    ...[...constants],
    ...helperData.filter((each): each is [string, number] => typeof each[1] === 'number')
  ];
  if (textData.length || realData.length) {
    program.blank();
    program.block(() => program.line(syntax.section('data')));
    const seen = new Set<string>();
    for (const [name, value] of textData) {
      if (seen.has(name)) continue;
      seen.add(name);
      program.label(`${syntax.data(name)}:`);
      program.block(() => program.line(syntax.text(value)));
    }
    if (realData.length) program.block(() => program.line(syntax.align(8)));
    for (const [name, value] of realData) {
      if (seen.has(name)) continue;
      seen.add(name);
      program.label(`${syntax.data(name)}:`);
      program.block(() => program.line(syntax.real(value)));
    }
  }
  program.blank();
  program.block(() => {
    program.line(syntax.section('code'));
    program.line(syntax.global('main'));
  });
  program.blank();
  program.append(code);
  helpers.write(program, (_, name) => helperCode.get(name)!);
  program.blank();
  program.block(() => program.line(`${syntax.section('stack')} ${syntax.comment} the stack holds no code`));
  return program.converted();
};

/** The writer of x86-64 assembly, in the intel and att syntaxes of the GNU assembler and in NASM's: its targets, which cmil/convert/assembly gives convert(). */
export const WRITERS: Writers = {
  'x86-64': {typed: true, write: (tree, types, sourceCode) => toAssembly(tree, types, sourceCode, INTEL)},
  'x86-64-att': {typed: true, write: (tree, types, sourceCode) => toAssembly(tree, types, sourceCode, AT_AND_T)},
  'x86-64-nasm': {typed: true, write: (tree, types, sourceCode) => toAssembly(tree, types, sourceCode, NASM)}
};
