/**
 * The operands of x86-64 assembly, its registers, and how the Intel and AT&T syntaxes of the GNU assembler and NASM
 * write a program: its directives, labels, instructions and their operands.
 */

/** A place in memory: a base, an index times a scale, and an offset, a number or a symbol, with the size of its value. */
export type Memory = {
  base?: string;
  index?: string;
  scale?: number;
  displacement?: number;
  //a variable of the frame, like total, a label of the data, like text1, or a symbol of the C library, like stdin
  variable?: string;
  data?: string;
  external?: string;
  //the size of the value there, which lea doesn't read
  size: 'qword' | 'byte' | null;
};

/** An operand of an instruction: a register, a number, a label a jump or a call goes to, or a place in memory. */
export type Operand = {register: string} | {number: string} | {label: string} | Memory;

/** How an assembler writes a program: its directives, its labels, its instructions and their operands. */
export type Syntax = {
  comment: string;
  //the lines before the data, with the functions and the symbols of the C library the program uses
  start: (library: string[]) => string[];
  section: (name: 'data' | 'code' | 'stack') => string;
  //a label of the data, like text1
  data: (name: string) => string;
  text: (value: string) => string;
  real: (value: number) => string;
  align: (bytes: number) => string;
  global: (name: string) => string;
  //a variable of a function at an offset of its frame
  set: (name: string, offset: number) => string;
  //a label of a function, like while1, and of a helper, whose name it has
  local: (name: string, helper?: string) => string;
  //a function of the C library a program calls
  library: (name: string) => string;
  instruction: (mnemonic: string, operands: Operand[]) => string;
};

//a number after a base, like + 8 or - 8
export const signed = (value: number) => (value < 0 ? ` - ${-value}` : ` + ${value}`);
//a text in a string of the GNU assembler or NASM, the letters of whose escapes are its own
export const escaped = (value: string, quote: string) =>
  [...value]
    .map(letter => ({'\\': '\\\\', '\n': '\\n', '\t': '\\t', [quote]: `\\${quote}`})[letter] ?? letter)
    .join('');

//the directives the GNU assembler has in both of its syntaxes
export const GNU = {
  comment: '#',
  section: (name: 'data' | 'code' | 'stack') =>
    ({data: '.section .rodata', code: '.text', stack: '.section .note.GNU-stack,"",@progbits'})[name],
  data: (name: string) => `.L${name}`,
  text: (value: string) => `.string "${escaped(value, '"')}"`,
  real: (value: number) => `.double ${value}`,
  align: (bytes: number) => `.align ${bytes}`,
  global: (name: string) => `.globl ${name}`,
  set: (name: string, offset: number) => `.set ${name}, ${offset}`,
  local: (name: string, helper?: string) => `.L${helper ? `${helper}_` : ''}${name}`,
  library: (name: string) => `${name}@PLT`
};

//a place in memory in Intel syntax, like [rbp + total], with the symbols of a syntax, and its size, like qword ptr
export const intelPlace = (place: Memory, symbol: (place: Memory) => string, size: (size: string) => string) => {
  const scaled = place.index && `${place.index}${place.scale && place.scale > 1 ? `*${place.scale}` : ''}`;
  const terms = [place.base, scaled].filter(Boolean).join(' + ');
  const written = `[${terms}${symbol(place)}${place.displacement ? signed(place.displacement) : ''}]`;
  return place.size ? `${size(place.size)} ${written}` : written;
};
export const intelInstruction = (mnemonic: string, operands: string[]) =>
  operands.length ? `${mnemonic} ${operands.join(', ')}` : mnemonic;

/** The GNU assembler in Intel syntax, the destination first, as gcc -masm=intel writes it. */
export const INTEL: Syntax = {
  ...GNU,
  start: () => ['.intel_syntax noprefix'],
  instruction: (mnemonic, operands) =>
    intelInstruction(
      mnemonic,
      operands.map(operand => {
        if ('register' in operand) return operand.register;
        if ('number' in operand) return operand.number;
        if ('label' in operand) return operand.label;
        return intelPlace(
          operand,
          place =>
            place.variable
              ? ` + ${place.variable}`
              : place.data
                ? ` + .L${place.data}`
                : place.external
                  ? ` + ${place.external}`
                  : '',
          size => `${size} ptr`
        );
      })
    )
};

