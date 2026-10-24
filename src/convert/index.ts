/**
 * Converts CMIL programs into other languages, one way: a learner who knows a CMIL program sees it in C++, Python,
 * C#, Java, C, JavaScript, Pascal, Go, Kotlin, Swift, Rust, PHP, Ruby, Lua, BASIC, Visual Basic, Fortran or Tcl,
 * line by line. The program tree and its types are made once; each language writes them its own way.
 */
import {programOf} from '../program.ts';
import {typesOf} from './types.ts';
import {toCpp} from './targets/cpp.ts';
import {toPython} from './targets/python.ts';
import {toCsharp} from './targets/csharp.ts';
import {toJava} from './targets/java.ts';
import {C_ARRAYS, toC} from './targets/c.ts';
import {toJavascript} from './targets/javascript.ts';
import {toPascal} from './targets/pascal.ts';
import {toGo} from './targets/go.ts';
import {toKotlin} from './targets/kotlin.ts';
import {toSwift} from './targets/swift.ts';
import {toRust} from './targets/rust.ts';
import {toPhp} from './targets/php.ts';
import {toRuby} from './targets/ruby.ts';
import {toLua} from './targets/lua.ts';
import {BASIC_ARRAYS, toBasic} from './targets/basic.ts';
import {toVisualBasic} from './targets/visualbasic.ts';
import {FORTRAN_ARRAYS, toFortran} from './targets/fortran.ts';
import {toTcl} from './targets/tcl.ts';
import {COBOL_ARRAYS, toCobol} from './targets/cobol.ts';
import {toAssembly} from './targets/assembly/index.ts';
import {AT_AND_T, INTEL, NASM} from './targets/assembly/syntax.ts';
import {fixedArraysLineOf, namesApart, valueErrorOf, type Converted, type FixedArrays} from './emit.ts';
import type {ProgramError} from '../core/types.ts';

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

/**
 * Why a program can't be written in a language whose values have one type each: a variable or a function that gets
 * values of two types, with its name as written, or a list with items of two types.
 */
export type ConversionProblem =
  | {id: 'mixedTypes'; line: number; name: string; target: string}
  | {id: 'mixedItems'; line: number; target: string}
  //C, BASIC, Fortran and COBOL, whose lists are the arrays of a first course, can't write a list of lists, and what
  //each declares in its FixedArrays, like C a function that gives a list
  | {id: 'fixedArrays'; line: number; target: string};

export type Conversion = Converted | {problems: ConversionProblem[]} | {error: ProgramError};

//each target, with whether it declares types, and what it can't write when its lists are fixed arrays
const TARGETS: (Target & {typed: boolean; fixedArrays?: FixedArrays; write: typeof toCpp})[] = [
  {id: 'cpp', name: 'C++', extension: 'cpp', typed: true, write: toCpp},
  {id: 'python', name: 'Python', extension: 'py', typed: false, write: toPython},
  {
    id: 'csharp',
    name: 'C#',
    extension: 'cs',
    style: 'modern',
    typed: true,
    write: (tree, types, sourceCode) => toCsharp(tree, types, sourceCode, 'modern')
  },
  {
    id: 'csharp-classic',
    name: 'C#',
    extension: 'cs',
    style: 'classic',
    typed: true,
    write: (tree, types, sourceCode) => toCsharp(tree, types, sourceCode, 'classic')
  },
  {
    id: 'java',
    name: 'Java',
    extension: 'java',
    style: 'modern',
    typed: true,
    write: (tree, types, sourceCode) => toJava(tree, types, sourceCode, 'modern')
  },
  {
    id: 'java-classic',
    name: 'Java',
    extension: 'java',
    style: 'classic',
    typed: true,
    write: (tree, types, sourceCode) => toJava(tree, types, sourceCode, 'classic')
  },
  {id: 'c', name: 'C', extension: 'c', typed: true, fixedArrays: C_ARRAYS, write: toC},
  {id: 'javascript', name: 'JavaScript', extension: 'js', typed: false, write: toJavascript},
  {id: 'pascal', name: 'Pascal', extension: 'pas', typed: true, write: toPascal},
  {id: 'go', name: 'Go', extension: 'go', typed: true, write: toGo},
  {id: 'kotlin', name: 'Kotlin', extension: 'kt', typed: true, write: toKotlin},
  {id: 'swift', name: 'Swift', extension: 'swift', typed: true, write: toSwift},
  {id: 'rust', name: 'Rust', extension: 'rs', typed: true, write: toRust},
  {id: 'php', name: 'PHP', extension: 'php', typed: false, write: toPhp},
  {id: 'ruby', name: 'Ruby', extension: 'rb', typed: false, write: toRuby},
  {id: 'lua', name: 'Lua', extension: 'lua', typed: false, write: toLua},
  {id: 'basic', name: 'BASIC', extension: 'bas', typed: true, fixedArrays: BASIC_ARRAYS, write: toBasic},
  {id: 'visualbasic', name: 'Visual Basic', extension: 'vb', typed: true, write: toVisualBasic},
  {id: 'fortran', name: 'Fortran', extension: 'f90', typed: true, fixedArrays: FORTRAN_ARRAYS, write: toFortran},
  {id: 'tcl', name: 'Tcl', extension: 'tcl', typed: true, write: toTcl},
  {id: 'cobol', name: 'COBOL', extension: 'cob', typed: true, fixedArrays: COBOL_ARRAYS, write: toCobol},
  {
    id: 'x86-64',
    name: 'x86-64 Assembly',
    extension: 's',
    style: 'intel',
    typed: true,
    write: (tree, types, sourceCode) => toAssembly(tree, types, sourceCode, INTEL)
  },
  {
    id: 'x86-64-att',
    name: 'x86-64 Assembly',
    extension: 's',
    style: 'att',
    typed: true,
    write: (tree, types, sourceCode) => toAssembly(tree, types, sourceCode, AT_AND_T)
  },
  {
    id: 'x86-64-nasm',
    name: 'x86-64 Assembly',
    extension: 'asm',
    style: 'nasm',
    typed: true,
    write: (tree, types, sourceCode) => toAssembly(tree, types, sourceCode, NASM)
  }
];

/** The languages programs can be converted into. */
export const targets: readonly Target[] = Object.freeze(
  TARGETS.map(({id, name, extension, style}) => ({id, name, extension, ...(style ? {style} : {})}))
);

/**
 * Converts a program into a language of targets: its code, with the CMIL line each line comes from; or why it can't
 * be, like a variable with a number and a text in C++; or the error the program has before it runs.
 */
export const convert = (sourceCode: string, language: string, target: string): Conversion => {
  const writer = TARGETS.find(({id}) => id === target);
  if (!writer) throw new Error(`Unknown target: ${target}`);

  const tree = programOf(sourceCode, language);
  if ('error' in tree) return {error: tree.error};

  namesApart(tree);
  const types = typesOf(tree.statements);
  //a list turned into a text, or lists compared, stop the program in CMIL, so they are its error
  const error = valueErrorOf(tree, types);
  if (error) return {error};
  if (writer.typed && types.conflicts.length) {
    return {
      problems: types.conflicts.map(({line, name}): ConversionProblem =>
        name === '[]'
          ? {id: 'mixedItems', line, target: writer.name}
          : {id: 'mixedTypes', line, name: tree.names[name] ?? name, target: writer.name}
      )
    };
  }
  const line = writer.fixedArrays && fixedArraysLineOf(tree, types, writer.fixedArrays);
  if (line) return {problems: [{id: 'fixedArrays', line, target: writer.name}]};
  return writer.write(tree, types, sourceCode);
};
