/**
 * Converts CMIL programs into other languages, one way: a learner who knows a CMIL program sees it in C++ or Python,
 * line by line. The program tree and its types are made once; each language writes them its own way.
 */
import {programOf} from '../program.ts';
import {typesOf} from './types.ts';
import {toCpp} from './targets/cpp.ts';
import {toPython} from './targets/python.ts';
import type {Converted} from './emit.ts';
import type {ProgramError} from '../core/types.ts';

/** A language a program can be converted into. */
export type Target = {id: string; name: string; extension: string};

/**
 * Why a program can't be written in a language whose values have one type each: a variable or a function that gets
 * values of two types, with its name as written, or a list with items of two types.
 */
export type ConversionProblem =
  {id: 'mixedTypes'; line: number; name: string; target: string} | {id: 'mixedItems'; line: number; target: string};

export type Conversion = Converted | {problems: ConversionProblem[]} | {error: ProgramError};

const TARGETS: (Target & {typed: boolean; write: typeof toCpp})[] = [
  {id: 'cpp', name: 'C++', extension: 'cpp', typed: true, write: toCpp},
  {id: 'python', name: 'Python', extension: 'py', typed: false, write: toPython}
];

/** The languages programs can be converted into. */
export const targets: readonly Target[] = Object.freeze(
  TARGETS.map(({id, name, extension}) => ({id, name, extension}))
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

  const types = typesOf(tree.statements);
  if (writer.typed && types.conflicts.length) {
    return {
      problems: types.conflicts.map(({line, name}): ConversionProblem =>
        name === '[]'
          ? {id: 'mixedItems', line, target: writer.name}
          : {id: 'mixedTypes', line, name: tree.names[name] ?? name, target: writer.name}
      )
    };
  }
  return writer.write(tree, types, sourceCode);
};
