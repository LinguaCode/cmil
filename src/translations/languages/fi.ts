import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'syötä'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'tulosta'
  },
  {
    command: COMMAND.IF,
    definition: 'jos'
  },
  {
    command: COMMAND.ELSE,
    definition: 'muuten'
  },
  {
    command: COMMAND.THEN,
    definition: 'niin'
  },
  {
    command: COMMAND.OR,
    definition: 'tai'
  },
  {
    command: COMMAND.AND,
    definition: 'ja'
  },
  {
    command: COMMAND.NOT,
    definition: 'ei'
  },
  {
    command: COMMAND.FALSE,
    definition: 'epätosi'
  },
  {
    command: COMMAND.TRUE,
    definition: 'tosi'
  },
  {
    command: COMMAND.DO,
    definition: 'tehdä'
  },
  {
    command: COMMAND.WHILE,
    definition: 'kun',
    note: 'Means when; is there a short word for as long as?'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'toista'
  },
  {
    command: COMMAND.TIMES,
    definition: 'kertaa'
  },
  {
    command: COMMAND.BREAK,
    definition: 'keskeytä'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'jatka'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'funktio'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'satunnainen'
  },
  {
    command: COMMAND.POW,
    definition: 'potenssi'
  },
  {
    command: COMMAND.SQR,
    definition: 'neliö'
  },
  {
    command: COMMAND.SQRT,
    definition: 'neliöjuuri'
  },
  {
    command: COMMAND.ROUND,
    definition: 'pyöristä'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'pyöristä_alas'
  },
  {
    command: COMMAND.CEIL,
    definition: 'pyöristä_ylös'
  },
  {
    command: COMMAND.ABS,
    definition: 'itseisarvo'
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
