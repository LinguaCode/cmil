//the words of the CMIL commands in Korean
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['입력'],
    output: ['출력'],
    if: ['만약'],
    else: ['아니면'],
    then: ['그러면'],
    or: ['또는'],
    and: ['그리고'],
    not: ['지'],
    false: ['거짓'],
    true: ['참'],
    do: ['실행'],
    while: ['동안'],
    repeat: ['반복'],
    times: ['번'],
    break: ['중단'],
    continue: ['계속'],
    function: ['함수'],
    random: ['난수'],
    pow: ['거듭제곱'],
    sqr: ['제곱'],
    sqrt: ['제곱근'],
    round: ['반올림'],
    floor: ['내림'],
    ceil: ['올림'],
    abs: ['절댓값'],
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
    not: 'A fragment of -지 않다; which word should logical not be?'
  }
};

export default translation;
