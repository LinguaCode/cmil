//the words of the CMIL commands in Slovak
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['vstup'],
    output: ['výstup'],
    if: ['ak'],
    else: ['inak'],
    then: ['tak'],
    or: ['alebo'],
    and: ['a'],
    not: ['nie'],
    false: ['nepravda'],
    true: ['pravda'],
    do: ['robiť'],
    while: ['kým'],
    repeat: ['opakovať'],
    times: ['krát'],
    break: ['prerušiť'],
    continue: ['pokračovať'],
    function: ['funkcia'],
    random: ['náhodný'],
    pow: ['mocnina'],
    sqr: ['druhá_mocnina'],
    sqrt: ['odmocnina'],
    round: ['zaokrúhliť'],
    floor: ['zaokrúhliť_nadol'],
    ceil: ['zaokrúhliť_nahor'],
    abs: ['modul'],
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
    syntaxError: 'Syntaktická chyba na riadku {line}.',
    indentError: 'Chyba odsadenia na riadku {line}: odsadzujte bloky o 4 medzery.',
    argumentError: 'Riadok {line}: matematická funkcia má zlé argumenty.',
    undefinedVariable: 'Riadok {line}: {variable} ešte nemá hodnotu.',
    typeError: 'Riadok {line}: {operator} s týmito hodnotami nefunguje.',
    conditionError: 'Riadok {line}: podmienka musí byť pravdivá alebo nepravdivá.',
    divisionByZero: 'Riadok {line}: delenie nulou.',
    mathError: 'Riadok {line}: {operator} pre túto hodnotu nemá výsledok.',
    memoryLimit: 'Riadok {line}: text je príliš dlhý.',
    timeout: 'Program bežal príliš dlho bez toho, aby požiadal o vstup.',
    unknownLanguage: 'Neznámy jazyk: {language}.'
  }
};

export default translation;
