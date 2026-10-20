//the words of the CMIL commands in Polish
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['wczytaj'],
    output: ['wypisz'],
    if: ['jeśli'],
    else: ['inaczej'],
    then: ['wtedy'],
    or: ['lub'],
    and: ['i'],
    not: ['nie'],
    false: ['fałsz'],
    true: ['prawda'],
    do: ['robić'],
    while: ['dopóki'],
    repeat: ['powtórzyć'],
    times: ['razy'],
    break: ['przerwij'],
    continue: ['dalej'],
    function: ['funkcja'],
    random: ['losowy'],
    pow: ['potęga'],
    sqr: ['kwadrat'],
    sqrt: ['pierwiastek_kwadratowy'],
    round: ['zaokrąglij'],
    floor: ['zaokrąglij_w_dół'],
    ceil: ['zaokrąglij_w_górę'],
    abs: ['wartość_bezwzględna'],
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
    syntaxError: 'Błąd składni w wierszu {line}.',
    indentError: 'Błąd wcięcia w wierszu {line}: wcinaj bloki o 4 spacje.',
    argumentError: 'Wiersz {line}: funkcja matematyczna ma złe argumenty.',
    undefinedVariable: 'Wiersz {line}: {variable} nie ma jeszcze wartości.',
    memoryLimit: 'Wiersz {line}: tekst stał się za długi.',
    timeout: 'Program działał zbyt długo, nie prosząc o dane.',
    unknownLanguage: 'Nieznany język: {language}.'
  }
};

export default translation;
