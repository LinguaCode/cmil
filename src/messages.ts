/**
 * The messages of the errors of programs, in each language.
 */
import TRANSLATION from './translations/index.ts';
import {ERROR} from './constants/index.ts';
import type {ProgramError} from './core/types.ts';
import type {ConversionProblem} from './convert/index.ts';

/**
 * Returns the message of an error in a language, or in English when the language is unknown.
 * The count of an argumentError is its number of arguments, like 2, or 1–2 when it takes from 1 to 2.
 *
 * @example
 * messageOf({id: 'syntaxError', line: 2, column: 8}, 'en');
 * // returns 'Syntax error on line 2.'
 */
export const messageOf = (error: ProgramError, language: string): string => {
  const known = Object.hasOwn(TRANSLATION, language);
  const {messages} = TRANSLATION[known ? language : 'en'];
  const params: Record<string, unknown> = {...error};

  let count = 0;
  if (error.id === ERROR.ARGUMENT_ERROR) {
    count = error.max;
    params.count = error.min === error.max ? String(error.max) : `${error.min}–${error.max}`;
  }

  //a message with plural forms takes the form of its count
  const message = messages[error.id];
  const text =
    typeof message === 'string'
      ? message
      : (message[new Intl.PluralRules(known ? language : 'en').select(count)] ?? message.other);

  return text.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in params ? String(params[name]) : placeholder
  );
};

/**
 * Returns the message of a problem of a conversion in a language, or in English when the language is unknown.
 *
 * @example
 * problemOf({id: 'mixedItems', line: 1, target: 'C++'}, 'en');
 * // returns "Line 1: C++ can't write this program: a list has items of two kinds, like numbers and texts."
 */
export const problemOf = (problem: ConversionProblem, language: string): string => {
  const {conversion} = TRANSLATION[Object.hasOwn(TRANSLATION, language) ? language : 'en'];
  const params: Record<string, unknown> = {...problem};
  return conversion[problem.id].replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in params ? String(params[name]) : placeholder
  );
};
