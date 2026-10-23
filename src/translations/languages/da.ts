//the words of the CMIL commands in Danish
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['indtast'],
    print: ['udskriv'],
    if: ['hvis'],
    else: ['ellers'],
    then: ['så'],
    or: ['eller'],
    and: ['og'],
    not: ['ikke'],
    false: ['falsk'],
    true: ['sandt'],
    do: ['gøre'],
    while: ['så_længe'],
    repeat: ['gentag'],
    times: ['gange'],
    break: ['afbryd'],
    continue: ['fortsæt'],
    for: ['for'],
    from: ['fra'],
    to: ['til'],
    step: ['trin'],
    in: ['blandt'],
    add: ['tilføj'],
    remove: ['fjern'],
    function: ['funktion'],
    return: ['returner'],
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
    length: ['længden_af'],
    upper: ['store_bogstaver'],
    lower: ['små_bogstaver'],
    number: ['til_tal'],
    text: ['til_tekst'],
    split: ['del_op'],
    join: ['sammenføj']
  },
  quotes: [['»', '«']],
  messages: {
    syntaxError: 'Syntaksfejl i linje {line}.',
    indentError: 'Indrykningsfejl i linje {line}: ryk blokke 4 mellemrum ind.',
    argumentError: {
      one: 'Linje {line}: {function} tager {count} værdi.',
      other: 'Linje {line}: {function} tager {count} værdier.'
    },
    equalsError: 'Linje {line}: skriv == i stedet for = for at sammenligne.',
    nameError: 'Linje {line}: {name} er en kommando, så det kan ikke være et navn; vælg et andet.',
    undefinedVariable: 'Linje {line}: {variable} har endnu ingen værdi.',
    undefinedFunction: 'Linje {line}: der er ingen funktion {function}.',
    noValue: 'Linje {line}: {function} returnerer ingen værdi.',
    typeError: 'Linje {line}: {operator} virker ikke med disse værdier.',
    conditionError: 'Linje {line}: en betingelse skal være sand eller falsk.',
    divisionByZero: 'Linje {line}: division med nul.',
    mathError: 'Linje {line}: {operator} har intet resultat for denne værdi.',
    indexError: 'Linje {line}: der er intet element {index}.',
    itemError: 'Linje {line}: listen har intet element {item}.',
    memoryLimit: 'Linje {line}: en tekst eller en liste blev for lang.',
    recursionLimit: 'Linje {line}: for mange indlejrede funktionskald.',
    timeout: 'Programmet kørte for længe uden at bede om inddata.',
    unknownLanguage: 'Ukendt sprog: {language}.'
  },
  conversion: {
    mixedTypes:
      'Linje {line}: {target} kan ikke skrive dette program: {name} får værdier af to slags, som et tal og en tekst.',
    mixedItems:
      'Linje {line}: {target} kan ikke skrive dette program: en liste har elementer af to slags, som tal og tekster.'
  }
};

export default translation;
