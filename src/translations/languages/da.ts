//the words of the CMIL commands in Danish
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['indtast'],
    output: ['udskriv'],
    if: ['hvis'],
    else: ['ellers'],
    then: ['så'],
    or: ['eller'],
    and: ['og'],
    not: ['ikke'],
    false: ['falsk'],
    true: ['sandt'],
    do: ['gøre'],
    while: ['mens'],
    repeat: ['gentag'],
    times: ['gange'],
    break: ['afbryd'],
    continue: ['fortsæt'],
    function: ['funktion'],
    random: ['tilfældig'],
    pow: ['potens'],
    sqr: ['kvadrat'],
    sqrt: ['kvadratrod'],
    round: ['afrund'],
    floor: ['afrund_ned'],
    ceil: ['afrund_op'],
    abs: ['absolutte_værdi'],
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
    while: 'Means during; would så_længe be better?'
  }
};

export default translation;
