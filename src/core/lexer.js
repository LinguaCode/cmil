/**
 * Splits CMIL source code, whose commands are already converted to @commands by the translator,
 * into lines of tokens.
 */
const CmilError = require('./error');
const STATUS = require('../constants').STATUS;

const QUOTES = {
  '«': '»',
  '"': '"',
  "'": "'"
};

//the Armenian one dot leader is the decimal point on Armenian keyboards
const DECIMAL_POINTS = ['.', '․'];

const ESCAPES = {
  n: '\n',
  t: '\t'
};

const OPERATORS = ['==', '!=', '<=', '>=', '<', '>', '=', '+', '-', '*', '/', '%', '(', ')', ','];

const IDENTIFIER_START = /[\p{L}\p{M}_]/u;
const IDENTIFIER_PART = /[\p{L}\p{M}\p{N}_]/u;
const DIGIT = /[0-9]/;
const COMMAND_PART = /[a-z_]/;

const syntaxError = line => new CmilError(STATUS.SYNTAX_ERROR, {line});

const readString = (text, start, lineNumber) => {
  const closingQuote = QUOTES[text[start]];
  let value = '';

  for (let i = start + 1; i < text.length; i++) {
    const symbol = text[i];
    if (symbol === '\\' && i + 1 < text.length) {
      const escaped = text[++i];
      value += ESCAPES[escaped] || escaped;
    } else if (symbol === closingQuote) {
      return {value, end: i + 1};
    } else {
      value += symbol;
    }
  }

  throw syntaxError(lineNumber);
};

const readNumber = (text, start, lineNumber) => {
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
 * @param {String} text - the line without its indentation.
 * @param {Number} lineNumber
 * @returns {Array.<Object>} tokens of {type, value, line}.
 */
const tokenizeLine = (text, lineNumber) => {
  const tokens = [];
  const token = (type, value) => tokens.push({type, value, line: lineNumber});

  let i = 0;
  while (i < text.length) {
    const symbol = text[i];

    if (/\s/.test(symbol)) {
      i++;
    } else if (symbol === '#') {
      break;
    } else if (QUOTES[symbol]) {
      const string = readString(text, i, lineNumber);
      token('string', string.value);
      i = string.end;
    } else if (DIGIT.test(symbol)) {
      const number = readNumber(text, i, lineNumber);
      token('number', number.value);
      i = number.end;
    } else if (symbol === '@' && COMMAND_PART.test(text[i + 1] || '')) {
      let command = '@';
      i++;
      while (i < text.length && COMMAND_PART.test(text[i])) command += text[i++];
      token('command', command);
    } else if (IDENTIFIER_START.test(symbol)) {
      let name = '';
      while (i < text.length && IDENTIFIER_PART.test(text[i])) name += text[i++];
      token('identifier', name.toLowerCase());
    } else {
      const operator = OPERATORS.find(candidate => text.startsWith(candidate, i));
      if (!operator) {
        throw syntaxError(lineNumber);
      }
      token('operator', operator);
      i += operator.length;
    }
  }

  return tokens;
};

const INDENT_SIZE = 4;

/**
 * Returns the lines of the source code that contain tokens.
 * The indentation of every line is checked first, so an indentError is reported before any syntaxError.
 *
 * @param {String} sourceCode - Unix or Windows line endings.
 * @returns {Array.<Object>} lines of {number, level, tokens}, where level is the indentation level.
 */
exports.tokenize = sourceCode => {
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
