/**
 * Types shared by the lexer, the parser, the compiler and the interpreter.
 */
import type {ERROR} from '../constants/index.ts';

/** A value of a CMIL program. */
export type Value = number | string | boolean;

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

export type Expression =
  | {type: 'value'; value: Value}
  | {type: 'variable'; name: string; column: number}
  | {type: 'call'; name: string; args: Expression[]}
  | {type: 'unary'; operator: string; operand: Expression}
  | {type: 'binary'; operator: string; left: Expression; right: Expression};

export type Statement =
  | {type: 'output'; expression: Expression; line: number}
  | {type: 'input'; name: string; line: number}
  | {type: 'assign'; name: string; expression: Expression; line: number}
  | {type: 'if'; branches: Branch[]; elseBody: Statement[]; line: number}
  | {type: 'while'; condition: Expression; body: Statement[]; line: number}
  | {type: 'doWhile'; body: Statement[]; condition: Expression; line: number}
  | {type: 'repeat'; count: Expression; body: Statement[]; line: number}
  | {type: 'break' | 'continue'; line: number};

export type Branch = {
  condition: Expression;
  body: Statement[];
  line: number;
};

export type Instruction =
  | {op: 'output'; expression: Expression; line: number}
  | {op: 'input'; name: string; line: number}
  | {op: 'assign'; name: string; expression: Expression; line: number}
  | {op: 'jump'; target: number; line?: number}
  | {op: 'jumpUnless' | 'jumpIf'; expression: Expression; target: number; line: number}
  | {op: 'repeatStart'; slot: number; line: number}
  | {op: 'repeatTest'; slot: number; expression: Expression; target: number; line: number};

export type Program = {
  instructions: Instruction[];
  slots: number;
};

/** An error of a program: its id, and where it is; the column counts from 1. */
export type ProgramError =
  | {id: typeof ERROR.SYNTAX_ERROR | typeof ERROR.ARGUMENT_ERROR; line: number; column?: number}
  | {id: typeof ERROR.INDENT_ERROR | typeof ERROR.MEMORY_LIMIT; line: number}
  | {id: typeof ERROR.UNDEFINED_VARIABLE; line: number; column: number; variable: string}
  | {id: typeof ERROR.TIMEOUT}
  | {id: typeof ERROR.UNKNOWN_LANGUAGE; language: string};
