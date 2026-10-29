/**
 * The languages programs can be converted into, apart from their converters: a page that only lists them, like in a
 * menu, doesn't load the converters with them.
 */

/**
 * A language a program can be converted into; a language written in two shapes, like C# and Java, is two targets of
 * the same name, each with its style: modern, like C# 12, or classic, which builds with older compilers too; and
 * x86-64 assembly is three, one for each syntax: intel and att of the GNU assembler, and nasm. Its writer is the
 * part of convert() that writes it, the entry cmil/convert/<writer>, which the targets of a language share, like
 * csharp, and its colors are the entry cmil/codemirror/targets/<writer>.
 */
export type Target = {
  id: string;
  name: string;
  extension: string;
  style?: 'modern' | 'classic' | 'intel' | 'att' | 'nasm';
  writer: string;
};

//each target, in the order they are listed, with its writer
const TARGETS = [
  {id: 'cpp', name: 'C++', extension: 'cpp', writer: 'cpp'},
  {id: 'python', name: 'Python', extension: 'py', writer: 'python'},
  {id: 'csharp', name: 'C#', extension: 'cs', style: 'modern', writer: 'csharp'},
  {id: 'csharp-classic', name: 'C#', extension: 'cs', style: 'classic', writer: 'csharp'},
  {id: 'java', name: 'Java', extension: 'java', style: 'modern', writer: 'java'},
  {id: 'java-classic', name: 'Java', extension: 'java', style: 'classic', writer: 'java'},
  {id: 'c', name: 'C', extension: 'c', writer: 'c'},
  {id: 'javascript', name: 'JavaScript', extension: 'js', writer: 'javascript'},
  {id: 'pascal', name: 'Pascal', extension: 'pas', writer: 'pascal'},
  {id: 'go', name: 'Go', extension: 'go', writer: 'go'},
  {id: 'kotlin', name: 'Kotlin', extension: 'kt', writer: 'kotlin'},
  {id: 'swift', name: 'Swift', extension: 'swift', writer: 'swift'},
  {id: 'rust', name: 'Rust', extension: 'rs', writer: 'rust'},
  {id: 'php', name: 'PHP', extension: 'php', writer: 'php'},
  {id: 'ruby', name: 'Ruby', extension: 'rb', writer: 'ruby'},
  {id: 'lua', name: 'Lua', extension: 'lua', writer: 'lua'},
  {id: 'basic', name: 'BASIC', extension: 'bas', writer: 'basic'},
  {id: 'visualbasic', name: 'Visual Basic', extension: 'vb', writer: 'visualbasic'},
  {id: 'fortran', name: 'Fortran', extension: 'f90', writer: 'fortran'},
  {id: 'tcl', name: 'Tcl', extension: 'tcl', writer: 'tcl'},
  {id: 'cobol', name: 'COBOL', extension: 'cob', writer: 'cobol'},
  {id: 'x86-64', name: 'x86-64 Assembly', extension: 's', style: 'intel', writer: 'assembly'},
  {id: 'x86-64-att', name: 'x86-64 Assembly', extension: 's', style: 'att', writer: 'assembly'},
  {id: 'x86-64-nasm', name: 'x86-64 Assembly', extension: 'asm', style: 'nasm', writer: 'assembly'}
] as const satisfies readonly Target[];

/** The id of a target, like `cpp` or `x86-64-nasm`. */
export type TargetId = (typeof TARGETS)[number]['id'];

/** The writer of targets, like `csharp` for csharp and csharp-classic, or `assembly` for the three of x86-64. */
export type WriterId = (typeof TARGETS)[number]['writer'];

/** The languages programs can be converted into. */
export const targets: readonly Target[] = Object.freeze(TARGETS.map(target => ({...target})));
