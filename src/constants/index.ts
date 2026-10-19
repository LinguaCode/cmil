//files of constants
export {default as STATUS} from './status/index.ts';
export {default as BOOLEAN_DEFINITION} from './boolean_definition.ts';
export {default as COMMAND} from './command/index.ts';

//limits of a program, between two inputs
export const TIMEOUT_TIME = 666;
export const MAX_STEPS = 100000;

//limits of the memory: length of one text and of the output waiting to be sent
export const MAX_TEXT_LENGTH = 1000000;
export const MAX_OUTPUT_LENGTH = 10000000;

//nesting of blocks and of expressions
export const MAX_NESTING = 100;
