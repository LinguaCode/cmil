//the words of the CMIL commands in Romanian
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['intrare'],
    print: ['ieșire'],
    if: ['dacă'],
    else: ['altfel'],
    then: ['atunci'],
    or: ['sau'],
    and: ['și'],
    not: ['nu'],
    false: ['fals'],
    true: ['adevărat'],
    do: ['execută'],
    while: ['cât_timp'],
    repeat: ['repetă'],
    times: ['ori'],
    break: ['întrerupe'],
    continue: ['continua'],
    function: ['funcție'],
    random: ['aleatoare'],
    pow: ['putere'],
    sqr: ['pătrat'],
    sqrt: ['rădăcină_pătrată'],
    round: ['rotunjire'],
    floor: ['rotunjire_în_jos'],
    ceil: ['rotunjire_în_sus'],
    abs: ['valoare_absolută'],
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
    random: 'Feminine plural; should it be aleator?'
  },
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'Eroare de sintaxă pe linia {line}.',
    indentError: 'Eroare de indentare pe linia {line}: indentează blocurile cu 4 spații.',
    argumentError: 'Linia {line}: o funcție matematică are argumente greșite.',
    equalsError: 'Linia {line}: pentru a compara, scrie == în loc de =.',
    undefinedVariable: 'Linia {line}: {variable} nu are încă o valoare.',
    typeError: 'Linia {line}: {operator} nu funcționează cu aceste valori.',
    conditionError: 'Linia {line}: o condiție trebuie să fie adevărată sau falsă.',
    divisionByZero: 'Linia {line}: împărțire la zero.',
    mathError: 'Linia {line}: {operator} nu are rezultat pentru această valoare.',
    memoryLimit: 'Linia {line}: un text a devenit prea lung.',
    timeout: 'Programul a rulat prea mult fără să ceară o intrare.',
    unknownLanguage: 'Limbă necunoscută: {language}.'
  }
};

export default translation;
