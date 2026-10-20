/**
 * Values of CMIL programs: numbers, texts and booleans, their operators and the math functions.
 */
import {COMMAND} from '../constants/index.ts';
import type {Value} from './types.ts';

const marker = (word: 'true' | 'false' | 'NaN' | 'Infinity') => `<${word}/>`;

//operators and math functions convert mixed values like JavaScript does, for example '6' * 2 is 12
const num = (value: Value | undefined): number => value as number;

/**
 * Converts a value into text: booleans, NaN and Infinity become markers which the user interface translates.
 *
 * @example
 * values.toText(4 > 2);
 * // returns '<true/>'
 */
export const toText = (value: Value): string => {
  if (typeof value === 'boolean') return marker(value ? 'true' : 'false');
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return marker('NaN');
    if (value === Infinity) return marker('Infinity');
    if (value === -Infinity) return `-${marker('Infinity')}`;
  }

  return String(value);
};

const isNumeric = (value: string | number) => !isNaN(parseFloat(String(value))) && isFinite(num(value));

/**
 * Converts an input into a number when it is numeric, else into a text.
 *
 * @example
 * values.fromInput('-25');
 * // returns -25
 */
export const fromInput = (input: string | number): Value =>
  isNumeric(input) ? parseFloat(String(input)) : String(input);

/**
 * Applies a binary operator; JavaScript semantics on numbers, texts and booleans.
 * A text joined with any value is joined with the value's text.
 */
export const binary = (operator: string, left: Value, right: Value): Value => {
  switch (operator) {
    case '+':
      return typeof left === 'string' || typeof right === 'string'
        ? toText(left) + toText(right)
        : num(left) + num(right);
    case '-':
      return num(left) - num(right);
    case '*':
      return num(left) * num(right);
    case '/':
      return num(left) / num(right);
    case '%':
      return num(left) % num(right);
    case '==':
      return left == right;
    case '!=':
      return left != right;
    case '<':
      return num(left) < num(right);
    case '>':
      return num(left) > num(right);
    case '<=':
      return num(left) <= num(right);
    case '>=':
      return num(left) >= num(right);
  }

  throw new Error(`Unknown operator: ${operator}`);
};

const fixed = (value: number) => parseFloat(value.toFixed(10));

const tan = (value: Value) => (value == Math.PI / 2 ? Infinity : value == Math.PI ? 0 : fixed(Math.tan(num(value))));

type MathFunction = {
  min: number;
  max: number;
  apply: (...args: Value[]) => Value;
};

/**
 * Math functions by their commands, with the allowed counts of arguments.
 */
export const FUNCTIONS: Record<string, MathFunction> = {
  [COMMAND.POW]: {min: 2, max: 2, apply: (base, exponent) => Math.pow(num(base), num(exponent))},
  [COMMAND.SQRT]: {min: 1, max: 1, apply: value => Math.pow(num(value), 1 / 2)},
  [COMMAND.SQR]: {min: 1, max: 1, apply: value => Math.pow(num(value), 2)},
  [COMMAND.ROUND]: {min: 1, max: 1, apply: value => Math.round(num(value))},
  [COMMAND.FLOOR]: {min: 1, max: 1, apply: value => Math.floor(num(value))},
  [COMMAND.CEIL]: {min: 1, max: 1, apply: value => Math.ceil(num(value))},
  [COMMAND.LG]: {min: 1, max: 1, apply: value => Math.log10(num(value))},
  [COMMAND.LN]: {min: 1, max: 1, apply: value => Math.log(num(value))},
  [COMMAND.LOG]: {min: 2, max: 2, apply: (base, value) => Math.log(num(value)) / Math.log(num(base))},
  [COMMAND.RANDOM]: {
    min: 1,
    max: 2,
    apply: (first, second) => {
      let min = num(first);
      let max = num(second);
      if (second === undefined) {
        max = min;
        min = 0;
      }
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
  },
  [COMMAND.ABS]: {min: 1, max: 1, apply: value => Math.abs(num(value))},
  [COMMAND.ARCSIN]: {min: 1, max: 1, apply: value => Math.asin(num(value))},
  [COMMAND.ARCCOS]: {min: 1, max: 1, apply: value => Math.acos(num(value))},
  [COMMAND.ARCTAN]: {min: 1, max: 1, apply: value => Math.atan(num(value))},
  [COMMAND.ARCCTG]: {min: 1, max: 1, apply: value => Math.PI / 2 - Math.atan(num(value))},
  [COMMAND.SIN]: {min: 1, max: 1, apply: value => fixed(Math.sin(num(value)))},
  [COMMAND.COS]: {min: 1, max: 1, apply: value => fixed(Math.cos(num(value)))},
  [COMMAND.TAN]: {min: 1, max: 1, apply: tan},
  [COMMAND.CTG]: {min: 1, max: 1, apply: value => 1 / tan(value)}
};

export const CONSTANTS: Record<string, number> = {
  [COMMAND.PI]: Math.PI,
  [COMMAND.E]: Math.E
};
