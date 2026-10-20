import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'intrare'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'ieșire'
  },
  {
    command: COMMAND.IF,
    definition: 'dacă'
  },
  {
    command: COMMAND.ELSE,
    definition: 'altfel'
  },
  {
    command: COMMAND.THEN,
    definition: 'atunci'
  },
  {
    command: COMMAND.OR,
    definition: 'sau'
  },
  {
    command: COMMAND.AND,
    definition: 'și'
  },
  {
    command: COMMAND.NOT,
    definition: 'nu'
  },
  {
    command: COMMAND.FALSE,
    definition: 'fals'
  },
  {
    command: COMMAND.TRUE,
    definition: 'adevărat'
  },
  {
    command: COMMAND.DO,
    definition: 'execută'
  },
  {
    command: COMMAND.WHILE,
    definition: 'cât_timp'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'repetă'
  },
  {
    command: COMMAND.TIMES,
    definition: 'ori'
  },
  {
    command: COMMAND.BREAK,
    definition: 'întrerupe'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'continua'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'funcție'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'aleatoare',
    note: 'Feminine plural; should it be aleator?'
  },
  {
    command: COMMAND.POW,
    definition: 'putere'
  },
  {
    command: COMMAND.SQR,
    definition: 'pătrat'
  },
  {
    command: COMMAND.SQRT,
    definition: 'rădăcină_pătrată'
  },
  {
    command: COMMAND.ROUND,
    definition: 'rotunjire'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'rotunjire_în_jos'
  },
  {
    command: COMMAND.CEIL,
    definition: 'rotunjire_în_sus'
  },
  {
    command: COMMAND.ABS,
    definition: 'valoare_absolută'
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
