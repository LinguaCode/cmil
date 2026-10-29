/**
 * The writers convert() has: each registered by its entry, cmil/convert/<writer>, when it is imported, or all of them
 * by the convert() of cmil/convert when it first converts a program.
 */
import type {Converted, FixedArrays} from './emit.ts';
import type {ProgramTree} from '../program.ts';
import type {TargetId} from '../targets.ts';
import type {Types} from './types.ts';

/**
 * How a target is written: whether its language declares types, what it can't write when its lists are fixed
 * arrays, and its code.
 */
export type Writer = {
  typed: boolean;
  fixedArrays?: FixedArrays;
  write: (tree: ProgramTree, types: Types, sourceCode: string) => Converted;
};

/** The writer of each target of a language, like csharp and csharp-classic. */
export type Writers = Partial<Record<TargetId, Writer>>;

const WRITERS = new Map<string, Writer>();

/** Gives convert() the writer of each of the targets. */
export const registerWriters = (writers: Writers): void => {
  Object.entries(writers).forEach(([target, writer]) => WRITERS.set(target, writer));
};

/** The writer of a target, once its entry is imported. */
export const writerOf = (target: string): Writer | undefined => WRITERS.get(target);
