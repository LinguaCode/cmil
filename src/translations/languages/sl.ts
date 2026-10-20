//the words of the CMIL commands in Slovenian
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['vhod'],
    output: ['izhod'],
    if: ['če'],
    else: ['sicer'],
    then: ['nato'],
    or: ['ali'],
    and: ['in'],
    not: ['ne'],
    false: ['ni_res'],
    true: ['res'],
    do: ['naredi'],
    while: ['dokler'],
    repeat: ['ponovi'],
    times: ['krat'],
    break: ['prekini'],
    continue: ['nadaljuj'],
    function: ['funkcija'],
    random: ['naključno'],
    pow: ['potenca'],
    sqr: ['kvadrat'],
    sqrt: ['kvadratni_koren'],
    round: ['zaokroži'],
    floor: ['zaokroži_navzdol'],
    ceil: ['zaokroži_navzgor'],
    abs: ['modul'],
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
    then: 'Is potem more common after če?'
  }
};

export default translation;
