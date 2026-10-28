//the words of the CMIL commands in Hebrew
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['קלט'],
    print: ['פלט'],
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
    for: ['עבור'],
    from: ['מ'],
    to: ['עד'],
    step: ['צעד'],
    in: ['בתוך'],
    add: ['הוסף'],
    remove: ['הסר'],
    function: ['פונקציה'],
    return: ['החזר'],
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
    length: ['אורך'],
    upper: ['אותיות_גדולות'],
    lower: ['אותיות_קטנות'],
    number: ['למספר'],
    text: ['לטקסט'],
    split: ['פצל'],
    join: ['חבר']
  },
  quotes: [['„', '”']],
  messages: {
    syntaxError: 'שגיאת תחביר בשורה {line}.',
    indentError: 'שגיאת הזחה בשורה {line}: הזיחו בלוקים ב-4 רווחים.',
    argumentError: {
      one: 'שורה {line}: {function} מקבלת {count} ערך.',
      other: 'שורה {line}: {function} מקבלת {count} ערכים.'
    },
    equalsError: 'שורה {line}: כדי להשוות כתבו == במקום =.',
    nameError: 'שורה {line}: {name} היא פקודה, ולכן אי אפשר להשתמש בה כשם; בחרו שם אחר.',
    undefinedVariable: 'שורה {line}: ל-{variable} עדיין אין ערך.',
    undefinedFunction: 'שורה {line}: אין פונקציה {function}.',
    noValue: 'שורה {line}: {function} לא מחזירה ערך.',
    typeError: 'שורה {line}: {operator} לא עובד עם הערכים האלה.',
    listAsText:
      'שורה {line}: רשימה לא מודפסת כמו שהיא; חברו את הפריטים שלה לטקסט בעזרת {join}, או הדפיסו אותם אחד אחד.',
    conditionError: 'שורה {line}: תנאי חייב להיות אמת או שקר.',
    divisionByZero: 'שורה {line}: חלוקה באפס.',
    mathError: 'שורה {line}: ל-{operator} אין תוצאה עבור הערך הזה.',
    indexError: 'שורה {line}: אין פריט מספר {index}.',
    itemError: 'שורה {line}: אין ברשימה פריט {item}.',
    memoryLimit: 'שורה {line}: טקסט או רשימה נעשו ארוכים מדי.',
    recursionLimit: 'שורה {line}: יותר מדי קריאות מקוננות לפונקציות.',
    timeout: 'התוכנית רצה זמן רב מדי בלי לבקש קלט.',
    unknownLanguage: 'שפה לא מוכרת: {language}.'
  },
  warnings: {
    numberText: '{text} הוא טקסט: תשובה כמו {number} היא מספר, ומספר אף פעם לא שווה לטקסט. כתבו {number} בלי המירכאות.'
  },
  conversion: {
    mixedTypes: 'שורה {line}: {target} לא יכולה לכתוב את התוכנית הזאת: {name} מקבל ערכים משני סוגים, כמו מספר וטקסט.',
    mixedItems:
      'שורה {line}: {target} לא יכולה לכתוב את התוכנית הזאת: ברשימה יש פריטים משני סוגים, כמו מספרים וטקסטים.',
    fixedArrays:
      'שורה {line}: {target} לא יכולה לכתוב את התוכנית הזאת עם המערכים הקבועים של קורס ראשון, כמו רשימה של רשימות או פונקציה שמחזירה רשימה.'
  }
};

export default translation;
