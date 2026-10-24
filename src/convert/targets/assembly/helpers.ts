/**
 * The helpers of x86-64 assembly, each written once for every syntax by an Assembler: what one instruction can't say,
 * like printing a list's items or joining texts, after the program, only when it needs them.
 */
import {
  AL,
  EAX,
  type Memory,
  type Operand,
  RAX,
  RCX,
  RDI,
  RDX,
  RSI,
  RSP,
  XMM0,
  XMM1,
  at,
  item,
  number,
  register
} from './syntax.ts';

/** Writes instructions, labels and comments, each from a line of the program. */
export type Assembler = {
  //an instruction, with the comment after it, if the last of its parts is a text
  ins: (mnemonic: string, ...parts: (Operand | string)[]) => void;
  //the label of a function, and a label in a function, like next
  entry: (name: string) => void;
  label: (name: string) => void;
  //where a jump goes: a label in the function; where a call goes: a function, or one of the C library
  to: (name: string) => Operand;
  fn: (name: string) => Operand;
  lib: (name: string) => Operand;
  //a label of the data, like text1, and a symbol of the C library, like stdin
  data: (name: string, size?: 'qword' | null) => Memory;
  external: (name: string) => Memory;
  //a comment on a line of its own, before a helper
  note: (text: string) => void;
};

/** A helper: the helpers it uses, its data, by its labels, and its instructions. */
export type Helper = {
  uses?: string[];
  data?: (words: [string, string]) => [string, string | number][];
  code: (a: Assembler) => void;
};

//the kinds of the items of a list, by which its helpers are named: whole numbers, booleans and lists are 8 bytes
//compared as they are, real numbers as numbers and texts by their letters
export type Kind = 'whole' | 'real' | 'text' | 'boolean';
export const PLURAL: Record<Kind, string> = {whole: 'wholes', real: 'reals', text: 'texts', boolean: 'booleans'};
export const IN_WORDS: Record<Kind, string> = {
  whole: 'whole numbers',
  real: 'real numbers',
  text: 'texts',
  boolean: 'booleans'
};
//the kind a helper that compares items is written for: booleans are compared as whole numbers
export const compared = (kind: Kind): Exclude<Kind, 'boolean'> => (kind === 'boolean' ? 'whole' : kind);

//the start and the end of a function with variables in its frame, below rbp
export const enter = (a: Assembler, bytes: number) => {
  a.ins('push', register('rbp'));
  a.ins('mov', register('rbp'), RSP);
  if (bytes) a.ins('sub', RSP, number(bytes));
};
export const leave = (a: Assembler) => {
  a.ins('leave');
  a.ins('ret');
};

//the instructions that go to a label when an item of a list of a kind, at rax + rcx * 8, is the value at rbp - 16
export const jumpIfEqual = (a: Assembler, kind: Exclude<Kind, 'boolean'>, target: string) => {
  if (kind === 'text') {
    a.ins('mov', RDI, item('rax', 'rcx'));
    a.ins('mov', RSI, at('rbp', -16));
    a.ins('call', a.lib('strcmp'));
    a.ins('test', EAX, EAX);
    a.ins('jz', a.to(target));
  } else if (kind === 'real') {
    a.ins('movsd', XMM0, item('rax', 'rcx'));
    a.ins('ucomisd', XMM0, at('rbp', -16));
    a.ins('je', a.to(target));
  } else {
    a.ins('mov', RAX, item('rax', 'rcx'));
    a.ins('cmp', RAX, at('rbp', -16));
    a.ins('je', a.to(target));
  }
};

//the start of a loop over the items of a list at rbp - 8, with the place of an item in the frame: it goes to end
//after the last item, and has the address of the items in rax and the place in rcx
export const eachItem = (a: Assembler, place: number, end: string) => {
  a.label('next');
  a.ins('mov', RDI, at('rbp', -8));
  a.ins('mov', RCX, at('rbp', place));
  a.ins('cmp', RCX, at('rdi', 0));
  a.ins('jge', a.to(end));
  a.ins('mov', RAX, at('rdi', 8));
};

//a helper for each kind of item
export const ofKinds = (kinds: Kind[], name: (kind: Kind) => string, helper: (kind: Kind) => Helper) =>
  Object.fromEntries(kinds.map(kind => [name(kind), helper(kind)]));

