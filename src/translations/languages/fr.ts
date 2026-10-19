import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'entrée'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'sortie'
  },
  {
    command: COMMAND.IF,
    definition: 'si'
  },
  {
    command: COMMAND.ELSE,
    definition: 'autre'
  },
  {
    command: COMMAND.THEN,
    definition: 'alors'
  },
  {
    command: COMMAND.OR,
    definition: 'ou'
  },
  {
    command: COMMAND.AND,
    definition: 'et'
  },
  {
    command: COMMAND.NOT,
    definition: 'pas'
  },
  {
    command: COMMAND.FALSE,
    definition: 'faux'
  },
  {
    command: COMMAND.TRUE,
    definition: 'vrai'
  },
  {
    command: COMMAND.DO,
    definition: 'faire'
  },
  {
    command: COMMAND.WHILE,
    definition: 'alors_que'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'répétez'
  },
  {
    command: COMMAND.TIMES,
    definition: 'fois'
  },
  {
    command: COMMAND.BREAK,
    definition: 'pause'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'continuer'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'la_fonction'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'aléatoire'
  },
  {
    command: COMMAND.POW,
    definition: 'puissance'
  },
  {
    command: COMMAND.SQR,
    definition: 'carré'
  },
  {
    command: COMMAND.SQRT,
    definition: 'racine_carrée'
  },
  {
    command: COMMAND.ROUND,
    definition: 'ronde'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'étage'
  },
  {
    command: COMMAND.CEIL,
    definition: 'ceil'
  },
  {
    command: COMMAND.ABS,
    definition: 'valeur_absolue'
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
