//the words of the CMIL commands in Ukrainian
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['ввести'],
    print: ['вивести'],
    if: ['якщо'],
    else: ['інакше'],
    then: ['тоді'],
    or: ['або'],
    and: ['і'],
    not: ['не'],
    false: ['хиба'],
    true: ['істина'],
    do: ['робити'],
    while: ['поки'],
    repeat: ['повторити'],
    times: ['раз'],
    break: ['перервати'],
    continue: ['далі'],
    for: ['для'],
    from: ['від'],
    to: ['до'],
    step: ['крок'],
    in: ['серед'],
    add: ['додати'],
    remove: ['видалити'],
    function: ['функція'],
    return: ['повернути'],
    random: ['випадковий'],
    pow: ['степінь'],
    sqr: ['квадрат'],
    sqrt: ['квадратний_корінь'],
    round: ['округлити'],
    floor: ['округлити_вниз'],
    ceil: ['округлити_вгору'],
    abs: ['модуль'],
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
    e: ['e', 'е'],
    length: ['довжина'],
    upper: ['великі_літери'],
    lower: ['малі_літери'],
    number: ['в_число'],
    text: ['в_текст'],
    split: ['розділити'],
    join: ['поєднати']
  },
  quotes: [
    ['«', '»'],
    ['„', '“']
  ],
  messages: {
    syntaxError: 'Синтаксична помилка в рядку {line}.',
    indentError: 'Помилка відступу в рядку {line}: робіть відступи блоків у 4 пробіли.',
    argumentError: {
      one: 'Рядок {line}: {function} приймає {count} значення.',
      few: 'Рядок {line}: {function} приймає {count} значення.',
      many: 'Рядок {line}: {function} приймає {count} значень.',
      other: 'Рядок {line}: {function} приймає {count} значення.'
    },
    equalsError: 'Рядок {line}: для порівняння пишіть == замість =.',
    nameError: 'Рядок {line}: {name} — команда, тому це не може бути іменем; виберіть інше.',
    undefinedVariable: 'Рядок {line}: {variable} ще не має значення.',
    undefinedFunction: 'Рядок {line}: немає функції {function}.',
    noValue: 'Рядок {line}: функція {function} не повертає значення.',
    typeError: 'Рядок {line}: {operator} не працює з цими значеннями.',
    listAsText:
      'Рядок {line}: список не виводиться як є; з’єднайте його елементи в текст за допомогою {join} або виведіть їх по одному.',
    conditionError: 'Рядок {line}: умова має бути істинною або хибною.',
    divisionByZero: 'Рядок {line}: ділення на нуль.',
    mathError: 'Рядок {line}: {operator} не має результату для цього значення.',
    indexError: 'Рядок {line}: немає елемента з номером {index}.',
    itemError: 'Рядок {line}: у списку немає елемента {item}.',
    memoryLimit: 'Рядок {line}: текст або список став задовгим.',
    recursionLimit: 'Рядок {line}: забагато вкладених викликів функцій.',
    timeout: 'Програма працювала задовго, не запитуючи введення.',
    unknownLanguage: 'Невідома мова: {language}.'
  },
  conversion: {
    mixedTypes:
      'Рядок {line}: мовою {target} цю програму не написати: {name} отримує значення двох видів, наприклад число й текст.',
    mixedItems:
      'Рядок {line}: мовою {target} цю програму не написати: у списку елементи двох видів, наприклад числа й тексти.',
    fixedArrays:
      'Рядок {line}: мовою {target} цю програму не написати фіксованими масивами першого курсу, наприклад список списків або функцію, що повертає список.'
  }
};

export default translation;
