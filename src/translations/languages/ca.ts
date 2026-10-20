import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'entrada'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'sortida'
  },
  {
    command: COMMAND.IF,
    definition: 'si'
  },
  {
    command: COMMAND.ELSE,
    definition: 'sinó'
  },
  {
    command: COMMAND.THEN,
    definition: 'llavors'
  },
  {
    command: COMMAND.OR,
    definition: 'o'
  },
  {
    command: COMMAND.AND,
    definition: 'i'
  },
  {
    command: COMMAND.NOT,
    definition: 'no'
  },
  {
    command: COMMAND.FALSE,
    definition: 'fals'
  },
  {
    command: COMMAND.TRUE,
    definition: 'cert'
  },
  {
    command: COMMAND.DO,
    definition: 'fer'
  },
  {
    command: COMMAND.WHILE,
    definition: 'mentre'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'repetir'
  },
  {
    command: COMMAND.TIMES,
    definition: 'vegades'
  },
  {
    command: COMMAND.BREAK,
    definition: 'interrompre'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'continuar'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'funció'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'aleatori'
  },
  {
    command: COMMAND.POW,
    definition: 'potència'
  },
  {
    command: COMMAND.SQR,
    definition: 'quadrat'
  },
  {
    command: COMMAND.SQRT,
    definition: 'arrel_quadrada'
  },
  {
    command: COMMAND.ROUND,
    definition: 'arrodonir'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'arrodonir_avall'
  },
  {
    command: COMMAND.CEIL,
    definition: 'arrodonir_amunt'
  },
  {
    command: COMMAND.ABS,
    definition: 'valor_absolut'
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
