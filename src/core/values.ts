/**
 * Values of CMIL programs: numbers, texts and booleans, their operators and the math functions.
 * Values are never converted: an operator or a function with values it doesn't take throws a ValueError.
 */
import {COMMAND, ERROR, NUMBER_PRECISION} from '../constants/index.ts';
import type {Value} from './types.ts';

/** A value that doesn't fit its operator or function; the interpreter adds where it happened. */
export class ValueError extends Error {
  id: typeof ERROR.TYPE_ERROR | typeof ERROR.DIVISION_BY_ZERO | typeof ERROR.MATH_ERROR;

  constructor(id: ValueError['id']) {
    super(id);
    this.id = id;
  }
}

const typeError = () => new ValueError(ERROR.TYPE_ERROR);

/** The words a program's language prints for true and false. */
export type Booleans = {true: string; false: string};

/**
 * A number as it is printed and compared: whole numbers as they are, others with 12 significant digits,
 * also whole numbers too large to be exact.
 *
 * @example
 * values.rounded(0.1 + 0.2);
 * // returns 0.3
 */
export const rounded = (value: number): number =>
  Number.isSafeInteger(value) ? value : Number(value.toPrecision(NUMBER_PRECISION));

//all the digits of a number, never 1e-7 or 1e+21, which programs can't write
const digits = (value: number): string => {
  const text = String(value);
  if (!text.includes('e')) return text;
  return Math.abs(value) < 1
    ? value.toLocaleString('en-US', {useGrouping: false, maximumSignificantDigits: NUMBER_PRECISION})
    : value.toLocaleString('en-US', {useGrouping: false, maximumFractionDigits: 0});
};

/**
 * Converts a value into text; booleans become the words of the program's language.
 *
 * @example
 * values.toText(4 > 2, {true: 'ճիշտ', false: 'սխալ'});
 * // returns 'ճիշտ'
 */
export const toText = (value: Value, booleans: Booleans): string => {
  if (typeof value === 'boolean') return value ? booleans.true : booleans.false;
  if (typeof value === 'number') return digits(rounded(value) || 0);
  return value;
};

const isNumeric = (value: string | number) => !isNaN(parseFloat(String(value))) && isFinite(Number(value));

/**
 * Converts an input into a number when it is numeric, else into a text.
 *
 * @example
 * values.fromInput('-25');
 * // returns -25
 */
export const fromInput = (input: string | number): Value =>
  isNumeric(input) ? parseFloat(String(input)) : String(input);

const number = (value: Value): number => {
  if (typeof value !== 'number') throw typeError();
  return value;
};

export const boolean = (value: Value): boolean => {
  if (typeof value !== 'boolean') throw typeError();
  return value;
};

//a result that is not a number, like the square root of -1, or too large to be one
const finite = (value: number): number => {
  if (!Number.isFinite(value)) throw new ValueError(ERROR.MATH_ERROR);
  return value;
};

const divisor = (value: Value): number => {
  if (number(value) === 0) throw new ValueError(ERROR.DIVISION_BY_ZERO);
  return value as number;
};

//numbers with numbers, texts with texts
const compare = (left: Value, right: Value): [number, number] | [string, string] => {
  if (typeof left === 'number' && typeof right === 'number') return [rounded(left), rounded(right)];
  if (typeof left === 'string' && typeof right === 'string') return [left, right];
  throw typeError();
};

//values of different types are never equal
const equals = (left: Value, right: Value): boolean =>
  typeof left === 'number' && typeof right === 'number' ? rounded(left) === rounded(right) : left === right;

/**
 * Applies a binary operator. + adds numbers, or joins a text with any value.
 */
export const binary = (operator: string, left: Value, right: Value, booleans: Booleans): Value => {
  switch (operator) {
    case '+':
      if (typeof left === 'string' || typeof right === 'string') {
        return toText(left, booleans) + toText(right, booleans);
      }
      return finite(number(left) + number(right));
    case '-':
      return finite(number(left) - number(right));
    case '*':
      return finite(number(left) * number(right));
    case '/':
      return finite(number(left) / divisor(right));
    case '%':
      return finite(number(left) % divisor(right));
    case '==':
      return equals(left, right);
    case '!=':
      return !equals(left, right);
  }

  const [a, b] = compare(left, right);
  switch (operator) {
    case '<':
      return a < b;
    case '>':
      return a > b;
    case '<=':
      return a <= b;
    case '>=':
      return a >= b;
  }

  throw new Error(`Unknown operator: ${operator}`);
};

