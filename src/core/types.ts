/**
 * Types shared by the lexer, the parser, the compiler and the interpreter.
 */
import type {ERROR} from '../constants/index.ts';

/** A value of a CMIL program; a list is shared by every variable it is assigned to. */
export type Value = number | string | boolean | Value[];

/** A token, with the line and the column, from 1, where it starts. */
export type Token = (
  {type: 'number'; value: number} | {type: 'string' | 'identifier' | 'command' | 'operator'; value: string}
) & {line: number; column: number};

/** A line of the source code that contains tokens. */
export type Line = {
  number: number;
  level: number;
  tokens: Token[];
};

/** An expression; column is where its variable, function or operator starts, and where the [ of an index is. */
export type Expression =
  | {type: 'value'; value: number | string | boolean}
  | {type: 'list'; items: Expression[]}
  | {type: 'index'; target: Expression; index: Expression; column: number}
  | {type: 'variable'; name: string; column: number}
  | {type: 'call'; name: string; args: Expression[]; column: number}
  | {type: 'unary'; operator: string; operand: Expression; column: number}
  | {type: 'binary'; operator: string; left: Expression; right: Expression; column: number};

export type Statement =
  | {type: 'print'; expressions: Expression[]; line: number}
  | {type: 'input'; name: string; prompt?: Expression; line: number}
  | {type: 'assign'; name: string; expression: Expression; line: number}
  | {type: 'setItem'; target: Expression; index: Expression; expression: Expression; column: number; line: number}
  | {type: 'add'; expression: Expression; target: Expression; line: number}
  | {type: 'if'; branches: Branch[]; elseBody: Statement[]; line: number}
  | {type: 'while'; condition: Expression; body: Statement[]; line: number}
  | {type: 'doWhile'; body: Statement[]; condition: Expression; line: number}
  | {type: 'repeat'; count: Expression; body: Statement[]; line: number}
  | {type: 'for'; name: string; from: Expression; to: Expression; step?: Expression; body: Statement[]; line: number}
  | {type: 'forEach'; name: string; expression: Expression; body: Statement[]; line: number}
  | {type: 'break' | 'continue'; line: number};

export type Branch = {
  condition: Expression;
  body: Statement[];
  line: number;
};

export type Instruction =
  | {op: 'print'; expressions: Expression[]; line: number}
  | {op: 'input'; name: string; prompt?: Expression; line: number}
  | {op: 'assign'; name: string; expression: Expression; line: number}
  | {op: 'setItem'; target: Expression; index: Expression; expression: Expression; column: number; line: number}
  | {op: 'add'; expression: Expression; target: Expression; line: number}
  | {op: 'jump'; target: number; line?: number}
  | {op: 'jumpUnless' | 'jumpIf'; expression: Expression; target: number; line: number}
  | {op: 'repeatStart'; slot: number; expression: Expression; line: number}
  | {op: 'repeatTest'; slot: number; target: number; line: number}
  | {op: 'forStart'; slot: number; from: Expression; to: Expression; step?: Expression; line: number}
  | {op: 'forTest'; slot: number; name: string; target: number; line: number}
  | {op: 'forEachStart'; slot: number; expression: Expression; line: number}
  | {op: 'forEachTest'; slot: number; name: string; target: number; line: number};

export type Program = {
  instructions: Instruction[];
  slots: number;
};

/** An error of a program: its id, and where it is; the column counts from 1. */
export type ProgramError =
  | {id: typeof ERROR.SYNTAX_ERROR | typeof ERROR.ARGUMENT_ERROR; line: number; column?: number}
  | {id: typeof ERROR.EQUALS_ERROR; line: number; column: number}
  | {id: typeof ERROR.INDENT_ERROR | typeof ERROR.MEMORY_LIMIT; line: number}
  | {id: typeof ERROR.UNDEFINED_VARIABLE; line: number; column: number; variable: string}
  | {id: typeof ERROR.TYPE_ERROR | typeof ERROR.MATH_ERROR; line: number; column?: number; operator: string}
  | {id: typeof ERROR.DIVISION_BY_ZERO; line: number; column?: number}
  | {id: typeof ERROR.INDEX_ERROR; line: number; column: number; index: number}
  | {id: typeof ERROR.CONDITION_ERROR; line: number}
  | {id: typeof ERROR.TIMEOUT}
  | {id: typeof ERROR.UNKNOWN_LANGUAGE; language: string};
