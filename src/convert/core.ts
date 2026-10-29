/**
 * Converts CMIL programs into other languages, one way, the entry cmil/convert/core: the program tree and its types
 * are made once, and each language writes them its own way, with its writer, the entry cmil/convert/<writer> of
 * targets[].writer, which convert() uses once it is imported. cmil/convert has every writer.
 */
import {programOf} from '../program.ts';
import {typesOf} from './types.ts';
import {fixedArraysLineOf, namesApart, valueErrorOf, type Converted} from './emit.ts';
import {writerOf} from './registry.ts';
import {targets} from '../targets.ts';
import type {ProgramError} from '../core/types.ts';

export {targets} from '../targets.ts';
export type {Target, TargetId, WriterId} from '../targets.ts';

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

/**
 * Converts a program into a language of targets: its code, with the CMIL line each line comes from; or why it can't
 * be, like a variable with a number and a text in C++; or the error the program has before it runs.
 */
export const convert = (sourceCode: string, language: string, target: string): Conversion => {
  const known = targets.find(({id}) => id === target);
  if (!known) throw new Error(`Unknown target: ${target}`);
  const writer = writerOf(target);
  if (!writer) throw new Error(`The writer of ${target} isn't loaded: import cmil/convert/${known.writer}`);
  const targetName = known.name;

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
