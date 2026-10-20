import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'vhod'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'izhod'
  },
  {
    command: COMMAND.IF,
    definition: 'če'
  },
  {
    command: COMMAND.ELSE,
    definition: 'sicer'
  },
  {
    command: COMMAND.THEN,
    definition: 'nato',
    note: 'Is potem more common after če?'
  },
  {
    command: COMMAND.OR,
    definition: 'ali'
  },
  {
    command: COMMAND.AND,
    definition: 'in'
  },
  {
    command: COMMAND.NOT,
    definition: 'ne'
  },
  {
    command: COMMAND.FALSE,
    definition: 'ni_res'
  },
  {
    command: COMMAND.TRUE,
    definition: 'res'
  },
  {
    command: COMMAND.DO,
    definition: 'naredi'
  },
  {
    command: COMMAND.WHILE,
    definition: 'dokler'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'ponovi'
  },
  {
    command: COMMAND.TIMES,
    definition: 'krat'
  },
  {
    command: COMMAND.BREAK,
    definition: 'prekini'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'nadaljuj'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'funkcija'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'naključno'
  },
  {
    command: COMMAND.POW,
    definition: 'potenca'
  },
  {
    command: COMMAND.SQR,
    definition: 'kvadrat'
  },
  {
    command: COMMAND.SQRT,
    definition: 'kvadratni_koren'
  },
  {
    command: COMMAND.ROUND,
    definition: 'zaokroži'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'zaokroži_navzdol'
  },
  {
    command: COMMAND.CEIL,
    definition: 'zaokroži_navzgor'
  },
  {
    command: COMMAND.ABS,
    definition: 'modul'
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
