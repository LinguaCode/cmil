//the words of the CMIL commands in Georgian
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['შეყვანის'],
    output: ['გამოშვება'],
    if: ['თუ'],
    else: ['სხვა'],
    then: ['მაშინ'],
    or: ['ან'],
    and: ['და'],
    not: ['არა'],
    false: ['ცრუ'],
    true: ['მართალია'],
    do: ['გააკეთე'],
    while: ['სანამ'],
    repeat: ['გაიმეორე'],
    times: ['ჯერ'],
    break: ['შეწყვიტე'],
    continue: ['გაგრძელება'],
    function: ['ფუნქცია'],
    random: ['შემთხვევითი'],
    pow: ['ხარისხი'],
    sqr: ['კვადრატი'],
    sqrt: ['კვადრატული_ფესვი'],
    round: ['დამრგვალება'],
    floor: ['დამრგვალება_ქვემოთ'],
    ceil: ['დამრგვალება_ზემოთ'],
    abs: ['მოდული'],
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
    input: 'Genitive (of input); should it be შეყვანა?',
    output: 'Means release; should it be გამოტანა?',
    else: 'Means other; should it be თორემ?',
    true: 'Means it is true; should it be ჭეშმარიტი?'
  }
};

export default translation;
