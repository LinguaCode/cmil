//the words of the CMIL commands in Thai
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['นำเข้าข้อมูล'],
    output: ['ส่งออก'],
    if: ['ถ้า'],
    else: ['มิฉะนั้น'],
    then: ['แล้ว'],
    or: ['หรือ'],
    and: ['และ'],
    not: ['ไม่'],
    false: ['เท็จ'],
    true: ['จริง'],
    do: ['ทำ'],
    while: ['ในขณะที่'],
    repeat: ['ทำซ้ำ'],
    times: ['ครั้ง'],
    break: ['หยุด'],
    continue: ['ทำต่อไป'],
    function: ['ฟังก์ชัน'],
    random: ['แบบสุ่ม'],
    pow: ['ยกกำลัง'],
    sqr: ['กำลังสอง'],
    sqrt: ['รากที่สอง'],
    round: ['ปัดเศษ'],
    floor: ['ปัดลง'],
    ceil: ['ปัดขึ้น'],
    abs: ['ค่าสัมบูรณ์'],
    sin: ['sin'],
    cos: ['cos'],
    tan: ['tan'],
    ctg: ['ctg'],
    arcsin: ['arcsin'],
    arccos: ['arccos'],
    arctan: ['arctan'],
    arcctg: ['arcctg'],
    log: ['log'],
    ln: ['ln'],
    lg: ['lg'],
    pi: ['pi'],
    e: ['e']
  },
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'ไวยากรณ์ผิดในบรรทัดที่ {line}',
    indentError: 'ย่อหน้าผิดในบรรทัดที่ {line}: ให้ย่อหน้าบล็อกทีละ 4 ช่อง',
    argumentError: 'บรรทัดที่ {line}: ฟังก์ชันคณิตศาสตร์มีอาร์กิวเมนต์ไม่ถูกต้อง',
    undefinedVariable: 'บรรทัดที่ {line}: {variable} ยังไม่มีค่า',
    memoryLimit: 'บรรทัดที่ {line}: ข้อความยาวเกินไป',
    timeout: 'โปรแกรมทำงานนานเกินไปโดยไม่ขอข้อมูลเข้า',
    unknownLanguage: 'ไม่รู้จักภาษา: {language}'
  }
};

export default translation;
