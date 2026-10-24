/**
 * Fortran: what a teacher writes, in modern Fortran, from Fortran 2008, that prints what the CMIL program prints, as
 * gfortran builds it. A program main declares every variable first, as Fortran does, then has its statements, and the
 * functions of the program and the helpers it needs after its contains, each helper with what it is for. Numbers are
 * integer or real(dp), texts character of any length, lists allocatable arrays, which count from 1 as CMIL does, and a
 * list of texts an array of the type string, whose texts each have their own length. Names have only Latin letters, as
 * in Pascal, whatever their case. A list of lists, which arrays can't hold, is a problem, as in C.
 */
import {COMMAND} from '../../constants/index.ts';
import TRANSLATION from '../../translations/index.ts';
import {Grammar, mathOf, signedTest, type Code} from '../code.ts';
import {
  Before,
  Helpers,
  Names,
  Trivia,
  type FixedArrays,
  Writer,
  assignedIn,
  blocksOf,
  callsIn,
  changedIn,
  changesItsList,
  definitionOf,
  eachNode,
  isJoined,
  isText,
  hasEffect,
  joinedParts,
  linesOf,
  negation,
  neverEqual,
  stepOf,
  type Converted
} from '../emit.ts';
import {branchesApart, doWhileOf, loopMade, loopOf, statementsOf, testsOf, type Braces} from '../statements.ts';
import {isList, isNumber, type Type, type Types} from '../types.ts';
import type {ProgramTree} from '../../program.ts';
import type {Expression, Statement} from '../../core/types.ts';

//the names a program's names can't be, whatever their case, in small letters: Fortran reserves none of its words, so
//these are the names of its library the conversion uses and those of the helpers, which a name of the program would
//hide, like size, concurrent, which a do counter can't be, and the words of its statements, which a name would read
//like
const RESERVED = new Set(
  [
    'abs achar acos aint any call ceiling character complex concurrent contains cycle do dp else elseif end enddo',
    'endif exit exp floor function go goto has iachar iand if implicit index int int64 integer iso_fortran_env join',
    'join_integers join_logicals join_reals join_strings len letter_count letter_of letters log logical lower main',
    'module new_line none pi print program random_between random_number random_seed read read_number',
    'read_text real remove_item remove_item_integers remove_item_logicals remove_item_reals remove_item_strings',
    'repeat return round_to scan sin size split_at split_words sqrt stop str str_integer str_logical str_real string',
    'subroutine then to_number trim upper use while write'
  ]
    .join(' ')
    .split(' ')
);

//the precedence of Fortran's operators, from the loosest: .not. binds more loosely than a comparison, so .not. a == b
//is .not. (a == b), and a sign like +, so a * (-b) has brackets, since Fortran writes no two operators in a row
const PRECEDENCE: Record<string, number> = {
  '.eqv.': 1,
  '.neqv.': 1,
  '.or.': 2,
  '.and.': 3,
  '==': 5,
  '/=': 5,
  '<': 5,
  '>': 5,
  '<=': 5,
  '>=': 5,
  '//': 6,
  '+': 7,
  '-': 7,
  '*': 8,
  '/': 8,
  '**': 9
};
const NOT = 4;
const SIGN = PRECEDENCE['+'];

const OPERATORS: Record<string, string> = {
  [COMMAND.AND]: '.and.',
  [COMMAND.OR]: '.or.',
  '!=': '/='
};

const fortran = new Grammar(PRECEDENCE, new Set(), ['(', ')']);
const name = (text: string) => fortran.atom(text);

//a power, whose exponent may have a sign, like 2.0_dp ** (-1)
const power = (base: Code, exponent: Code) =>
  fortran.binary('**', base, exponent, [PRECEDENCE['**'] + 1, PRECEDENCE['**']]);

//a text as Fortran writes it: in double quotes, with "" for a quote; a new line is new_line("a") and a tab achar(9),
//joined to the rest with //
const literal = (text: string): Code => {
  const parts = text
    .split(/([\n\t])/)
    .filter(part => part !== '')
    .map(part =>
      name(part === '\n' ? 'new_line("a")' : part === '\t' ? 'achar(9)' : `"${part.replaceAll('"', '""')}"`)
    );
  return parts.length ? parts.reduce((left, right) => fortran.binary('//', left, right)) : name('""');
};

//the blocks of Fortran, ended by end if and end do
const BLOCKS: Braces = {head: text => text, tail: text => text};

//the code of a line of Fortran has at most 132 bytes, of UTF-8, and its comment any; a longer one goes on in the next
//line, after an & at the end of the first, cut at a space outside a text, else in a text, which goes on after an & at
//the start of the next line
const LIMIT = 132;
const bytes = (text: string) => new TextEncoder().encode(text).length;
const wrapped = (line: string): string[] => {
  //the letters of the line, whole, and where its comment starts, outside a text
  const letters = Array.from(line);
  let quote = false;
  let comment = letters.length;
  for (const [at, mark] of letters.entries()) {
    if (quote) quote = mark !== '"';
    else if (mark === '"') quote = true;
    else if (mark === '!') {
      comment = at;
      break;
    }
  }
  if (bytes(letters.slice(0, comment).join('')) <= LIMIT) return [line];
  const indent = Array.from(`${/^ */.exec(line)![0]}    `);
  const pieces: string[] = [];
  let rest = letters.slice(0, comment);
  //whether the line goes on in a text, after its &
  let inside = false;
  while (bytes(rest.join('')) > LIMIT) {
    let size = 0;
    let cut = -1;
    //the last space in a text that fits, else its last letter that does, where a text goes on in the next line
    let inText = -1;
    quote = inside;
    for (const [at, mark] of rest.entries()) {
      size += bytes(mark);
      if (size > LIMIT - 2) break;
      if (at < indent.length) continue;
      if (quote) {
        quote = mark !== '"';
        if (quote && (mark === ' ' || inText < 0 || rest[inText] !== ' ')) inText = mark === ' ' ? at : at + 1;
      } else if (mark === '"') quote = true;
      else if (mark === ' ') cut = at;
    }
    if (cut > 0) {
      pieces.push(`${rest.slice(0, cut).join('')} &`);
      rest = [...indent, ...rest.slice(cut + 1)];
      inside = false;
    } else if (quote && inText > 0) {
      pieces.push(`${rest.slice(0, inText).join('')}&`);
      rest = [...indent, '&', ...rest.slice(inText)];
      inside = true;
    } else break;
  }
  return [...pieces, rest.join('') + letters.slice(comment).join('')];
};

