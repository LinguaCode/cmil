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
    definition: 'ak'
  },
  {
    command: COMMAND.ELSE,
    definition: 'inak'
  },
  {
    command: COMMAND.THEN,
    definition: 'tak'
  },
  {
    command: COMMAND.OR,
    definition: 'alebo'
  },
  {
    command: COMMAND.AND,
    definition: 'a'
  },
  {
    command: COMMAND.NOT,
    definition: 'nie'
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
    definition: 'robiť'
  },
  {
    command: COMMAND.WHILE,
    definition: 'kým'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'opakovať'
  },
  {
    command: COMMAND.TIMES,
    definition: 'krát'
  },
  {
    command: COMMAND.BREAK,
    definition: 'prerušiť'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'pokračovať'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'funkcia'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'náhodný'
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
    definition: 'zaokrúhliť'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'zaokrúhliť_nadol'
  },
  {
    command: COMMAND.CEIL,
    definition: 'zaokrúhliť_nahor'
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
