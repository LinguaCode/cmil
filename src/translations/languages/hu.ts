//the words of the CMIL commands in Hungarian
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['bemenet'],
    print: ['kimenet'],
    if: ['ha'],
    else: ['különben'],
    then: ['akkor'],
    or: ['vagy'],
    and: ['és'],
    not: ['nem'],
    false: ['hamis'],
    true: ['igaz'],
    do: ['csinálni'],
    while: ['míg'],
    repeat: ['ismétlés'],
    times: ['szer'],
    break: ['megszakítás'],
    continue: ['tovább'],
    for: ['ciklus'],
    from: ['kezdet'],
    to: ['vég'],
    step: ['lépés'],
    function: ['funkció'],
    random: ['véletlen'],
    pow: ['hatvány'],
    sqr: ['négyzet'],
    sqrt: ['négyzetgyök'],
    round: ['kerekítés'],
    floor: ['lefelé_kerekítés'],
    ceil: ['felfelé_kerekítés'],
    abs: ['abszolút_érték'],
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
    syntaxError: 'Szintaktikai hiba a(z) {line}. sorban.',
    indentError: 'Behúzási hiba a(z) {line}. sorban: a blokkokat 4 szóközzel húzd be.',
    argumentError: '{line}. sor: egy matematikai függvény argumentumai hibásak.',
    equalsError: '{line}. sor: összehasonlításhoz == kell, nem =.',
    undefinedVariable: '{line}. sor: {variable} még nem kapott értéket.',
    typeError: '{line}. sor: a(z) {operator} nem működik ezekkel az értékekkel.',
    conditionError: '{line}. sor: a feltételnek igaznak vagy hamisnak kell lennie.',
    divisionByZero: '{line}. sor: nullával osztás.',
    mathError: '{line}. sor: a(z) {operator} értéke ennél az értéknél nem létezik.',
    memoryLimit: '{line}. sor: egy szöveg túl hosszú lett.',
    timeout: 'A program túl sokáig futott anélkül, hogy bemenetet kért volna.',
    unknownLanguage: 'Ismeretlen nyelv: {language}.'
  }
};

export default translation;
