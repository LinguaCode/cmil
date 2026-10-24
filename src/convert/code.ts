/**
 * The expressions of a language as trees: a language says what an expression is, and its grammar brackets the parts
 * that its precedence needs in brackets, like (a + b) * c, and prints it with a space around each operator.
 */
import {COMMAND} from '../constants/index.ts';
import type {Expression} from '../core/types.ts';

/** An expression of a language: a name, a literal or code written whole; an operator with its operands; brackets; a
 * call; a property or a method of a value; an item of a list; and items between their brackets, like a list. */
export type Code =
  | {kind: 'atom'; text: string; precedence: number}
  | {kind: 'binary'; operator: string; left: Code; right: Code}
  | {kind: 'unary'; operator: string; operand: Code; precedence: number}
  | {kind: 'paren'; inner: Code}
  | {kind: 'call'; callee: string; args: Code[]}
  | {kind: 'member'; target: Code; name: string; args?: Code[]; separator: string}
  | {kind: 'index'; target: Code; index: Code}
  | {kind: 'items'; open: string; items: Code[]; close: string};

/** How tightly an operator before its operand binds, like -x and !x, above every operator between two operands. */
export const UNARY = 50;
/** How tightly a call, a property or a method, and an item of a list bind, like f(x), x.y and x[1]. */
export const POSTFIX = 90;
/** How tightly a name or a literal binds: it is never in brackets. */
export const ATOM = 100;

/**
 * The operators of a language, and how its expressions are put together and printed.
 */
export class Grammar {
  readonly operators: Record<string, number>;
  readonly tight: ReadonlySet<string>;
  readonly brackets: [string, string];

  /**
   * @param operators - the precedence of each operator between two operands, from 1, the loosest.
   * @param tight - the operators written without spaces around them, like .. in Kotlin's 1..10.
   * @param brackets - the brackets of an index, like list[i], or list(i) in Visual Basic.
   */
  constructor(
    operators: Record<string, number>,
    tight: ReadonlySet<string> = new Set(),
    brackets: [string, string] = ['[', ']']
  ) {
    this.operators = operators;
    this.tight = tight;
    this.brackets = brackets;
  }

  precedenceOf(code: Code): number {
    switch (code.kind) {
      case 'atom':
      case 'unary':
        return code.precedence;
      case 'binary':
        return this.operators[code.operator];
      case 'paren':
      case 'items':
        return ATOM;
      default:
        return POSTFIX;
    }
  }

  /** A name, a literal or code written whole, which binds as tightly as its precedence says. */
  atom(text: string, precedence = ATOM): Code {
    return {kind: 'atom', text, precedence};
  }

  /** An expression in brackets when it binds more loosely than its place needs. */
  bracketed(code: Code, need: number): Code {
    return this.precedenceOf(code) < need ? {kind: 'paren', inner: code} : code;
  }

  /**
   * An operator between two operands, each in brackets when it binds more loosely than its side needs: the left one
   * at least as tightly as the operator, the right one more tightly, or what a language's operator needs, like the
   * ** of Python, which binds from the right.
   */
  binary(operator: string, left: Code, right: Code, needs?: [number, number]): Code {
    const precedence = this.operators[operator];
    const [leftNeed, rightNeed] = needs ?? [precedence, precedence + 1];
    return {
      kind: 'binary',
      operator,
      left: this.bracketed(left, leftNeed),
      right: this.bracketed(right, rightNeed)
    };
  }

  /** An operator before its operand, like -x; - -x is -(-x), since --x would be one less. */
  unary(operator: string, operand: Code, precedence = UNARY): Code {
    const twice =
      (operator === '-' || operator === '+') &&
      ((operand.kind === 'unary' && operand.operator === operator) ||
        (operand.kind === 'atom' && operand.text.startsWith(operator)));
    return {
      kind: 'unary',
      operator,
      operand: twice ? {kind: 'paren', inner: operand} : this.bracketed(operand, precedence),
      precedence
    };
  }

  call(callee: string, args: Code[]): Code {
    return {kind: 'call', callee, args};
  }

  /** A property of a value, like list.size, or with arguments its method, like list.add(x). */
  member(target: Code, name: string, args?: Code[], separator = '.'): Code {
    return {kind: 'member', target: this.bracketed(target, POSTFIX), name, args, separator};
  }

  index(target: Code, index: Code): Code {
    return {kind: 'index', target: this.bracketed(target, POSTFIX), index};
  }

  /** Items between their brackets, like [1, 2] or []int{1, 2}. */
  items(open: string, items: Code[], close: string): Code {
    return {kind: 'items', open, items, close};
  }

