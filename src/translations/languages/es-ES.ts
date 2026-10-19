import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'introducir'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'salida'
  },
  {
    command: COMMAND.IF,
    definition: 'si'
  },
  {
    command: COMMAND.ELSE,
    definition: 'otro'
  },
  {
    command: COMMAND.THEN,
    definition: 'después'
  },
  {
    command: COMMAND.OR,
    definition: 'o'
  },
  {
    command: COMMAND.AND,
    definition: 'y'
  },
  {
    command: COMMAND.NOT,
    definition: 'no'
  },
  {
    command: COMMAND.FALSE,
    definition: 'falso'
  },
  {
    command: COMMAND.TRUE,
    definition: 'verdadero'
  },
  {
    command: COMMAND.DO,
    definition: 'hacer'
  },
  {
    command: COMMAND.WHILE,
    definition: 'mientras'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'repetir'
  },
  {
    command: COMMAND.TIMES,
    definition: 'veces'
  },
  {
    command: COMMAND.BREAK,
    definition: 'abortar'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'continuar'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'función'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'aleatorio'
  },
  {
    command: COMMAND.POW,
    definition: 'el_poder'
  },
  {
    command: COMMAND.SQR,
    definition: 'plaza'
  },
  {
    command: COMMAND.SQRT,
    definition: 'raíz_cuadrada'
  },
  {
    command: COMMAND.ROUND,
    definition: 'redondear'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'suelo'
  },
  {
    command: COMMAND.CEIL,
    definition: 'techo'
  },
  {
    command: COMMAND.ABS,
    definition: 'valor_absoluto'
  },
  {
    command: COMMAND.SIN,
    definition: 'Sin'
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
