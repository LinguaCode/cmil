import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'المدخلات',
    note: 'Plural (the inputs); would أدخل be better?'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'الإخراج',
    note: 'Also means directing a film; would اطبع (print) be better?'
  },
  {
    command: COMMAND.IF,
    definition: 'إذا'
  },
  {
    command: COMMAND.ELSE,
    definition: 'وإلا'
  },
  {
    command: COMMAND.THEN,
    definition: 'ثم',
    note: 'Means afterwards; would فإن be better?'
  },
  {
    command: COMMAND.OR,
    definition: 'أو'
  },
  {
    command: COMMAND.AND,
    definition: 'و'
  },
  {
    command: COMMAND.NOT,
    definition: 'لا'
  },
  {
    command: COMMAND.FALSE,
    definition: 'كاذبة',
    note: 'Feminine (lying); is خطأ the usual truth value?'
  },
  {
    command: COMMAND.TRUE,
    definition: 'صحيح',
    note: 'Is صواب or صح the usual truth value?'
  },
  {
    command: COMMAND.DO,
    definition: 'افعل'
  },
  {
    command: COMMAND.WHILE,
    definition: 'طالما'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'كرر'
  },
  {
    command: COMMAND.TIMES,
    definition: 'مرات'
  },
  {
    command: COMMAND.BREAK,
    definition: 'توقف'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'استمر'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'دالة'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'عشوائية'
  },
  {
    command: COMMAND.POW,
    definition: 'قوة'
  },
  {
    command: COMMAND.SQR,
    definition: 'مربع'
  },
  {
    command: COMMAND.SQRT,
    definition: 'جذر_تربيعي'
  },
  {
    command: COMMAND.ROUND,
    definition: 'تقريب'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'تقريب_لأسفل'
  },
  {
    command: COMMAND.CEIL,
    definition: 'تقريب_لأعلى'
  },
  {
    command: COMMAND.ABS,
    definition: 'قيمة_مطلقة'
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
