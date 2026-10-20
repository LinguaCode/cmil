/**
 * The messages of the errors of programs, in each language.
 */
import TRANSLATION from './translations/index.ts';
import type {ProgramError} from './core/types.ts';

/**
 * Returns the message of an error in a language, or in English when the language is unknown.
 *
 * @example
 * messageOf({id: 'syntaxError', line: 2, column: 8}, 'en');
 * // returns 'Syntax error on line 2.'
 */
export const messageOf = (error: ProgramError, language: string): string => {
  const {messages} = Object.hasOwn(TRANSLATION, language) ? TRANSLATION[language] : TRANSLATION.en;
  const params: Record<string, unknown> = error;

  return messages[error.id].replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in params ? String(params[name]) : placeholder
  );
};
