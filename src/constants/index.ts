/**
 * The commands of CMIL, the ids of its errors and the limits of a program.
 * Each language gives the commands its words in src/translations.
 */
export const COMMAND = {
  INPUT: 'input',
  OUTPUT: 'output',

  IF: 'if',
  ELSE: 'else',
  THEN: 'then',

  FALSE: 'false',
  TRUE: 'true',

  REPEAT: 'repeat',
  WHILE: 'while',
  DO: 'do',
  TIMES: 'times',

  BREAK: 'break',
  CONTINUE: 'continue',

  OR: 'or',
  AND: 'and',
  NOT: 'not',

  FUNCTION: 'function',

  //math
  SQR: 'sqr',
  SQRT: 'sqrt',
  POW: 'pow',

  ROUND: 'round',
  CEIL: 'ceil',
  FLOOR: 'floor',

  LG: 'lg',
  LN: 'ln',
  LOG: 'log',

  ABS: 'abs',

  SIN: 'sin',
  COS: 'cos',
  TAN: 'tan',
  CTG: 'ctg',
  ARCSIN: 'arcsin',
  ARCCOS: 'arccos',
  ARCTAN: 'arctan',
  ARCCTG: 'arcctg',

  RANDOM: 'random',

  PI: 'pi',
  E: 'e'
} as const;

export type Command = (typeof COMMAND)[keyof typeof COMMAND];

//the errors reported to onSessionEnd
export const ERROR = {
  TIMEOUT: 'timeout',
  SYNTAX_ERROR: 'syntaxError',
  INDENT_ERROR: 'indentError',
  UNDEFINED_VARIABLE: 'undefinedVariable',
  FUNCTION_ARGUMENT_SYNTAX_ERROR: 'functionArgumentSyntaxError',
  MEMORY_LIMIT: 'memoryLimit',
  UNKNOWN_LANGUAGE: 'unknownLanguage'
} as const;

//what a session does when it stops running
export const STATE = {
  WAITS_FOR_INPUT: 'waitsForInput',
  SESSION_END: 'sessionEnd'
} as const;

//limits of a program, between two inputs
export const TIMEOUT_TIME = 666;
export const MAX_STEPS = 100000;

//limits of the memory: length of one text and of the output waiting to be sent
export const MAX_TEXT_LENGTH = 1000000;
export const MAX_OUTPUT_LENGTH = 10000000;

//nesting of blocks and of expressions
export const MAX_NESTING = 100;
