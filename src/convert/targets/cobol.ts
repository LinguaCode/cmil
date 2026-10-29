/**
 * COBOL: what a teacher writes, in GnuCOBOL's free format, that prints what the CMIL program prints. The program is
 * main-program, which declares its variables in its WORKING-STORAGE: a whole number is PIC S9(18), a real number
 * COMP-2, a text PIC X(1000), whose spaces at its end are no part of it, a boolean PIC 9, 1 or 0, and a list a table
 * of up to 1000 items with its count. COBOL computes numbers in COMPUTE, puts texts together in CONCATENATE and tests
 * conditions in IF, so a value the one needs of the other, like a number in a text, is kept in a variable first; a
 * number is written by MOVE into an edited field, like PIC -(18)9. A function of the program is a program of its own,
 * IS RECURSIVE, which CALL gives its values and a variable for its result, and the helpers are programs too, after
 * them, each with what it is for. A name that is a word of COBOL, like count, or of C, is the-count, and _ is -.
 */
import {COMMAND} from '../../constants/index.ts';
import TRANSLATION from '../../translations/index.ts';
import {Grammar, UNARY, mathOf, signedTest, type Code} from '../code.ts';
import {
  Before,
  Helpers,
  Names,
  Trivia,
  type FixedArrays,
  Writer,
  assignedIn,
  callsIn,
  definitionOf,
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
import {branchesApart, loopMade, loopOf, statementsOf, testsOf, type Braces} from '../statements.ts';
import {isList, type Type, type Types} from '../types.ts';
import type {ProgramTree} from '../../program.ts';
import type {Writers} from '../registry.ts';
import type {Expression, Statement} from '../../core/types.ts';

//the names a name of the program can't be, whatever its case, in small letters: the words of GnuCOBOL a variable
//can't be named, of those it reserves, the names of C a program can't be, since GnuCOBOL makes it a function of C,
//and the names of the program and of the helpers
const RESERVED = new Set(
  [
    'absent accept access active-class add address advancing after aligned all allocate alphabet alphabetic',
    'alphabetic-lower alphabetic-upper alphanumeric alphanumeric-edited also alter alternate and any anycase are',
    'area areas argument-number argument-value as ascending assign at auto automatic auto-skip autoterminate',
    'background-colour background-high background-low background-standard b-and based beep before binary binary-char',
    'binary-c-long binary-double binary-int binary-long binary-long-long binary-short bit blank block b-not bool',
    'boolean b-or bottom break b-xor by call cancel case catch cd cells center cf ch chain chaining char character',
    'characters class class-id classification close code code-set col collating color colours cols column columns',
    'comma command-line commit common communication comp comp-0 comp-1 comp-2 comp-3 comp-4 comp-5 comp-6 comp-n',
    'computational computational-0 computational-1 computational-2 computational-3 computational-4 computational-5',
    'computational-6 computational-n computational-x compute comp-x condition configuration const constant contains',
    'contains-booleans contains-reals contains-text contains-texts contains-wholes content continue control controls',
    'converting copy corr corresponding count crt crt-under currency cursor data data-pointer date day day-of-week',
    'de debugging decimal-point declaratives default default-font delete delimited delimiter depending descending',
    'destination destroy detail disable display divide division do double down duplicates dynamic ec echo egi else',
    'emi empty-check enable end end-accept end-add end-call end-chain end-compute end-delete end-display end-divide',
    'end-evaluate end-if end-json end-multiply end-of-page end-perform end-read end-receive end-return end-rewrite',
    'end-search end-start end-string end-subtract end-unstring end-write end-xml entry enum environment',
    'environment-name environment-value eo eop equal equals error escape esi evaluate event exception',
    'exception-object exclusive exhibit exit extend extern external external-form factory false fd file file-control',
    'file-id filler final first fixed fixed-font float float-binary-128 float-binary-32 float-binary-64',
    'float-decimal-16 float-decimal-34 float-extended float-infinity floating float-long float-short font footing',
    'fopen for foreground-colour format free friend from function function-id function-pointer generate get giving',
    'global go goback goto greater group group-usage handle heading high-value high-values id identification',
    'identified if ignore in index indexed indicate inherits initial initialise initialised initialize initiate',
    'inline input input-output inquire inspect int interface interface-id into invalid invoke i-o i-o-control is',
    'join-booleans join-reals join-texts join-wholes json json-code just justified kept key label large-font last',
    'layout-manager leading left left-justify leftline length length-check less letter-count letter-of letters like',
    'limit limits linage linage-counter line line-counter lines linkage list-count list-item lm-resize locale',
    'local-storage lock long low-value low-values main main-program manual medium-font memcpy menu merge message',
    'method method-id minus mode modify move multiple multiply namespace national national-edited native negative',
    'nested new next no no-echo not nothing null nulls number number-of-call-parameters numbers numeric',
    'numeric-edited object object-computer object-reference occurs of off omitted on only open operator optional',
    'options or order organisation organization other output overflow overline override packed-decimal padding page',
    'page-counter parse perform pf ph physical pic picture pixels plus pointer pos position positive present printf',
    'printing priority private procedure procedure-pointer procedures proceed program program-id program-pointer',
    'prompt property protected prototype public purge puts queue quote quotes raise raising random random-seed rd',
    'read receive record recording records redefines reel reference references register relative release remainder',
    'removal remove-booleans remove-reals remove-texts remove-wholes renames replace replacing report reporting',
    'reports repository reserve reset restrict resume retry return return-code returning reverse reversed rewind',
    'rewrite rf rh right right-justify rollback rounded round-to run same screen sd search section segment',
    'segment-limit select self send sentence separate sequence sequential set sharing short show-real sign signed',
    'signed-int signed-long signed-short size sizeof small-font sort',
    'sort-merge sort-return source source-computer sources space space-fill spaces special-names split-at',
    'split-words standard standard-1 standard-2 start static status stderr stdin stdout stop strcmp string strlen',
    'struct sub-queue-1 sub-queue-2 sub-queue-3 subtract subwindow sum super suppress switch symbolic sync',
    'synchronised synchronized system-default system-offset table tally tallying template terminate test text than',
    'the-list then this thread threads through throw thru time timeout times to top traditional-font trailing',
    'trailing-sign transform true try type typedef union unit universal unlock unsigned unsigned-int unsigned-long',
    'unsigned-short unstring until up update upon usage use user-default using valid validate validate-status',
    'val-status value values variant varying virtual void volatile wait when when-compiled while window with words',
    'working-storage write xml xml-code zero zeroes zeros'
  ]
    .join(' ')
    .split(' ')
);

//the kinds of values, and how COBOL declares each
type Kind = 'whole' | 'real' | 'text' | 'boolean';
const PICTURE: Record<Kind, string> = {whole: 'PIC S9(18)', real: 'COMP-2', text: 'PIC X(1000)', boolean: 'PIC 9'};
//the plural in the names of the helpers of lists of a kind, like join-wholes
const PLURAL: Record<Kind, string> = {whole: 'wholes', real: 'reals', text: 'texts', boolean: 'booleans'};

const kindOf = (type: Type): Kind =>
  type === 'real' ? 'real' : type === 'text' ? 'text' : type === 'boolean' ? 'boolean' : 'whole';

//a table of a kind: its count and its items, up to 1000
const table = (name: string, kind: Kind, linkage = false) => [
  `01 ${name}.`,
  `    05 ${name}-count PIC 9(9)${linkage ? '' : ' VALUE 0'}.`,
  `    05 ${name}-item ${PICTURE[kind]} OCCURS 0 TO 1000 TIMES DEPENDING ON ${name}-count.`
];

//the precedence of the operators of COMPUTE, from the loosest; a sign binds more tightly than **
const ARITHMETIC: Record<string, number> = {'+': 1, '-': 1, '*': 2, '/': 2, '**': 3};
const arithmetic = new Grammar(ARITHMETIC, new Set(), ['(', ')']);
//the precedence of the operators of a condition, from the loosest: a comparison binds the most tightly
const LOGIC: Record<string, number> = {OR: 1, AND: 2, '=': 4, 'NOT =': 4, '<': 4, '>': 4, '<=': 4, '>=': 4};
const NOT = 3;
const logic = new Grammar(LOGIC);
const name = (text: string) => arithmetic.atom(text);

//a power, whose exponent may have a sign, like 2 ** -1
const power = (base: Code, exponent: Code) => arithmetic.binary('**', base, exponent, [ARITHMETIC['**'] + 1, UNARY]);

//a number as COBOL writes it, with all its digits, since a literal of COBOL has no exponent
const numeral = (value: number): string => {
  const text = String(value);
  if (!text.includes('e')) return text;
  return Math.abs(value) < 1
    ? value.toLocaleString('en-US', {useGrouping: false, maximumSignificantDigits: 17})
    : value.toLocaleString('en-US', {useGrouping: false, maximumFractionDigits: 0});
};

//the parts of a text literal, in double quotes with "" for a quote, and a new line and a tab as X"0A" and X"09"
const literalParts = (text: string): string[] =>
  text
    .split(/([\n\t])/)
    .filter(part => part !== '')
    .map(part => (part === '\n' ? 'X"0A"' : part === '\t' ? 'X"09"' : `"${part.replaceAll('"', '""')}"`));

//the bytes of a text, of UTF-8, which COBOL counts
const bytes = (text: string) => new TextEncoder().encode(text).length;

//the blocks of COBOL, ended by END-IF, END-PERFORM and END-EVALUATE
const BLOCKS: Braces = {head: text => text, tail: text => text, empty: 'CONTINUE'};

//the value of a number of numbers only, like -1 or 2 * 3, which CMIL computes the same way
const constant = (node: Expression): number | null => {
  if (node.type === 'value') return typeof node.value === 'number' && !node.constant ? node.value : null;
  if (node.type === 'unary' && node.operator === '-') {
    const operand = constant(node.operand);
    return operand === null ? null : -operand;
  }
  if (node.type !== 'binary' || !['+', '-', '*', '/'].includes(node.operator)) return null;
  const [left, right] = [constant(node.left), constant(node.right)];
  if (left === null || right === null) return null;
  return {'+': left + right, '-': left - right, '*': left * right, '/': left / right}[node.operator]!;
};

type HelperContext = {words: [string, string]; kinds: Kind[]};
type Helper = {code: (context: HelperContext) => string[]; uses?: string[]};

//a program of a helper, with its local variables, the values it is given and its statements
const program = (
  title: string,
  comment: string[],
  locals: string[],
  linkage: string[],
  using: string,
  body: string[]
) => [
  ...comment.map(line => `*> ${line}`),
  'IDENTIFICATION DIVISION.',
  `PROGRAM-ID. ${title}.`,
  'DATA DIVISION.',
  ...(locals.length ? ['LOCAL-STORAGE SECTION.', ...locals] : []),
  'LINKAGE SECTION.',
  ...linkage,
  `PROCEDURE DIVISION USING ${using}.`,
  ...body.map(line => `    ${line}`),
  '    GOBACK.',
  `END PROGRAM ${title}.`
];

//an item of a list as it is printed, put into shown at place
const itemText = (kind: Kind, words: [string, string]) => {
  switch (kind) {
    case 'whole':
      return [
        'MOVE list-item(i) TO whole-text',
        `STRING FUNCTION TRIM(whole-text) DELIMITED BY SIZE INTO shown WITH POINTER place`
      ];
    case 'real':
      return [
        'CALL "show-real" USING list-item(i) item-shown',
        `STRING FUNCTION TRIM(item-shown TRAILING) DELIMITED BY SIZE INTO shown WITH POINTER place`
      ];
    case 'boolean':
      return [
        'IF list-item(i) = 1',
        `    STRING ${literalParts(words[0]).join(' ')} DELIMITED BY SIZE INTO shown WITH POINTER place`,
        'ELSE',
        `    STRING ${literalParts(words[1]).join(' ')} DELIMITED BY SIZE INTO shown WITH POINTER place`,
        'END-IF'
      ];
    case 'text':
      return [`STRING FUNCTION TRIM(list-item(i) TRAILING) DELIMITED BY SIZE INTO shown WITH POINTER place`];
  }
};
//the local variables the items of a list of a kind are printed by
const itemLocals = (kind: Kind) =>
  kind === 'whole' ? ['01 whole-text PIC -(18)9.'] : kind === 'real' ? ['01 item-shown PIC X(1000).'] : [];

//the helpers, by name, in the order they are written: the helpers they use, and their code, for the kinds of the
//lists they are written for
const HELPERS: Record<string, Helper> = {
  showReal: {
    code: () =>
      program(
        'show-real',
        [
          'a real number as CMIL prints it: a whole one with all its digits, any other with up to 12 digits that',
          'count, and never with an exponent'
        ],
        [
          '01 whole-text PIC -(18)9.',
          '01 magnitude COMP-2.',
          '01 fraction COMP-2.',
          '01 exponent PIC S9(4).',
          '01 digits PIC 9(13).',
          '01 digits-text PIC 9(12).',
          '01 used PIC 99.',
          '01 zero-letters PIC X(400) VALUE ALL "0".',
          '01 place PIC 9(4).'
        ],
        ['01 number-value COMP-2.', '01 shown PIC X(1000).'],
        'number-value shown',
        [
          'MOVE SPACES TO shown',
          'COMPUTE fraction = number-value - FUNCTION INTEGER-PART(number-value)',
          'IF fraction = 0 AND FUNCTION ABS(number-value) < 9007199254740992',
          '    MOVE number-value TO whole-text',
          '    MOVE FUNCTION TRIM(whole-text) TO shown',
          '    GOBACK',
          'END-IF',
          '*> the 12 digits that count, without the zeros at their end, and the place of the first one',
          'COMPUTE magnitude = FUNCTION ABS(number-value)',
          'COMPUTE exponent = FUNCTION INTEGER(FUNCTION LOG10(magnitude))',
          'COMPUTE digits ROUNDED = magnitude / 10 ** (exponent - 11)',
          'IF digits >= 1000000000000',
          '    ADD 1 TO exponent',
          '    COMPUTE digits ROUNDED = magnitude / 10 ** (exponent - 11)',
          'END-IF',
          'IF digits < 100000000000',
          '    SUBTRACT 1 FROM exponent',
          '    COMPUTE digits ROUNDED = magnitude / 10 ** (exponent - 11)',
          'END-IF',
          'MOVE digits TO digits-text',
          'MOVE 12 TO used',
          'PERFORM UNTIL used = 1 OR digits-text(used:1) NOT = "0"',
          '    SUBTRACT 1 FROM used',
          'END-PERFORM',
          'MOVE 1 TO place',
          'IF number-value < 0',
          '    STRING "-" DELIMITED BY SIZE INTO shown WITH POINTER place',
          'END-IF',
          'EVALUATE TRUE',
          'WHEN exponent < 0',
          '    STRING "0." DELIMITED BY SIZE INTO shown WITH POINTER place',
          '    IF exponent < -1',
          '        STRING zero-letters(1:-1 - exponent) DELIMITED BY SIZE INTO shown WITH POINTER place',
          '    END-IF',
          '    STRING digits-text(1:used) DELIMITED BY SIZE INTO shown WITH POINTER place',
          'WHEN exponent + 1 >= used',
          '    STRING digits-text(1:used) DELIMITED BY SIZE INTO shown WITH POINTER place',
          '    IF exponent + 1 > used',
          '        STRING zero-letters(1:exponent + 1 - used) DELIMITED BY SIZE INTO shown WITH POINTER place',
          '    END-IF',
          'WHEN OTHER',
          '    STRING digits-text(1:exponent + 1) "." digits-text(exponent + 2:used - exponent - 1)',
          '        DELIMITED BY SIZE INTO shown WITH POINTER place',
          'END-EVALUATE'
        ]
      )
  },
  join: {
    code: ({words, kinds}) =>
      kinds.flatMap((kind, index) => [
        ...(index ? [''] : []),
        ...program(
          `join-${PLURAL[kind]}`,
          index ? [] : ['the items of a list as they are printed, with a separator of a length between them'],
          ['01 i PIC 9(9).', '01 place PIC 9(9).', ...itemLocals(kind)],
          [
            ...table('the-list', kind, true).map(line => line.replace(/the-list-/g, 'list-')),
            '01 separator PIC X(1000).',
            '01 separator-length PIC S9(18).',
            '01 shown PIC X(1000).'
          ],
          'the-list separator separator-length shown',
          [
            'MOVE SPACES TO shown',
            'MOVE 1 TO place',
            'PERFORM VARYING i FROM 1 BY 1 UNTIL i > list-count',
            '    IF i > 1 AND separator-length > 0',
            '        STRING separator(1:separator-length) DELIMITED BY SIZE INTO shown WITH POINTER place',
            '    END-IF',
            ...itemText(kind, words).map(line => `    ${line}`),
            'END-PERFORM'
          ]
        )
      ])
  },
  contains: {
    code: ({kinds}) =>
      kinds.flatMap((kind, index) => [
        ...(index ? [''] : []),
        ...program(
          `contains-${PLURAL[kind]}`,
          index ? [] : ['whether a list has an item'],
          ['01 i PIC 9(9).'],
          [
            ...table('the-list', kind, true).map(line => line.replace(/the-list-/g, 'list-')),
            `01 wanted ${PICTURE[kind]}.`,
            '01 found PIC 9.'
          ],
          'the-list wanted found',
          [
            'MOVE 0 TO found',
            'PERFORM VARYING i FROM 1 BY 1 UNTIL i > list-count OR found = 1',
            '    IF list-item(i) = wanted',
            '        MOVE 1 TO found',
            '    END-IF',
            'END-PERFORM'
          ]
        )
      ])
  },
  remove: {
    code: ({kinds}) =>
      kinds.flatMap((kind, index) => [
        ...(index ? [''] : []),
        ...program(
          `remove-${PLURAL[kind]}`,
          index ? [] : ['removes the first item of a list that is a value'],
          ['01 i PIC 9(9).', '01 j PIC 9(9).'],
          [
            ...table('the-list', kind, true).map(line => line.replace(/the-list-/g, 'list-')),
            `01 wanted ${PICTURE[kind]}.`
          ],
          'the-list wanted',
          [
            'PERFORM VARYING i FROM 1 BY 1 UNTIL i > list-count',
            '    IF list-item(i) = wanted',
            '        PERFORM VARYING j FROM i BY 1 UNTIL j >= list-count',
            '            MOVE list-item(j + 1) TO list-item(j)',
            '        END-PERFORM',
            '        SUBTRACT 1 FROM list-count',
            '        GOBACK',
            '    END-IF',
            'END-PERFORM'
          ]
        )
      ])
  },
  letterCount: {
    code: () =>
      program(
        'letter-count',
        ['the letters of a text: a letter like ա has more than one byte, and each byte after its first is 10xxxxxx'],
        ['01 i PIC 9(9).', '01 byte-value PIC 9(3).'],
        ['01 the-text PIC X(1000).', '01 letter-total PIC S9(18).'],
        'the-text letter-total',
        [
          'MOVE 0 TO letter-total',
          'PERFORM VARYING i FROM 1 BY 1 UNTIL i > FUNCTION LENGTH(FUNCTION TRIM(the-text TRAILING))',
          '    COMPUTE byte-value = FUNCTION ORD(the-text(i:1)) - 1',
          '    IF byte-value < 128 OR byte-value >= 192',
          '        ADD 1 TO letter-total',
          '    END-IF',
          'END-PERFORM'
        ]
      )
  },
  letterOf: {
    code: () =>
      program(
        'letter-of',
        ['the letter of a text at a place, from 1, with all the bytes of a letter like ա'],
        ['01 i PIC 9(9).', '01 letters-seen PIC S9(18).', '01 byte-value PIC 9(3).', '01 place PIC 9(4).'],
        ['01 the-text PIC X(1000).', '01 wanted-place PIC S9(18).', '01 letter PIC X(1000).'],
        'the-text wanted-place letter',
        [
          'MOVE SPACES TO letter',
          'MOVE 0 TO letters-seen',
          'MOVE 1 TO place',
          'PERFORM VARYING i FROM 1 BY 1 UNTIL i > 1000',
          '    COMPUTE byte-value = FUNCTION ORD(the-text(i:1)) - 1',
          '    IF byte-value < 128 OR byte-value >= 192',
          '        ADD 1 TO letters-seen',
          '    END-IF',
          '    IF letters-seen = wanted-place',
          '        STRING the-text(i:1) DELIMITED BY SIZE INTO letter WITH POINTER place',
          '    END-IF',
          '    IF letters-seen > wanted-place',
          '        GOBACK',
          '    END-IF',
          'END-PERFORM'
        ]
      )
  },
  letters: {
    code: () =>
      program(
        'letters',
        ['the letters of a text, each a text of its own, into a list'],
        ['01 i PIC 9(9).', '01 byte-value PIC 9(3).', '01 place PIC 9(4).'],
        [
          '01 the-text PIC X(1000).',
          ...table('the-list', 'text', true).map(line => line.replace(/the-list-/g, 'list-'))
        ],
        'the-text the-list',
        [
          'MOVE 0 TO list-count',
          'PERFORM VARYING i FROM 1 BY 1 UNTIL i > FUNCTION LENGTH(FUNCTION TRIM(the-text TRAILING))',
          '    COMPUTE byte-value = FUNCTION ORD(the-text(i:1)) - 1',
          '    IF byte-value < 128 OR byte-value >= 192',
          '        ADD 1 TO list-count',
          '        MOVE SPACES TO list-item(list-count)',
          '        MOVE 1 TO place',
          '    END-IF',
          '    STRING the-text(i:1) DELIMITED BY SIZE INTO list-item(list-count) WITH POINTER place',
          'END-PERFORM'
        ]
      )
  },
  splitWords: {
    code: () =>
      program(
        'split-words',
        ['the words of a text, between its spaces, into a list'],
        ['01 i PIC 9(9).', '01 place PIC 9(4).', '01 in-word PIC 9 VALUE 0.'],
        [
          '01 the-text PIC X(1000).',
          ...table('the-list', 'text', true).map(line => line.replace(/the-list-/g, 'list-'))
        ],
        'the-text the-list',
        [
          'MOVE 0 TO list-count',
          'PERFORM VARYING i FROM 1 BY 1 UNTIL i > 1000',
          '    IF the-text(i:1) = SPACE OR the-text(i:1) = X"09" OR the-text(i:1) = X"0A"',
          '        MOVE 0 TO in-word',
          '    ELSE',
          '        IF in-word = 0',
          '            ADD 1 TO list-count',
          '            MOVE SPACES TO list-item(list-count)',
          '            MOVE 1 TO place',
          '            MOVE 1 TO in-word',
          '        END-IF',
          '        STRING the-text(i:1) DELIMITED BY SIZE INTO list-item(list-count) WITH POINTER place',
          '    END-IF',
          'END-PERFORM'
        ]
      )
  },
  splitAt: {
    code: () =>
      program(
        'split-at',
        ['the parts of a text between a separator of a length, with the empty ones, into a list'],
        ['01 i PIC 9(9).', '01 size-of PIC 9(9).', '01 place PIC 9(4).'],
        [
          '01 the-text PIC X(1000).',
          '01 separator PIC X(1000).',
          '01 separator-length PIC S9(18).',
          ...table('the-list', 'text', true).map(line => line.replace(/the-list-/g, 'list-'))
        ],
        'the-text separator separator-length the-list',
        [
          'MOVE FUNCTION LENGTH(FUNCTION TRIM(the-text TRAILING)) TO size-of',
          'MOVE 1 TO list-count',
          'MOVE SPACES TO list-item(1)',
          'MOVE 1 TO place',
          'MOVE 1 TO i',
          'PERFORM UNTIL i > size-of',
          '    IF the-text(i:separator-length) = separator(1:separator-length)',
          '        ADD 1 TO list-count',
          '        MOVE SPACES TO list-item(list-count)',
          '        MOVE 1 TO place',
          '        ADD separator-length TO i',
          '    ELSE',
          '        STRING the-text(i:1) DELIMITED BY SIZE INTO list-item(list-count) WITH POINTER place',
          '        ADD 1 TO i',
          '    END-IF',
          'END-PERFORM'
        ]
      )
  },
  containsText: {
    code: () =>
      program(
        'contains-text',
        ['whether a text has a part of a length'],
        ['01 i PIC 9(9).'],
        ['01 the-text PIC X(1000).', '01 part PIC X(1000).', '01 part-length PIC S9(18).', '01 found PIC 9.'],
        'the-text part part-length found',
        [
          'MOVE 0 TO found',
          'IF part-length = 0',
          '    MOVE 1 TO found',
          '    GOBACK',
          'END-IF',
          'PERFORM VARYING i FROM 1 BY 1 UNTIL i + part-length > 1001 OR found = 1',
          '    IF the-text(i:part-length) = part(1:part-length)',
          '        MOVE 1 TO found',
          '    END-IF',
          'END-PERFORM'
        ]
      )
  },
  roundTo: {
    uses: ['showReal'],
    code: () =>
      program(
        'round-to',
        ['a number rounded to a count of decimals, a half up, after rounding it like it is printed, so 1.005 is 1.01'],
        ['01 scaled COMP-2.', '01 shown PIC X(1000).'],
        ['01 number-value COMP-2.', '01 decimals PIC S9(18).', '01 rounded-value COMP-2.'],
        'number-value decimals rounded-value',
        [
          'COMPUTE scaled = number-value * 10 ** decimals',
          'CALL "show-real" USING scaled shown',
          'COMPUTE rounded-value = FUNCTION INTEGER(FUNCTION NUMVAL(shown) + 0.5) / 10 ** decimals'
        ]
      )
  }
};

//the kinds of temporary variables a statement needs, and the names they are given
type Slot = Kind | 'shown' | `list-${Kind}`;
const SLOT_NAMES: Record<string, string> = {
  whole: 'whole-value',
  real: 'real-value',
  text: 'text-value',
  boolean: 'flag',
  shown: 'shown-number'
};

/**
 * What COBOL's tables can't hold, besides what no language of them can: a function that gives a list, and a loop that
 * changes the list it goes over.
 */
export const COBOL_ARRAYS: FixedArrays = {listResults: true, changedLoops: true};

/**
 * Writes a program in COBOL, which COBOL_ARRAYS can hold.
 */
export const toCobol = (tree: ProgramTree, types: Types, sourceCode: string): Converted => {
  const names = new Names(tree.names, RESERVED, {
    caseless: true,
    latin: true,
    //a name of COBOL has - for _, and starts and ends with a letter or a digit
    rewrite: spelling => spelling.replaceAll('_', '-').replace(/^-+|-+$/g, ''),
    apart: spelling => `the-${spelling}`
  });
  const trivia = new Trivia(tree.comments, sourceCode, '*>');
  const helpers = new Helpers(HELPERS);
  const forKinds = new Map<string, Set<Kind>>();
  const {words: commands} = TRANSLATION[tree.language];
  const words: [string, string] = [commands.true[0], commands.false[0]];
  const definitions = tree.statements.filter(
    (statement): statement is Statement & {type: 'function'} => statement.type === 'function'
  );
  //the lines a statement needs first, like a call whose result it uses
  const pending = new Before();
  //the temporary variables of the program being written, by their kind, which each statement takes from the first,
  //and the declarations of the variables the conversion adds to it
  let pools = new Map<Slot, string[]>();
  let taken = new Map<Slot, number>();
  let added = new Map<string, string[]>();
  let random = false;
  //whether a function of the program is being written, rather than the program
  let inFunction = false;
  //the function being written: the variable of its result, and the return that ends it
  let result: {variable: string; type: Type} | undefined;
  let finalReturn: Statement | undefined;

  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';

  //the kind of the items of a list, which tables have only of numbers, texts and booleans
  const itemKind = (list: Type): Kind => {
    const item = isList(list) ? list.list : 'unknown';
    return kindOf(item);
  };

  //a helper of lists for the kind of a list
  const listHelper = (helper: string, kind: Kind) => {
    helpers.use(helper);
    if (!forKinds.has(helper)) forKinds.set(helper, new Set());
    forKinds.get(helper)!.add(kind);
    if (kind === 'real' && (helper === 'showList' || helper === 'join')) helpers.use('showReal');
  };

  //the declaration of a variable of a type
  const declaration = (type: Type, variable: string): string[] =>
    isList(type) ? table(variable, itemKind(type)) : [`01 ${variable} ${PICTURE[kindOf(type)]}.`];

  //a temporary variable of a kind, of those the statement hasn't taken yet; a lasting one is the loop's, which the
  //statements in it don't take
  const slot = (kind: Slot, lasting = false): string => {
    const base = SLOT_NAMES[kind] ?? 'items';
    //a kind is a type of CMIL, as its name says, and a shown number an edited field
    const declare = (variable: string) => {
      const type: Type = kind.startsWith('list-') ? {list: kind.slice(5) as Type} : (kind as Type);
      added.set(variable, kind === 'shown' ? [`01 ${variable} PIC -(18)9.`] : declaration(type, variable));
      return variable;
    };
    if (lasting) return declare(names.fresh([base]));
    const pool = pools.get(kind) ?? [];
    pools.set(kind, pool);
    const index = taken.get(kind) ?? 0;
    taken.set(kind, index + 1);
    if (!pool[index]) pool[index] = declare(names.fresh([base]));
    return pool[index];
  };

  //an arithmetic expression, for COMPUTE
  const number = (node: Expression): Code => {
    switch (node.type) {
      case 'value':
        if (node.constant === 'pi') return name('FUNCTION PI');
        if (node.constant === 'e') return name('FUNCTION E');
        if (typeof node.value === 'number')
          return arithmetic.atom(numeral(node.value), node.value < 0 ? UNARY : undefined);
        return name(node.value ? '1' : '0');
      case 'variable':
        return name(names.of(node.name));
      case 'index':
        if (isList(typeOf(node.target)))
          return arithmetic.index(name(`${listOf(node.target)}-item`), number(node.index));
        return name(variableOf(node, 'whole'));
      case 'input':
        return arithmetic.call('FUNCTION NUMVAL', [name(variableOf(node, 'text'))]);
      case 'userCall':
        return name(called(node));
      case 'unary':
        if (node.operator === COMMAND.NOT) return name(variableOf(node, 'boolean'));
        return arithmetic.unary(node.operator, number(node.operand));
      case 'binary': {
        if (node.operator === '%') return arithmetic.call('FUNCTION REM', [number(node.left), number(node.right)]);
        if (['+', '-', '*', '/'].includes(node.operator) && typeOf(node) !== 'text' && typeOf(node) !== 'boolean') {
          return arithmetic.binary(node.operator, number(node.left), number(node.right));
        }
        //a comparison, 1 or 0
        return name(variableOf(node, 'boolean'));
      }
      case 'call':
        return builtIn(node);
      default:
        throw new Error(`No COBOL number for ${node.type}`);
    }
  };

  const builtIn = (node: Expression & {type: 'call'}): Code => {
    const [first] = node.args;
    const args = () => node.args.map(number);
    switch (node.name) {
      case COMMAND.POW:
        return power(number(first), number(node.args[1]));
      case COMMAND.SQR:
        return first.type === 'variable' || first.type === 'value'
          ? arithmetic.binary('*', number(first), number(first))
          : power(number(first), name('2'));
      case COMMAND.ROUND: {
        if (node.args.length === 2) {
          helpers.use('roundTo');
          const value = variableOf(first, 'real');
          const digits = variableOf(node.args[1], 'whole');
          const rounded = slot('real');
          pending.add([`CALL "round-to" USING ${value} ${digits} ${rounded}`]);
          return name(rounded);
        }
        if (typeOf(first) === 'whole') return number(first);
        return arithmetic.call('FUNCTION INTEGER', [arithmetic.binary('+', number(first), name('0.5'))]);
      }
      case COMMAND.FLOOR:
        return typeOf(first) === 'whole' ? number(first) : arithmetic.call('FUNCTION INTEGER', args());
      case COMMAND.CEIL:
        //the ceiling of a number is the floor of its opposite, turned around
        return typeOf(first) === 'whole'
          ? number(first)
          : arithmetic.unary('-', arithmetic.call('FUNCTION INTEGER', [arithmetic.unary('-', number(first))]));
      case COMMAND.ABS:
        return arithmetic.call('FUNCTION ABS', args());
      case COMMAND.RANDOM: {
        random = true;
        const [min, max] = node.args.length === 1 ? [null, first] : node.args;
        const count = min
          ? arithmetic.binary('+', arithmetic.binary('-', number(max), number(min)), name('1'))
          : number(max);
        const drawn = arithmetic.call('FUNCTION INTEGER', [arithmetic.binary('*', name('FUNCTION RANDOM'), count)]);
        return arithmetic.binary('+', drawn, min ? number(min) : name('1'));
      }
      case COMMAND.LENGTH: {
        if (isList(typeOf(first))) return name(`${listOf(first)}-count`);
        helpers.use('letterCount');
        const count = slot('whole');
        pending.add([`CALL "letter-count" USING ${variableOf(first, 'text')} ${count}`]);
        return name(count);
      }
      case COMMAND.NUMBER:
        if (typeOf(first) === 'text') return arithmetic.call('FUNCTION NUMVAL', [name(textOperand(first))]);
        return number(first);
    }
    const formula = mathOf(
      arithmetic,
      node.name,
      args(),
      (method, values) => arithmetic.call(`FUNCTION ${method.toUpperCase()}`, values),
      () => name('FUNCTION PI')
    );
    if (formula) return formula;
    throw new Error(`No COBOL number for ${node.name}`);
  };

  //the name of a list's table: its variable, or a table given its items first
  const listOf = (node: Expression, lasting = false): string => {
    if (node.type === 'variable') return names.of(node.name);
    const type = typeOf(node);
    const items = slot(`list-${itemKind(type)}`, lasting);
    fill(items, node);
    return items;
  };

  //the lines that give a table the items of a list: of a list of items, or of split()
  const fill = (items: string, node: Expression) => {
    const kind = itemKind(typeOf(node));
    if (node.type === 'list') {
      pending.add([`MOVE ${node.items.length} TO ${items}-count`]);
      node.items.forEach((item, index) => pending.add(into(`${items}-item(${index + 1})`, item, kind)));
      return;
    }
    if (node.type === 'call' && node.name === COMMAND.SPLIT) {
      const [text, separator] = node.args;
      if (!separator) {
        helpers.use('splitWords');
        pending.add([`CALL "split-words" USING ${variableOf(text, 'text')} ${items}`]);
      } else if (isText(separator) && separator.value === '') {
        helpers.use('letters');
        pending.add([`CALL "letters" USING ${variableOf(text, 'text')} ${items}`]);
      } else {
        helpers.use('splitAt');
        const [value, length] = sized(separator);
        pending.add([`CALL "split-at" USING ${variableOf(text, 'text')} ${value} ${length} ${items}`]);
      }
      return;
    }
    throw new Error('No COBOL table for a list from another list or a function');
  };

  //a text and its length in bytes, which a text of COBOL, padded with spaces, doesn't keep: that of a text of the
  //program, else that of its letters without the spaces at its end
  const sized = (node: Expression): [string, string] => {
    const value = variableOf(node, 'text');
    const length = slot('whole');
    pending.add([
      isText(node)
        ? `MOVE ${bytes(node.value)} TO ${length}`
        : `MOVE FUNCTION LENGTH(FUNCTION TRIM(${value} TRAILING)) TO ${length}`
    ]);
    return [value, length];
  };

  //the lines that give a variable, or an item, a value of a kind
  const into = (target: string, node: Expression, kind: Kind): string[] => {
    const mark = pending.mark;
    let lines: string[];
    if (kind === 'text') {
      const parts = textParts(node);
      lines = [
        parts.length === 0
          ? `MOVE SPACES TO ${target}`
          : `MOVE ${parts.length === 1 ? parts[0] : `FUNCTION CONCATENATE(${parts.join(', ')})`} TO ${target}`
      ];
    } else if (kind === 'boolean') {
      if (node.type === 'value' || node.type === 'variable') lines = [`MOVE ${fortrue(node)} TO ${target}`];
      else if (node.type === 'userCall') lines = [`MOVE ${called(node)} TO ${target}`];
      else if (node.type === 'index' && isList(typeOf(node.target))) lines = [`MOVE ${itemOf(node)} TO ${target}`];
      else {
        const test = logic.print(condition(node));
        lines = [`IF ${test}`, `    MOVE 1 TO ${target}`, 'ELSE', `    MOVE 0 TO ${target}`, 'END-IF'];
      }
    } else if (node.type === 'input') {
      const text = slot('text');
      lines = [`ACCEPT ${text}`, `COMPUTE ${target} = FUNCTION NUMVAL(${text})`];
    } else {
      lines = [computed(target, node)];
    }
    return [...linesOf(pending.take(mark)), ...lines];
  };
  //an item of a list in its table, like scores-item(i)
  const itemOf = (node: Expression & {type: 'index'}) =>
    `${listOf(node.target)}-item(${arithmetic.print(number(node.index))})`;
  //a number given to a variable: by MOVE when it is a number, a variable or an item of a table, else by COMPUTE; in a
  //function, GnuCOBOL builds a COMPUTE of numbers only, or of one item, in the program first, so a function moves them
  const computed = (target: string, node: Expression): string => {
    const fixed = inFunction ? constant(node) : null;
    if (fixed !== null && Number.isFinite(fixed)) return `MOVE ${numeral(fixed)} TO ${target}`;
    const value = number(node);
    const text = arithmetic.print(value);
    return value.kind === 'atom' || value.kind === 'index'
      ? `MOVE ${text} TO ${target}`
      : `COMPUTE ${target} = ${text}`;
  };
  //a boolean literal or variable as 1 or 0
  const fortrue = (node: Expression) =>
    node.type === 'value' ? (node.value ? '1' : '0') : names.of((node as {name: string}).name);

  //a variable of a kind that has a value: its own, or a temporary one given it first, as CALL needs
  const variableOf = (node: Expression, kind: Kind): string => {
    if (node.type === 'variable' && kindOf(typeOf(node)) === kind && !isList(typeOf(node))) return names.of(node.name);
    if (node.type === 'userCall' && kindOf(types.results.get(node.name)!) === kind) return called(node);
    const variable = slot(kind);
    if (node.type === 'input' && kind === 'text') pending.add([`ACCEPT ${variable}`]);
    else if (node.type === 'index' && !isList(typeOf(node.target))) {
      helpers.use('letterOf');
      pending.add([
        `CALL "letter-of" USING ${variableOf(node.target, 'text')} ${variableOf(node.index, 'whole')} ${variable}`
      ]);
    } else pending.add(into(variable, node, kind));
    return variable;
  };

  //the result of a call of a function of the program, in a variable, after the CALL
  const called = (node: Expression & {type: 'userCall'}): string => {
    const type = types.results.get(node.name)!;
    const answer = slot(kindOf(type));
    pending.add([callOf(node, answer)]);
    return answer;
  };

  //a CALL of a function of the program: a number, a text and a boolean are its own copies, BY CONTENT, a list is
  //the caller's, BY REFERENCE, and so is the variable of its result
  const callOf = (node: Expression & {type: 'userCall'}, answer?: string): string => {
    const definition = definitionOf(definitions, node.name);
    const scope = types.variables.get(node.name)!;
    let mode = '';
    const args = node.args.map((arg, index) => {
      const type = scope.get(definition.parameters[index])!;
      const [by, value] = isList(type) ? ['BY REFERENCE', listOf(arg)] : ['BY CONTENT', variableOf(arg, kindOf(type))];
      const text = by === mode ? value : `${by} ${value}`;
      mode = by;
      return text;
    });
    if (answer) args.push(mode === 'BY REFERENCE' ? answer : `BY REFERENCE ${answer}`);
    return `CALL "${names.of(node.name)}"${args.length ? ` USING ${args.join(' ')}` : ''}`;
  };

  //the parts of a text, which DISPLAY shows one after another and CONCATENATE puts together
  const textParts = (node: Expression): string[] => {
    if (isJoined(node, types)) return joinedParts(node, types).flatMap(textParts);
    if (isText(node)) return literalParts(node.value);
    const type = typeOf(node);
    //a text without the spaces at its end, which COBOL pads it with
    const trimmed = (variable: string) => [`FUNCTION TRIM(${variable} TRAILING)`];
    switch (kindOf(type)) {
      case 'text':
        if (node.type === 'variable') return trimmed(names.of(node.name));
        if (node.type === 'index' && isList(typeOf(node.target))) return trimmed(itemOf(node));
        if (node.type === 'call' && (node.name === COMMAND.UPPER || node.name === COMMAND.LOWER)) {
          const changed = node.name === COMMAND.UPPER ? 'FUNCTION UPPER-CASE' : 'FUNCTION LOWER-CASE';
          return textParts(node.args[0]).map(part => (part.startsWith('X"') ? part : `${changed}(${part})`));
        }
        if (node.type === 'call' && node.name === COMMAND.JOIN) {
          const [list, separator = {type: 'value', value: ''} as Expression] = node.args;
          const kind = itemKind(typeOf(list));
          listHelper('join', kind);
          const [value, length] = sized(separator);
          const shown = slot('text');
          pending.add([`CALL "join-${PLURAL[kind]}" USING ${listOf(list)} ${value} ${length} ${shown}`]);
          return trimmed(shown);
        }
        if (node.type === 'call' && node.name === COMMAND.TEXT) return textParts(node.args[0]);
        //an answer, a letter of a text, or the text of a function
        return trimmed(variableOf(node, 'text'));
      case 'real': {
        helpers.use('showReal');
        const value = variableOf(node, 'real');
        const shown = slot('text');
        pending.add([`CALL "show-real" USING ${value} ${shown}`]);
        return trimmed(shown);
      }
      case 'boolean': {
        const shown = slot('text');
        const test = logic.print(condition(node));
        pending.add([
          `IF ${test}`,
          `    MOVE ${literalParts(words[0]).join(' ')} TO ${shown}`,
          'ELSE',
          `    MOVE ${literalParts(words[1]).join(' ')} TO ${shown}`,
          'END-IF'
        ]);
        return trimmed(shown);
      }
      default: {
        const shown = slot('shown');
        pending.add([computed(shown, node)]);
        return [`FUNCTION TRIM(${shown})`];
      }
    }
  };

  //a text as one value, for a comparison or a function
  const textOperand = (node: Expression): string => {
    if (node.type === 'variable') return names.of(node.name);
    const parts = textParts(node);
    return parts.length === 0 ? 'SPACE' : parts.length === 1 ? parts[0] : `FUNCTION CONCATENATE(${parts.join(', ')})`;
  };

  //a condition, for IF and PERFORM UNTIL
  const condition = (node: Expression): Code => {
    switch (node.type) {
      case 'value':
        return logic.atom(node.value ? '1 = 1' : '1 = 0', LOGIC['=']);
      case 'variable':
        return logic.binary('=', name(names.of(node.name)), name('1'));
      case 'index':
        if (isList(typeOf(node.target))) return logic.binary('=', name(itemOf(node)), name('1'));
        break;
      case 'userCall':
        return logic.binary('=', name(called(node)), name('1'));
      case 'unary':
        if (node.operator === COMMAND.NOT) return logic.unary('NOT ', condition(node.operand), NOT);
        break;
      case 'binary': {
        if (node.operator === COMMAND.AND || node.operator === COMMAND.OR) {
          const operator = node.operator === COMMAND.AND ? 'AND' : 'OR';
          const first = condition(node.left);
          const mark = pending.mark;
          const second = condition(node.right);
          if (pending.mark === mark || !hasEffect(node.right)) return logic.binary(operator, first, second);
          //the right side has an effect on lines of its own, like a CALL, which CMIL computes only when the left side
          //doesn't decide: the left side in a variable first, then those lines and the right side, in an IF
          const made = pending.take(mark);
          const test = slot('boolean');
          const set = (value: Code) => [
            `IF ${logic.print(value)}`,
            `    MOVE 1 TO ${test}`,
            'ELSE',
            `    MOVE 0 TO ${test}`,
            'END-IF'
          ];
          pending.add([
            ...set(first),
            `IF ${test} = ${node.operator === COMMAND.AND ? 1 : 0}`,
            ...[...linesOf(made), ...set(second)].map(text => `    ${text}`),
            'END-IF'
          ]);
          return logic.binary('=', name(test), name('1'));
        }
        const left = typeOf(node.left);
        const right = typeOf(node.right);
        if (node.operator === COMMAND.IN) {
          const found = slot('boolean');
          if (isList(right)) {
            const kind = itemKind(right);
            listHelper('contains', kind);
            pending.add([
              `CALL "contains-${PLURAL[kind]}" USING ${listOf(node.right)} ${variableOf(node.left, kind)} ${found}`
            ]);
          } else {
            helpers.use('containsText');
            const [part, length] = sized(node.left);
            pending.add([`CALL "contains-text" USING ${variableOf(node.right, 'text')} ${part} ${length} ${found}`]);
          }
          return logic.binary('=', name(found), name('1'));
        }
        const comparisons: Record<string, string> = {
          '==': '=',
          '!=': 'NOT =',
          '<': '<',
          '>': '>',
          '<=': '<=',
          '>=': '>='
        };
        const operator = comparisons[node.operator];
        if (!operator) break;
        //values of different types are never equal in CMIL
        if ((node.operator === '==' || node.operator === '!=') && neverEqual(left, right)) {
          return logic.atom(node.operator === '==' ? '1 = 0' : '1 = 1', LOGIC['=']);
        }
        if (left === 'text') return logic.binary(operator, name(textOperand(node.left)), name(textOperand(node.right)));
        if (left === 'boolean')
          return logic.binary(
            operator,
            name(variableOf(node.left, 'boolean')),
            name(variableOf(node.right, 'boolean'))
          );
        return logic.binary(
          operator,
          name(arithmetic.print(number(node.left))),
          name(arithmetic.print(number(node.right)))
        );
      }
    }
    throw new Error(`No COBOL condition for ${node.type}`);
  };

  //the lines a statement needs first, then the statement
  const flushed = (texts: string[]) => {
    const all = [...linesOf(pending.take()), ...texts];
    taken = new Map();
    return all;
  };

  const block = statementsOf({
    trivia,
    names,
    braces: BLOCKS,
    write: (statement, context) => {
      const {comment, scope} = context;
      //writes the lines a statement needs first, then the statement, with the comment after its last line
      const lines = (texts: string[]) => {
        const all = flushed(texts);
        if (all.length) all[all.length - 1] += comment;
        all.forEach(text => context.line(text));
      };
      //the lines a loop's condition needs, before it and again before each test
      const again = (loop: Statement & {type: 'while' | 'doWhile'}) => {
        const made = loopMade(context, loop, pending.take());
        taken = new Map();
        return made;
      };
      switch (statement.type) {
        case 'print': {
          const value = statement.expression;
          const parts = textParts(value);
          lines([parts.length ? `DISPLAY ${parts.join(' ')}` : 'DISPLAY FUNCTION TRIM(SPACES)']);
          return;
        }
        case 'assign': {
          const type = scope.get(statement.name)!;
          const variable = names.of(statement.name);
          const value = statement.expression;
          if (isList(type)) {
            fill(variable, value);
            lines([]);
            return;
          }
          if (value.type === 'input' && type === 'text') {
            lines([`ACCEPT ${variable}`]);
            return;
          }
          //a whole number one more or less, or more by a whole number, by ADD and SUBTRACT
          if (
            type === 'whole' &&
            value.type === 'binary' &&
            (value.operator === '+' || value.operator === '-') &&
            value.left.type === 'variable' &&
            value.left.name === statement.name &&
            typeOf(value.right) === 'whole'
          ) {
            const by = number(value.right);
            if (by.kind === 'atom') {
              lines([
                value.operator === '+' ? `ADD ${by.text} TO ${variable}` : `SUBTRACT ${by.text} FROM ${variable}`
              ]);
              return;
            }
          }
          lines(into(variable, value, kindOf(type)));
          return;
        }
        case 'setItem': {
          const list = typeOf(statement.target);
          const item = `${listOf(statement.target)}-item(${arithmetic.print(number(statement.index))})`;
          lines(into(item, statement.expression, itemKind(list)));
          return;
        }
        case 'add': {
          const list = listOf(statement.target);
          const kind = itemKind(typeOf(statement.target));
          lines([`ADD 1 TO ${list}-count`, ...into(`${list}-item(${list}-count)`, statement.expression, kind)]);
          return;
        }
        case 'remove': {
          const kind = itemKind(typeOf(statement.target));
          listHelper('remove', kind);
          lines([
            `CALL "remove-${PLURAL[kind]}" USING ${listOf(statement.target)} ${variableOf(statement.expression, kind)}`
          ]);
          return;
        }
        case 'call': {
          const type = types.results.get(statement.call.name)!;
          lines([callOf(statement.call, type === 'unknown' ? undefined : slot(kindOf(type)))]);
          return;
        }
        case 'return': {
          const texts =
            result && statement.expression ? into(result.variable, statement.expression, kindOf(result.type)) : [];
          if (statement !== finalReturn) texts.push('GOBACK');
          if (texts.length) lines(texts);
          else if (comment) context.line(comment.trimStart());
          return;
        }
        case 'if': {
          //one test is IF, more EVALUATE TRUE, whose WHEN are tested one after another
          const tests = testsOf(statement, pending, test => logic.print(condition(test)));
          flushed([]).forEach(text => context.line(text));
          if (tests.length === 1) {
            context.blocks(
              branchesApart(statement, tests, test => `IF ${test}`, 'ELSE'),
              undefined,
              'END-IF'
            );
            return;
          }
          context.line('EVALUATE TRUE');
          context.blocks(
            branchesApart(statement, tests, test => `WHEN ${test}`, 'WHEN OTHER'),
            undefined,
            'END-EVALUATE'
          );
          return;
        }
        case 'while': {
          const test = logic.print(condition(negation(statement.condition, types)));
          context.blocks([loopOf(statement, `PERFORM UNTIL ${test}`, again(statement))], undefined, 'END-PERFORM');
          return;
        }
        case 'doWhile': {
          const test = logic.print(condition(negation(statement.condition, types)));
          const head = {
            text: `PERFORM WITH TEST AFTER UNTIL ${test}`,
            line: statement.doLine,
            body: statement.body,
            ...again(statement)
          };
          context.blocks([head], undefined, 'END-PERFORM');
          return;
        }
        case 'repeat': {
          const count = statement.count;
          const times =
            count.type === 'value' || (count.type === 'variable' && typeOf(count) === 'whole')
              ? arithmetic.print(number(count))
              : variableOf(count, 'whole');
          flushed([]).forEach(text => context.line(text));
          context.blocks([loopOf(statement, `PERFORM ${times} TIMES`)], undefined, 'END-PERFORM');
          return;
        }
        case 'for': {
          const counter = names.of(statement.name);
          const type = scope.get(statement.name)!;
          const {down, size, signed} = stepOf(statement);
          //a bound is read once, as CMIL reads it: a number or a variable the loop doesn't change as it is, any other
          //kept in a variable of the loop first
          const changed = assignedIn(statement.body);
          const once = (bound: Expression, kind: Kind): string => {
            const fixed = constant(bound);
            if (fixed !== null && Number.isFinite(fixed)) return numeral(fixed);
            if (bound.type === 'variable' && !changed.has(bound.name)) return names.of(bound.name);
            const kept = slot(kind, true);
            pending.add(into(kept, bound, kind));
            return kept;
          };
          const from = once(statement.from, kindOf(type));
          const last = once(statement.to, kindOf(typeOf(statement.to)));
          //COBOL counts down by a negative step, which BY takes as a number or a variable
          const step = size ?? ({type: 'value', value: 1} as Expression);
          const by = once(
            down ? ({type: 'unary', operator: '-', operand: step, column: 0} as Expression) : step,
            kindOf(type)
          );
          flushed([]).forEach(text => context.line(text));
          //UNTIL ends the loop: past the last value counting up or down, or, for a step whose sign shows only as the
          //program runs, past it by the sign
          const past = (operator: string) => logic.binary(operator === '<=' ? '>' : '<', name(counter), name(last));
          const until = signed
            ? logic.print(signedTest(logic, past, name(by), ['AND', 'OR']))
            : `${counter} ${down ? '<' : '>'} ${last}`;
          const head = `PERFORM VARYING ${counter} FROM ${from} BY ${by} UNTIL ${until}`;
          context.blocks([loopOf(statement, head)], undefined, 'END-PERFORM');
          return;
        }
        case 'forEach': {
          const type = typeOf(statement.expression);
          const variable = names.of(statement.name);
          const place = context.fresh(['i', 'j', 'k']);
          added.set(place, [`01 ${place} ${PICTURE.whole}.`]);
          if (isList(type)) {
            const list = listOf(statement.expression, true);
            flushed([]).forEach(text => context.line(text));
            context.blocks(
              [
                loopOf(statement, `PERFORM VARYING ${place} FROM 1 BY 1 UNTIL ${place} > ${list}-count`, {
                  first: [`MOVE ${list}-item(${place}) TO ${variable}`]
                })
              ],
              undefined,
              'END-PERFORM'
            );
            return;
          }
          //the letters of a text, each a text of its own
          helpers.use('letterCount');
          helpers.use('letterOf');
          const text = slot('text', true);
          pending.add(into(text, statement.expression, 'text'));
          const count = slot('whole', true);
          pending.add([`CALL "letter-count" USING ${text} ${count}`]);
          flushed([]).forEach(each => context.line(each));
          context.blocks(
            [
              loopOf(statement, `PERFORM VARYING ${place} FROM 1 BY 1 UNTIL ${place} > ${count}`, {
                first: [`CALL "letter-of" USING ${text} ${place} ${variable}`]
              })
            ],
            undefined,
            'END-PERFORM'
          );
          return;
        }
        case 'break':
          lines(['EXIT PERFORM']);
          return;
        case 'continue':
          context.next();
          lines(['EXIT PERFORM CYCLE']);
          return;
      }
    }
  });

  //the declarations of a program: its variables, and those the conversion adds
  const declarations = (scope: Map<string, Type>, skipped: Set<string>): string[] => [
    ...[...scope]
      .filter(([variable]) => !skipped.has(variable))
      .flatMap(([variable, type]) => declaration(type, names.of(variable))),
    ...[...added.values()].flat()
  ];

  //the functions that call themselves, by others too, which are RECURSIVE
  const recursive = new Set<string>();
  for (const definition of definitions) {
    const reached = new Set<string>();
    const visit = (from: string) =>
      callsIn(definitionOf(definitions, from)).forEach(each => {
        if (reached.has(each)) return;
        reached.add(each);
        if (definitions.some(other => other.name === each)) visit(each);
      });
    visit(definition.name);
    if (reached.has(definition.name)) recursive.add(definition.name);
  }

  //starts a program: its temporary variables are its own, so their names are free again for it
  const start = () => {
    for (const variable of added.keys()) names.release(variable);
    pools = new Map();
    taken = new Map();
    added = new Map();
  };

  const programs = new Writer('    ');
  inFunction = true;
  for (const definition of definitions) {
    start();
    const scope = types.variables.get(definition.name)!;
    const type = types.results.get(definition.name)!;
    const answer = type === 'unknown' ? undefined : names.fresh(['answer', 'result-value']);
    if (answer) names.release(answer);
    result = answer ? {variable: answer, type} : undefined;
    const last = definition.body[definition.body.length - 1];
    finalReturn = last?.type === 'return' ? last : undefined;
    const body = new Writer('    ');
    block(body, definition.body, scope, new Set(definition.parameters));

    const title = names.of(definition.name);
    trivia.before(programs, definition.line);
    programs.line('IDENTIFICATION DIVISION.', definition.line);
    programs.line(
      `PROGRAM-ID. ${title}${recursive.has(definition.name) ? ' IS RECURSIVE' : ''}.${trivia.after(definition.line)}`,
      definition.line
    );
    programs.line('DATA DIVISION.');
    const locals = declarations(scope, new Set(definition.parameters));
    if (locals.length) {
      programs.line('LOCAL-STORAGE SECTION.');
      locals.forEach(text => programs.line(text));
    }
    const linkage = [
      ...definition.parameters.flatMap(parameter => {
        const kind = scope.get(parameter)!;
        return isList(kind)
          ? table(names.of(parameter), itemKind(kind), true)
          : [`01 ${names.of(parameter)} ${PICTURE[kindOf(kind)]}.`];
      }),
      ...(answer ? [`01 ${answer} ${PICTURE[kindOf(type)]}.`] : [])
    ];
    if (linkage.length) {
      programs.line('LINKAGE SECTION.');
      linkage.forEach(text => programs.line(text));
    }
    const using = [...definition.parameters.map(parameter => names.of(parameter)), ...(answer ? [answer] : [])];
    programs.line(`PROCEDURE DIVISION${using.length ? ` USING ${using.join(' ')}` : ''}.`);
    programs.block(() => {
      programs.append(body);
      programs.line('GOBACK.');
    });
    programs.line(`END PROGRAM ${title}.`);
    programs.blank();
  }
  result = undefined;
  finalReturn = undefined;
  inFunction = false;

  start();
  const main = new Writer('    ');
  block(main, tree.statements, types.variables.get('')!, new Set());
  trivia.rest(main);
  if (random) added.set('random-seed', ['01 random-seed COMP-2.']);
  const storage = declarations(types.variables.get('')!, new Set());

  const out = new Writer('    ');
  //the format of the program, free, which a compiler reads in its first one, fixed, from the 8th column
  out.line('       >>SOURCE FORMAT FREE');
  out.line('IDENTIFICATION DIVISION.');
  out.line('PROGRAM-ID. main-program.');
  if (storage.length) {
    out.line('DATA DIVISION.');
    out.line('WORKING-STORAGE SECTION.');
    storage.forEach(text => out.line(text));
  }
  out.line('PROCEDURE DIVISION.');
  out.block(() => {
    if (random) {
      out.line('*> other random numbers each time');
      out.line('COMPUTE random-seed = FUNCTION RANDOM(FUNCTION INTEGER(FUNCTION SECONDS-PAST-MIDNIGHT * 100))');
    }
    out.append(main);
    out.line('STOP RUN.');
  });
  out.line('END PROGRAM main-program.');
  out.blank();
  out.append(programs);
  helpers.write(out, (helper, helperName) => helper.code({words, kinds: [...(forKinds.get(helperName) ?? [])]}));
  return out.converted();
};

/** The writer of COBOL: its targets, which cmil/convert/cobol gives convert(). */
export const WRITERS: Writers = {cobol: {typed: true, fixedArrays: COBOL_ARRAYS, write: toCobol}};
