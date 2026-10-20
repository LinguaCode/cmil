//the words of the CMIL commands in German
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['eingeben'],
    print: ['ausgeben'],
    if: ['wenn'],
    else: ['sonst'],
    then: ['dann'],
    or: ['oder'],
    and: ['und'],
    not: ['nicht'],
    false: ['falsch'],
    true: ['wahr'],
    do: ['tun'],
    while: ['solange'],
    repeat: ['wiederholen'],
    times: ['mal'],
    break: ['abbrechen'],
    continue: ['weiter'],
    for: ['für'],
    from: ['von'],
    to: ['bis'],
    step: ['schritt'],
    function: ['funktion'],
    random: ['zufällig'],
    pow: ['potenz'],
    sqr: ['quadrat'],
    sqrt: ['quadratwurzel'],
    round: ['runden'],
    floor: ['abrunden'],
    ceil: ['aufrunden'],
    abs: ['absolutwert'],
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
    for: 'A new word; it needs a native review.',
    from: 'A new word; it needs a native review.',
    to: 'A new word; it needs a native review.',
    step: 'A new word; it needs a native review.'
  },
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'Syntaxfehler in Zeile {line}.',
    indentError: 'Einrückungsfehler in Zeile {line}: Blöcke um 4 Leerzeichen einrücken.',
    argumentError: 'Zeile {line}: Eine Mathefunktion hat falsche Argumente.',
    equalsError: 'Zeile {line}: Zum Vergleichen == statt = schreiben.',
    undefinedVariable: 'Zeile {line}: {variable} hat noch keinen Wert.',
    typeError: 'Zeile {line}: {operator} funktioniert mit diesen Werten nicht.',
    conditionError: 'Zeile {line}: Eine Bedingung muss wahr oder falsch sein.',
    divisionByZero: 'Zeile {line}: Division durch null.',
    mathError: 'Zeile {line}: {operator} hat für diesen Wert kein Ergebnis.',
    memoryLimit: 'Zeile {line}: Ein Text wurde zu lang.',
    timeout: 'Das Programm lief zu lange, ohne nach einer Eingabe zu fragen.',
    unknownLanguage: 'Unbekannte Sprache: {language}.'
  }
};

export default translation;
