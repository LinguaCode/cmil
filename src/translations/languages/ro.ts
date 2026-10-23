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
    for: ['pentru'],
    from: ['de_la'],
    to: ['până_la'],
    step: ['pas'],
    in: ['în'],
    add: ['adaugă'],
    remove: ['elimină'],
    function: ['funcție'],
    return: ['returnează'],
    random: ['aleator'],
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
    e: ['e'],
    length: ['lungimea'],
    upper: ['majuscule'],
    lower: ['minuscule'],
    number: ['în_număr'],
    text: ['în_text'],
    split: ['împarte'],
    join: ['unește']
  },
  quotes: [['„', '”']],
  messages: {
    syntaxError: 'Eroare de sintaxă pe linia {line}.',
    indentError: 'Eroare de indentare pe linia {line}: indentează blocurile cu 4 spații.',
    argumentError: {
      one: 'Linia {line}: {function} primește {count} valoare.',
      few: 'Linia {line}: {function} primește {count} valori.',
      other: 'Linia {line}: {function} primește {count} de valori.'
    },
    equalsError: 'Linia {line}: pentru a compara, scrie == în loc de =.',
    nameError: 'Linia {line}: {name} este o comandă, deci nu poate fi un nume; alege altul.',
    undefinedVariable: 'Linia {line}: {variable} nu are încă o valoare.',
    undefinedFunction: 'Linia {line}: nu există funcția {function}.',
    noValue: 'Linia {line}: {function} nu returnează nicio valoare.',
    typeError: 'Linia {line}: {operator} nu funcționează cu aceste valori.',
    conditionError: 'Linia {line}: o condiție trebuie să fie adevărată sau falsă.',
    divisionByZero: 'Linia {line}: împărțire la zero.',
    mathError: 'Linia {line}: {operator} nu are rezultat pentru această valoare.',
    indexError: 'Linia {line}: nu există elementul {index}.',
    itemError: 'Linia {line}: lista nu are elementul {item}.',
    memoryLimit: 'Linia {line}: un text sau o listă a devenit prea lung.',
    recursionLimit: 'Linia {line}: prea multe apeluri de funcții imbricate.',
    timeout: 'Programul a rulat prea mult fără să ceară o intrare.',
    unknownLanguage: 'Limbă necunoscută: {language}.'
  },
  conversion: {
    mixedTypes:
      'Linia {line}: {target} nu poate scrie acest program: {name} primește valori de două feluri, ca un număr și un text.',
    mixedItems:
      'Linia {line}: {target} nu poate scrie acest program: o listă are elemente de două feluri, ca numere și texte.'
  }
};

export default translation;
