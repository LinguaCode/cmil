//the words of the CMIL commands in Czech
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['vstup'],
    print: ['výstup'],
    if: ['když'],
    else: ['jinak'],
    then: ['pak'],
    or: ['nebo'],
    and: ['a'],
    not: ['ne'],
    false: ['nepravda'],
    true: ['pravda'],
    do: ['dělat'],
    while: ['dokud'],
    repeat: ['opakovat'],
    times: ['krát'],
    break: ['přerušení'],
    continue: ['pokračovat'],
    for: ['pro'],
    from: ['od'],
    to: ['do'],
    step: ['krok'],
    function: ['funkce'],
    random: ['náhodné'],
    pow: ['mocnina'],
    sqr: ['druhá_mocnina'],
    sqrt: ['odmocnina'],
    round: ['zaokrouhlit'],
    floor: ['zaokrouhlit_dolů'],
    ceil: ['zaokrouhlit_nahoru'],
    abs: ['absolutní_hodnota'],
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
    syntaxError: 'Syntaktická chyba na řádku {line}.',
    indentError: 'Chyba odsazení na řádku {line}: odsazujte bloky o 4 mezery.',
    argumentError: 'Řádek {line}: matematická funkce má špatné argumenty.',
    equalsError: 'Řádek {line}: pro porovnání pište == místo =.',
    undefinedVariable: 'Řádek {line}: {variable} zatím nemá hodnotu.',
    typeError: 'Řádek {line}: {operator} s těmito hodnotami nefunguje.',
    conditionError: 'Řádek {line}: podmínka musí být pravdivá, nebo nepravdivá.',
    divisionByZero: 'Řádek {line}: dělení nulou.',
    mathError: 'Řádek {line}: {operator} pro tuto hodnotu nemá výsledek.',
    memoryLimit: 'Řádek {line}: text je příliš dlouhý.',
    timeout: 'Program běžel příliš dlouho, aniž by požádal o vstup.',
    unknownLanguage: 'Neznámý jazyk: {language}.'
  }
};

export default translation;
