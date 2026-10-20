import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: '入力'
  },
  {
    command: COMMAND.OUTPUT,
    definition: '出力'
  },
  {
    command: COMMAND.IF,
    definition: 'もし'
  },
  {
    command: COMMAND.ELSE,
    definition: 'そうでなければ'
  },
  {
    command: COMMAND.THEN,
    definition: 'ならば'
  },
  {
    command: COMMAND.OR,
    definition: 'または'
  },
  {
    command: COMMAND.AND,
    definition: 'かつ'
  },
  {
    command: COMMAND.NOT,
    definition: 'でない'
  },
  {
    command: COMMAND.FALSE,
    definition: '偽'
  },
  {
    command: COMMAND.TRUE,
    definition: '真'
  },
  {
    command: COMMAND.DO,
    definition: 'する'
  },
  {
    command: COMMAND.WHILE,
    definition: 'しばらくの間',
    note: 'Means for a while; which word fits before the condition? DNCL puts the condition first: 〈condition〉の間.'
  },
  {
    command: COMMAND.REPEAT,
    definition: '繰り返す'
  },
  {
    command: COMMAND.TIMES,
    definition: '回'
  },
  {
    command: COMMAND.BREAK,
    definition: '中断'
  },
  {
    command: COMMAND.CONTINUE,
    definition: '続ける'
  },
  {
    command: COMMAND.FUNCTION,
    definition: '関数'
  },
  {
    command: COMMAND.RANDOM,
    definition: '乱数'
  },
  {
    command: COMMAND.POW,
    definition: 'べき乗'
  },
  {
    command: COMMAND.SQR,
    definition: '二乗'
  },
  {
    command: COMMAND.SQRT,
    definition: '平方根'
  },
  {
    command: COMMAND.ROUND,
    definition: '四捨五入'
  },
  {
    command: COMMAND.FLOOR,
    definition: '切り捨て'
  },
  {
    command: COMMAND.CEIL,
    definition: '切り上げ'
  },
  {
    command: COMMAND.ABS,
    definition: '絶対値'
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
