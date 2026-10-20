import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'entrada'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'saída'
  },
  {
    command: COMMAND.IF,
    definition: 'se'
  },
  {
    command: COMMAND.ELSE,
    definition: 'senão'
  },
  {
    command: COMMAND.THEN,
    definition: 'então'
  },
  {
    command: COMMAND.OR,
    definition: 'ou'
  },
  {
    command: COMMAND.AND,
    definition: 'e'
  },
  {
    command: COMMAND.NOT,
    definition: 'não'
  },
  {
    command: COMMAND.FALSE,
    definition: 'falso'
  },
  {
    command: COMMAND.TRUE,
    definition: 'verdadeiro'
  },
  {
    command: COMMAND.DO,
    definition: 'fazer'
  },
  {
    command: COMMAND.WHILE,
    definition: 'enquanto'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'repita'
  },
  {
    command: COMMAND.TIMES,
    definition: 'vezes'
  },
  {
    command: COMMAND.BREAK,
    definition: 'interromper'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'continuar'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'função'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'aleatória',
    note: 'Feminine; should it be aleatório?'
  },
  {
    command: COMMAND.POW,
    definition: 'potência'
  },
  {
    command: COMMAND.SQR,
    definition: 'quadrado'
  },
  {
    command: COMMAND.SQRT,
    definition: 'raiz_quadrada'
  },
  {
    command: COMMAND.ROUND,
    definition: 'arredondar'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'chão',
    note: 'Brazil uses piso; which word is used in Portugal?'
  },
  {
    command: COMMAND.CEIL,
    definition: 'teto'
  },
  {
    command: COMMAND.ABS,
    definition: 'valor_absoluto'
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
    definition: 'euler'
  }
];

export default translation;