//the kinds of values of lists, by which the helpers of lists are written
type Kind = 'integer' | 'real' | 'logical' | 'string';

const kindOf = (type: Type): Kind =>
  type === 'real' ? 'real' : type === 'boolean' ? 'logical' : type === 'text' ? 'string' : 'integer';

//the type of a value of a kind, as Fortran declares it, and as an array constructor names it, like [string ::]
const DECLARED: Record<Kind, string> = {
  integer: 'integer',
  real: 'real(dp)',
  logical: 'logical',
  string: 'type(string)'
};
const CONSTRUCTED: Record<Kind, string> = {...DECLARED, string: 'string'};

type HelperContext = {words: [string, string]; kinds: Kind[]};
type Helper = {code: (context: HelperContext) => string[]; uses?: string[]};

//the name of a helper's procedure for a kind, like join_integers for a list of whole numbers
const specific = (helper: string, kind: Kind, list = true) => `${helper}_${kind}${list ? 's' : ''}`;

//the helpers, by name, in the order they are written: the helpers they use, and their code, for the kinds of the
//lists they are written for
const HELPERS: Record<string, Helper> = {
  readText: {
    code: () => [
      '! an answer of the user, as a text of any length, read a part at a time',
      'function read_text() result(text)',
      '    character(len=:), allocatable :: text',
      '    character(len=100) :: part',
      '    integer :: status, count',
      '    text = ""',
      '    do',
      "        read (*, '(a)', advance='no', iostat=status, size=count) part",
      '        text = text // part(:count)',
      '        if (status /= 0) exit',
      '    end do',
      'end function read_text'
    ]
  },
  readNumber: {
    code: () => [
      '! an answer of the user, as a number',
      'function read_number() result(number)',
      '    real(dp) :: number',
      '    read (*, *) number',
      'end function read_number'
    ]
  },
  strInteger: {
    code: () => [
      '! a whole number as a text',
      'function str_integer(value) result(text)',
      '    integer, intent(in) :: value',
      '    character(len=:), allocatable :: text',
      '    character(len=20) :: digits',
      "    write (digits, '(i0)') value",
      '    text = trim(digits)',
      'end function str_integer'
    ]
  },
  strReal: {
    code: () => [
      '! a real number as CMIL prints it: a whole one with all its digits, any other with up to 12 digits that count,',
      '! and never with an exponent',
      'function str_real(value) result(text)',
      '    real(dp), intent(in) :: value',
      '    character(len=:), allocatable :: text, digits',
      '    character(len=20) :: written',
      '    integer :: exponent',
      '    if (value == aint(value) .and. abs(value) < 2.0_dp**53) then',
      "        write (written, '(i0)') int(value, int64)",
      '        text = trim(written)',
      '        return',
      '    end if',
      '    ! the 12 digits that count, like 1.23450000000E+002, without the zeros at their end',
      "    write (written, '(es18.11e3)') abs(value)",
      '    digits = written(1:1) // written(3:13)',
      "    read (written(15:18), '(i4)') exponent",
      '    do while (len(digits) > 1 .and. digits(len(digits):) == "0")',
      '        digits = digits(:len(digits) - 1)',
      '    end do',
      '    if (exponent < 0) then',
      '        text = "0." // repeat("0", -exponent - 1) // digits',
      '    else if (exponent + 1 >= len(digits)) then',
      '        text = digits // repeat("0", exponent + 1 - len(digits))',
      '    else',
      '        text = digits(:exponent + 1) // "." // digits(exponent + 2:)',
      '    end if',
      '    if (value < 0) text = "-" // text',
      'end function str_real'
    ]
  },
  strLogical: {
    code: ({words: [yes, no]}) => [
      '! a boolean in words',
      'function str_logical(value) result(text)',
      '    logical, intent(in) :: value',
      '    character(len=:), allocatable :: text',
      '    if (value) then',
      `        text = ${fortran.print(literal(yes))}`,
      '    else',
      `        text = ${fortran.print(literal(no))}`,
      '    end if',
      'end function str_logical'
    ]
  },
  join: {
    code: ({kinds}) =>
      kinds.flatMap((kind, index) => [
        ...(index ? [''] : ['! the items of a list as they are printed, with a separator between them']),
        `function ${specific('join', kind)}(list, separator) result(text)`,
        `    ${DECLARED[kind]}, intent(in) :: list(:)`,
        '    character(len=*), intent(in) :: separator',
        '    character(len=:), allocatable :: text',
        '    integer :: i',
        '    text = ""',
        '    do i = 1, size(list)',
        '        if (i > 1) text = text // separator',
        `        text = text // ${kind === 'string' ? 'list(i)%value' : 'str(list(i))'}`,
        '    end do',
        `end function ${specific('join', kind)}`
      ])
  },
  removeItem: {
    code: ({kinds}) =>
      kinds.flatMap((kind, index) => [
        ...(index ? [''] : ['! removes the first item of a list that is a value']),
        `subroutine ${specific('remove_item', kind)}(list, value)`,
        `    ${DECLARED[kind]}, allocatable, intent(inout) :: list(:)`,
        `    ${kind === 'string' ? 'character(len=*)' : DECLARED[kind]}, intent(in) :: value`,
        '    integer :: i',
        '    do i = 1, size(list)',
        `        if (${kind === 'string' ? 'list(i)%value == value' : kind === 'logical' ? 'list(i) .eqv. value' : 'list(i) == value'}) then`,
        '            list = [list(:i - 1), list(i + 1:)]',
        '            return',
        '        end if',
        '    end do',
        `end subroutine ${specific('remove_item', kind)}`
      ])
  },
  has: {
    code: () => [
      '! whether a list of texts has a text',
      'function has(list, value) result(found)',
      '    type(string), intent(in) :: list(:)',
      '    character(len=*), intent(in) :: value',
      '    logical :: found',
      '    integer :: i',
      '    found = .false.',
      '    do i = 1, size(list)',
      '        if (list(i)%value == value) found = .true.',
      '    end do',
      'end function has'
    ]
  },
  letterCount: {
    code: () => [
      '! the letters of a text: a letter like ա has more than one byte, and each byte after its first is 10xxxxxx',
      'function letter_count(text) result(count)',
      '    character(len=*), intent(in) :: text',
      '    integer :: count, i',
      '    count = 0',
      '    do i = 1, len(text)',
      '        if (iand(iachar(text(i:i)), 192) /= 128) count = count + 1',
      '    end do',
      'end function letter_count'
    ]
  },
  letterOf: {
    code: () => [
      '! the letter of a text at a place, from 1, with all the bytes of a letter like ա',
      'function letter_of(text, place) result(letter)',
      '    character(len=*), intent(in) :: text',
      '    integer, intent(in) :: place',
      '    character(len=:), allocatable :: letter',
      '    integer :: count, i',
      '    count = 0',
      '    letter = ""',
      '    do i = 1, len(text)',
      '        if (iand(iachar(text(i:i)), 192) /= 128) count = count + 1',
      '        if (count == place) letter = letter // text(i:i)',
      '    end do',
      'end function letter_of'
    ]
  },
  letters: {
    code: () => [
      '! the letters of a text, each a text of its own: a letter starts at a byte that is not 10xxxxxx',
      'function letters(text) result(list)',
      '    character(len=*), intent(in) :: text',
      '    type(string), allocatable :: list(:)',
      '    integer :: i, first',
      '    list = [string ::]',
      '    first = 1',
      '    do i = 2, len(text) + 1',
      '        if (i > len(text)) then',
      '            list = [list, string(text(first:))]',
      '        else if (iand(iachar(text(i:i)), 192) /= 128) then',
      '            list = [list, string(text(first:i - 1))]',
      '            first = i',
      '        end if',
      '    end do',
      'end function letters'
    ]
  },
  splitWords: {
    code: () => [
      '! the words of a text, between its spaces',
      'function split_words(text) result(words)',
      '    character(len=*), intent(in) :: text',
      '    type(string), allocatable :: words(:)',
      '    character(len=:), allocatable :: word',
      '    integer :: i',
      '    words = [string ::]',
      '    word = ""',
      '    do i = 1, len(text) + 1',
      '        if (i > len(text)) then',
      '            if (word /= "") words = [words, string(word)]',
      '        else if (scan(text(i:i), " " // achar(9) // new_line("a")) > 0) then',
      '            if (word /= "") words = [words, string(word)]',
      '            word = ""',
      '        else',
      '            word = word // text(i:i)',
      '        end if',
      '    end do',
      'end function split_words'
    ]
  },
  splitAt: {
    uses: ['letters'],
    code: () => [
      '! the parts of a text between a separator, with the empty ones; its letters for ""',
      'function split_at(text, separator) result(parts)',
      '    character(len=*), intent(in) :: text, separator',
      '    type(string), allocatable :: parts(:)',
      '    integer :: start, found',
      '    if (separator == "") then',
      '        parts = letters(text)',
      '        return',
      '    end if',
      '    parts = [string ::]',
      '    start = 1',
      '    do',
      '        found = index(text(start:), separator)',
      '        if (found == 0) exit',
      '        parts = [parts, string(text(start:start + found - 2))]',
      '        start = start + found - 1 + len(separator)',
      '    end do',
      '    parts = [parts, string(text(start:))]',
      'end function split_at'
    ]
  },
  upper: {
    code: () => [
      '! a text in capitals: the English letters, which are the only ones of one byte',
      'function upper(text) result(changed)',
      '    character(len=*), intent(in) :: text',
      '    character(len=len(text)) :: changed',
      '    integer :: i',
      '    changed = text',
      '    do i = 1, len(text)',
      '        if (text(i:i) >= "a" .and. text(i:i) <= "z") changed(i:i) = achar(iachar(text(i:i)) - 32)',
      '    end do',
      'end function upper'
    ]
  },
  lower: {
    code: () => [
      '! a text in small letters: the English letters, which are the only ones of one byte',
      'function lower(text) result(changed)',
      '    character(len=*), intent(in) :: text',
      '    character(len=len(text)) :: changed',
      '    integer :: i',
      '    changed = text',
      '    do i = 1, len(text)',
      '        if (text(i:i) >= "A" .and. text(i:i) <= "Z") changed(i:i) = achar(iachar(text(i:i)) + 32)',
      '    end do',
      'end function lower'
    ]
  },
  toNumber: {
    code: () => [
      '! the number a text has, like 2.5',
      'function to_number(text) result(number)',
      '    character(len=*), intent(in) :: text',
      '    real(dp) :: number',
      '    read (text, *) number',
      'end function to_number'
    ]
  },
  roundTo: {
    uses: ['strReal', 'toNumber'],
    code: () => [
      '! a number rounded to a count of decimals, a half up, after rounding it like it is printed, so 1.005 is 1.01',
      'function round_to(number, digits) result(rounded)',
      '    real(dp), intent(in) :: number',
      '    integer, intent(in) :: digits',
      '    real(dp) :: rounded',
      '    rounded = floor(to_number(str_real(number * 10.0_dp**digits)) + 0.5_dp) / 10.0_dp**digits',
      'end function round_to'
    ]
  },
  random: {
    code: () => [
      '! a random whole number from low to high',
      'function random_between(low, high) result(number)',
      '    integer, intent(in) :: low, high',
      '    integer :: number',
      '    real(dp) :: fraction',
      '    call random_number(fraction)',
      '    number = low + floor(fraction * (high - low + 1))',
      'end function random_between'
    ]
  }
};

