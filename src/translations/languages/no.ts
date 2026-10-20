//the words of the CMIL commands in Norwegian
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['skriv_inn'],
    print: ['skriv_ut'],
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
    for: ['for'],
    from: ['fra'],
    to: ['til'],
    step: ['steg'],
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
    then: 'Is så more common after hvis?',
    while: 'Means during; would så_lenge be better?',
    for: 'A new word; it needs a native review.',
    from: 'A new word; it needs a native review.',
    to: 'A new word; it needs a native review.',
    step: 'A new word; it needs a native review.'
  },
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'Syntaksfeil på linje {line}.',
    indentError: 'Innrykksfeil på linje {line}: rykk inn blokker med 4 mellomrom.',
    argumentError: 'Linje {line}: en matematisk funksjon har feil argumenter.',
    equalsError: 'Linje {line}: skriv == i stedet for = for å sammenligne.',
    undefinedVariable: 'Linje {line}: {variable} har ingen verdi ennå.',
    typeError: 'Linje {line}: {operator} virker ikke med disse verdiene.',
    conditionError: 'Linje {line}: en betingelse må være sann eller usann.',
    divisionByZero: 'Linje {line}: deling på null.',
    mathError: 'Linje {line}: {operator} har ikke noe resultat for denne verdien.',
    memoryLimit: 'Linje {line}: en tekst ble for lang.',
    timeout: 'Programmet kjørte for lenge uten å be om inndata.',
    unknownLanguage: 'Ukjent språk: {language}.'
  }
};

export default translation;
