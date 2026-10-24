/**
 * Values of CMIL programs: numbers, texts, booleans and lists, their operators and the functions.
 * Values are never converted: an operator or a function with values it doesn't take throws a ValueError.
 */
import {COMMAND, ERROR, MAX_LIST_LENGTH, NUMBER_PRECISION} from '../constants/index.ts';
import {quote} from './words.ts';
import type {Quotes} from '../translations/index.ts';
import type {Value} from './types.ts';

/** A value that doesn't fit its operator or function; the interpreter adds where it happened. */
export class ValueError extends Error {
  id:
    | typeof ERROR.TYPE_ERROR
    | typeof ERROR.LIST_AS_TEXT
    | typeof ERROR.DIVISION_BY_ZERO
    | typeof ERROR.MATH_ERROR
    | typeof ERROR.INDEX_ERROR
    | typeof ERROR.MEMORY_LIMIT;
  //the index of an indexError
  index: number;

  constructor(id: ValueError['id'], index = 0) {
    super(id);
    this.id = id;
    this.index = index;
  }
}

const typeError = () => new ValueError(ERROR.TYPE_ERROR);

/** How a program's language prints values: its words for true and false, and the quotes of texts in lists. */
export type Format = {true: string; false: string; quotes: Quotes};

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
 * A value as an error names an item of a list: a text in quotes, other values as they are printed.
 */
export const itemText = (value: Value, format: Format): string =>
  typeof value === 'string' ? quote(value, format.quotes) : toText(value, format);

/**
 * Converts a value into text; booleans become the words of the program's language. A list is no text: its items are
 * joined into one by join, or printed one by one, so a list here is a listAsText.
 *
 * @example
 * values.toText(4 > 2, {true: 'ճիշտ', false: 'սխալ', quotes: ['«', '»']});
 * // returns 'ճիշտ'
 */
export const toText = (value: Value, format: Format): string => {
  if (typeof value === 'boolean') return value ? format.true : format.false;
  if (typeof value === 'number') return digits(rounded(value) || 0);
  if (Array.isArray(value)) throw new ValueError(ERROR.LIST_AS_TEXT);
  return value;
};

