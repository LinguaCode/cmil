import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'ввести'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'вивести'
  },
  {
    command: COMMAND.IF,
    definition: 'якщо'
  },
  {
    command: COMMAND.ELSE,
    definition: 'інакше'
  },
  {
    command: COMMAND.THEN,
    definition: 'тоді'
  },
  {
    command: COMMAND.OR,
    definition: 'або'
  },
  {
    command: COMMAND.AND,
    definition: 'і'
  },
  {
    command: COMMAND.NOT,
    definition: 'не'
  },
  {
    command: COMMAND.FALSE,
    definition: 'хиба'
  },
  {
    command: COMMAND.TRUE,
    definition: 'істина'
  },
  {
    command: COMMAND.DO,
    definition: 'робити'
  },
  {
    command: COMMAND.WHILE,
    definition: 'поки'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'повторити'
  },
  {
    command: COMMAND.TIMES,
    definition: 'раз'
  },
  {
    command: COMMAND.BREAK,
    definition: 'перервати'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'далі'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'функція'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'випадковий'
  },
  {
    command: COMMAND.POW,
    definition: 'степінь'
  },
  {
    command: COMMAND.SQR,
    definition: 'квадрат'
  },
  {
    command: COMMAND.SQRT,
    definition: 'квадратний_корінь'
  },
  {
    command: COMMAND.ROUND,
    definition: 'округлити'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'округлити_вниз'
  },
  {
    command: COMMAND.CEIL,
    definition: 'округлити_вгору'
  },
  {
    command: COMMAND.ABS,
    definition: 'модуль'
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
