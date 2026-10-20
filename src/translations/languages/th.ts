//the words of the CMIL commands in Thai
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['นำเข้าข้อมูล'],
    print: ['ส่งออก'],
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
    for: ['สำหรับ'],
    from: ['จาก'],
    to: ['ถึง'],
    step: ['ทีละ'],
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
    cot: ['ctg'],
    arcsin: ['arcsin'],
    arccos: ['arccos'],
    arctan: ['arctan'],
    arccot: ['arcctg'],
    log: ['log'],
    ln: ['ln'],
    lg: ['lg'],
    pi: ['pi'],
    e: ['e']
  },
  notes: {
    for: 'A new word; it needs a native review.',
    from: 'A new word; it needs a native review.',
    to: 'A new word; it needs a native review.',
    step: 'A new word; it needs a native review.'
  },
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'ไวยากรณ์ผิดในบรรทัดที่ {line}',
    indentError: 'ย่อหน้าผิดในบรรทัดที่ {line}: ให้ย่อหน้าบล็อกทีละ 4 ช่อง',
    argumentError: 'บรรทัดที่ {line}: ฟังก์ชันคณิตศาสตร์มีอาร์กิวเมนต์ไม่ถูกต้อง',
    equalsError: 'บรรทัดที่ {line}: ถ้าจะเปรียบเทียบ ให้ใช้ == แทน =',
    undefinedVariable: 'บรรทัดที่ {line}: {variable} ยังไม่มีค่า',
    typeError: 'บรรทัดที่ {line}: {operator} ใช้กับค่าเหล่านี้ไม่ได้',
    conditionError: 'บรรทัดที่ {line}: เงื่อนไขต้องเป็นจริงหรือเท็จ',
    divisionByZero: 'บรรทัดที่ {line}: หารด้วยศูนย์',
    mathError: 'บรรทัดที่ {line}: {operator} ไม่มีผลลัพธ์สำหรับค่านี้',
    memoryLimit: 'บรรทัดที่ {line}: ข้อความยาวเกินไป',
    timeout: 'โปรแกรมทำงานนานเกินไปโดยไม่ขอข้อมูลเข้า',
    unknownLanguage: 'ไม่รู้จักภาษา: {language}'
  }
};

export default translation;
