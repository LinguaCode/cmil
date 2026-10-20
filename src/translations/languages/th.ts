import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'นำเข้าข้อมูล'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'ส่งออก'
  },
  {
    command: COMMAND.IF,
    definition: 'ถ้า'
  },
  {
    command: COMMAND.ELSE,
    definition: 'มิฉะนั้น'
  },
  {
    command: COMMAND.THEN,
    definition: 'แล้ว'
  },
  {
    command: COMMAND.OR,
    definition: 'หรือ'
  },
  {
    command: COMMAND.AND,
    definition: 'และ'
  },
  {
    command: COMMAND.NOT,
    definition: 'ไม่'
  },
  {
    command: COMMAND.FALSE,
    definition: 'เท็จ'
  },
  {
    command: COMMAND.TRUE,
    definition: 'จริง'
  },
  {
    command: COMMAND.DO,
    definition: 'ทำ'
  },
  {
    command: COMMAND.WHILE,
    definition: 'ในขณะที่'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'ทำซ้ำ'
  },
  {
    command: COMMAND.TIMES,
    definition: 'ครั้ง'
  },
  {
    command: COMMAND.BREAK,
    definition: 'หยุด'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'ทำต่อไป'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'ฟังก์ชัน'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'แบบสุ่ม'
  },
  {
    command: COMMAND.POW,
    definition: 'ยกกำลัง'
  },
  {
    command: COMMAND.SQR,
    definition: 'กำลังสอง'
  },
  {
    command: COMMAND.SQRT,
    definition: 'รากที่สอง'
  },
  {
    command: COMMAND.ROUND,
    definition: 'ปัดเศษ'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'ปัดลง'
  },
  {
    command: COMMAND.CEIL,
    definition: 'ปัดขึ้น'
  },
  {
    command: COMMAND.ABS,
    definition: 'ค่าสัมบูรณ์'
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
