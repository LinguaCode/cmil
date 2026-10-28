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
  IN: 'in',

  //lists
  ADD: 'add',
  REMOVE: 'remove',

  BREAK: 'break',
  CONTINUE: 'continue',

  OR: 'or',
  AND: 'and',
  NOT: 'not',

  FUNCTION: 'function',
  RETURN: 'return',

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
  E: 'e',

  //lists and texts
  LENGTH: 'length',
  UPPER: 'upper',
  LOWER: 'lower',
  NUMBER: 'number',
  TEXT: 'text',
  SPLIT: 'split',
  JOIN: 'join'
} as const;

export type Command = (typeof COMMAND)[keyof typeof COMMAND];

//the errors of a program
export const ERROR = {
  SYNTAX_ERROR: 'syntaxError',
  INDENT_ERROR: 'indentError',
  ARGUMENT_ERROR: 'argumentError',
  EQUALS_ERROR: 'equalsError',
  NAME_ERROR: 'nameError',
  UNDEFINED_VARIABLE: 'undefinedVariable',
  UNDEFINED_FUNCTION: 'undefinedFunction',
  NO_VALUE: 'noValue',
  TYPE_ERROR: 'typeError',
  LIST_AS_TEXT: 'listAsText',
  CONDITION_ERROR: 'conditionError',
  DIVISION_BY_ZERO: 'divisionByZero',
  MATH_ERROR: 'mathError',
  INDEX_ERROR: 'indexError',
  ITEM_ERROR: 'itemError',
  MEMORY_LIMIT: 'memoryLimit',
  RECURSION_LIMIT: 'recursionLimit',
  TIMEOUT: 'timeout',
  UNKNOWN_LANGUAGE: 'unknownLanguage'
} as const;

export type ErrorId = (typeof ERROR)[keyof typeof ERROR];

//the warnings about a program, which runs as it is but may not do what it means to
export const WARNING = {
  NUMBER_TEXT: 'numberText'
} as const;

export type WarningId = (typeof WARNING)[keyof typeof WARNING];

//what a session does when it stops running
export const STATE = {
  INPUT: 'input',
  END: 'end'
} as const;

//steps a program may run in one call of run() or input(), unless the session sets its own maxSteps
export const MAX_STEPS = 1000000;

//limits of the memory: length of one text, of one list and of the output of one call
export const MAX_TEXT_LENGTH = 1000000;
export const MAX_LIST_LENGTH = 1000000;
export const MAX_OUTPUT_LENGTH = 10000000;

//nesting of blocks and of expressions
export const MAX_NESTING = 100;

//calls of functions that haven't returned yet, like a function that calls itself
export const MAX_RECURSION = 1000;

//the significant digits numbers are printed and compared with, so 0.1 + 0.2 is 0.3
export const NUMBER_PRECISION = 12;
