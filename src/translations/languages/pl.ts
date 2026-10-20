import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'wczytaj'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'wypisz'
  },
  {
    command: COMMAND.IF,
    definition: 'jeśli'
  },
  {
    command: COMMAND.ELSE,
    definition: 'inaczej'
  },
  {
    command: COMMAND.THEN,
    definition: 'wtedy'
  },
  {
    command: COMMAND.OR,
    definition: 'lub'
  },
  {
    command: COMMAND.AND,
    definition: 'i'
  },
  {
    command: COMMAND.NOT,
    definition: 'nie'
  },
  {
    command: COMMAND.FALSE,
    definition: 'fałsz'
  },
  {
    command: COMMAND.TRUE,
    definition: 'prawda'
  },
  {
    command: COMMAND.DO,
    definition: 'robić'
  },
  {
    command: COMMAND.WHILE,
    definition: 'dopóki'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'powtórzyć'
  },
  {
    command: COMMAND.TIMES,
    definition: 'razy'
  },
  {
    command: COMMAND.BREAK,
    definition: 'przerwij'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'dalej'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'funkcja'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'losowy'
  },
  {
    command: COMMAND.POW,
    definition: 'potęga'
  },
  {
    command: COMMAND.SQR,
    definition: 'kwadrat'
  },
  {
    command: COMMAND.SQRT,
    definition: 'pierwiastek_kwadratowy'
  },
  {
    command: COMMAND.ROUND,
    definition: 'zaokrąglij'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'zaokrąglij_w_dół'
  },
  {
    command: COMMAND.CEIL,
    definition: 'zaokrąglij_w_górę'
  },
  {
    command: COMMAND.ABS,
    definition: 'wartość_bezwzględna'
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