//a decimal number, like 25, -2.5, .5 or 1e3, with spaces around it; 0x10 is a text, not 16 or 0
const DECIMAL = /^\s*[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?\s*$/i;
const isNumeric = (value: string | number) => DECIMAL.test(String(value)) && isFinite(Number(value));

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

//values of different types are never equal; lists aren't compared, as their items are one by one
const equals = (left: Value, right: Value): boolean => {
  if (Array.isArray(left) || Array.isArray(right)) throw typeError();
  return typeof left === 'number' && typeof right === 'number' ? rounded(left) === rounded(right) : left === right;
};

//whether an item of a list is a value, which is no list; an item that is a list never is
const isItem = (item: Value, value: Value): boolean => !Array.isArray(item) && equals(item, value);

/**
 * Applies a binary operator. + adds numbers, or joins a text with a number, a text or a boolean; == compares numbers,
 * texts and booleans, never lists.
 */
export const binary = (operator: string, left: Value, right: Value, format: Format): Value => {
  switch (operator) {
    case '+':
      if (typeof left === 'string' || typeof right === 'string') {
        return toText(left, format) + toText(right, format);
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
    //a value in a list, which is no list, or a text in a text
    case COMMAND.IN:
      if (Array.isArray(left)) throw typeError();
      if (Array.isArray(right)) return right.some(item => isItem(item, left));
      if (typeof right === 'string' && typeof left === 'string') return right.includes(left);
      throw typeError();
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

const cot = (value: Value) => {
  if (trigonometric(Math.sin(number(value))) === 0) throw new ValueError(ERROR.MATH_ERROR);
  return trigonometric(1 / Math.tan(number(value)));
};

//rounds to a count of decimals; the product is rounded like printed numbers, so round(1.005, 2) is 1.01
const round = (value: Value, digits: Value = 0) => {
  const factor = 10 ** whole(digits);
  return Math.round(rounded(number(value) * factor)) / factor;
};

const text = (value: Value): string => {
  if (typeof value !== 'string') throw typeError();
  return value;
};

const list = (value: Value): Value[] => {
  if (!Array.isArray(value)) throw typeError();
  return value;
};

//the letters of a text: a letter outside the basic plane, like most emoji, is one letter, not two halves
const letters = (value: string): string | string[] => (/[\uD800-\uDFFF]/.test(value) ? Array.from(value) : value);

//the items of a list or the letters of a text
const items = (value: Value): Value[] | string | string[] => (typeof value === 'string' ? letters(value) : list(value));

//an index counts from 1; one outside the items is an indexError
const position = (value: Value, length: number): number => {
  const index = rounded(number(value));
  if (!Number.isInteger(index) || index < 1 || index > length) throw new ValueError(ERROR.INDEX_ERROR, index);
  return index - 1;
};

/**
 * The item of a list, or the letter of a text, at an index from 1.
 *
 * @example
 * values.item(['a', 'b'], 2);
 * // returns 'b'
 */
export const item = (target: Value, index: Value): Value => {
  const all = items(target);
  return all[position(index, all.length)];
};

/**
 * Replaces the item of a list at an index from 1; texts can't be changed.
 */
export const setItem = (target: Value, index: Value, value: Value): void => {
  const all = list(target);
  all[position(index, all.length)] = value;
};

/**
 * Adds a value at the end of a list.
 */
export const add = (value: Value, target: Value): void => {
  const all = list(target);
  if (all.length >= MAX_LIST_LENGTH) throw new ValueError(ERROR.MEMORY_LIMIT);
  all.push(value);
};

/**
 * Removes the first item of a list equal to a value, which is no list; false when the list has none.
 */
export const remove = (value: Value, target: Value): boolean => {
  const all = list(target);
  if (Array.isArray(value)) throw typeError();
  const index = all.findIndex(item => isItem(item, value));
  if (index < 0) return false;
  all.splice(index, 1);
  return true;
};

/**
 * The items a for … in loop passes: a copy of a list, so changing the list doesn't change the loop,
 * or the letters of a text.
 */
export const sequence = (value: Value): Value[] =>
  typeof value === 'string' ? Array.from(value) : list(value).slice();

type BuiltIn = {
  min: number;
  max: number;
  //random is a number from 0 up to 1, like Math.random()
  apply: (args: Value[], format: Format, random: () => number) => Value;
};

const one = (apply: (value: number) => number): BuiltIn => ({
  min: 1,
  max: 1,
  apply: ([value]) => finite(apply(number(value)))
});

/**
 * The functions by their commands, with the allowed counts of arguments.
 */
export const FUNCTIONS: Record<string, BuiltIn> = {
  [COMMAND.POW]: {min: 2, max: 2, apply: ([base, exponent]) => finite(Math.pow(number(base), number(exponent)))},
  [COMMAND.SQRT]: one(Math.sqrt),
  [COMMAND.SQR]: one(value => value * value),
  [COMMAND.ROUND]: {min: 1, max: 2, apply: ([value, digits]) => finite(round(value, digits))},
  [COMMAND.FLOOR]: one(Math.floor),
  [COMMAND.CEIL]: one(Math.ceil),
  [COMMAND.LG]: one(Math.log10),
  [COMMAND.LN]: one(Math.log),
  [COMMAND.LOG]: {
    min: 2,
    max: 2,
    apply: ([base, value]) => finite(Math.log(number(value)) / Math.log(number(base)))
  },
  [COMMAND.RANDOM]: {
    min: 1,
    max: 2,
    apply: ([first, second], _format, random) => {
      //from 1, like a die and the items of a list
      const [min, max] = second === undefined ? [1, whole(first)] : [whole(first), whole(second)];
      if (min > max) throw new ValueError(ERROR.MATH_ERROR);
      return Math.floor(random() * (max - min + 1) + min);
    }
  },
  [COMMAND.ABS]: one(Math.abs),
  [COMMAND.ARCSIN]: one(Math.asin),
  [COMMAND.ARCCOS]: one(Math.acos),
  [COMMAND.ARCTAN]: one(Math.atan),
  [COMMAND.ARCCOT]: one(value => Math.PI / 2 - Math.atan(value)),
  [COMMAND.SIN]: one(value => trigonometric(Math.sin(value))),
  [COMMAND.COS]: one(value => trigonometric(Math.cos(value))),
  [COMMAND.TAN]: {min: 1, max: 1, apply: ([value]) => tan(value)},
  [COMMAND.COT]: {min: 1, max: 1, apply: ([value]) => cot(value)},

  [COMMAND.LENGTH]: {min: 1, max: 1, apply: ([value]) => items(value).length},
  [COMMAND.UPPER]: {min: 1, max: 1, apply: ([value]) => text(value).toUpperCase()},
  [COMMAND.LOWER]: {min: 1, max: 1, apply: ([value]) => text(value).toLowerCase()},
  //a number as it is, or a text that is a number, read like an input
  [COMMAND.NUMBER]: {
    min: 1,
    max: 1,
    apply: ([value]) => {
      const result = typeof value === 'string' ? fromInput(value) : value;
      if (typeof result !== 'number') throw typeError();
      return result;
    }
  },
  [COMMAND.TEXT]: {min: 1, max: 1, apply: ([value], format) => toText(value, format)},
  //the words of a text, or its parts between a separator; an empty separator gives its letters
  [COMMAND.SPLIT]: {
    min: 1,
    max: 2,
    apply: ([value, separator]) => {
      if (separator === undefined) return text(value).trim() ? text(value).trim().split(/\s+/) : [];
      return text(separator) ? text(value).split(text(separator)) : Array.from(text(value));
    }
  },
  //the items of a list as they are printed, joined with a separator, or with nothing
  [COMMAND.JOIN]: {
    min: 1,
    max: 2,
    apply: ([value, separator = ''], format) =>
      list(value)
        .map(item => toText(item, format))
        .join(text(separator))
  }
};

export const CONSTANTS: Record<string, number> = {
  [COMMAND.PI]: Math.PI,
  [COMMAND.E]: Math.E
};

/**
 * The bounds of for … from … to … step: numbers, with a step that isn't 0.
 */
export const bounds = (from: Value, to: Value, step: Value): [number, number, number] => [
  number(from),
  number(to),
  number(step)
];

export const nonZero = (value: number): number => {
  if (value === 0) throw typeError();
  return value;
};

/**
 * The passes of repeat … times: a whole number, not below 0.
 */
export const passes = (value: Value): number => {
  if (whole(value) < 0) throw typeError();
  return value as number;
};
