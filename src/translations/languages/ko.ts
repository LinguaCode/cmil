import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: '입력'
  },
  {
    command: COMMAND.OUTPUT,
    definition: '출력'
  },
  {
    command: COMMAND.IF,
    definition: '만약'
  },
  {
    command: COMMAND.ELSE,
    definition: '아니면'
  },
  {
    command: COMMAND.THEN,
    definition: '그러면'
  },
  {
    command: COMMAND.OR,
    definition: '또는'
  },
  {
    command: COMMAND.AND,
    definition: '그리고'
  },
  {
    command: COMMAND.NOT,
    definition: '지',
    note: 'A fragment of -지 않다; which word should logical not be?'
  },
  {
    command: COMMAND.FALSE,
    definition: '거짓'
  },
  {
    command: COMMAND.TRUE,
    definition: '참'
  },
  {
    command: COMMAND.DO,
    definition: '실행'
  },
  {
    command: COMMAND.WHILE,
    definition: '동안'
  },
  {
    command: COMMAND.REPEAT,
    definition: '반복'
  },
  {
    command: COMMAND.TIMES,
    definition: '번'
  },
  {
    command: COMMAND.BREAK,
    definition: '중단'
  },
  {
    command: COMMAND.CONTINUE,
    definition: '계속'
  },
  {
    command: COMMAND.FUNCTION,
    definition: '함수'
  },
  {
    command: COMMAND.RANDOM,
    definition: '난수'
  },
  {
    command: COMMAND.POW,
    definition: '거듭제곱'
  },
  {
    command: COMMAND.SQR,
    definition: '제곱'
  },
  {
    command: COMMAND.SQRT,
    definition: '제곱근'
  },
  {
    command: COMMAND.ROUND,
    definition: '반올림'
  },
  {
    command: COMMAND.FLOOR,
    definition: '내림'
  },
  {
    command: COMMAND.CEIL,
    definition: '올림'
  },
  {
    command: COMMAND.ABS,
    definition: '절댓값'
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
