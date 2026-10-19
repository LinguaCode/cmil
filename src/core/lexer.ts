/**
 * Splits CMIL source code, whose commands are already converted to @commands by the translator,
 * into lines of tokens.
 */
import CmilError from './error.ts';
import {STATUS} from '../constants/index.ts';
import type {Line, Token} from './types.ts';

const QUOTES: Record<string, string> = {
  '«': '»',
  '"': '"',
  "'": "'"
};

//the Armenian one dot leader is the decimal point on Armenian keyboards
const DECIMAL_POINTS = ['.', '․'];

const ESCAPES: Record<string, string> = {
  n: '\n',
  t: '\t'
};

const OPERATORS = ['==', '!=', '<=', '>=', '<', '>', '=', '+', '-', '*', '/', '%', '(', ')', ','];

const IDENTIFIER_START = /[\p{L}\p{M}_]/u;
const IDENTIFIER_PART = /[\p{L}\p{M}\p{N}_]/u;
const DIGIT = /[0-9]/;
const COMMAND_PART = /[a-z_]/;

const syntaxError = (line: number) => new CmilError(STATUS.SYNTAX_ERROR, {line});

const readString = (text: string, start: number, lineNumber: number) => {
  const closingQuote = QUOTES[text[start]];
  let value = '';

  for (let i = start + 1; i < text.length; i++) {
    const symbol = text[i];
    if (symbol === '\\' && i + 1 < text.length) {
      const escaped = text[++i];
      value += Object.hasOwn(ESCAPES, escaped) ? ESCAPES[escaped] : escaped;
    } else if (symbol === closingQuote) {
      return {value, end: i + 1};
    } else {
      value += symbol;
    }
  }

  throw syntaxError(lineNumber);
};

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
 * Returns the tokens of one line, without its comment.
 *
 * @param text - the line without its indentation.
 */
const tokenizeLine = (text: string, lineNumber: number): Token[] => {
  const tokens: Token[] = [];

  let i = 0;
  while (i < text.length) {
    const symbol = text[i];

    if (/\s/.test(symbol)) {
      i++;
    } else if (symbol === '#') {
      break;
    } else if (Object.hasOwn(QUOTES, symbol)) {
      const string = readString(text, i, lineNumber);
      tokens.push({type: 'string', value: string.value, line: lineNumber});
      i = string.end;
    } else if (DIGIT.test(symbol)) {
      const number = readNumber(text, i, lineNumber);
      tokens.push({type: 'number', value: number.value, line: lineNumber});
      i = number.end;
    } else if (symbol === '@' && COMMAND_PART.test(text[i + 1] || '')) {
      let command = '@';
      i++;
      while (i < text.length && COMMAND_PART.test(text[i])) command += text[i++];
      tokens.push({type: 'command', value: command, line: lineNumber});
    } else if (IDENTIFIER_START.test(symbol)) {
      let name = '';
      while (i < text.length && IDENTIFIER_PART.test(text[i])) name += text[i++];
      tokens.push({type: 'identifier', value: name.toLowerCase(), line: lineNumber});
    } else {
      const operator = OPERATORS.find(candidate => text.startsWith(candidate, i));
      if (!operator) {
        throw syntaxError(lineNumber);
      }
      tokens.push({type: 'operator', value: operator, line: lineNumber});
      i += operator.length;
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
 */
export const tokenize = (sourceCode: string): Line[] => {
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
      tokens: tokenizeLine(text, number)
    }))
    .filter(line => line.tokens.length);
};
