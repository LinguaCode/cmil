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
  },
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'Skladenjska napaka v vrstici {line}.',
    indentError: 'Napaka zamika v vrstici {line}: bloke zamaknite za 4 presledke.',
    argumentError: 'Vrstica {line}: matematična funkcija ima napačne argumente.',
    undefinedVariable: 'Vrstica {line}: {variable} še nima vrednosti.',
    typeError: 'Vrstica {line}: {operator} ne deluje s temi vrednostmi.',
    conditionError: 'Vrstica {line}: pogoj mora biti resničen ali neresničen.',
    divisionByZero: 'Vrstica {line}: deljenje z nič.',
    mathError: 'Vrstica {line}: {operator} za to vrednost nima rezultata.',
    memoryLimit: 'Vrstica {line}: besedilo je postalo predolgo.',
    timeout: 'Program je tekel predolgo, ne da bi zahteval vhod.',
    unknownLanguage: 'Neznan jezik: {language}.'
  }
};

export default translation;