/**
 * Applies a unary operator: - and + on numbers, not on booleans.
 */
export const unary = (operator: string, operand: Value): Value => {
  if (operator === COMMAND.NOT) return !boolean(operand);
  return operator === '-' ? -number(operand) : number(operand);
};

const whole = (value: Value): number => {
  if (!Number.isInteger(number(value))) throw typeError();
  return value as number;
};

//trigonometry is rounded to 12 decimals, so sin(pi) is 0
const trigonometric = (value: number) => Math.round(value * 1e12) / 1e12 || 0;

const tan = (value: Value) => {
  if (trigonometric(Math.cos(number(value))) === 0) throw new ValueError(ERROR.MATH_ERROR);
  return trigonometric(Math.tan(number(value)));
};

const ctg = (value: Value) => {
  if (trigonometric(Math.sin(number(value))) === 0) throw new ValueError(ERROR.MATH_ERROR);
  return trigonometric(1 / Math.tan(number(value)));
};

//rounds to a count of decimals; the product is rounded like printed numbers, so round(1.005, 2) is 1.01
const round = (value: Value, digits: Value = 0) => {
  const factor = 10 ** whole(digits);
  return Math.round(rounded(number(value) * factor)) / factor;
};

type MathFunction = {
  min: number;
  max: number;
  apply: (...args: Value[]) => number;
};

const one = (apply: (value: number) => number): MathFunction => ({
  min: 1,
  max: 1,
  apply: value => finite(apply(number(value)))
});

/**
 * Math functions by their commands, with the allowed counts of arguments.
 */
export const FUNCTIONS: Record<string, MathFunction> = {
  [COMMAND.POW]: {min: 2, max: 2, apply: (base, exponent) => finite(Math.pow(number(base), number(exponent)))},
  [COMMAND.SQRT]: one(Math.sqrt),
  [COMMAND.SQR]: one(value => value * value),
  [COMMAND.ROUND]: {min: 1, max: 2, apply: (value, digits) => finite(round(value, digits))},
  [COMMAND.FLOOR]: one(Math.floor),
  [COMMAND.CEIL]: one(Math.ceil),
  [COMMAND.LG]: one(Math.log10),
  [COMMAND.LN]: one(Math.log),
  [COMMAND.LOG]: {
    min: 2,
    max: 2,
    apply: (base, value) => finite(Math.log(number(value)) / Math.log(number(base)))
  },
  [COMMAND.RANDOM]: {
    min: 1,
    max: 2,
    apply: (first, second) => {
      const [min, max] = second === undefined ? [0, whole(first)] : [whole(first), whole(second)];
      if (min > max) throw new ValueError(ERROR.MATH_ERROR);
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
  },
  [COMMAND.ABS]: one(Math.abs),
  [COMMAND.ARCSIN]: one(Math.asin),
  [COMMAND.ARCCOS]: one(Math.acos),
  [COMMAND.ARCTAN]: one(Math.atan),
  [COMMAND.ARCCTG]: one(value => Math.PI / 2 - Math.atan(value)),
  [COMMAND.SIN]: one(value => trigonometric(Math.sin(value))),
  [COMMAND.COS]: one(value => trigonometric(Math.cos(value))),
  [COMMAND.TAN]: {min: 1, max: 1, apply: tan},
  [COMMAND.CTG]: {min: 1, max: 1, apply: ctg}
};

export const CONSTANTS: Record<string, number> = {
  [COMMAND.PI]: Math.PI,
  [COMMAND.E]: Math.E
};

/**
 * The passes of repeat … times: a whole number, not below 0.
 */
export const passes = (value: Value): number => {
  if (whole(value) < 0) throw typeError();
  return value as number;
};
