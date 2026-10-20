import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'invoer'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'uitvoer'
  },
  {
    command: COMMAND.IF,
    definition: 'als'
  },
  {
    command: COMMAND.ELSE,
    definition: 'anders'
  },
  {
    command: COMMAND.THEN,
    definition: 'dan'
  },
  {
    command: COMMAND.OR,
    definition: 'of'
  },
  {
    command: COMMAND.AND,
    definition: 'en'
  },
  {
    command: COMMAND.NOT,
    definition: 'niet'
  },
  {
    command: COMMAND.FALSE,
    definition: 'onwaar'
  },
  {
    command: COMMAND.TRUE,
    definition: 'waar'
  },
  {
    command: COMMAND.DO,
    definition: 'doen'
  },
  {
    command: COMMAND.WHILE,
    definition: 'zolang'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'herhaal'
  },
  {
    command: COMMAND.TIMES,
    definition: 'keer'
  },
  {
    command: COMMAND.BREAK,
    definition: 'onderbreek'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'doorgaan'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'functie'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'willekeurig'
  },
  {
    command: COMMAND.POW,
    definition: 'macht'
  },
  {
    command: COMMAND.SQR,
    definition: 'kwadraat'
  },
  {
    command: COMMAND.SQRT,
    definition: 'vierkantswortel'
  },
  {
    command: COMMAND.ROUND,
    definition: 'afronden'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'afronden_beneden'
  },
  {
    command: COMMAND.CEIL,
    definition: 'afronden_boven'
  },
  {
    command: COMMAND.ABS,
    definition: 'absolute_waarde'
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
