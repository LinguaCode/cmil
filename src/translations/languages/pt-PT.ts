//the words of the CMIL commands in Portuguese
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['entrada'],
    output: ['saída'],
    if: ['se'],
    else: ['senão'],
    then: ['então'],
    or: ['ou'],
    and: ['e'],
    not: ['não'],
    false: ['falso'],
    true: ['verdadeiro'],
    do: ['fazer'],
    while: ['enquanto'],
    repeat: ['repita'],
    times: ['vezes'],
    break: ['interromper'],
    continue: ['continuar'],
    function: ['função'],
    random: ['aleatória'],
    pow: ['potência'],
    sqr: ['quadrado'],
    sqrt: ['raiz_quadrada'],
    round: ['arredondar'],
    floor: ['chão'],
    ceil: ['teto'],
    abs: ['valor_absoluto'],
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
    e: ['euler']
  },
  notes: {
    random: 'Feminine; should it be aleatório?',
    floor: 'Brazil uses piso; which word is used in Portugal?'
  }
};

export default translation;
