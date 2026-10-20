import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: '输入'
  },
  {
    command: COMMAND.OUTPUT,
    definition: '输出'
  },
  {
    command: COMMAND.IF,
    definition: '如果'
  },
  {
    command: COMMAND.ELSE,
    definition: '否则'
  },
  {
    command: COMMAND.THEN,
    definition: '那么'
  },
  {
    command: COMMAND.OR,
    definition: '或者'
  },
  {
    command: COMMAND.AND,
    definition: '并且'
  },
  {
    command: COMMAND.NOT,
    definition: '不'
  },
  {
    command: COMMAND.FALSE,
    definition: '假'
  },
  {
    command: COMMAND.TRUE,
    definition: '真'
  },
  {
    command: COMMAND.DO,
    definition: '做'
  },
  {
    command: COMMAND.WHILE,
    definition: '当'
  },
  {
    command: COMMAND.REPEAT,
    definition: '重复'
  },
  {
    command: COMMAND.TIMES,
    definition: '次'
  },
  {
    command: COMMAND.BREAK,
    definition: '跳出'
  },
  {
    command: COMMAND.CONTINUE,
    definition: '继续'
  },
  {
    command: COMMAND.FUNCTION,
    definition: '函数'
  },
  {
    command: COMMAND.RANDOM,
    definition: '随机的'
  },
  {
    command: COMMAND.POW,
    definition: '乘方'
  },
  {
    command: COMMAND.SQR,
    definition: '平方'
  },
  {
    command: COMMAND.SQRT,
    definition: '平方根'
  },
  {
    command: COMMAND.ROUND,
    definition: '四舍五入'
  },
  {
    command: COMMAND.FLOOR,
    definition: '向下取整'
  },
  {
    command: COMMAND.CEIL,
    definition: '向上取整'
  },
  {
    command: COMMAND.ABS,
    definition: '绝对值'
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
