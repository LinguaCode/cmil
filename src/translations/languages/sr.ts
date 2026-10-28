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
    in: ['међу'],
    add: ['додај'],
    remove: ['уклони'],
    function: ['функција'],
    return: ['врати'],
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
    e: ['e', 'е'],
    length: ['дужина'],
    upper: ['велика_слова'],
    lower: ['мала_слова'],
    number: ['у_број'],
    text: ['у_текст'],
    split: ['подели'],
    join: ['спој']
  },
  quotes: [['„', '“']],
  messages: {
    syntaxError: 'Синтаксна грешка у реду {line}.',
    indentError: 'Грешка увлачења у реду {line}: увлачите блокове за 4 размака.',
    argumentError: {
      one: 'Ред {line}: {function} прима {count} вредност.',
      few: 'Ред {line}: {function} прима {count} вредности.',
      other: 'Ред {line}: {function} прима {count} вредности.'
    },
    equalsError: 'Ред {line}: за поређење пишите == уместо =.',
    nameError: 'Ред {line}: {name} је наредба, па не може бити име; изаберите друго.',
    undefinedVariable: 'Ред {line}: {variable} још нема вредност.',
    undefinedFunction: 'Ред {line}: не постоји функција {function}.',
    noValue: 'Ред {line}: {function} не враћа вредност.',
    typeError: 'Ред {line}: {operator} не ради са овим вредностима.',
    listAsText:
      'Ред {line}: листа се не исписује онаква каква је; спојите њене елементе у текст помоћу {join} или их испишите један по један.',
    conditionError: 'Ред {line}: услов мора бити тачан или нетачан.',
    divisionByZero: 'Ред {line}: дељење нулом.',
    mathError: 'Ред {line}: {operator} нема резултат за ову вредност.',
    indexError: 'Ред {line}: не постоји елемент {index}.',
    itemError: 'Ред {line}: листа нема елемент {item}.',
    memoryLimit: 'Ред {line}: текст или листа је постао предугачак.',
    recursionLimit: 'Ред {line}: превише угнежђених позива функција.',
    timeout: 'Програм је радио предуго, а није тражио унос.',
    unknownLanguage: 'Непознат језик: {language}.'
  },
  warnings: {
    numberText:
      '{text} је текст: одговор као што је {number} је број, а број никад није једнак тексту. Напиши {number} без наводника.'
  },
  conversion: {
    mixedTypes:
      'Ред {line}: {target} не може да напише овај програм: {name} добија вредности две врсте, као број и текст.',
    mixedItems:
      'Ред {line}: {target} не може да напише овај програм: листа има ставке две врсте, као бројеве и текстове.',
    fixedArrays:
      'Ред {line}: {target} не може да напише овај програм фиксним низовима првог курса, као листу листа или функцију која даје листу.'
  }
};

export default translation;