  /** An expression as the language writes it. */
  print(code: Code): string {
    const all = (codes: Code[]) => codes.map(each => this.print(each)).join(', ');
    switch (code.kind) {
      case 'atom':
        return code.text;
      case 'binary': {
        const space = this.tight.has(code.operator) ? '' : ' ';
        return `${this.print(code.left)}${space}${code.operator}${space}${this.print(code.right)}`;
      }
      case 'unary':
        return code.operator + this.print(code.operand);
      case 'paren':
        return `(${this.print(code.inner)})`;
      case 'call':
        return `${code.callee}(${all(code.args)})`;
      case 'member':
        return `${this.print(code.target)}${code.separator}${code.name}${code.args ? `(${all(code.args)})` : ''}`;
      case 'index':
        return `${this.print(code.target)}${this.brackets[0]}${this.print(code.index)}${this.brackets[1]}`;
      case 'items':
        return `${code.open}${all(code.items)}${code.close}`;
    }
  }
}

/**
 * The test of a for's counter, as C writes it in for (…; test; …): up to its last value, or down to it, or, for a step
 * whose sign shows only as the program runs, by the sign, like s > 0 ? i <= last : i >= last, as CMIL tests it.
 */
export const counterTest = (
  grammar: Grammar,
  compare: (operator: string) => Code,
  {down, signed}: {down: boolean; signed: boolean},
  step?: Code
): string =>
  signed
    ? `${grammar.print(grammar.binary('>', step!, grammar.atom('0')))} ? ${grammar.print(compare('<='))} : ${grammar.print(compare('>='))}`
    : grammar.print(compare(down ? '>=' : '<='));

/**
 * The test of a for's counter by the sign of a step that shows only as the program runs, for a language without a
 * conditional expression: (s > 0 and i <= last) or (s < 0 and i >= last), with its words for and and or, and its 0,
 * like 0.0 for a real step in Rust.
 */
export const signedTest = (
  grammar: Grammar,
  compare: (operator: string) => Code,
  step: Code,
  [and, or]: [string, string],
  zero = '0'
): Code => {
  const side = (sign: string, operator: string): Code => ({
    kind: 'paren',
    inner: grammar.binary(and, grammar.binary(sign, step, grammar.atom(zero)), compare(operator))
  });
  return grammar.binary(or, side('>', '<='), side('<', '>='));
};

/** The index from 0 of an index of CMIL, which counts from 1: a number one less, else the index minus 1. */
export const fromZero = (grammar: Grammar, index: Expression, write: (node: Expression) => Code): Code =>
  index.type === 'value' && typeof index.value === 'number'
    ? grammar.atom(String(index.value - 1))
    : grammar.binary('-', write(index), grammar.atom('1'));

//the functions of CMIL's math by the names most languages give them
const MATH: Record<string, string> = {
  [COMMAND.SQRT]: 'sqrt',
  [COMMAND.POW]: 'pow',
  [COMMAND.SIN]: 'sin',
  [COMMAND.COS]: 'cos',
  [COMMAND.TAN]: 'tan',
  [COMMAND.ARCSIN]: 'asin',
  [COMMAND.ARCCOS]: 'acos',
  [COMMAND.ARCTAN]: 'atan',
  [COMMAND.LN]: 'log',
  [COMMAND.LG]: 'log10'
};

/**
 * A function of CMIL's math in a language: by the name most languages give it, like asin, which call writes the
 * language's way, like Math.asin or std::asin; cot, arccot and the log of a base, which most languages don't have,
 * with tan, atan and log; nothing for the others.
 */
export const mathOf = (
  grammar: Grammar,
  command: string,
  args: Code[],
  call: (name: string, args: Code[]) => Code,
  pi: () => Code,
  //a number of the formulas, like 2, as the language writes it where it is a real number, like 2.0 in Rust
  number: (value: number) => Code = value => grammar.atom(String(value))
): Code | undefined => {
  switch (command) {
    case COMMAND.COT:
      return grammar.binary('/', number(1), call('tan', args));
    case COMMAND.ARCCOT:
      return grammar.binary('-', grammar.binary('/', pi(), number(2)), call('atan', args));
    case COMMAND.LOG:
      return grammar.binary('/', call('log', [args[1]]), call('log', [args[0]]));
  }
  return Object.hasOwn(MATH, command) ? call(MATH[command], args) : undefined;
};

/** A name with a capital first letter, like Sin for sin, as some languages name their functions. */
export const capitalized = (name: string): string => name[0].toUpperCase() + name.slice(1);
