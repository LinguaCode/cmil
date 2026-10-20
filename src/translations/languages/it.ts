//the words of the CMIL commands in Italian
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['ingresso'],
    print: ['uscita'],
    if: ['se'],
    else: ['altrimenti'],
    then: ['allora'],
    or: ['o'],
    and: ['e'],
    not: ['non'],
    false: ['falso'],
    true: ['vero'],
    do: ['fare'],
    while: ['mentre'],
    repeat: ['ripetere'],
    times: ['volte'],
    break: ['fermare'],
    continue: ['proseguire'],
    for: ['per'],
    from: ['da'],
    to: ['a'],
    step: ['passo'],
    function: ['funzione'],
    random: ['casuale'],
    pow: ['potenza'],
    sqr: ['quadrato'],
    sqrt: ['radice_quadrata'],
    round: ['arrotonda'],
    floor: ['arrotonda_difetto'],
    ceil: ['arrotonda_eccesso'],
    abs: ['modulo'],
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
    pi: ['pi_numero'],
    e: ['e_numero']
  },
  notes: {
    input: 'An electronics term; would leggi (read) be better?',
    print: 'An electronics term; would scrivi (write) be better?',
    for: 'A new word; it needs a native review.',
    from: 'A new word; it needs a native review.',
    to: 'A new word; it needs a native review.',
    step: 'A new word; it needs a native review.'
  },
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'Errore di sintassi alla riga {line}.',
    indentError: 'Errore di rientro alla riga {line}: rientra i blocchi di 4 spazi.',
    argumentError: 'Riga {line}: una funzione matematica ha argomenti sbagliati.',
    equalsError: 'Riga {line}: per confrontare, scrivi == invece di =.',
    undefinedVariable: 'Riga {line}: {variable} non ha ancora un valore.',
    typeError: 'Riga {line}: {operator} non funziona con questi valori.',
    conditionError: 'Riga {line}: una condizione deve essere vera o falsa.',
    divisionByZero: 'Riga {line}: divisione per zero.',
    mathError: 'Riga {line}: {operator} non ha risultato per questo valore.',
    memoryLimit: 'Riga {line}: un testo è diventato troppo lungo.',
    timeout: 'Il programma è andato avanti troppo a lungo senza chiedere input.',
    unknownLanguage: 'Lingua sconosciuta: {language}.'
  }
};

export default translation;
