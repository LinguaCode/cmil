//the words of the CMIL commands in Norwegian
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['skriv_inn'],
    output: ['skriv_ut'],
    if: ['hvis'],
    else: ['ellers'],
    then: ['da'],
    or: ['eller'],
    and: ['og'],
    not: ['ikke'],
    false: ['usann'],
    true: ['sann'],
    do: ['gjøre'],
    while: ['mens'],
    repeat: ['gjenta'],
    times: ['ganger'],
    break: ['avbryt'],
    continue: ['fortsett'],
    function: ['funksjon'],
    random: ['tilfeldig'],
    pow: ['potens'],
    sqr: ['kvadrat'],
    sqrt: ['kvadratrot'],
    round: ['avrund'],
    floor: ['avrund_ned'],
    ceil: ['avrund_opp'],
    abs: ['absolutt_verdi'],
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
    then: 'Is så more common after hvis?',
    while: 'Means during; would så_lenge be better?'
  }
};

export default translation;
