/**
 * Splits CMIL source code into lines of tokens; the commands are written in the words of the program's language.
 */
import CmilError from './error.ts';
import {ERROR} from '../constants/index.ts';
import {DECIMAL_POINTS, DIGIT, IDENTIFIER_PART, scan} from './words.ts';
import type {Line, Token} from './types.ts';

const OPERATORS = ['==', '!=', '<=', '>=', '<', '>', '=', '+', '-', '*', '/', '%', '(', ')', ','];

const syntaxError = (line: number, column: number) => new CmilError({id: ERROR.SYNTAX_ERROR, line, column});

//a number from start; offset is the column of the text before it
const readNumber = (text: string, start: number, lineNumber: number, offset: number) => {
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
    throw syntaxError(lineNumber, offset + i + 1);
  }

  return {value: parseFloat(digits), end: i};
};

/**
 * Adds the numbers and operators between the words and texts of a line.
 *
 * @param offset - the column of the line before text.
 */
const tokenizeOther = (text: string, offset: number, lineNumber: number, tokens: Token[]) => {
  let i = 0;
  while (i < text.length) {
    const symbol = text[i];
    const column = offset + i + 1;

    if (/\s/.test(symbol)) {
      i++;
    } else if (DIGIT.test(symbol)) {
      const number = readNumber(text, i, lineNumber, offset);
      tokens.push({type: 'number', value: number.value, line: lineNumber, column});
      i = number.end;
    } else {
      const operator = OPERATORS.find(candidate => text.startsWith(candidate, i));
      if (!operator) {
        throw syntaxError(lineNumber, column);
      }
      tokens.push({type: 'operator', value: operator, line: lineNumber, column});
      i += operator.length;
    }
  }
};

/**
 * Returns the tokens of one line, without its comment.
 *
 * @param text - the line without its indentation.
 * @param indent - the length of the indentation.
 */
const tokenizeLine = (text: string, indent: number, lineNumber: number, language: string): Token[] => {
  const tokens: Token[] = [];
  let offset = indent;

  for (const segment of scan(text, language)) {
    if (segment.type === 'comment') break;
    const position = {line: lineNumber, column: offset + 1};

    if (segment.type === 'keyword') {
      tokens.push({type: 'command', value: segment.command, ...position});
    } else if (segment.type === 'name') {
      tokens.push({type: 'identifier', value: segment.text.toLowerCase(), ...position});
    } else if (segment.type === 'string') {
      if (!segment.closed) {
        throw syntaxError(lineNumber, position.column);
      }
      tokens.push({type: 'string', value: segment.value, ...position});
    } else {
      tokenizeOther(segment.text, offset, lineNumber, tokens);
    }
    offset += segment.text.length;
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
    throw new CmilError({id: ERROR.INDENT_ERROR, line: misindented.number});
  }

  return lines
    .map(({number, spaces, text}) => ({
      number,
      level: spaces / INDENT_SIZE,
      tokens: tokenizeLine(text, spaces, number, language)
    }))
    .filter(line => line.tokens.length);
};
