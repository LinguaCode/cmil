//the words of the CMIL commands in Ukrainian
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['ввести'],
    output: ['вивести'],
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
    function: ['функція'],
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
    ctg: ['ctg'],
    arcsin: ['arcsin'],
    arccos: ['arccos'],
    arctan: ['arctan'],
    arcctg: ['arcctg'],
    log: ['log'],
    ln: ['ln'],
    lg: ['lg'],
    pi: ['pi'],
    e: ['e', 'е']
  },
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'Синтаксична помилка в рядку {line}.',
    indentError: 'Помилка відступу в рядку {line}: робіть відступи блоків у 4 пробіли.',
    argumentError: 'Рядок {line}: математична функція має неправильні аргументи.',
    undefinedVariable: 'Рядок {line}: {variable} ще не має значення.',
    memoryLimit: 'Рядок {line}: текст став задовгим.',
    timeout: 'Програма працювала задовго, не запитуючи введення.',
    unknownLanguage: 'Невідома мова: {language}.'
  }
};

export default translation;
