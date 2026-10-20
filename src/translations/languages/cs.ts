import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'vstup'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'výstup'
  },
  {
    command: COMMAND.IF,
    definition: 'když'
  },
  {
    command: COMMAND.ELSE,
    definition: 'jinak'
  },
  {
    command: COMMAND.THEN,
    definition: 'pak'
  },
  {
    command: COMMAND.OR,
    definition: 'nebo'
  },
  {
    command: COMMAND.AND,
    definition: 'a'
  },
  {
    command: COMMAND.NOT,
    definition: 'ne'
  },
  {
    command: COMMAND.FALSE,
    definition: 'nepravda'
  },
  {
    command: COMMAND.TRUE,
    definition: 'pravda'
  },
  {
    command: COMMAND.DO,
    definition: 'dělat'
  },
  {
    command: COMMAND.WHILE,
    definition: 'dokud'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'opakovat'
  },
  {
    command: COMMAND.TIMES,
    definition: 'krát'
  },
  {
    command: COMMAND.BREAK,
    definition: 'přerušení'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'pokračovat'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'funkce'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'náhodné'
  },
  {
    command: COMMAND.POW,
    definition: 'mocnina'
  },
  {
    command: COMMAND.SQR,
    definition: 'druhá_mocnina'
  },
  {
    command: COMMAND.SQRT,
    definition: 'odmocnina'
  },
  {
    command: COMMAND.ROUND,
    definition: 'zaokrouhlit'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'zaokrouhlit_dolů'
  },
  {
    command: COMMAND.CEIL,
    definition: 'zaokrouhlit_nahoru'
  },
  {
    command: COMMAND.ABS,
    definition: 'absolutní_hodnota'
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
