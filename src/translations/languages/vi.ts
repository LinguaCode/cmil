import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'đầu_vào'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'ra'
  },
  {
    command: COMMAND.IF,
    definition: 'nếu'
  },
  {
    command: COMMAND.ELSE,
    definition: 'ngược_lại'
  },
  {
    command: COMMAND.THEN,
    definition: 'thì'
  },
  {
    command: COMMAND.OR,
    definition: 'hay'
  },
  {
    command: COMMAND.AND,
    definition: 'và'
  },
  {
    command: COMMAND.NOT,
    definition: 'không'
  },
  {
    command: COMMAND.FALSE,
    definition: 'sai'
  },
  {
    command: COMMAND.TRUE,
    definition: 'đúng'
  },
  {
    command: COMMAND.DO,
    definition: 'làm'
  },
  {
    command: COMMAND.WHILE,
    definition: 'trong_khi'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'lặp_lại'
  },
  {
    command: COMMAND.TIMES,
    definition: 'lần'
  },
  {
    command: COMMAND.BREAK,
    definition: 'dừng'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'tiếp_tục'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'hàm'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'ngẫu_nhiên'
  },
  {
    command: COMMAND.POW,
    definition: 'lũy_thừa'
  },
  {
    command: COMMAND.SQR,
    definition: 'bình_phương'
  },
  {
    command: COMMAND.SQRT,
    definition: 'căn_bậc_hai'
  },
  {
    command: COMMAND.ROUND,
    definition: 'làm_tròn'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'làm_tròn_xuống'
  },
  {
    command: COMMAND.CEIL,
    definition: 'làm_tròn_lên'
  },
  {
    command: COMMAND.ABS,
    definition: 'mô_đun'
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
