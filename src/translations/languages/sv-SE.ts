import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'mata_in'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'skriv_ut'
  },
  {
    command: COMMAND.IF,
    definition: 'om'
  },
  {
    command: COMMAND.ELSE,
    definition: 'annars'
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
    definition: 'och'
  },
  {
    command: COMMAND.NOT,
    definition: 'inte'
  },
  {
    command: COMMAND.FALSE,
    definition: 'falskt'
  },
  {
    command: COMMAND.TRUE,
    definition: 'sant'
  },
  {
    command: COMMAND.DO,
    definition: 'göra'
  },
  {
    command: COMMAND.WHILE,
    definition: 'medan',
    note: 'Means during; would så_länge be better?'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'upprepa'
  },
  {
    command: COMMAND.TIMES,
    definition: 'gånger'
  },
  {
    command: COMMAND.BREAK,
    definition: 'avbryt'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'fortsätt'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'funktion'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'slumptal'
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
    definition: 'roten_ur'
  },
  {
    command: COMMAND.ROUND,
    definition: 'avrunda'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'avrunda_nedåt'
  },
  {
    command: COMMAND.CEIL,
    definition: 'avrunda_uppåt'
  },
  {
    command: COMMAND.ABS,
    definition: 'absolutvärde'
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
