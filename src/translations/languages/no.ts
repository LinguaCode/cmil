import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'skriv_inn'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'skriv_ut'
  },
  {
    command: COMMAND.IF,
    definition: 'hvis'
  },
  {
    command: COMMAND.ELSE,
    definition: 'ellers'
  },
  {
    command: COMMAND.THEN,
    definition: 'da',
    note: 'Is så more common after hvis?'
  },
  {
    command: COMMAND.OR,
    definition: 'eller'
  },
  {
    command: COMMAND.AND,
    definition: 'og'
  },
  {
    command: COMMAND.NOT,
    definition: 'ikke'
  },
  {
    command: COMMAND.FALSE,
    definition: 'usann'
  },
  {
    command: COMMAND.TRUE,
    definition: 'sann'
  },
  {
    command: COMMAND.DO,
    definition: 'gjøre'
  },
  {
    command: COMMAND.WHILE,
    definition: 'mens',
    note: 'Means during; would så_lenge be better?'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'gjenta'
  },
  {
    command: COMMAND.TIMES,
    definition: 'ganger'
  },
  {
    command: COMMAND.BREAK,
    definition: 'avbryt'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'fortsett'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'funksjon'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'tilfeldig'
  },
  {
    command: COMMAND.POW,
    definition: 'potens'
  },
  {
    command: COMMAND.SQR,
    definition: 'kvadrat'
  },
  {
    command: COMMAND.SQRT,
    definition: 'kvadratrot'
  },
  {
    command: COMMAND.ROUND,
    definition: 'avrund'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'avrund_ned'
  },
  {
    command: COMMAND.CEIL,
    definition: 'avrund_opp'
  },
  {
    command: COMMAND.ABS,
    definition: 'absolutt_verdi'
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
