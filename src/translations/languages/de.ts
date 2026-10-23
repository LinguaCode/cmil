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
    in: ['in'],
    add: ['füge_hinzu'],
    remove: ['entferne'],
    function: ['funktion'],
    return: ['zurückgeben'],
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
    e: ['e'],
    length: ['länge_von'],
    upper: ['großbuchstaben', 'grossbuchstaben'],
    lower: ['kleinbuchstaben'],
    number: ['zu_zahl'],
    text: ['zu_text'],
    split: ['teile'],
    join: ['verbinde']
  },
  quotes: [
    ['„', '“'],
    ['»', '«']
  ],
  messages: {
    syntaxError: 'Syntaxfehler in Zeile {line}.',
    indentError: 'Einrückungsfehler in Zeile {line}: Blöcke um 4 Leerzeichen einrücken.',
    argumentError: {
      one: 'Zeile {line}: {function} nimmt {count} Wert.',
      other: 'Zeile {line}: {function} nimmt {count} Werte.'
    },
    equalsError: 'Zeile {line}: Zum Vergleichen == statt = schreiben.',
    nameError: 'Zeile {line}: {name} ist ein Befehl und kann kein Name sein. Einen anderen Namen wählen.',
    undefinedVariable: 'Zeile {line}: {variable} hat noch keinen Wert.',
    undefinedFunction: 'Zeile {line}: Es gibt keine Funktion {function}.',
    noValue: 'Zeile {line}: {function} gibt keinen Wert zurück.',
    typeError: 'Zeile {line}: {operator} funktioniert mit diesen Werten nicht.',
    conditionError: 'Zeile {line}: Eine Bedingung muss wahr oder falsch sein.',
    divisionByZero: 'Zeile {line}: Division durch null.',
    mathError: 'Zeile {line}: {operator} hat für diesen Wert kein Ergebnis.',
    indexError: 'Zeile {line}: Es gibt kein Element {index}.',
    itemError: 'Zeile {line}: Die Liste hat kein Element {item}.',
    memoryLimit: 'Zeile {line}: Ein Text oder eine Liste wurde zu lang.',
    recursionLimit: 'Zeile {line}: Zu viele verschachtelte Funktionsaufrufe.',
    timeout: 'Das Programm lief zu lange, ohne nach einer Eingabe zu fragen.',
    unknownLanguage: 'Unbekannte Sprache: {language}.'
  },
  conversion: {
    mixedTypes:
      'Zeile {line}: {target} kann dieses Programm nicht schreiben: {name} bekommt Werte zweier Arten, etwa eine Zahl und einen Text.',
    mixedItems:
      'Zeile {line}: {target} kann dieses Programm nicht schreiben: Eine Liste hat Elemente zweier Arten, etwa Zahlen und Texte.'
  }
};

export default translation;
