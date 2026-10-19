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
    definition: '他'
  },
  {
    command: COMMAND.THEN,
    definition: 'その後'
  },
  {
    command: COMMAND.OR,
    definition: 'または'
  },
  {
    command: COMMAND.AND,
    definition: 'そして'
  },
  {
    command: COMMAND.NOT,
    definition: 'じゃない'
  },
  {
    command: COMMAND.FALSE,
    definition: '偽'
  },
  {
    command: COMMAND.TRUE,
    definition: '正しい'
  },
  {
    command: COMMAND.DO,
    definition: 'する'
  },
  {
    command: COMMAND.WHILE,
    definition: 'しばらくの間'
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
    definition: '休憩'
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
    definition: 'おまかせ表示'
  },
  {
    command: COMMAND.POW,
    definition: '電源'
  },
  {
    command: COMMAND.SQR,
    definition: '広場'
  },
  {
    command: COMMAND.SQRT,
    definition: '平方根'
  },
  {
    command: COMMAND.ROUND,
    definition: '丸'
  },
  {
    command: COMMAND.FLOOR,
    definition: '階'
  },
  {
    command: COMMAND.CEIL,
    definition: '天井'
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
