/**
 * Values of CMIL programs: numbers, texts, booleans and lists, their operators and the functions.
 * Values are never converted: an operator or a function with values it doesn't take throws a ValueError.
 */
import {COMMAND, ERROR, MAX_LIST_LENGTH, MAX_TEXT_LENGTH, NUMBER_PRECISION} from '../constants/index.ts';
import {quote} from './words.ts';
import type {Quotes} from '../translations/index.ts';
import type {Value} from './types.ts';

/** A value that doesn't fit its operator or function; the interpreter adds where it happened. */
export class ValueError extends Error {
  id:
    | typeof ERROR.TYPE_ERROR
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

//a list as [1, 2, "a"], with the texts in the quotes of the language, built without recursion so deep lists can't
//overflow the stack;
//a list inside itself is [...], and a text longer than a text may be is a memoryLimit
const listText = (root: Value[], format: Format): string => {
  let printed = '[';
  const open = new Set([root]);
  const stack = [{list: root, index: 0}];

  while (stack.length) {
    const frame = stack[stack.length - 1];
    if (frame.index === frame.list.length) {
      printed += ']';
      open.delete(frame.list);
      stack.pop();
      continue;
    }

    if (frame.index) printed += ', ';
    const next = frame.list[frame.index++];
    if (!Array.isArray(next)) {
      printed += typeof next === 'string' ? quote(next, format.quotes) : toText(next, format);
    } else if (open.has(next)) {
      printed += '[...]';
    } else {
      printed += '[';
      open.add(next);
      stack.push({list: next, index: 0});
    }

    if (printed.length > MAX_TEXT_LENGTH) throw new ValueError(ERROR.MEMORY_LIMIT);
  }

  return printed;
};

/**
 * Converts a value into text; booleans become the words of the program's language.
 *
 * @example
 * values.toText(4 > 2, {true: 'ճիշտ', false: 'սխալ', quotes: ['«', '»']});
 * // returns 'ճիշտ'
 */
export const toText = (value: Value, format: Format): string => {
  if (typeof value === 'boolean') return value ? format.true : format.false;
  if (typeof value === 'number') return digits(rounded(value) || 0);
  if (Array.isArray(value)) return listText(value, format);
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

//lists are equal when their items are; a pair of lists met again counts as equal, so lists inside themselves compare
const listsEqual = (left: Value[], right: Value[]): boolean => {
  const compared = new Map<Value[], Set<Value[]>>();
  const pairs: [Value[], Value[]][] = [[left, right]];

  for (let pair; (pair = pairs.pop());) {
    const [a, b] = pair;
    if (a === b) continue;

    let seen = compared.get(a);
    if (!seen) compared.set(a, (seen = new Set()));
    if (seen.has(b)) continue;
    seen.add(b);

    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      const [x, y] = [a[i], b[i]];
      if (Array.isArray(x) && Array.isArray(y)) pairs.push([x, y]);
      else if (!equals(x, y)) return false;
    }
  }

  return true;
};

//values of different types are never equal
const equals = (left: Value, right: Value): boolean => {
  if (Array.isArray(left) && Array.isArray(right)) return listsEqual(left, right);
  return typeof left === 'number' && typeof right === 'number' ? rounded(left) === rounded(right) : left === right;
};

/**
 * Applies a binary operator. + adds numbers, or joins a text with any value; == compares lists by their items.
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
 * The items a for … in loop passes: a copy of a list, so changing the list doesn't change the loop,
 * or the letters of a text.
 */
export const sequence = (value: Value): Value[] =>
  typeof value === 'string' ? Array.from(value) : list(value).slice();

type BuiltIn = {
  min: number;
  max: number;
  apply: (args: Value[], format: Format) => Value;
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
    apply: ([first, second]) => {
      const [min, max] = second === undefined ? [0, whole(first)] : [whole(first), whole(second)];
      if (min > max) throw new ValueError(ERROR.MATH_ERROR);
      return Math.floor(Math.random() * (max - min + 1) + min);
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
  [COMMAND.TEXT]: {min: 1, max: 1, apply: ([value], format) => toText(value, format)}
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