//the size of each register, which an instruction of AT&T syntax has as its last letter, like q of movq
export const REGISTER_SIZES: Record<string, string> = {
  ...Object.fromEntries(['rax', 'rbx', 'rcx', 'rdx', 'rsi', 'rdi', 'rbp', 'rsp', 'r8', 'r9'].map(name => [name, 'q'])),
  ...Object.fromEntries(['eax', 'ecx', 'edx', 'esi', 'edi'].map(name => [name, 'l'])),
  al: 'b'
};
//the instructions of whole numbers, which AT&T syntax gives the size of their values, like movq
export const SIZED = new Set([
  'mov',
  'add',
  'sub',
  'imul',
  'idiv',
  'cmp',
  'test',
  'inc',
  'dec',
  'neg',
  'push',
  'lea',
  'xor',
  'and'
]);
//the instructions AT&T syntax names its own way
export const AT_AND_T_NAMES: Record<string, string> = {
  cqo: 'cqto',
  cdqe: 'cltq',
  cvtsi2sd: 'cvtsi2sdq',
  cvttsd2si: 'cvttsd2siq'
};

/** The GNU assembler in AT&T syntax, its own: the source first, % before a register, $ before a number. */
export const AT_AND_T: Syntax = {
  ...GNU,
  start: () => [],
  instruction: (mnemonic, operands) => {
    const sizeOf = (operand: Operand) =>
      'register' in operand
        ? REGISTER_SIZES[operand.register]
        : 'size' in operand && operand.size
          ? operand.size[0]
          : '';
    const written = operands.map(operand => {
      if ('register' in operand) return `%${operand.register}`;
      if ('number' in operand) return `$${operand.number}`;
      if ('label' in operand) return operand.label;
      const symbol = operand.variable ?? (operand.data && `.L${operand.data}`) ?? operand.external ?? '';
      const offset = symbol
        ? `${symbol}${operand.displacement ? signed(operand.displacement).replaceAll(' ', '') : ''}`
        : operand.displacement
          ? String(operand.displacement)
          : '';
      const index = operand.index
        ? `,%${operand.index}${operand.scale && operand.scale > 1 ? `,${operand.scale}` : ''}`
        : '';
      return `${offset}(${operand.base ? `%${operand.base}` : ''}${index})`;
    });
    //movzx of a byte is movzb, with the size of the register it fills, like movzbl
    const name =
      mnemonic === 'movzx'
        ? `movzb${sizeOf(operands[0])}`
        : SIZED.has(mnemonic)
          ? `${mnemonic}${operands.map(sizeOf).find(Boolean) ?? 'q'}`
          : (AT_AND_T_NAMES[mnemonic] ?? mnemonic);
    return written.length ? `${name} ${written.reverse().join(', ')}` : name;
  }
};

