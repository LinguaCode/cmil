/**
 * Types shared by the lexer, the parser, the compiler and the interpreter.
 */
import type {ERROR} from '../constants/index.ts';

/** A value of a CMIL program; a list is shared by every variable it is assigned to. */
export type Value = number | string | boolean | Value[];

/** A token, with the line and the column, from 1, where it starts; a command keeps its word as written. */
export type Token = (
  {type: 'number'; value: number} | {type: 'string' | 'identifier' | 'command' | 'operator'; value: string}
) & {line: number; column: number; text?: string};

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
  | {type: 'userCall'; name: string; args: Expression[]; column: number}
  //input(), whose value is the answer of the user
  | {type: 'input'; column: number}
  | {type: 'unary'; operator: string; operand: Expression; column: number}
  | {type: 'binary'; operator: string; left: Expression; right: Expression; column: number};

export type Statement =
  | {type: 'print'; expression: Expression; line: number}
  | {type: 'assign'; name: string; expression: Expression; line: number}
  | {type: 'setItem'; target: Expression; index: Expression; expression: Expression; column: number; line: number}
  | {type: 'add'; expression: Expression; target: Expression; line: number}
  | {type: 'remove'; expression: Expression; target: Expression; line: number}
  | {type: 'call'; call: Expression & {type: 'userCall'}; line: number}
  | {type: 'function'; name: string; parameters: string[]; body: Statement[]; line: number}
  | {type: 'return'; expression?: Expression; line: number}
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
  | {op: 'print'; expression: Expression; line: number}
  | {op: 'assign'; name: string; expression: Expression; line: number}
  | {op: 'setItem'; target: Expression; index: Expression; expression: Expression; column: number; line: number}
  | {op: 'add'; expression: Expression; target: Expression; line: number}
  | {op: 'remove'; expression: Expression; target: Expression; line: number}
  | {op: 'call'; call: Expression & {type: 'userCall'}; line: number}
  | {op: 'return'; expression?: Expression; line: number}
  | {op: 'end'; line?: number}
  | {op: 'jump'; target: number; line?: number}
  | {op: 'jumpUnless' | 'jumpIf'; expression: Expression; target: number; line: number}
  | {op: 'repeatStart'; slot: number; expression: Expression; line: number}
  | {op: 'repeatTest'; slot: number; target: number; line: number}
  | {op: 'forStart'; slot: number; from: Expression; to: Expression; step?: Expression; line: number}
  | {op: 'forTest'; slot: number; name: string; target: number; line: number}
  | {op: 'forEachStart'; slot: number; expression: Expression; line: number}
  | {op: 'forEachTest'; slot: number; name: string; target: number; line: number};

/** A function of a program: where its instructions start, and its parameters. */
export type UserFunction = {
  start: number;
  parameters: string[];
};

export type Program = {
  instructions: Instruction[];
  slots: number;
  functions: Map<string, UserFunction>;
  //the instructions with calls of functions or inputs, which run again with the values they had when the call returns
  //or the input comes
  replays: boolean[];
};

/** An error of a program: its id, and where it is; the column counts from 1. */
export type ProgramError =
  | {id: typeof ERROR.SYNTAX_ERROR; line: number; column?: number}
  //a call with another count of arguments than its function takes, from min to max, or without its )
  | {id: typeof ERROR.ARGUMENT_ERROR; line: number; column: number; function: string; min: number; max: number}
  | {id: typeof ERROR.EQUALS_ERROR; line: number; column: number}
  //a command where a program gives a name, as written
  | {id: typeof ERROR.NAME_ERROR; line: number; column: number; name: string}
  | {id: typeof ERROR.INDENT_ERROR | typeof ERROR.MEMORY_LIMIT; line: number}
  | {id: typeof ERROR.UNDEFINED_VARIABLE; line: number; column: number; variable: string}
  | {id: typeof ERROR.UNDEFINED_FUNCTION | typeof ERROR.NO_VALUE; line: number; column: number; function: string}
  | {id: typeof ERROR.RECURSION_LIMIT; line: number}
  | {id: typeof ERROR.TYPE_ERROR | typeof ERROR.MATH_ERROR; line: number; column?: number; operator: string}
  | {id: typeof ERROR.DIVISION_BY_ZERO; line: number; column?: number}
  | {id: typeof ERROR.INDEX_ERROR; line: number; column: number; index: number}
  //remove of an item that isn't in the list, printed as in the program
  | {id: typeof ERROR.ITEM_ERROR; line: number; item: string}
  | {id: typeof ERROR.CONDITION_ERROR; line: number}
  | {id: typeof ERROR.TIMEOUT}
  | {id: typeof ERROR.UNKNOWN_LANGUAGE; language: string};