/** What Fortran's arrays can't hold is only what no language of them can. */
export const FORTRAN_ARRAYS: FixedArrays = {};

/**
 * Writes a program in Fortran, which FORTRAN_ARRAYS can hold.
 */
export const toFortran = (tree: ProgramTree, types: Types, sourceCode: string): Converted => {
  const names = new Names(tree.names, RESERVED, {
    caseless: true,
    latin: true,
    //a name of Fortran starts with a letter
    rewrite: spelling => (spelling.startsWith('_') ? `v${spelling}` : spelling)
  });
  const trivia = new Trivia(tree.comments, sourceCode, '!');
  const helpers = new Helpers(HELPERS);
  //the kinds of the lists each helper of lists is written for, and those of the values str() is written for
  const forKinds = new Map<string, Set<Kind>>();
  const scalars = new Set<Kind>();
  const {words: commands} = TRANSLATION[tree.language];
  const words: [string, string] = [commands.true[0], commands.false[0]];
  const definitions = tree.statements.filter(
    (statement): statement is Statement & {type: 'function'} => statement.type === 'function'
  );
  //whether the program has real numbers, of the kind dp, a list of texts, of the type string, random numbers or pi
  let reals = false;
  let strings = false;
  let random = false;
  let pi = false;
  //the variables the conversion adds to the scope being written, like the counter of a repeat, with their declarations
  let locals = new Map<string, string>();
  //the lines a statement needs first, like a list a function changes, given in a variable
  const pending = new Before();
  //the function being written: its result's variable and type, and the return that ends it, which needs no return
  let result: {variable: string; type: Type} | undefined;
  let finalReturn: Statement | undefined;

  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';
  const code = (node: Expression, place?: Type) => fortran.print(expression(node, place));

  //the kind of the items of a list, which arrays have only of numbers, booleans and texts
  const itemKind = (list: Type): Kind => {
    const item = isList(list) ? list.list : 'unknown';
    if (item === 'real') reals = true;
    if (item === 'text') strings = true;
    return kindOf(item);
  };

  //a helper of lists for the kind of a list
  const listHelper = (helper: string, list: Type) => {
    helpers.use(helper);
    if (!forKinds.has(helper)) forKinds.set(helper, new Set());
    const kind = itemKind(list);
    forKinds.get(helper)!.add(kind);
    if (helper === 'join' && kind !== 'string') scalarText(kind);
  };

  //str() of a value of a kind: a text of a whole number, a real number or a boolean
  const scalarText = (kind: Kind) => {
    scalars.add(kind);
    helpers.use(kind === 'integer' ? 'strInteger' : kind === 'real' ? 'strReal' : 'strLogical');
    if (kind === 'real') reals = true;
  };

  //the declaration of a value of a type, like integer, allocatable :: scores(:), with its attributes
  const declaration = (type: Type, variable: string, attributes: string[] = []): string => {
    if (isList(type)) {
      const kind = itemKind(type);
      return `${[DECLARED[kind], 'allocatable', ...attributes].join(', ')} :: ${variable}(:)`;
    }
    if (type === 'real') reals = true;
    const base =
      type === 'real' ? 'real(dp)' : type === 'boolean' ? 'logical' : type === 'text' ? 'character(len=:)' : 'integer';
    return `${[base, ...(type === 'text' ? ['allocatable'] : []), ...attributes].join(', ')} :: ${variable}`;
  };

  //a variable the conversion adds, like the counter of a repeat, declared in its scope
  const local = (variable: string, text: string) => {
    locals.set(variable, text);
    return variable;
  };
  //a variable the conversion keeps a value of a type in, named as no other, since the types of two may differ
  const kept = (candidates: string[], type: Type) => {
    const variable = names.fresh(candidates);
    return local(variable, declaration(type, variable));
  };

  //a whole number written as a real number, like 2.0_dp, or made real, like real(n, dp)
  const real = (node: Expression): Code => {
    reals = true;
    if (node.type === 'value' && typeof node.value === 'number') {
      return fortran.atom(`${node.value}.0_dp`, node.value < 0 ? SIGN : undefined);
    }
    return fortran.call('real', [expression(node), name('dp')]);
  };

  //an expression in a place of a type, like a real parameter, which Fortran never makes of a whole number by itself
  const placed = (node: Expression, place?: Type): Code =>
    place === 'real' && typeOf(node) === 'whole' ? real(node) : expression(node, place);

  //a text as an item of a list of texts: string(text), or the item of another list of texts as it is, which gfortran
  //11 would give empty as string(words(i)%value); a text computed, like an answer, is kept in a variable first, since
  //gfortran 11 can't build the string() of the result of a function in a list
  const stringOf = (node: Expression): Code => {
    if (node.type === 'index' && isList(typeOf(node.target))) {
      return fortran.index(name(variableOf(node.target, typeOf(node.target))), expression(node.index));
    }
    if (node.type === 'value' || node.type === 'variable') return fortran.call('string', [expression(node)]);
    const text = kept(['item', 'text'], 'text');
    pending.add([`${text} = ${code(node)}`], {node});
    return fortran.call('string', [name(text)]);
  };

  //a value as a text: a text as it is, the others by str(), as CMIL prints them
  const asText = (node: Expression): Code => {
    const type = typeOf(node);
    if (type === 'text') return expression(node);
    scalarText(kindOf(type));
    return fortran.call('str', [expression(node)]);
  };

  //values joined into a text with //
  const joinText = (parts: Expression[]): Code =>
    parts.map(asText).reduce((left, right) => fortran.binary('//', left, right));

  //a list in a variable, for a procedure that changes it; a list in no variable is given one first
  const variableOf = (node: Expression, type: Type): string => {
    if (node.type === 'variable') return names.of(node.name);
    const items = kept(['items', 'list'], type);
    pending.add([`${items} = ${code(node, type)}`], {node});
    return items;
  };

  const expression = (node: Expression, place?: Type): Code => {
    switch (node.type) {
      case 'value':
        if (node.constant === 'pi') {
          pi = true;
          reals = true;
          return name('pi');
        }
        if (node.constant === 'e') {
          reals = true;
          return fortran.call('exp', [name('1.0_dp')]);
        }
        if (typeof node.value === 'string') return literal(node.value);
        if (typeof node.value === 'boolean') return name(node.value ? '.true.' : '.false.');
        if (!Number.isInteger(node.value)) {
          reals = true;
          return fortran.atom(`${node.value}_dp`, node.value < 0 ? SIGN : undefined);
        }
        return fortran.atom(String(node.value), node.value < 0 ? SIGN : undefined);
      case 'list': {
        const type = place && isList(place) ? place : typeOf(node);
        const kind = itemKind(type);
        const item = isList(type) ? type.list : 'unknown';
        if (!node.items.length) return name(`[${CONSTRUCTED[kind]} ::]`);
        const items = node.items.map(each => (kind === 'string' ? stringOf(each) : placed(each, item)));
        return fortran.items('[', items, ']');
      }
      case 'template':
        return joinText(joinedParts(node, types));
      case 'variable':
        return name(names.of(node.name));
      case 'index': {
        const target = typeOf(node.target);
        if (isList(target)) {
          //an item of a list in no variable is of one given it first, since Fortran indexes only variables
          const item = fortran.index(name(variableOf(node.target, target)), expression(node.index));
          return itemKind(target) === 'string' ? fortran.member(item, 'value', undefined, '%') : item;
        }
        helpers.use('letterOf');
        return fortran.call('letter_of', [expression(node.target), expression(node.index)]);
      }
      case 'input':
        if (typeOf(node) === 'real') {
          reals = true;
          helpers.use('readNumber');
          return fortran.call('read_number', []);
        }
        helpers.use('readText');
        return fortran.call('read_text', []);
      case 'userCall': {
        const definition = definitionOf(definitions, node.name);
        const scope = types.variables.get(node.name)!;
        return fortran.call(
          names.of(node.name),
          node.args.map((arg, index) => {
            const parameter = definition.parameters[index];
            const type = scope.get(parameter)!;
            //a list the function changes is given in a variable, which it can change
            if (isList(type) && changedIn(definition.body).has(parameter)) return name(variableOf(arg, type));
            return placed(arg, type);
          })
        );
      }
      case 'call':
        return builtIn(node);
      case 'unary':
        if (node.operator === COMMAND.NOT) return fortran.unary('.not. ', expression(node.operand), NOT);
        return fortran.unary(node.operator, fortran.bracketed(expression(node.operand), SIGN + 1), SIGN);
      case 'binary':
        return binary(node);
    }
  };

  const binary = (node: Expression & {type: 'binary'}): Code => {
    const left = typeOf(node.left);
    const right = typeOf(node.right);

    if (node.operator === '+' && typeOf(node) === 'text') return joinText(joinedParts(node, types));
    if (node.operator === COMMAND.IN) {
      if (isList(right)) {
        const kind = itemKind(right);
        if (kind === 'string') {
          helpers.use('has');
          return fortran.call('has', [expression(node.right), expression(node.left)]);
        }
        const test = fortran.binary(kind === 'logical' ? '.eqv.' : '==', expression(node.right), expression(node.left));
        return fortran.call('any', [test]);
      }
      return fortran.binary('>', fortran.call('index', [expression(node.right), expression(node.left)]), name('0'));
    }
    //a whole number divided by a whole number is a whole number in Fortran, so the first one is made real
    if (node.operator === '/' && left === 'whole' && right === 'whole') {
      return fortran.binary('/', real(node.left), expression(node.right));
    }
    if (node.operator === '%') {
      const real_ = left === 'real' || right === 'real';
      const operand = (side: Expression) => (real_ ? placed(side, 'real') : expression(side));
      return fortran.call('mod', [operand(node.left), operand(node.right)]);
    }
    if (node.operator === '==' || node.operator === '!=') {
      //values of different types are never equal in CMIL; Fortran doesn't compare them
      if (neverEqual(left, right)) return name(node.operator === '==' ? '.false.' : '.true.');
      //booleans are equal by .eqv., not ==
      if (left === 'boolean') {
        const operator = node.operator === '==' ? '.eqv.' : '.neqv.';
        return fortran.binary(operator, expression(node.left), expression(node.right));
      }
    }
    const operator = OPERATORS[node.operator] ?? node.operator;
    if (node.operator === COMMAND.AND || node.operator === COMMAND.OR) {
      const first = expression(node.left);
      const mark = pending.mark;
      const second = expression(node.right);
      if (!hasEffect(node.right)) return fortran.binary(operator, first, second);
      //Fortran may compute both sides of .and. and .or., where CMIL computes the right one only when the left one
      //doesn't decide, so a right side with an effect, like a call, comes after the left side in a variable, with the
      //lines it makes, in an if
      const made = pending.take(mark);
      const test = kept(['test', 'either'], 'boolean');
      pending.add(
        [
          `${test} = ${fortran.print(first)}`,
          `if (${node.operator === COMMAND.AND ? test : `.not. ${test}`}) then`,
          ...linesOf(made).map(text => `    ${text}`),
          `    ${test} = ${fortran.print(second)}`,
          'end if'
        ],
        {node}
      );
      return name(test);
    }
    return fortran.binary(operator, expression(node.left), expression(node.right));
  };

  const builtIn = (node: Expression & {type: 'call'}): Code => {
    const [first] = node.args;
    const args = () => node.args.map(arg => expression(arg));
    //a function of math, which takes real numbers
    const ofReals = () => node.args.map(arg => placed(arg, 'real'));
    switch (node.name) {
      case COMMAND.POW: {
        const [base, exponent] = node.args;
        return power(
          typeOf(base) === 'whole' && typeOf(exponent) === 'whole' ? real(base) : expression(base),
          expression(exponent)
        );
      }
      case COMMAND.SQR:
        return first.type === 'variable' || first.type === 'value'
          ? fortran.binary('*', expression(first), expression(first))
          : power(expression(first), name('2'));
      case COMMAND.ROUND:
        if (node.args.length === 2) {
          helpers.use('roundTo');
          reals = true;
          return fortran.call('round_to', [placed(first, 'real'), expression(node.args[1])]);
        }
        if (typeOf(first) === 'whole') return expression(first);
        return fortran.call('floor', [fortran.binary('+', expression(first), name('0.5_dp'))]);
      case COMMAND.FLOOR:
        return typeOf(first) === 'whole' ? expression(first) : fortran.call('floor', args());
      case COMMAND.CEIL:
        return typeOf(first) === 'whole' ? expression(first) : fortran.call('ceiling', args());
      case COMMAND.ABS:
        return fortran.call('abs', args());
      case COMMAND.RANDOM: {
        random = true;
        helpers.use('random');
        reals = true;
        const [min, max] = node.args.length === 1 ? [null, first] : node.args;
        const whole = (bound: Expression) =>
          typeOf(bound) === 'real' ? fortran.call('int', [expression(bound)]) : expression(bound);
        return fortran.call('random_between', [min ? whole(min) : name('1'), whole(max)]);
      }
      case COMMAND.LENGTH:
        if (isList(typeOf(first))) return fortran.call('size', args());
        helpers.use('letterCount');
        return fortran.call('letter_count', args());
      case COMMAND.UPPER:
        helpers.use('upper');
        return fortran.call('upper', args());
      case COMMAND.LOWER:
        helpers.use('lower');
        return fortran.call('lower', args());
      case COMMAND.NUMBER:
        //a number by itself is a real number, which Fortran writes as a number made real
        if (isNumber(typeOf(first))) return typeOf(node) === 'real' ? placed(first, 'real') : expression(first);
        helpers.use('toNumber');
        reals = true;
        return fortran.call('to_number', args());
      case COMMAND.TEXT:
        return asText(first);
      case COMMAND.SPLIT: {
        strings = true;
        const [text, separator] = node.args;
        if (!separator) {
          helpers.use('splitWords');
          return fortran.call('split_words', [expression(text)]);
        }
        if (isText(separator) && separator.value === '') {
          helpers.use('letters');
          return fortran.call('letters', [expression(text)]);
        }
        helpers.use('splitAt');
        return fortran.call('split_at', [expression(text), expression(separator)]);
      }
      case COMMAND.JOIN:
        listHelper('join', typeOf(first));
        return fortran.call('join', [expression(first), node.args[1] ? expression(node.args[1]) : name('""')]);
    }
    const formula = mathOf(
      fortran,
      node.name,
      ofReals(),
      (method, values) => fortran.call(method, values),
      () => {
        pi = true;
        reals = true;
        return name('pi');
      },
      value => {
        reals = true;
        return name(`${value}.0_dp`);
      }
    );
    if (formula) {
      reals = true;
      return formula;
    }
    throw new Error(`No Fortran for ${node.name}`);
  };

  //what print prints of a variable of the conversion: a whole number by i0, the others as a text
  const printedVariable = (variable: string, type: Type): string => {
    if (type === 'whole') return `print '(i0)', ${variable}`;
    if (type === 'text') return `print '(a)', ${variable}`;
    scalarText(kindOf(type));
    return `print '(a)', str(${variable})`;
  };

  //what print prints: a whole number by i0, the others as a text
  const printed = (node: Expression): string => {
    if (isText(node) && node.value === '') return `print '(a)', ""`;
    if (typeOf(node) === 'whole' && !isJoined(node, types)) return `print '(i0)', ${code(node)}`;
    if (isJoined(node, types)) return `print '(a)', ${fortran.print(joinText(joinedParts(node, types)))}`;
    return `print '(a)', ${fortran.print(asText(node))}`;
  };

  //the functions of the program that print or read, also by the functions they call
  const printing = new Set<string>();
  const prints = (statements: Statement[]): boolean =>
    statements.some(statement => {
      let found = statement.type === 'print';
      eachNode(statement, node => {
        if (node.type === 'input' || (node.type === 'userCall' && printing.has(node.name))) found = true;
      });
      return found || blocksOf(statement).some(prints);
    });
  for (let more = true; more;) {
    more = false;
    for (const definition of definitions) {
      if (printing.has(definition.name) || !prints(definition.body)) continue;
      printing.add(definition.name);
      more = true;
    }
  }

  //the lines a statement needs first, then the statement
  const flushed = (texts: string[]) => [...linesOf(pending.take()), ...texts];

  const block = statementsOf({
    trivia,
    names,
    braces: BLOCKS,
    write: (statement, context) => {
      const {comment, scope} = context;
      //writes the lines a statement needs first, then the statement, with the comment after its last line
      const lines = (texts: string[]) => {
        if (texts.length) texts[texts.length - 1] += comment;
        flushed(texts).forEach(text => context.line(text));
      };
      //writes the lines the head of a block needs first
      const before = () => flushed([]).forEach(text => context.line(text));
      //a counter of the conversion, an integer
      const counter = () => {
        const variable = context.fresh(['i', 'j', 'k']);
        return local(variable, `integer :: ${variable}`);
      };
      switch (statement.type) {
        case 'print': {
          const value = statement.expression;
          //a value that prints or reads is computed first, since Fortran stops a program that prints or reads while
          //it prints
          let io = false;
          eachNode(statement, node => {
            if (node.type === 'input' || (node.type === 'userCall' && printing.has(node.name))) io = true;
          });
          if (!io) {
            lines([printed(value)]);
            return;
          }
          const type = isJoined(value, types) ? 'text' : typeOf(value);
          const shown = kept(['shown', 'line'], type);
          const text = isJoined(value, types) ? fortran.print(joinText(joinedParts(value, types))) : code(value);
          pending.add([`${shown} = ${text}`]);
          lines([printedVariable(shown, type)]);
          return;
        }
        case 'assign': {
          const type = scope.get(statement.name)!;
          const variable = names.of(statement.name);
          const value = statement.expression;
          if (value.type === 'input' && typeOf(value) === 'real') {
            lines([`read (*, *) ${variable}`]);
            return;
          }
          lines([`${variable} = ${code(value, type)}`]);
          return;
        }
        case 'setItem': {
          const list = typeOf(statement.target);
          const item = fortran.index(expression(statement.target), expression(statement.index));
          const place = itemKind(list) === 'string' ? fortran.member(item, 'value', undefined, '%') : item;
          const value = isList(list) ? placed(statement.expression, list.list) : expression(statement.expression);
          lines([`${fortran.print(place)} = ${fortran.print(value)}`]);
          return;
        }
        case 'add': {
          const list = typeOf(statement.target);
          const target = code(statement.target);
          const value = isList(list)
            ? itemKind(list) === 'string'
              ? stringOf(statement.expression)
              : placed(statement.expression, list.list)
            : expression(statement.expression);
          lines([`${target} = [${target}, ${fortran.print(value)}]`]);
          return;
        }
        case 'remove': {
          const list = typeOf(statement.target);
          listHelper('removeItem', list);
          const value = isList(list) ? placed(statement.expression, list.list) : expression(statement.expression);
          lines([`call remove_item(${code(statement.target)}, ${fortran.print(value)})`]);
          return;
        }
        case 'call': {
          const called = types.results.get(statement.call.name)!;
          const call = code(statement.call);
          if (called === 'unknown') {
            lines([`call ${call}`]);
            return;
          }
          //Fortran calls a function only for its value, which the program doesn't use here
          lines([`${kept(['unused', 'ignored'], called)} = ${call}`]);
          return;
        }
        case 'return': {
          const texts =
            result && statement.expression ? [`${result.variable} = ${code(statement.expression, result.type)}`] : [];
          if (statement !== finalReturn) texts.push('return');
          if (texts.length) lines(texts);
          else if (comment) context.line(comment.trimStart());
          return;
        }
        case 'if': {
          const tests = testsOf(statement, pending, condition => code(condition));
          before();
          context.blocks(
            branchesApart(statement, tests, (test, index) => `${index ? 'else if' : 'if'} (${test}) then`),
            undefined,
            'end if'
          );
          return;
        }
        case 'while': {
          const test = code(statement.condition);
          const again = loopMade(context, statement, pending.take());
          context.blocks([loopOf(statement, `do while (${test})`, again)], undefined, 'end do');
          return;
        }
        case 'doWhile': {
          const test = `if (${code(negation(statement.condition, types))})`;
          const again = loopMade(context, statement, pending.take());
          const head = doWhileOf(context, statement, 'do', test, 'exit', {oneLine: true});
          //the values the test made, made again before it
          const madeFirst = (write?: () => void) => () => {
            again.last?.();
            write?.();
          };
          context.blocks([{...head, last: madeFirst(head.last), next: madeFirst(head.next)}], undefined, 'end do');
          return;
        }
        case 'repeat': {
          const count =
            typeOf(statement.count) === 'real'
              ? fortran.call('int', [expression(statement.count)])
              : expression(statement.count);
          const head = loopOf(statement, `do ${counter()} = 1, ${fortran.print(count)}`);
          before();
          context.blocks([head], undefined, 'end do');
          return;
        }
        case 'for': {
          const variable = names.of(statement.name);
          const type = scope.get(statement.name)!;
          const {down, size, signed} = stepOf(statement);
          //Fortran's do counts a whole counter, which the loop doesn't change, from a first to a last value, by a step
          //of either sign
          if (type === 'whole' && !assignedIn(statement.body).has(statement.name)) {
            //a real last value, like sqrt(n), is the whole number the counter reaches, which a step whose sign shows
            //only as the program runs takes by the sign
            const to = expression(statement.to);
            const reached = (down: boolean) => fortran.call(down ? 'ceiling' : 'floor', [to]);
            const last =
              typeOf(statement.to) !== 'real'
                ? to
                : signed
                  ? fortran.call('merge', [
                      reached(false),
                      reached(true),
                      fortran.binary('>', expression(size!), name('0'))
                    ])
                  : reached(down);
            const step = size
              ? `, ${down ? '-' : ''}${fortran.print(fortran.bracketed(expression(size), SIGN + 1))}`
              : down
                ? ', -1'
                : '';
            const head = loopOf(statement, `do ${variable} = ${code(statement.from)}, ${fortran.print(last)}${step}`);
            before();
            context.blocks([head], undefined, 'end do');
            return;
          }
          //a real counter goes by its step in a do while, which reads its last value and its step once
          const kept = (bound: Expression, candidates: string[]) =>
            context.keep(bound, candidates, kept => {
              local(kept, declaration(typeOf(bound) === 'real' ? 'real' : type, kept));
              return `${kept} = ${code(bound)}`;
            });
          before();
          context.line(`${variable} = ${code(statement.from, type)}`);
          const last = kept(statement.to, ['last', 'stop']) ?? code(statement.to);
          const step = size
            ? (kept(size, ['step', 'by']) ?? fortran.print(fortran.bracketed(expression(size), SIGN + 1)))
            : '1';
          //the step, after the block and before a cycle
          const next = () => context.line(`${variable} = ${variable} ${down ? '-' : '+'} ${step}`);
          const compare = (operator: string) => fortran.binary(operator, name(variable), name(last));
          const test = signed
            ? signedTest(fortran, compare, name(step), ['.and.', '.or.'])
            : compare(down ? '>=' : '<=');
          const head = loopOf(statement, `do while (${fortran.print(test)})`, {last: next, next});
          context.blocks([head], undefined, 'end do');
          return;
        }
        case 'forEach': {
          const type = typeOf(statement.expression);
          const variable = names.of(statement.name);
          const place = counter();
          let head: string;
          let first: string;
          if (isList(type)) {
            let list = code(statement.expression);
            //the loop changes its list, so it goes over a copy: the items the list had when the loop started
            if (changesItsList(statement) || statement.expression.type !== 'variable') {
              const copy = kept(['items', 'each'], type);
              pending.add([`${copy} = ${list}`]);
              list = copy;
            }
            head = `do ${place} = 1, size(${list})`;
            first = `${variable} = ${list}(${place})${itemKind(type) === 'string' ? '%value' : ''}`;
          } else {
            //the letters of a text, each a text of its own
            helpers.use('letterCount');
            helpers.use('letterOf');
            const text = code(statement.expression);
            head = `do ${place} = 1, letter_count(${text})`;
            first = `${variable} = letter_of(${text}, ${place})`;
          }
          before();
          context.blocks([loopOf(statement, head, {first: [first]})], undefined, 'end do');
          return;
        }
        case 'break':
          lines(['exit']);
          return;
        case 'continue':
          context.next();
          lines(['cycle']);
          return;
      }
    }
  });

  //the declarations of a scope: its variables, but its parameters, and those the conversion adds
  const declarations = (out: Writer, scope: Map<string, Type>, skipped: Set<string>) => {
    for (const [variable, type] of scope) {
      if (!skipped.has(variable)) out.line(declaration(type, names.of(variable)));
    }
    for (const text of locals.values()) out.line(text);
  };

  //the functions that call themselves, by others too, which Fortran writes recursive
  const recursive = new Set<string>();
  for (const definition of definitions) {
    const reached = new Set<string>();
    const visit = (from: string) =>
      callsIn(definitionOf(definitions, from)).forEach(called => {
        if (reached.has(called)) return;
        reached.add(called);
        if (definitions.some(each => each.name === called)) visit(called);
      });
    visit(definition.name);
    if (reached.has(definition.name)) recursive.add(definition.name);
  }

  //a function of the program: a function, or a subroutine when it gives no value. A list it reads is intent(in), one
  //it changes allocatable and intent(inout), so it can grow; a number it gives another value is its own copy, by
  //value, and so is a text, which it gets as name_in
  const functions = new Writer('    ');
  for (const definition of definitions) {
    locals = new Map();
    const scope = types.variables.get(definition.name)!;
    const type = types.results.get(definition.name)!;
    const assigned = assignedIn(definition.body);
    const changed = changedIn(definition.body);
    //the names the function gets its values by, and their declarations
    const dummies: string[] = [];
    const parameters: string[] = [];
    const copies: string[] = [];
    for (const parameter of definition.parameters) {
      const kind = scope.get(parameter)!;
      const variable = names.of(parameter);
      if (isList(kind)) {
        const attributes = changed.has(parameter) ? ['allocatable', 'intent(inout)'] : ['intent(in)'];
        parameters.push(`${[DECLARED[itemKind(kind)], ...attributes].join(', ')} :: ${variable}(:)`);
        dummies.push(variable);
      } else if (kind === 'text' && assigned.has(parameter)) {
        //a text the function gives another value is a copy of the one it gets
        const given = names.fresh([`${variable}_in`]);
        names.release(given);
        parameters.push(`character(len=*), intent(in) :: ${given}`);
        copies.push(`${variable} = ${given}`);
        locals.set(variable, declaration('text', variable));
        dummies.push(given);
      } else {
        const attributes = [assigned.has(parameter) ? 'value' : 'intent(in)'];
        parameters.push(
          kind === 'text' ? `character(len=*), intent(in) :: ${variable}` : declaration(kind, variable, attributes)
        );
        dummies.push(variable);
      }
    }
    const kind = type === 'unknown' ? 'subroutine' : 'function';
    const answer = type === 'unknown' ? undefined : names.fresh(['answer', 'res']);
    if (answer) names.release(answer);
    result = answer ? {variable: answer, type} : undefined;
    const last = definition.body[definition.body.length - 1];
    finalReturn = last?.type === 'return' ? last : undefined;

    const body = new Writer('    ');
    copies.forEach(copy => body.line(copy));
    block(body, definition.body, scope, new Set(definition.parameters));

    trivia.before(functions, definition.line);
    const head = `${recursive.has(definition.name) ? 'recursive ' : ''}${kind} ${names.of(definition.name)}(${dummies.join(', ')})`;
    functions.line(`${head}${answer ? ` result(${answer})` : ''}${trivia.after(definition.line)}`, definition.line);
    functions.block(() => {
      parameters.forEach(text => functions.line(text));
      if (answer) functions.line(declaration(type, answer));
      declarations(functions, scope, new Set(definition.parameters));
      functions.blank();
      functions.append(body);
    });
    functions.line(`end ${kind} ${names.of(definition.name)}`);
    functions.blank();
  }
  result = undefined;
  finalReturn = undefined;

  locals = new Map();
  const main = new Writer('    ');
  block(main, tree.statements, types.variables.get('')!, new Set());
  trivia.rest(main);
  const mainDeclarations = new Writer('    ');
  declarations(mainDeclarations, types.variables.get('')!, new Set());

  //the helpers, and the generic names of those of each kind, like str()
  const generics: [string, string[]][] = [];
  const kinds = (helper: string) => [...(forKinds.get(helper) ?? [])];
  const strNames = [...scalars].map(kind => `str_${kind}`);
  if (strNames.length) generics.push(['str', strNames]);
  if (helpers.has('join')) generics.push(['join', kinds('join').map(kind => specific('join', kind))]);
  if (helpers.has('removeItem'))
    generics.push(['remove_item', kinds('removeItem').map(kind => specific('remove_item', kind))]);
  if (helpers.has('strReal') || helpers.has('roundTo')) reals = true;
  for (const helper of ['letters', 'splitWords', 'splitAt', 'has']) if (helpers.has(helper)) strings = true;

  const out = new Writer('    ');
  out.line('program main');
  out.block(() => {
    const kinds_ = [...(reals ? ['dp => real64'] : []), ...(helpers.has('strReal') ? ['int64'] : [])];
    if (kinds_.length) out.line(`use, intrinsic :: iso_fortran_env, only: ${kinds_.join(', ')}`);
    out.line('implicit none');
    if (strings) {
      out.blank();
      out.line('! a text of a list of texts, each with its own length');
      out.line('type :: string');
      out.line('    character(len=:), allocatable :: value');
      out.line('end type string');
    }
    if (generics.length) {
      out.blank();
      for (const [generic, specifics] of generics) {
        out.line(`interface ${generic}`);
        out.line(`    procedure ${specifics.join(', ')}`);
        out.line('end interface');
      }
    }
    if (pi || mainDeclarations.length) out.blank();
    if (pi) out.line('real(dp), parameter :: pi = acos(-1.0_dp)');
    out.append(mainDeclarations);
    out.blank();
    if (random) out.line('call random_seed() ! other random numbers each time');
    out.append(main);
  });
  //the functions of the program, then the helpers, after contains
  if (definitions.length || Object.keys(HELPERS).some(helper => helpers.has(helper))) {
    out.blank();
    out.line('contains');
    out.block(() => {
      out.append(functions);
      helpers.write(out, (helper, helperName) => helper.code({words, kinds: kinds(helperName)}));
    });
  }
  out.line('end program main');
  const {code: text, lines: sources} = out.converted();
  //a line longer than Fortran's goes on in the next, from the same line of the program
  const all = text.replace(/\n$/, '').split('\n');
  const pieces = all.map(each => wrapped(each));
  return {
    code: `${pieces.flat().join('\n')}\n`,
    lines: pieces.flatMap((each, index) => each.map(() => sources[index]))
  };
};
