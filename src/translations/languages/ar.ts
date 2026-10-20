//the words of the CMIL commands in Arabic
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['المدخلات'],
    output: ['الإخراج'],
    if: ['إذا'],
    else: ['وإلا'],
    then: ['ثم'],
    or: ['أو'],
    and: ['و'],
    not: ['لا'],
    false: ['كاذبة'],
    true: ['صحيح'],
    do: ['افعل'],
    while: ['طالما'],
    repeat: ['كرر'],
    times: ['مرات'],
    break: ['توقف'],
    continue: ['استمر'],
    function: ['دالة'],
    random: ['عشوائية'],
    pow: ['قوة'],
    sqr: ['مربع'],
    sqrt: ['جذر_تربيعي'],
    round: ['تقريب'],
    floor: ['تقريب_لأسفل'],
    ceil: ['تقريب_لأعلى'],
    abs: ['قيمة_مطلقة'],
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
  notes: {
    input: 'Plural (the inputs); would أدخل be better?',
    output: 'Also means directing a film; would اطبع (print) be better?',
    then: 'Means afterwards; would فإن be better?',
    false: 'Feminine (lying); is خطأ the usual truth value?',
    true: 'Is صواب or صح the usual truth value?'
  },
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'خطأ نحوي في السطر {line}.',
    indentError: 'خطأ في الإزاحة في السطر {line}: أزح الكتل 4 مسافات.',
    argumentError: 'السطر {line}: وسائط دالة رياضية غير صحيحة.',
    undefinedVariable: 'السطر {line}: ليست للمتغير {variable} قيمة بعد.',
    typeError: 'السطر {line}: لا يعمل {operator} مع هذه القيم.',
    conditionError: 'السطر {line}: يجب أن يكون الشرط صحيحًا أو خاطئًا.',
    divisionByZero: 'السطر {line}: قسمة على صفر.',
    mathError: 'السطر {line}: ليس لـ {operator} نتيجة لهذه القيمة.',
    memoryLimit: 'السطر {line}: أصبح نص طويلًا جدًا.',
    timeout: 'عمل البرنامج مدة طويلة جدًا دون أن يطلب إدخالًا.',
    unknownLanguage: 'لغة غير معروفة: {language}.'
  }
};

export default translation;