/** NASM, in Intel syntax, with its own directives: a variable is a local label of its function, like .total. */
export const NASM: Syntax = {
  comment: ';',
  start: library => (library.length ? [`extern ${library.join(', ')}`] : []),
  section: name =>
    ({
      data: 'section .rodata',
      code: 'section .text',
      stack: 'section .note.GNU-stack noalloc noexec nowrite progbits'
    })[name],
  data: name => `data.${name}`,
  //a text in backquotes, whose escapes NASM reads, ended by a 0
  text: value => (value ? `db \`${escaped(value, '`')}\`, 0` : 'db 0'),
  //a real number with a point, which NASM reads as a real number, like 2.0
  real: value => `dq ${/[.e]/.test(String(value)) ? String(value).replace(/^(-?\d+)e/, '$1.0e') : `${value}.0`}`,
  align: bytes => `align ${bytes}`,
  global: name => `global ${name}`,
  set: (name, offset) => `.${name} equ ${offset}`,
  local: name => `.${name}`,
  library: name => `${name} wrt ..plt`,
  instruction: (mnemonic, operands) =>
    intelInstruction(
      mnemonic,
      operands.map(operand => {
        if ('register' in operand) return operand.register;
        if ('number' in operand) return operand.number;
        if ('label' in operand) return operand.label;
        if (operand.data || operand.external) {
          const place = `[rel ${operand.data ? `data.${operand.data}` : operand.external}]`;
          return operand.size ? `${operand.size} ${place}` : place;
        }
        return intelPlace(
          operand,
          place => (place.variable ? ` + .${place.variable}` : ''),
          size => size
        );
      })
    )
};

export type Register = {register: string};
export const register = (name: string): Register => ({register: name});
export const number = (value: number | string): Operand => ({number: String(value)});
//a value in memory, at a base and a number of bytes after it, like qword ptr [rax + 8]; without a size, an address
export const at = (base: string, displacement = 0, size: 'qword' | 'byte' | null = 'qword'): Memory => ({
  base,
  displacement,
  size
});
//an item of the items at an address, counted from 0, like qword ptr [rcx + rax*8]
export const item = (base: string, index: string, displacement = 0): Memory => ({
  base,
  index,
  scale: 8,
  displacement,
  size: 'qword'
});
//a variable of the frame, like qword ptr [rbp + total], a label of the data and a symbol of the C library
export const local = (name: string, size: 'qword' | null = 'qword'): Memory => ({base: 'rbp', variable: name, size});
export const data = (name: string, size: 'qword' | null = 'qword'): Memory => ({base: 'rip', data: name, size});
export const external = (name: string): Memory => ({base: 'rip', external: name, size: 'qword'});

export const [RAX, RCX, RDX, RSI, RDI, RSP, EAX, AL] = ['rax', 'rcx', 'rdx', 'rsi', 'rdi', 'rsp', 'eax', 'al'].map(
  register
);
export const [XMM0, XMM1] = ['xmm0', 'xmm1'].map(register);

//the registers of the arguments of a call, in the calling convention of Linux: the first six whole numbers and
//addresses, and the first eight real numbers
export const WHOLE_REGISTERS = ['rdi', 'rsi', 'rdx', 'rcx', 'r8', 'r9'];
export const REAL_REGISTERS = Array.from({length: 8}, (_, index) => `xmm${index}`);

//the functions of the C library a program calls, through the procedure linkage table of a program built by gcc
export const LIBRARY = [
  'printf puts asprintf calloc realloc strcmp strstr strlen strdup strndup strtok strcspn getline atof toupper',
  'tolower rand srand time floor ceil pow sin cos tan asin acos atan log log10 fmod fabs'
]
  .join(' ')
  .split(' ');

//the names of the registers, which an operand reads whatever their case, so a variable can't be named like one
export const REGISTERS = [
  ...['ax', 'bx', 'cx', 'dx', 'si', 'di', 'sp', 'bp'].flatMap(name => [`r${name}`, `e${name}`, name]),
  ...'al bl cl dl ah bh ch dh sil dil spl bpl rip eip ip st cs ds es fs gs ss flags eflags rflags'.split(' '),
  ...Array.from({length: 8}, (_, index) => index + 8).flatMap(index =>
    ['', 'd', 'w', 'b', 'l'].map(suffix => `r${index}${suffix}`)
  ),
  ...Array.from({length: 32}, (_, index) => [`xmm${index}`, `ymm${index}`, `zmm${index}`]).flat(),
  ...Array.from({length: 9}, (_, index) =>
    ['mm', 'st', 'k', 'cr', 'dr', 'bnd', 'tr', 'tmm'].map(name => `${name}${index}`)
  ).flat()
];

//the registers, the words of the GNU assembler's Intel syntax and of NASM, the functions of the C library and the
//helpers, which a name of the program can't be, in any syntax, so a program has the same names in each; names are
//compared whatever their case, as registers are
export const RESERVED = new Set([
  ...REGISTERS,
  ...LIBRARY,
  ...[
    'byte word dword fword qword tbyte oword xmmword ymmword zmmword tword yword zword ptr offset flat short near far',
    'rel abs and or xor not mod shl shr eq ne lt le gt ge main stdin a16 asp at common cpu default float global',
    'incbin lock nobnd nosplit osabi osp repe repne repnz repz required sectalign section seg segment static strict',
    'times use16 use32 wrt xacquire xrelease in_words read_text read_number letter_count letter_of uppercase',
    'lowercase list_new list_add list_copy split_words split_at split_letters round_to contains_whole contains_real',
    'contains_text remove_whole remove_real remove_text join_wholes join_reals join_texts join_booleans'
  ]
    .join(' ')
    .split(' ')
]);
