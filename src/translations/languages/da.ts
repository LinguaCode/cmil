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
  },
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'Syntaksfejl i linje {line}.',
    indentError: 'Indrykningsfejl i linje {line}: ryk blokke 4 mellemrum ind.',
    argumentError: 'Linje {line}: en matematisk funktion har forkerte argumenter.',
    undefinedVariable: 'Linje {line}: {variable} har endnu ingen værdi.',
    typeError: 'Linje {line}: {operator} virker ikke med disse værdier.',
    conditionError: 'Linje {line}: en betingelse skal være sand eller falsk.',
    divisionByZero: 'Linje {line}: division med nul.',
    mathError: 'Linje {line}: {operator} har intet resultat for denne værdi.',
    memoryLimit: 'Linje {line}: en tekst blev for lang.',
    timeout: 'Programmet kørte for længe uden at bede om inddata.',
    unknownLanguage: 'Ukendt sprog: {language}.'
  }
};

export default translation;
