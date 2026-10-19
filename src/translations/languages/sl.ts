import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'vhod'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'izhod'
  },
  {
    command: COMMAND.IF,
    definition: 'če'
  },
  {
    command: COMMAND.ELSE,
    definition: 'ostalo'
  },
  {
    command: COMMAND.THEN,
    definition: 'nato'
  },
  {
    command: COMMAND.OR,
    definition: 'ali'
  },
  {
    command: COMMAND.AND,
    definition: 'in'
  },
  {
    command: COMMAND.NOT,
    definition: 'ne'
  },
  {
    command: COMMAND.FALSE,
    definition: 'false'
  },
  {
    command: COMMAND.TRUE,
    definition: 'res'
  },
  {
    command: COMMAND.DO,
    definition: 'ne'
  },
  {
    command: COMMAND.WHILE,
    definition: 'medtem_ko'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'ponovite'
  },
  {
    command: COMMAND.TIMES,
    definition: 'krat'
  },
  {
    command: COMMAND.BREAK,
    definition: 'odmor'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'še'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'funkcija'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'naključno'
  },
  {
    command: COMMAND.POW,
    definition: 'moč'
  },
  {
    command: COMMAND.SQR,
    definition: 'kvadratni'
  },
  {
    command: COMMAND.SQRT,
    definition: 'kvadratni_koren'
  },
  {
    command: COMMAND.ROUND,
    definition: 'krog'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'tla'
  },
  {
    command: COMMAND.CEIL,
    definition: 'ceil'
  },
  {
    command: COMMAND.ABS,
    definition: 'modul'
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
