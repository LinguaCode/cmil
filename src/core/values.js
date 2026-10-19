/**
 * Values of CMIL programs: numbers, texts and booleans, their operators and the math functions.
 */
const {COMMAND, BOOLEAN_DEFINITION} = require('../constants');

const marker = word => `<${BOOLEAN_DEFINITION[word]}/>`;

/**
 * Converts a value into text: booleans, NaN and Infinity become markers which the user interface translates.
 *
 * @example
 * values.toText(4 > 2);
 * // returns '<true/>'
 *
 * @param {Number|String|Boolean} value
 * @returns {String}
 */
const toText = (exports.toText = value => {
  if (typeof value === 'boolean') return marker(String(value));
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return marker('NaN');
    if (value === Infinity) return marker('Infinity');
    if (value === -Infinity) return `-${marker('Infinity')}`;
  }

  return String(value);
});

const isNumeric = value => !isNaN(parseFloat(value)) && isFinite(value);

/**
 * Converts an input into a number when it is numeric, else into a text.
 *
 * @example
 * values.fromInput('-25');
 * // returns -25
 *
 * @param {String|Number} input
 * @returns {Number|String}
 */
exports.fromInput = input => (isNumeric(input) ? parseFloat(input) : String(input));

/**
 * Applies a binary operator; JavaScript semantics on numbers, texts and booleans.
 * A text joined with any value is joined with the value's text.
 *
 * @param {String} operator
 * @param {Number|String|Boolean} left
 * @param {Number|String|Boolean} right
 * @returns {Number|String|Boolean}
 */
exports.binary = (operator, left, right) => {
  switch (operator) {
    case '+':
      return typeof left === 'string' || typeof right === 'string' ? toText(left) + toText(right) : left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return left / right;
    case '%':
      return left % right;
    case '==':
      return left == right;
    case '!=':
      return left != right;
    case '<':
      return left < right;
    case '>':
      return left > right;
    case '<=':
      return left <= right;
    case '>=':
      return left >= right;
  }
};

const fixed = value => parseFloat(value.toFixed(10));

const tan = value => (value == Math.PI / 2 ? Infinity : value == Math.PI ? 0 : fixed(Math.tan(value)));

/**
 * Math functions by their commands, with the allowed counts of arguments.
 */
exports.FUNCTIONS = {
  [COMMAND.POW]: {min: 2, max: 2, apply: (base, exponent) => Math.pow(base, exponent)},
  [COMMAND.SQRT]: {min: 1, max: 1, apply: value => Math.pow(value, 1 / 2)},
  [COMMAND.SQR]: {min: 1, max: 1, apply: value => Math.pow(value, 2)},
  [COMMAND.ROUND]: {min: 1, max: 1, apply: Math.round},
  [COMMAND.FLOOR]: {min: 1, max: 1, apply: Math.floor},
  [COMMAND.CEIL]: {min: 1, max: 1, apply: Math.ceil},
  [COMMAND.LG]: {min: 1, max: 1, apply: Math.log10},
  [COMMAND.LN]: {min: 1, max: 1, apply: Math.log},
  [COMMAND.LOG]: {min: 2, max: 2, apply: (base, value) => Math.log(value) / Math.log(base)},
  [COMMAND.RANDOM]: {
    min: 1,
    max: 2,
    apply: (min, max) => {
      if (max === undefined) {
        max = min;
        min = 0;
      }
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
  },
  [COMMAND.ABS]: {min: 1, max: 1, apply: Math.abs},
  [COMMAND.ARCSIN]: {min: 1, max: 1, apply: Math.asin},
  [COMMAND.ARCCOS]: {min: 1, max: 1, apply: Math.acos},
  [COMMAND.ARCTAN]: {min: 1, max: 1, apply: Math.atan},
  [COMMAND.ARCCTG]: {min: 1, max: 1, apply: value => Math.PI / 2 - Math.atan(value)},
  [COMMAND.SIN]: {min: 1, max: 1, apply: value => fixed(Math.sin(value))},
  [COMMAND.COS]: {min: 1, max: 1, apply: value => fixed(Math.cos(value))},
  [COMMAND.TAN]: {min: 1, max: 1, apply: tan},
  [COMMAND.CTG]: {min: 1, max: 1, apply: value => 1 / tan(value)}
};

exports.CONSTANTS = {
  [COMMAND.PI]: Math.PI,
  [COMMAND.E]: Math.E
};
