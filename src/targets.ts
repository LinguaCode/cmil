/**
 * The languages programs can be converted into, apart from their converters: a page that only lists them, like in a
 * menu, doesn't load the converters with them.
 */

/**
 * A language a program can be converted into; a language written in two shapes, like C# and Java, is two targets of
 * the same name, each with its style: modern, like C# 12, or classic, which builds with older compilers too; and
 * x86-64 assembly is three, one for each syntax: intel and att of the GNU assembler, and nasm.
 */
export type Target = {
  id: string;
  name: string;
  extension: string;
  style?: 'modern' | 'classic' | 'intel' | 'att' | 'nasm';
};

//each target, in the order they are listed; convert() has a writer for each
const TARGETS = [
  {id: 'cpp', name: 'C++', extension: 'cpp'},
  {id: 'python', name: 'Python', extension: 'py'},
  {id: 'csharp', name: 'C#', extension: 'cs', style: 'modern'},
  {id: 'csharp-classic', name: 'C#', extension: 'cs', style: 'classic'},
  {id: 'java', name: 'Java', extension: 'java', style: 'modern'},
  {id: 'java-classic', name: 'Java', extension: 'java', style: 'classic'},
  {id: 'c', name: 'C', extension: 'c'},
  {id: 'javascript', name: 'JavaScript', extension: 'js'},
  {id: 'pascal', name: 'Pascal', extension: 'pas'},
  {id: 'go', name: 'Go', extension: 'go'},
  {id: 'kotlin', name: 'Kotlin', extension: 'kt'},
  {id: 'swift', name: 'Swift', extension: 'swift'},
  {id: 'rust', name: 'Rust', extension: 'rs'},
  {id: 'php', name: 'PHP', extension: 'php'},
  {id: 'ruby', name: 'Ruby', extension: 'rb'},
  {id: 'lua', name: 'Lua', extension: 'lua'},
  {id: 'basic', name: 'BASIC', extension: 'bas'},
  {id: 'visualbasic', name: 'Visual Basic', extension: 'vb'},
  {id: 'fortran', name: 'Fortran', extension: 'f90'},
  {id: 'tcl', name: 'Tcl', extension: 'tcl'},
  {id: 'cobol', name: 'COBOL', extension: 'cob'},
  {id: 'x86-64', name: 'x86-64 Assembly', extension: 's', style: 'intel'},
  {id: 'x86-64-att', name: 'x86-64 Assembly', extension: 's', style: 'att'},
  {id: 'x86-64-nasm', name: 'x86-64 Assembly', extension: 'asm', style: 'nasm'}
] as const satisfies readonly Target[];

/** The id of a target, like `cpp` or `x86-64-nasm`. */
export type TargetId = (typeof TARGETS)[number]['id'];

/** The languages programs can be converted into. */
export const targets: readonly Target[] = Object.freeze(TARGETS.map(target => ({...target})));
