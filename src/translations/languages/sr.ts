import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'улаз'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'излаз'
  },
  {
    command: COMMAND.IF,
    definition: 'ако'
  },
  {
    command: COMMAND.ELSE,
    definition: 'иначе'
  },
  {
    command: COMMAND.THEN,
    definition: 'онда'
  },
  {
    command: COMMAND.OR,
    definition: 'или'
  },
  {
    command: COMMAND.AND,
    definition: 'и'
  },
  {
    command: COMMAND.NOT,
    definition: 'не'
  },
  {
    command: COMMAND.FALSE,
    definition: 'лаж'
  },
  {
    command: COMMAND.TRUE,
    definition: 'истина'
  },
  {
    command: COMMAND.DO,
    definition: 'уради'
  },
  {
    command: COMMAND.WHILE,
    definition: 'док'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'понови'
  },
  {
    command: COMMAND.TIMES,
    definition: 'пута'
  },
  {
    command: COMMAND.BREAK,
    definition: 'прекини'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'даље'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'функција'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'случајни'
  },
  {
    command: COMMAND.POW,
    definition: 'степен'
  },
  {
    command: COMMAND.SQR,
    definition: 'квадрат'
  },
  {
    command: COMMAND.SQRT,
    definition: 'квадратни_корен'
  },
  {
    command: COMMAND.ROUND,
    definition: 'заокружи'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'заокружи_наниже'
  },
  {
    command: COMMAND.CEIL,
    definition: 'заокружи_навише'
  },
  {
    command: COMMAND.ABS,
    definition: 'модул'
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
    definition: 'e|е'
  }
];

export default translation;
