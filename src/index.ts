/**
 * CMIL: run programs written in any of its languages, check them, and translate them into another language.
 */
import {translateSource} from './core/words.ts';
import TRANSLATION from './translations/index.ts';

export {Session, check} from './session.ts';
export {messageOf, problemOf} from './messages.ts';
export {programOf, TREE_FORMAT} from './program.ts';
export {convert} from './convert/index.ts';
export {targets} from './targets.ts';
export {segmentsOf, commandsOf, quotesOf} from './editor.ts';

export type {Step, SessionOptions} from './session.ts';
export type {ProgramError, Statement, Expression, Comment} from './core/types.ts';
export type {ProgramTree} from './program.ts';
export type {Conversion, ConversionProblem} from './convert/index.ts';
export type {Target} from './targets.ts';
export type {Converted} from './convert/emit.ts';
export type {LineSegment, CommandKind} from './editor.ts';
export type {Quotes} from './translations/index.ts';

/** The codes of the languages programs can be written in, for example 'en' or 'hy-AM'. */
export const languages: readonly string[] = Object.freeze(Object.keys(TRANSLATION));

/**
 * Translates a program from one language into another, for example from 'en' to 'hy-AM'.
 * Texts are written in the main quotes of the other language, like «…» in Armenian; their values, comments and spacing
 * stay as written, and so do names, except a name that is a command in the other language, which gets a trailing _.
 * An unknown language throws an error.
 */
export const translate = (sourceCode: string, from: string, to: string): string => {
  for (const language of [from, to]) {
    if (!Object.hasOwn(TRANSLATION, language)) throw new Error(`Unknown language: ${language}`);
  }

  return translateSource(sourceCode, from, to);
};
