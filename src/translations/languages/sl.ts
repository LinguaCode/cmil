//the words of the CMIL commands in Slovenian
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['vhod'],
    print: ['izhod'],
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
    for: ['za'],
    from: ['od'],
    to: ['do'],
    step: ['korak'],
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
    cot: ['ctg'],
    arcsin: ['arcsin'],
    arccos: ['arccos'],
    arctan: ['arctan'],
    arccot: ['arcctg'],
    log: ['log'],
    ln: ['ln'],
    lg: ['lg'],
    pi: ['pi'],
    e: ['e']
  },
  notes: {
    then: 'Is potem more common after če?',
    for: 'A new word; it needs a native review.',
    from: 'A new word; it needs a native review.',
    to: 'A new word; it needs a native review.',
    step: 'A new word; it needs a native review.'
  },
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'Skladenjska napaka v vrstici {line}.',
    indentError: 'Napaka zamika v vrstici {line}: bloke zamaknite za 4 presledke.',
    argumentError: 'Vrstica {line}: matematična funkcija ima napačne argumente.',
    equalsError: 'Vrstica {line}: za primerjavo pišite == namesto =.',
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
