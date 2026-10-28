/**
 * CMIL in CodeMirror 6, the entry cmil/codemirror: the colors of a language's programs as classes, their
 * indentation, quotes, completions and errors, and the lines of two editors that go with each other. It takes the
 * CodeMirror packages the page has, which are peer dependencies of CMIL.
 */
import {syntaxHighlighting} from '@codemirror/language';
import type {Extension} from '@codemirror/state';

import {cmilCompletion} from './complete.ts';
import {cmilIndent} from './indent.ts';
import {cmilLanguage, highlighter, type ColorOptions} from './language.ts';
import {cmilLint} from './lint.ts';
import {closeQuotes} from './quotes.ts';

export {cmilLanguage, highlighter, tokenClasses, tokensOf} from './language.ts';
export {cmilIndent, indentationOf, INDENT} from './indent.ts';
export {closeQuotes, closeComposed, insideText, typeQuote} from './quotes.ts';
export {cmilCompletion, commandCompletions, namesOf} from './complete.ts';
export {cmilLint, diagnosticOf, markError} from './lint.ts';
export {linkedLines, markLines, showLines} from './linked.ts';

export type {ColorOptions, Token} from './language.ts';

/**
 * CMIL in one of its languages: its colors, as the classes of tokenClasses unless classes is false, its indentation,
 * quotes, completions, and its errors and warnings.
 *
 * @example
 * new EditorView({doc: 'print("Hi")', extensions: cmil('en'), parent: document.body});
 * //colored by the page's own highlighter
 * new EditorView({doc: 'print("Hi")', extensions: [cmil('en', {classes: false}), syntaxHighlighting(style)], parent});
 */
export const cmil = (language: string, options?: ColorOptions): Extension => [
  cmilLanguage(language),
  options?.classes === false ? [] : syntaxHighlighting(highlighter),
  cmilIndent(language),
  closeQuotes(language),
  cmilCompletion(language),
  cmilLint(language)
];
