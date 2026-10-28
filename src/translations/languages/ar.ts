//the words of the CMIL commands in Arabic
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['أدخل'],
    print: ['اطبع'],
    if: ['إذا'],
    else: ['وإلا'],
    then: ['فإن'],
    or: ['أو'],
    and: ['و'],
    not: ['لا'],
    false: ['خطأ'],
    true: ['صحيح'],
    do: ['افعل'],
    while: ['طالما'],
    repeat: ['كرر'],
    times: ['مرات'],
    break: ['توقف'],
    continue: ['استمر'],
    for: ['لكل'],
    from: ['من'],
    to: ['إلى'],
    step: ['بخطوة'],
    in: ['في'],
    add: ['أضف'],
    remove: ['احذف'],
    function: ['دالة'],
    return: ['أرجع'],
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
    cot: ['ctg'],
    arcsin: ['arcsin'],
    arccos: ['arccos'],
    arctan: ['arctan'],
    arccot: ['arcctg'],
    log: ['log'],
    ln: ['ln'],
    lg: ['lg'],
    pi: ['pi'],
    e: ['e'],
    length: ['طول'],
    upper: ['أحرف_كبيرة'],
    lower: ['أحرف_صغيرة'],
    number: ['كرقم'],
    text: ['كنص'],
    split: ['قسم'],
    join: ['ادمج']
  },
  quotes: [['«', '»']],
  messages: {
    syntaxError: 'خطأ نحوي في السطر {line}.',
    indentError: 'خطأ في الإزاحة في السطر {line}: أزح الكتل 4 مسافات.',
    argumentError: {
      one: 'السطر {line}: الدالة {function} تأخذ {count} قيمة.',
      two: 'السطر {line}: الدالة {function} تأخذ {count} قيمتين.',
      few: 'السطر {line}: الدالة {function} تأخذ {count} قيم.',
      other: 'السطر {line}: الدالة {function} تأخذ {count} قيمة.'
    },
    equalsError: 'السطر {line}: للمقارنة اكتب == بدلًا من =.',
    nameError: 'السطر {line}: {name} أمر، فلا يمكن أن يكون اسمًا؛ اختر اسمًا آخر.',
    undefinedVariable: 'السطر {line}: ليست للمتغير {variable} قيمة بعد.',
    undefinedFunction: 'السطر {line}: لا توجد دالة باسم {function}.',
    noValue: 'السطر {line}: الدالة {function} لا ترجع قيمة.',
    typeError: 'السطر {line}: لا يعمل {operator} مع هذه القيم.',
    listAsText:
      'السطر {line}: لا تُطبع القائمة كما هي؛ اجمع عناصرها في نص باستخدام {join}، أو اطبعها واحدًا تلو الآخر.',
    conditionError: 'السطر {line}: يجب أن يكون الشرط صحيحًا أو خاطئًا.',
    divisionByZero: 'السطر {line}: قسمة على صفر.',
    mathError: 'السطر {line}: ليس لـ {operator} نتيجة لهذه القيمة.',
    indexError: 'السطر {line}: لا يوجد عنصر رقم {index}.',
    itemError: 'السطر {line}: لا يوجد العنصر {item} في القائمة.',
    memoryLimit: 'السطر {line}: أصبح نص أو قائمة طويلًا جدًا.',
    recursionLimit: 'السطر {line}: استدعاءات متداخلة للدوال كثيرة جدًا.',
    timeout: 'عمل البرنامج مدة طويلة جدًا دون أن يطلب إدخالًا.',
    unknownLanguage: 'لغة غير معروفة: {language}.'
  },
  warnings: {
    numberText: '{text} نص: الإجابة مثل {number} رقم، والرقم لا يساوي نصًا أبدًا. اكتب {number} بدون علامات التنصيص.'
  },
  conversion: {
    mixedTypes: 'السطر {line}: لا تستطيع {target} كتابة هذا البرنامج، فـ {name} يأخذ قيمًا من نوعين، مثل رقم ونص.',
    mixedItems: 'السطر {line}: لا تستطيع {target} كتابة هذا البرنامج، ففي القائمة عناصر من نوعين، مثل أرقام ونصوص.',
    fixedArrays:
      'السطر {line}: لا تستطيع {target} كتابة هذا البرنامج بالمصفوفات الثابتة لدرس أول، مثل قائمة من القوائم أو دالة تعطي قائمة.'
  }
};

export default translation;
