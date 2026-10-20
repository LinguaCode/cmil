//the words of the CMIL commands in Swedish
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['mata_in'],
    output: ['skriv_ut'],
    if: ['om'],
    else: ['annars'],
    then: ['så'],
    or: ['eller'],
    and: ['och'],
    not: ['inte'],
    false: ['falskt'],
    true: ['sant'],
    do: ['göra'],
    while: ['medan'],
    repeat: ['upprepa'],
    times: ['gånger'],
    break: ['avbryt'],
    continue: ['fortsätt'],
    function: ['funktion'],
    random: ['slumptal'],
    pow: ['potens'],
    sqr: ['kvadrat'],
    sqrt: ['roten_ur'],
    round: ['avrunda'],
    floor: ['avrunda_nedåt'],
    ceil: ['avrunda_uppåt'],
    abs: ['absolutvärde'],
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
    while: 'Means during; would så_länge be better?'
  },
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'Syntaxfel på rad {line}.',
    indentError: 'Indragsfel på rad {line}: dra in block med 4 blanksteg.',
    argumentError: 'Rad {line}: en matematisk funktion har fel argument.',
    undefinedVariable: 'Rad {line}: {variable} har inget värde än.',
    memoryLimit: 'Rad {line}: en text blev för lång.',
    timeout: 'Programmet körde för länge utan att be om indata.',
    unknownLanguage: 'Okänt språk: {language}.'
  }
};

export default translation;
