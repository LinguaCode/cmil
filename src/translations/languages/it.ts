import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'ingresso',
    note: 'An electronics term; would leggi (read) be better?'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'uscita',
    note: 'An electronics term; would scrivi (write) be better?'
  },
  {
    command: COMMAND.IF,
    definition: 'se'
  },
  {
    command: COMMAND.ELSE,
    definition: 'altrimenti'
  },
  {
    command: COMMAND.THEN,
    definition: 'allora'
  },
  {
    command: COMMAND.OR,
    definition: 'o'
  },
  {
    command: COMMAND.AND,
    definition: 'e'
  },
  {
    command: COMMAND.NOT,
    definition: 'non'
  },
  {
    command: COMMAND.FALSE,
    definition: 'falso'
  },
  {
    command: COMMAND.TRUE,
    definition: 'vero'
  },
  {
    command: COMMAND.DO,
    definition: 'fare'
  },
  {
    command: COMMAND.WHILE,
    definition: 'mentre'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'ripetere'
  },
  {
    command: COMMAND.TIMES,
    definition: 'volte'
  },
  {
    command: COMMAND.BREAK,
    definition: 'fermare'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'proseguire'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'funzione'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'casuale'
  },
  {
    command: COMMAND.POW,
    definition: 'potenza'
  },
  {
    command: COMMAND.SQR,
    definition: 'quadrato'
  },
  {
    command: COMMAND.SQRT,
    definition: 'radice_quadrata'
  },
  {
    command: COMMAND.ROUND,
    definition: 'arrotonda'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'arrotonda_difetto'
  },
  {
    command: COMMAND.CEIL,
    definition: 'arrotonda_eccesso'
  },
  {
    command: COMMAND.ABS,
    definition: 'modulo'
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
    definition: 'pi_numero'
  },
  {
    command: COMMAND.E,
    definition: 'e_numero'
  }
];

export default translation;
