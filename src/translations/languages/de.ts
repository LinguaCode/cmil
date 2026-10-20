import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'eingeben'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'ausgeben'
  },
  {
    command: COMMAND.IF,
    definition: 'wenn'
  },
  {
    command: COMMAND.ELSE,
    definition: 'sonst'
  },
  {
    command: COMMAND.THEN,
    definition: 'dann'
  },
  {
    command: COMMAND.OR,
    definition: 'oder'
  },
  {
    command: COMMAND.AND,
    definition: 'und'
  },
  {
    command: COMMAND.NOT,
    definition: 'nicht'
  },
  {
    command: COMMAND.FALSE,
    definition: 'falsch'
  },
  {
    command: COMMAND.TRUE,
    definition: 'wahr'
  },
  {
    command: COMMAND.DO,
    definition: 'tun'
  },
  {
    command: COMMAND.WHILE,
    definition: 'solange'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'wiederholen'
  },
  {
    command: COMMAND.TIMES,
    definition: 'mal'
  },
  {
    command: COMMAND.BREAK,
    definition: 'abbrechen'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'weiter'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'funktion'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'zufällig'
  },
  {
    command: COMMAND.POW,
    definition: 'potenz'
  },
  {
    command: COMMAND.SQR,
    definition: 'quadrat'
  },
  {
    command: COMMAND.SQRT,
    definition: 'quadratwurzel'
  },
  {
    command: COMMAND.ROUND,
    definition: 'runden'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'abrunden'
  },
  {
    command: COMMAND.CEIL,
    definition: 'aufrunden'
  },
  {
    command: COMMAND.ABS,
    definition: 'absolutwert'
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
