import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'indtast'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'udskriv'
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
    definition: 'så'
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
    definition: 'falsk'
  },
  {
    command: COMMAND.TRUE,
    definition: 'sandt'
  },
  {
    command: COMMAND.DO,
    definition: 'gøre'
  },
  {
    command: COMMAND.WHILE,
    definition: 'mens',
    note: 'Means during; would så_længe be better?'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'gentag'
  },
  {
    command: COMMAND.TIMES,
    definition: 'gange'
  },
  {
    command: COMMAND.BREAK,
    definition: 'afbryd'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'fortsæt'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'funktion'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'tilfældig'
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
    definition: 'kvadratrod'
  },
  {
    command: COMMAND.ROUND,
    definition: 'afrund'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'afrund_ned'
  },
  {
    command: COMMAND.CEIL,
    definition: 'afrund_op'
  },
  {
    command: COMMAND.ABS,
    definition: 'absolutte_værdi'
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
