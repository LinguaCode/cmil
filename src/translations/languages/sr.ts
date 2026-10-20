//the words of the CMIL commands in Serbian
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['улаз'],
    print: ['излаз'],
    if: ['ако'],
    else: ['иначе'],
    then: ['онда'],
    or: ['или'],
    and: ['и'],
    not: ['не'],
    false: ['лаж'],
    true: ['истина'],
    do: ['уради'],
    while: ['док'],
    repeat: ['понови'],
    times: ['пута'],
    break: ['прекини'],
    continue: ['даље'],
    for: ['за'],
    from: ['од'],
    to: ['до'],
    step: ['корак'],
    function: ['функција'],
    random: ['случајни'],
    pow: ['степен'],
    sqr: ['квадрат'],
    sqrt: ['квадратни_корен'],
    round: ['заокружи'],
    floor: ['заокружи_наниже'],
    ceil: ['заокружи_навише'],
    abs: ['модул'],
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
    e: ['e', 'е']
  },
  notes: {
    for: 'A new word; it needs a native review.',
    from: 'A new word; it needs a native review.',
    to: 'A new word; it needs a native review.',
    step: 'A new word; it needs a native review.'
  },
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'Синтаксна грешка у реду {line}.',
    indentError: 'Грешка увлачења у реду {line}: увлачите блокове за 4 размака.',
    argumentError: 'Ред {line}: математичка функција има погрешне аргументе.',
    equalsError: 'Ред {line}: за поређење пишите == уместо =.',
    undefinedVariable: 'Ред {line}: {variable} још нема вредност.',
    typeError: 'Ред {line}: {operator} не ради са овим вредностима.',
    conditionError: 'Ред {line}: услов мора бити тачан или нетачан.',
    divisionByZero: 'Ред {line}: дељење нулом.',
    mathError: 'Ред {line}: {operator} нема резултат за ову вредност.',
    memoryLimit: 'Ред {line}: текст је постао предугачак.',
    timeout: 'Програм је радио предуго, а није тражио унос.',
    unknownLanguage: 'Непознат језик: {language}.'
  }
};

export default translation;
