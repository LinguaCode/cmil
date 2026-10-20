/**
 * The commands of CMIL, the ids of its errors and the limits of a program.
 * Each language gives the commands its words in src/translations.
 */
export const COMMAND = {
  INPUT: 'input',
  PRINT: 'print',

  IF: 'if',
  ELSE: 'else',
  THEN: 'then',

  FALSE: 'false',
  TRUE: 'true',

  REPEAT: 'repeat',
  WHILE: 'while',
  DO: 'do',
  TIMES: 'times',

  FOR: 'for',
  FROM: 'from',
  TO: 'to',
  STEP: 'step',

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
  COT: 'cot',
  ARCSIN: 'arcsin',
  ARCCOS: 'arccos',
  ARCTAN: 'arctan',
  ARCCOT: 'arccot',

  RANDOM: 'random',

  PI: 'pi',
  E: 'e'
} as const;

export type Command = (typeof COMMAND)[keyof typeof COMMAND];

//the errors of a program
export const ERROR = {
  SYNTAX_ERROR: 'syntaxError',
  INDENT_ERROR: 'indentError',
  ARGUMENT_ERROR: 'argumentError',
  EQUALS_ERROR: 'equalsError',
  UNDEFINED_VARIABLE: 'undefinedVariable',
  TYPE_ERROR: 'typeError',
  CONDITION_ERROR: 'conditionError',
  DIVISION_BY_ZERO: 'divisionByZero',
  MATH_ERROR: 'mathError',
  MEMORY_LIMIT: 'memoryLimit',
  TIMEOUT: 'timeout',
  UNKNOWN_LANGUAGE: 'unknownLanguage'
} as const;

export type ErrorId = (typeof ERROR)[keyof typeof ERROR];

//what a session does when it stops running
export const STATE = {
  INPUT: 'input',
  END: 'end'
} as const;

//steps a program may run in one call of run() or input(), unless the session sets its own maxSteps
export const MAX_STEPS = 1000000;

//limits of the memory: length of one text and of the output of one call
export const MAX_TEXT_LENGTH = 1000000;
export const MAX_OUTPUT_LENGTH = 10000000;

//nesting of blocks and of expressions
export const MAX_NESTING = 100;

//the significant digits numbers are printed and compared with, so 0.1 + 0.2 is 0.3
export const NUMBER_PRECISION = 12;
