//the words of the CMIL commands in Italian
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['ingresso'],
    output: ['uscita'],
    if: ['se'],
    else: ['altrimenti'],
    then: ['allora'],
    or: ['o'],
    and: ['e'],
    not: ['non'],
    false: ['falso'],
    true: ['vero'],
    do: ['fare'],
    while: ['mentre'],
    repeat: ['ripetere'],
    times: ['volte'],
    break: ['fermare'],
    continue: ['proseguire'],
    function: ['funzione'],
    random: ['casuale'],
    pow: ['potenza'],
    sqr: ['quadrato'],
    sqrt: ['radice_quadrata'],
    round: ['arrotonda'],
    floor: ['arrotonda_difetto'],
    ceil: ['arrotonda_eccesso'],
    abs: ['modulo'],
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
    pi: ['pi_numero'],
    e: ['e_numero']
  },
  notes: {
    input: 'An electronics term; would leggi (read) be better?',
    output: 'An electronics term; would scrivi (write) be better?'
  }
};

export default translation;
