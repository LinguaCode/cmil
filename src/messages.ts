/**
 * The messages of the errors of programs, in each language.
 */
import TRANSLATION from './translations/index.ts';
import {ERROR} from './constants/index.ts';
import type {ProgramError} from './core/types.ts';

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
