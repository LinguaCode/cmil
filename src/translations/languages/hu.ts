import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'bemeneti'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'kimenet'
  },
  {
    command: COMMAND.IF,
    definition: 'ha'
  },
  {
    command: COMMAND.ELSE,
    definition: 'más'
  },
  {
    command: COMMAND.THEN,
    definition: 'akkor'
  },
  {
    command: COMMAND.OR,
    definition: 'vagy'
  },
  {
    command: COMMAND.AND,
    definition: 's'
  },
  {
    command: COMMAND.NOT,
    definition: 'nem'
  },
  {
    command: COMMAND.FALSE,
    definition: 'hamis'
  },
  {
    command: COMMAND.TRUE,
    definition: 'igaz'
  },
  {
    command: COMMAND.DO,
    definition: 'csinálni'
  },
  {
    command: COMMAND.WHILE,
    definition: 'míg'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'ismétlés'
  },
  {
    command: COMMAND.TIMES,
    definition: 'szer'
  },
  {
    command: COMMAND.BREAK,
    definition: 'szünet'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'tovább'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'funkció'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'véletlen'
  },
  {
    command: COMMAND.POW,
    definition: 'teljesítmény'
  },
  {
    command: COMMAND.SQR,
    definition: 'tér'
  },
  {
    command: COMMAND.SQRT,
    definition: 'négyzetgyök'
  },
  {
    command: COMMAND.ROUND,
    definition: 'kerek'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'emelet'
  },
  {
    command: COMMAND.CEIL,
    definition: 'ceil'
  },
  {
    command: COMMAND.ABS,
    definition: 'abszolút_érték'
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