//the measure of the letter at rdi: rsi grows past each byte after its first, which is 10xxxxxx
export const measure = (a: Assembler) => {
  a.ins('mov', RSI, number(1), 'the bytes of the letter');
  a.label('measure');
  a.ins('movzx', EAX, {base: 'rdi', index: 'rsi', size: 'byte'});
  a.ins('and', EAX, number('0xC0'));
  a.ins('cmp', EAX, number('0x80'));
  a.ins('jne', a.to('cut'));
  a.ins('inc', RSI);
  a.ins('jmp', a.to('measure'));
  a.label('cut');
};

//the helpers, by name, in the order they are written
export const HELPERS: Record<string, Helper> = {
  in_words: {
    data: ([yes, no]) => [
      ['true', yes],
      ['false', no]
    ],
    code: a => {
      a.note('a boolean in the words of the program, as CMIL prints it');
      a.entry('in_words');
      a.ins('lea', RAX, a.data('true', null));
      a.ins('test', RDI, RDI);
      a.ins('jnz', a.to('end'));
      a.ins('lea', RAX, a.data('false', null));
      a.label('end');
      a.ins('ret');
    }
  },
  read_text: {
    data: () => [['new_line', '\n']],
    code: a => {
      a.note('an answer of the user, as a text without the end of its line');
      a.entry('read_text');
      enter(a, 16);
      a.ins('mov', at('rbp', -8), number(0), 'the answer, which getline makes');
      a.ins('mov', at('rbp', -16), number(0), 'its size');
      a.ins('lea', RDI, at('rbp', -8, null));
      a.ins('lea', RSI, at('rbp', -16, null));
      a.ins('mov', RDX, a.external('stdin'));
      a.ins('call', a.lib('getline'));
      a.ins('mov', RDI, at('rbp', -8));
      a.ins('lea', RSI, a.data('new_line', null));
      a.ins('call', a.lib('strcspn'));
      a.ins('mov', RDI, at('rbp', -8));
      a.ins('mov', {base: 'rdi', index: 'rax', size: 'byte'}, number(0));
      a.ins('mov', RAX, RDI);
      leave(a);
    }
  },
  read_number: {
    uses: ['read_text'],
    code: a => {
      a.note('an answer of the user, as a number');
      a.entry('read_number');
      enter(a, 0);
      a.ins('call', a.fn('read_text'));
      a.ins('mov', RDI, RAX);
      a.ins('call', a.lib('atof'));
      leave(a);
    }
  },
  letter_count: {
    code: a => {
      a.note(
        'the letters of a text: a letter like ա has more than one byte, and each byte after its first is 10xxxxxx'
      );
      a.entry('letter_count');
      a.ins('mov', RAX, number(0));
      a.label('next');
      a.ins('movzx', register('ecx'), at('rdi', 0, 'byte'));
      a.ins('test', register('ecx'), register('ecx'));
      a.ins('jz', a.to('end'));
      a.ins('and', register('ecx'), number('0xC0'));
      a.ins('cmp', register('ecx'), number('0x80'));
      a.ins('je', a.to('skip'));
      a.ins('inc', RAX);
      a.label('skip');
      a.ins('inc', RDI);
      a.ins('jmp', a.to('next'));
      a.label('end');
      a.ins('ret');
    }
  },
  letter_of: {
    code: a => {
      a.note('the letter of a text at a place, from 1, as a text, with all the bytes of a letter like ա');
      a.entry('letter_of');
      enter(a, 0);
      a.ins('mov', RCX, number(0), 'the letters so far');
      a.label('next');
      a.ins('movzx', EAX, at('rdi', 0, 'byte'));
      a.ins('test', EAX, EAX);
      a.ins('jz', a.to('none'));
      a.ins('and', EAX, number('0xC0'));
      a.ins('cmp', EAX, number('0x80'));
      a.ins('je', a.to('skip'));
      a.ins('inc', RCX);
      a.ins('cmp', RCX, RSI);
      a.ins('je', a.to('found'));
      a.label('skip');
      a.ins('inc', RDI);
      a.ins('jmp', a.to('next'));
      a.label('none');
      a.ins('mov', RSI, number(0));
      a.ins('jmp', a.to('cut'));
      a.label('found');
      measure(a);
      a.ins('call', a.lib('strndup'));
      leave(a);
    }
  },
  ...Object.fromEntries(
    (['upper', 'lower'] as const).map(height => [
      `${height}case`,
      {
        code: (a: Assembler) => {
          a.note(
            `a text in ${height === 'upper' ? 'capital' : 'small'} letters, of which to${height} changes the English`
          );
          a.entry(`${height}case`);
          enter(a, 16);
          a.ins('call', a.lib('strdup'));
          a.ins('mov', at('rbp', -8), RAX, 'the text');
          a.ins('mov', at('rbp', -16), RAX, 'the place of a letter');
          a.label('next');
          a.ins('mov', RAX, at('rbp', -16));
          a.ins('movzx', register('edi'), at('rax', 0, 'byte'));
          a.ins('test', register('edi'), register('edi'));
          a.ins('jz', a.to('end'));
          a.ins('call', a.lib(`to${height}`));
          a.ins('mov', RCX, at('rbp', -16));
          a.ins('mov', at('rcx', 0, 'byte'), AL);
          a.ins('inc', at('rbp', -16));
          a.ins('jmp', a.to('next'));
          a.label('end');
          a.ins('mov', RAX, at('rbp', -8));
          leave(a);
        }
      }
    ])
  ),
  list_new: {
    code: a => {
      a.note('a new list without items: its count, then the address of its items');
      a.entry('list_new');
      enter(a, 0);
      a.ins('mov', RDI, number(1));
      a.ins('mov', RSI, number(16));
      a.ins('call', a.lib('calloc'));
      leave(a);
    }
  },
  list_add: {
    code: a => {
      a.note('puts an item at the end of a list, with room for one more item');
      a.entry('list_add');
      enter(a, 16);
      a.ins('mov', at('rbp', -8), RDI, 'the list');
      a.ins('mov', at('rbp', -16), RSI, 'the item');
      a.ins('mov', RAX, at('rdi', 0));
      a.ins('lea', RSI, {index: 'rax', scale: 8, displacement: 8, size: null}, 'room for one more item');
      a.ins('mov', RDI, at('rdi', 8));
      a.ins('call', a.lib('realloc'));
      a.ins('mov', RDI, at('rbp', -8));
      a.ins('mov', at('rdi', 8), RAX);
      a.ins('mov', RCX, at('rdi', 0));
      a.ins('mov', RDX, at('rbp', -16));
      a.ins('mov', item('rax', 'rcx'), RDX);
      a.ins('inc', at('rdi', 0));
      leave(a);
    }
  },
  list_copy: {
    uses: ['list_new', 'list_add'],
    code: a => {
      a.note('a new list with the items of a list');
      a.entry('list_copy');
      enter(a, 32);
      a.ins('mov', at('rbp', -8), RDI, 'the list');
      a.ins('call', a.fn('list_new'));
      a.ins('mov', at('rbp', -16), RAX, 'its copy');
      a.ins('mov', at('rbp', -24), number(0), 'the place of an item');
      eachItem(a, -24, 'end');
      a.ins('mov', RSI, item('rax', 'rcx'));
      a.ins('mov', RDI, at('rbp', -16));
      a.ins('call', a.fn('list_add'));
      a.ins('inc', at('rbp', -24));
      a.ins('jmp', a.to('next'));
      a.label('end');
      a.ins('mov', RAX, at('rbp', -16));
      leave(a);
    }
  },
  ...ofKinds(
    ['whole', 'real', 'text'],
    kind => `contains_${kind}`,
    kind => ({
      code: a => {
        a.note(`whether a list of ${IN_WORDS[kind]} has an item`);
        a.entry(`contains_${kind}`);
        enter(a, 32);
        a.ins('mov', at('rbp', -8), RDI, 'the list');
        a.ins('mov', at('rbp', -16), RSI, 'the item');
        a.ins('mov', at('rbp', -24), number(0), 'the place of an item');
        eachItem(a, -24, 'no');
        jumpIfEqual(a, compared(kind), 'yes');
        a.ins('inc', at('rbp', -24));
        a.ins('jmp', a.to('next'));
        a.label('yes');
        a.ins('mov', RAX, number(1));
        leave(a);
        a.label('no');
        a.ins('mov', RAX, number(0));
        leave(a);
      }
    })
  ),
  ...ofKinds(
    ['whole', 'real', 'text'],
    kind => `remove_${kind}`,
    kind => ({
      code: a => {
        a.note(
          `removes the first item of a list of ${IN_WORDS[kind]} that is a value, and moves the items after it back`
        );
        a.entry(`remove_${kind}`);
        enter(a, 32);
        a.ins('mov', at('rbp', -8), RDI, 'the list');
        a.ins('mov', at('rbp', -16), RSI, 'the item');
        a.ins('mov', at('rbp', -24), number(0), 'the place of an item');
        eachItem(a, -24, 'end');
        jumpIfEqual(a, compared(kind), 'found');
        a.ins('inc', at('rbp', -24));
        a.ins('jmp', a.to('next'));
        a.label('found');
        a.ins('mov', RDI, at('rbp', -8));
        a.ins('mov', RAX, at('rdi', 8));
        a.ins('mov', RCX, at('rbp', -24));
        a.label('move');
        a.ins('lea', RDX, at('rcx', 1, null));
        a.ins('cmp', RDX, at('rdi', 0));
        a.ins('jge', a.to('last'));
        a.ins('mov', RSI, item('rax', 'rdx'));
        a.ins('mov', item('rax', 'rcx'), RSI);
        a.ins('mov', RCX, RDX);
        a.ins('jmp', a.to('move'));
        a.label('last');
        a.ins('dec', at('rdi', 0));
        a.label('end');
        leave(a);
      }
    })
  ),
  ...ofKinds(
    ['whole', 'real', 'text', 'boolean'],
    kind => `join_${PLURAL[kind]}`,
    kind => ({
      uses: kind === 'boolean' ? ['in_words'] : [],
      data: () => [
        ['empty', ''],
        [`join_${PLURAL[kind]}`, `%s%s${kind === 'whole' ? '%lld' : kind === 'real' ? '%.12g' : '%s'}`]
      ],
      code: a => {
        const name = `join_${PLURAL[kind]}`;
        a.note(`the items of a list of ${IN_WORDS[kind]} as one text, with a separator between them`);
        a.entry(name);
        enter(a, 32);
        a.ins('mov', at('rbp', -8), RDI, 'the list');
        a.ins('mov', at('rbp', -16), RSI, 'the separator');
        a.ins('lea', RAX, a.data('empty', null));
        a.ins('mov', at('rbp', -24), RAX, 'the text');
        a.ins('mov', at('rbp', -32), number(0), 'the place of an item');
        eachItem(a, -32, 'end');
        if (kind === 'real') {
          a.ins('movsd', XMM0, item('rax', 'rcx'));
        } else if (kind === 'boolean') {
          a.ins('mov', RDI, item('rax', 'rcx'));
          a.ins('call', a.fn('in_words'));
          a.ins('mov', register('r8'), RAX);
        } else {
          a.ins('mov', register('r8'), item('rax', 'rcx'));
        }
        a.ins('lea', RCX, a.data('empty', null), 'no separator before the first item');
        a.ins('cmp', at('rbp', -32), number(0));
        a.ins('cmovne', RCX, at('rbp', -16));
        a.ins('mov', RDX, at('rbp', -24));
        a.ins('lea', RDI, at('rbp', -24, null));
        a.ins('lea', RSI, a.data(`join_${PLURAL[kind]}`, null));
        a.ins('mov', EAX, number(kind === 'real' ? 1 : 0));
        a.ins('call', a.lib('asprintf'));
        a.ins('inc', at('rbp', -32));
        a.ins('jmp', a.to('next'));
        a.label('end');
        a.ins('mov', RAX, at('rbp', -24));
        leave(a);
      }
    })
  ),
  split_words: {
    uses: ['list_new', 'list_add'],
    data: () => [['spaces', ' \t\n']],
    code: a => {
      a.note('the words of a text, between its spaces');
      a.entry('split_words');
      enter(a, 16);
      a.ins('call', a.lib('strdup'));
      a.ins('mov', at('rbp', -8), RAX, 'a copy of the text, which strtok cuts into its words');
      a.ins('call', a.fn('list_new'));
      a.ins('mov', at('rbp', -16), RAX, 'the words');
      a.ins('mov', RDI, at('rbp', -8));
      a.label('next');
      a.ins('lea', RSI, a.data('spaces', null));
      a.ins('call', a.lib('strtok'));
      a.ins('test', RAX, RAX);
      a.ins('jz', a.to('end'));
      a.ins('mov', RDI, at('rbp', -16));
      a.ins('mov', RSI, RAX);
      a.ins('call', a.fn('list_add'));
      a.ins('mov', RDI, number(0), 'strtok goes on with the same text');
      a.ins('jmp', a.to('next'));
      a.label('end');
      a.ins('mov', RAX, at('rbp', -16));
      leave(a);
    }
  },
  split_letters: {
    uses: ['list_new', 'list_add'],
    code: a => {
      a.note('the letters of a text, each a text of its own, with all the bytes of a letter like ա');
      a.entry('split_letters');
      enter(a, 16);
      a.ins('mov', at('rbp', -8), RDI, 'the next letter');
      a.ins('call', a.fn('list_new'));
      a.ins('mov', at('rbp', -16), RAX, 'the letters');
      a.label('next');
      a.ins('mov', RDI, at('rbp', -8));
      a.ins('cmp', at('rdi', 0, 'byte'), number(0));
      a.ins('je', a.to('end'));
      measure(a);
      a.ins('add', at('rbp', -8), RSI);
      a.ins('call', a.lib('strndup'));
      a.ins('mov', RDI, at('rbp', -16));
      a.ins('mov', RSI, RAX);
      a.ins('call', a.fn('list_add'));
      a.ins('jmp', a.to('next'));
      a.label('end');
      a.ins('mov', RAX, at('rbp', -16));
      leave(a);
    }
  },
  split_at: {
    uses: ['split_letters', 'list_new', 'list_add'],
    code: a => {
      a.note('the parts of a text between a separator, with the empty ones; an empty separator gives its letters');
      a.entry('split_at');
      a.ins('cmp', at('rsi', 0, 'byte'), number(0));
      a.ins('je', a.fn('split_letters'));
      enter(a, 32);
      a.ins('mov', at('rbp', -16), RSI, 'the separator');
      a.ins('call', a.lib('strdup'));
      a.ins('mov', at('rbp', -8), RAX, 'the rest of a copy of the text, which the parts are cut from');
      a.ins('call', a.fn('list_new'));
      a.ins('mov', at('rbp', -24), RAX, 'the parts');
      a.label('next');
      a.ins('mov', RDI, at('rbp', -8));
      a.ins('mov', RSI, at('rbp', -16));
      a.ins('call', a.lib('strstr'));
      a.ins('test', RAX, RAX);
      a.ins('jz', a.to('end'));
      a.ins('mov', at('rax', 0, 'byte'), number(0), 'the part ends where the separator starts');
      a.ins('mov', at('rbp', -32), RAX);
      a.ins('mov', RDI, at('rbp', -24));
      a.ins('mov', RSI, at('rbp', -8));
      a.ins('call', a.fn('list_add'));
      a.ins('mov', RDI, at('rbp', -16));
      a.ins('call', a.lib('strlen'));
      a.ins('add', RAX, at('rbp', -32));
      a.ins('mov', at('rbp', -8), RAX, 'the rest, after the separator');
      a.ins('jmp', a.to('next'));
      a.label('end');
      a.ins('mov', RDI, at('rbp', -24));
      a.ins('mov', RSI, at('rbp', -8));
      a.ins('call', a.fn('list_add'));
      a.ins('mov', RAX, at('rbp', -24));
      leave(a);
    }
  },
  round_to: {
    data: () => [
      ['ten', 10],
      ['half', 0.5],
      ['real', '%.12g']
    ],
    code: a => {
      a.note(
        'a number rounded to a count of decimals, a half up, after rounding it like it is printed, so 1.005 is 1.01'
      );
      a.entry('round_to');
      enter(a, 32);
      a.ins('movsd', at('rbp', -8), XMM0, 'the number');
      a.ins('cvtsi2sd', XMM1, RDI);
      a.ins('movsd', XMM0, a.data('ten'));
      a.ins('call', a.lib('pow'));
      a.ins('movsd', at('rbp', -16), XMM0, '10 to the power of the count');
      a.ins('mulsd', XMM0, at('rbp', -8));
      a.ins('lea', RDI, at('rbp', -24, null));
      a.ins('lea', RSI, a.data('real', null));
      a.ins('mov', EAX, number(1));
      a.ins('call', a.lib('asprintf'));
      a.ins('mov', RDI, at('rbp', -24));
      a.ins('call', a.lib('atof'));
      a.ins('addsd', XMM0, a.data('half'));
      a.ins('call', a.lib('floor'));
      a.ins('divsd', XMM0, at('rbp', -16));
      leave(a);
    }
  }
};
