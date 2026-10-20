//the words of the CMIL commands in Romanian
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['intrare'],
    output: ['ieșire'],
    if: ['dacă'],
    else: ['altfel'],
    then: ['atunci'],
    or: ['sau'],
    and: ['și'],
    not: ['nu'],
    false: ['fals'],
    true: ['adevărat'],
    do: ['execută'],
    while: ['cât_timp'],
    repeat: ['repetă'],
    times: ['ori'],
    break: ['întrerupe'],
    continue: ['continua'],
    function: ['funcție'],
    random: ['aleatoare'],
    pow: ['putere'],
    sqr: ['pătrat'],
    sqrt: ['rădăcină_pătrată'],
    round: ['rotunjire'],
    floor: ['rotunjire_în_jos'],
    ceil: ['rotunjire_în_sus'],
    abs: ['valoare_absolută'],
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
    random: 'Feminine plural; should it be aleator?'
  }
};

export default translation;
