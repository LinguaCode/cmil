/**
 * The tree of a program, for tools like converters: its statements, its comments and the spelling of its names.
 */
import * as lexer from './core/lexer.ts';
import * as parser from './core/parser.ts';
import CmilError from './core/error.ts';
import {ERROR} from './constants/index.ts';
import TRANSLATION from './translations/index.ts';
import type {Comment, ProgramError, Statement} from './core/types.ts';

/** The format of the tree, which changes when the tree does. */
export const TREE_FORMAT = 2;

/**
 * A program as a tree: names are in small letters, as CMIL compares them, and names has the first spelling of each;
 * commands are their ids, like print, whatever the language.
 */
export type ProgramTree = {
  format: typeof TREE_FORMAT;
  language: string;
  statements: Statement[];
  comments: Comment[];
  names: Record<string, string>;
};

/**
 * Returns the tree of a program, or the first error it has before it runs, like check().
 */
export const programOf = (sourceCode: string, language: string): ProgramTree | {error: ProgramError} => {
  if (!Object.hasOwn(TRANSLATION, language)) return {error: {id: ERROR.UNKNOWN_LANGUAGE, language}};

  try {
    const lines = lexer.tokenize(sourceCode, language);
    const statements = parser.parse(lines);
    const names: Record<string, string> = {};
    for (const {tokens} of lines) {
      for (const token of tokens) {
        if (token.type === 'identifier' && !Object.hasOwn(names, token.value)) names[token.value] = token.text!;
      }
    }
    return {format: TREE_FORMAT, language, statements, comments: lexer.commentsOf(sourceCode, language), names};
  } catch (error) {
    if (error instanceof CmilError) return {error: error.error};
    throw error;
  }
};
