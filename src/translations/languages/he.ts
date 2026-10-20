//the words of the CMIL commands in Hebrew
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['קלט'],
    output: ['פלט'],
    if: ['אם'],
    else: ['אחרת'],
    then: ['אז'],
    or: ['או'],
    and: ['ו'],
    not: ['לא'],
    false: ['שקר'],
    true: ['אמת'],
    do: ['לעשות'],
    while: ['כל_עוד'],
    repeat: ['חזור'],
    times: ['פעמים'],
    break: ['עצור'],
    continue: ['המשך'],
    function: ['פונקציה'],
    random: ['אקראי'],
    pow: ['חזקה'],
    sqr: ['ריבוע'],
    sqrt: ['שורש_ריבועי'],
    round: ['עיגול'],
    floor: ['עיגול_למטה'],
    ceil: ['עיגול_למעלה'],
    abs: ['ערך_מוחלט'],
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
    syntaxError: 'שגיאת תחביר בשורה {line}.',
    indentError: 'שגיאת הזחה בשורה {line}: הזיחו בלוקים ב-4 רווחים.',
    argumentError: 'שורה {line}: לפונקציה מתמטית יש ארגומנטים שגויים.',
    undefinedVariable: 'שורה {line}: ל-{variable} עדיין אין ערך.',
    typeError: 'שורה {line}: {operator} לא עובד עם הערכים האלה.',
    conditionError: 'שורה {line}: תנאי חייב להיות אמת או שקר.',
    divisionByZero: 'שורה {line}: חלוקה באפס.',
    mathError: 'שורה {line}: ל-{operator} אין תוצאה עבור הערך הזה.',
    memoryLimit: 'שורה {line}: טקסט נעשה ארוך מדי.',
    timeout: 'התוכנית רצה זמן רב מדי בלי לבקש קלט.',
    unknownLanguage: 'שפה לא מוכרת: {language}.'
  }
};

export default translation;
