import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'קלט'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'פלט'
  },
  {
    command: COMMAND.IF,
    definition: 'אם'
  },
  {
    command: COMMAND.ELSE,
    definition: 'אחר'
  },
  {
    command: COMMAND.THEN,
    definition: 'אז'
  },
  {
    command: COMMAND.OR,
    definition: 'או'
  },
  {
    command: COMMAND.AND,
    definition: 'ו'
  },
  {
    command: COMMAND.NOT,
    definition: 'לא'
  },
  {
    command: COMMAND.FALSE,
    definition: 'שווא'
  },
  {
    command: COMMAND.TRUE,
    definition: 'נכון'
  },
  {
    command: COMMAND.DO,
    definition: 'לעשות'
  },
  {
    command: COMMAND.WHILE,
    definition: 'בזמן'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'חוזר'
  },
  {
    command: COMMAND.TIMES,
    definition: 'פעמים'
  },
  {
    command: COMMAND.BREAK,
    definition: 'הפסקה'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'המשך'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'פונקציה'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'אקראי'
  },
  {
    command: COMMAND.POW,
    definition: 'כוח'
  },
  {
    command: COMMAND.SQR,
    definition: 'כיכר'
  },
  {
    command: COMMAND.SQRT,
    definition: 'שורש_ריבועי'
  },
  {
    command: COMMAND.ROUND,
    definition: 'סיבוב'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'קומה'
  },
  {
    command: COMMAND.CEIL,
    definition: 'סיל'
  },
  {
    command: COMMAND.ABS,
    definition: 'ערך_מוחלט'
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
    definition: 'טאן'
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
