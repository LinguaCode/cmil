import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'input'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'output'
  },
  {
    command: COMMAND.IF,
    definition: 'if'
  },
  {
    command: COMMAND.ELSE,
    definition: 'else'
  },
  {
    command: COMMAND.THEN,
    definition: 'then'
  },
  {
    command: COMMAND.OR,
    definition: 'or'
  },
  {
    command: COMMAND.AND,
    definition: 'and'
  },
  {
    command: COMMAND.NOT,
    definition: 'not'
  },
  {
    command: COMMAND.FALSE,
    definition: 'false'
  },
  {
    command: COMMAND.TRUE,
    definition: 'true'
  },
  {
    command: COMMAND.DO,
    definition: 'do'
  },
  {
    command: COMMAND.WHILE,
    definition: 'while'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'repeat'
  },
  {
    command: COMMAND.TIMES,
    definition: 'times'
  },
  {
    command: COMMAND.BREAK,
    definition: 'break'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'continue'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'function'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'random'
  },
  {
    command: COMMAND.POW,
    definition: 'power'
  },
  {
    command: COMMAND.SQR,
    definition: 'square'
  },
  {
    command: COMMAND.SQRT,
    definition: 'square_root'
  },
  {
    command: COMMAND.ROUND,
    definition: 'round'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'floor'
  },
  {
    command: COMMAND.CEIL,
    definition: 'ceil'
  },
  {
    command: COMMAND.ABS,
    definition: 'absolute_value'
  },
  {
    command: COMMAND.SIN,
    definition: 'sin'
  },
  {
    command: COMMAND.COS,
    definition: 'cos'
  },
  {
    command: COMMAND.TAN,
    definition: 'tan'
  },
  {
    command: COMMAND.CTG,
    definition: 'ctg'
  },
  {
    command: COMMAND.ARCSIN,
    definition: 'arcsin'
  },
  {
    command: COMMAND.ARCCOS,
    definition: 'arccos'
  },
  {
    command: COMMAND.ARCTAN,
    definition: 'arctan'
  },
  {
    command: COMMAND.ARCCTG,
    definition: 'arcctg'
  },
  {
    command: COMMAND.LOG,
    definition: 'log'
  },
  {
    command: COMMAND.LN,
    definition: 'ln'
  },
  {
    command: COMMAND.LG,
    definition: 'lg'
  },
  {
    command: COMMAND.PI,
    definition: 'pi'
  },
  {
    command: COMMAND.E,
    definition: 'e'
  }
];

export default translation;
