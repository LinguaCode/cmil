//the words of the CMIL commands in Slovenian
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['vhod'],
    print: ['izhod'],
    if: ['če'],
    else: ['sicer'],
    then: ['potem'],
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
    in: ['med'],
    add: ['dodaj'],
    remove: ['odstrani'],
    function: ['funkcija'],
    return: ['vrni'],
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
    e: ['e'],
    length: ['dolžina'],
    upper: ['velike_črke'],
    lower: ['male_črke'],
    number: ['v_število'],
    text: ['v_besedilo'],
    split: ['razdeli'],
    join: ['združi']
  },
  quotes: [['„', '“']],
  messages: {
    syntaxError: 'Skladenjska napaka v vrstici {line}.',
    indentError: 'Napaka zamika v vrstici {line}: bloke zamaknite za 4 presledke.',
    argumentError: {
      one: 'Vrstica {line}: {function} sprejme {count} vrednost.',
      two: 'Vrstica {line}: {function} sprejme {count} vrednosti.',
      few: 'Vrstica {line}: {function} sprejme {count} vrednosti.',
      other: 'Vrstica {line}: {function} sprejme {count} vrednosti.'
    },
    equalsError: 'Vrstica {line}: za primerjavo pišite == namesto =.',
    nameError: 'Vrstica {line}: {name} je ukaz, zato ne more biti ime; izberite drugo.',
    undefinedVariable: 'Vrstica {line}: {variable} še nima vrednosti.',
    undefinedFunction: 'Vrstica {line}: funkcije {function} ni.',
    noValue: 'Vrstica {line}: {function} ne vrne vrednosti.',
    typeError: 'Vrstica {line}: {operator} ne deluje s temi vrednostmi.',
    listAsText:
      'Vrstica {line}: seznam se ne izpiše tak, kot je; združite njegove elemente v besedilo z {join} ali jih izpišite enega za drugim.',
    conditionError: 'Vrstica {line}: pogoj mora biti resničen ali neresničen.',
    divisionByZero: 'Vrstica {line}: deljenje z nič.',
    mathError: 'Vrstica {line}: {operator} za to vrednost nima rezultata.',
    indexError: 'Vrstica {line}: elementa {index} ni.',
    itemError: 'Vrstica {line}: seznam nima elementa {item}.',
    memoryLimit: 'Vrstica {line}: besedilo ali seznam je postal predolg.',
    recursionLimit: 'Vrstica {line}: preveč gnezdenih klicev funkcij.',
    timeout: 'Program je tekel predolgo, ne da bi zahteval vhod.',
    unknownLanguage: 'Neznan jezik: {language}.'
  },
  conversion: {
    mixedTypes:
      'Vrstica {line}: {target} tega programa ne more zapisati: {name} dobi vrednosti dveh vrst, na primer število in besedilo.',
    mixedItems:
      'Vrstica {line}: {target} tega programa ne more zapisati: seznam ima elemente dveh vrst, na primer števila in besedila.',
    fixedArrays:
      'Vrstica {line}: {target} tega programa ne more zapisati s fiksnimi tabelami prvega tečaja, na primer seznama seznamov ali funkcije, ki vrne seznam.'
  }
};

export default translation;
