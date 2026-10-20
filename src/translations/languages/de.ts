//the words of the CMIL commands in German
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['eingeben'],
    output: ['ausgeben'],
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
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'Syntaxfehler in Zeile {line}.',
    indentError: 'Einrückungsfehler in Zeile {line}: Blöcke um 4 Leerzeichen einrücken.',
    argumentError: 'Zeile {line}: Eine Mathefunktion hat falsche Argumente.',
    undefinedVariable: 'Zeile {line}: {variable} hat noch keinen Wert.',
    memoryLimit: 'Zeile {line}: Ein Text wurde zu lang.',
    timeout: 'Das Programm lief zu lange, ohne nach einer Eingabe zu fragen.',
    unknownLanguage: 'Unbekannte Sprache: {language}.'
  }
};

export default translation;
