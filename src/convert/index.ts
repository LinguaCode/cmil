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
import {targets, type TargetId} from '../targets.ts';
import type {ProgramError} from '../core/types.ts';

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

//how each target is written: whether its language declares types, and what it can't write when its lists are
//fixed arrays
type Writer = {typed: boolean; fixedArrays?: FixedArrays; write: typeof toCpp};

const WRITERS: Record<TargetId, Writer> = {
  cpp: {typed: true, write: toCpp},
  python: {typed: false, write: toPython},
  csharp: {typed: true, write: (tree, types, sourceCode) => toCsharp(tree, types, sourceCode, 'modern')},
  'csharp-classic': {typed: true, write: (tree, types, sourceCode) => toCsharp(tree, types, sourceCode, 'classic')},
  java: {typed: true, write: (tree, types, sourceCode) => toJava(tree, types, sourceCode, 'modern')},
  'java-classic': {typed: true, write: (tree, types, sourceCode) => toJava(tree, types, sourceCode, 'classic')},
  c: {typed: true, fixedArrays: C_ARRAYS, write: toC},
  javascript: {typed: false, write: toJavascript},
  pascal: {typed: true, write: toPascal},
  go: {typed: true, write: toGo},
  kotlin: {typed: true, write: toKotlin},
  swift: {typed: true, write: toSwift},
  rust: {typed: true, write: toRust},
  php: {typed: false, write: toPhp},
  ruby: {typed: false, write: toRuby},
  lua: {typed: false, write: toLua},
  basic: {typed: true, fixedArrays: BASIC_ARRAYS, write: toBasic},
  visualbasic: {typed: true, write: toVisualBasic},
  fortran: {typed: true, fixedArrays: FORTRAN_ARRAYS, write: toFortran},
  tcl: {typed: true, write: toTcl},
  cobol: {typed: true, fixedArrays: COBOL_ARRAYS, write: toCobol},
  'x86-64': {typed: true, write: (tree, types, sourceCode) => toAssembly(tree, types, sourceCode, INTEL)},
  'x86-64-att': {typed: true, write: (tree, types, sourceCode) => toAssembly(tree, types, sourceCode, AT_AND_T)},
  'x86-64-nasm': {typed: true, write: (tree, types, sourceCode) => toAssembly(tree, types, sourceCode, NASM)}
};

/**
 * Converts a program into a language of targets: its code, with the CMIL line each line comes from; or why it can't
 * be, like a variable with a number and a text in C++; or the error the program has before it runs.
 */
export const convert = (sourceCode: string, language: string, target: string): Conversion => {
  const writer = Object.hasOwn(WRITERS, target) ? WRITERS[target as TargetId] : undefined;
  const targetName = targets.find(({id}) => id === target)?.name;
  if (!writer || !targetName) throw new Error(`Unknown target: ${target}`);

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
          ? {id: 'mixedItems', line, target: targetName}
          : {id: 'mixedTypes', line, name: tree.names[name] ?? name, target: targetName}
      )
    };
  }
  const line = writer.fixedArrays && fixedArraysLineOf(tree, types, writer.fixedArrays);
  if (line) return {problems: [{id: 'fixedArrays', line, target: targetName}]};
  return writer.write(tree, types, sourceCode);
};
