import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'შეყვანის',
    note: 'Genitive (of input); should it be შეყვანა?'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'გამოშვება',
    note: 'Means release; should it be გამოტანა?'
  },
  {
    command: COMMAND.IF,
    definition: 'თუ'
  },
  {
    command: COMMAND.ELSE,
    definition: 'სხვა',
    note: 'Means other; should it be თორემ?'
  },
  {
    command: COMMAND.THEN,
    definition: 'მაშინ'
  },
  {
    command: COMMAND.OR,
    definition: 'ან'
  },
  {
    command: COMMAND.AND,
    definition: 'და'
  },
  {
    command: COMMAND.NOT,
    definition: 'არა'
  },
  {
    command: COMMAND.FALSE,
    definition: 'ცრუ'
  },
  {
    command: COMMAND.TRUE,
    definition: 'მართალია',
    note: 'Means it is true; should it be ჭეშმარიტი?'
  },
  {
    command: COMMAND.DO,
    definition: 'გააკეთე'
  },
  {
    command: COMMAND.WHILE,
    definition: 'სანამ'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'გაიმეორე'
  },
  {
    command: COMMAND.TIMES,
    definition: 'ჯერ'
  },
  {
    command: COMMAND.BREAK,
    definition: 'შეწყვიტე'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'გაგრძელება'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'ფუნქცია'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'შემთხვევითი'
  },
  {
    command: COMMAND.POW,
    definition: 'ხარისხი'
  },
  {
    command: COMMAND.SQR,
    definition: 'კვადრატი'
  },
  {
    command: COMMAND.SQRT,
    definition: 'კვადრატული_ფესვი'
  },
  {
    command: COMMAND.ROUND,
    definition: 'დამრგვალება'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'დამრგვალება_ქვემოთ'
  },
  {
    command: COMMAND.CEIL,
    definition: 'დამრგვალება_ზემოთ'
  },
  {
    command: COMMAND.ABS,
    definition: 'მოდული'
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
