/**
 * Splits CMIL source code into lines of tokens; the commands are written in the words of the program's language.
 */
import CmilError from './error.ts';
import {STATUS} from '../constants/index.ts';
import {DECIMAL_POINTS, DIGIT, IDENTIFIER_PART, scan} from './words.ts';
import type {Line, Token} from './types.ts';

const OPERATORS = ['==', '!=', '<=', '>=', '<', '>', '=', '+', '-', '*', '/', '%', '(', ')', ','];

const syntaxError = (line: number) => new CmilError(STATUS.SYNTAX_ERROR, {line});

const readNumber = (text: string, start: number, lineNumber: number) => {
  let i = start;
  let digits = '';

  while (i < text.length && DIGIT.test(text[i])) digits += text[i++];

  if (DECIMAL_POINTS.includes(text[i]) && DIGIT.test(text[i + 1] || '')) {
    digits += '.';
    i++;
    while (i < text.length && DIGIT.test(text[i])) digits += text[i++];
  }

  //like 1x
  if (i < text.length && IDENTIFIER_PART.test(text[i])) {
    throw syntaxError(lineNumber);
  }

  return {value: parseFloat(digits), end: i};
};

/**
 * Adds the numbers and operators between the words and texts of a line.
 */
const tokenizeOther = (text: string, lineNumber: number, tokens: Token[]) => {
  let i = 0;
  while (i < text.length) {
    const symbol = text[i];

    if (/\s/.test(symbol)) {
      i++;
    } else if (DIGIT.test(symbol)) {
      const number = readNumber(text, i, lineNumber);
      tokens.push({type: 'number', value: number.value, line: lineNumber});
      i = number.end;
    } else {
      const operator = OPERATORS.find(candidate => text.startsWith(candidate, i));
      if (!operator) {
        throw syntaxError(lineNumber);
      }
      tokens.push({type: 'operator', value: operator, line: lineNumber});
      i += operator.length;
    }
  }
};

/**
 * Returns the tokens of one line, without its comment.
 *
 * @param text - the line without its indentation.
 */
const tokenizeLine = (text: string, lineNumber: number, language: string): Token[] => {
  const tokens: Token[] = [];

  for (const segment of scan(text, language)) {
    if (segment.type === 'comment') break;

    if (segment.type === 'keyword') {
      tokens.push({type: 'command', value: segment.command, line: lineNumber});
    } else if (segment.type === 'name') {
      tokens.push({type: 'identifier', value: segment.text.toLowerCase(), line: lineNumber});
    } else if (segment.type === 'string') {
      if (!segment.closed) {
        throw syntaxError(lineNumber);
      }
      tokens.push({type: 'string', value: segment.value, line: lineNumber});
    } else {
      tokenizeOther(segment.text, lineNumber, tokens);
    }
  }

  return tokens;
};

const INDENT_SIZE = 4;

/**
 * Returns the lines of the source code that contain tokens, with their indentation level.
 * The indentation of every line is checked first, so an indentError is reported before any syntaxError.
 *
 * @param sourceCode - Unix or Windows line endings.
 * @param language - a language of the translations.
 */
export const tokenize = (sourceCode: string, language: string): Line[] => {
  const lines = sourceCode
    .replace(/\r/g, '')
    .split('\n')
    .map((text, index) => {
      const spaces = text.length - text.replace(/^ +/, '').length;
      return {number: index + 1, spaces, text: text.slice(spaces)};
    })
    .filter(({text}) => text.trim() && !text.startsWith('#'));

  const misindented = lines.find(({spaces}) => spaces % INDENT_SIZE !== 0);
  if (misindented) {
    throw new CmilError(STATUS.INDENT_ERROR, {line: misindented.number});
  }

  return lines
    .map(({number, spaces, text}) => ({
      number,
      level: spaces / INDENT_SIZE,
      tokens: tokenizeLine(text, number, language)
    }))
    .filter(line => line.tokens.length);
};
