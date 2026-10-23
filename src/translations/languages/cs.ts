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
    in: ['mezi'],
    add: ['přidej'],
    remove: ['odeber'],
    function: ['funkce'],
    return: ['vrať'],
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
    e: ['e'],
    length: ['délka'],
    upper: ['velká_písmena'],
    lower: ['malá_písmena'],
    number: ['na_číslo'],
    text: ['na_text'],
    split: ['rozděl'],
    join: ['spoj']
  },
  quotes: [['„', '“']],
  messages: {
    syntaxError: 'Syntaktická chyba na řádku {line}.',
    indentError: 'Chyba odsazení na řádku {line}: odsazujte bloky o 4 mezery.',
    argumentError: {
      one: 'Řádek {line}: {function} bere {count} hodnotu.',
      few: 'Řádek {line}: {function} bere {count} hodnoty.',
      many: 'Řádek {line}: {function} bere {count} hodnoty.',
      other: 'Řádek {line}: {function} bere {count} hodnot.'
    },
    equalsError: 'Řádek {line}: pro porovnání pište == místo =.',
    nameError: 'Řádek {line}: {name} je příkaz, takže nemůže být názvem; zvolte jiný.',
    undefinedVariable: 'Řádek {line}: {variable} zatím nemá hodnotu.',
    undefinedFunction: 'Řádek {line}: funkce {function} neexistuje.',
    noValue: 'Řádek {line}: {function} nevrací žádnou hodnotu.',
    typeError: 'Řádek {line}: {operator} s těmito hodnotami nefunguje.',
    conditionError: 'Řádek {line}: podmínka musí být pravdivá, nebo nepravdivá.',
    divisionByZero: 'Řádek {line}: dělení nulou.',
    mathError: 'Řádek {line}: {operator} pro tuto hodnotu nemá výsledek.',
    indexError: 'Řádek {line}: prvek {index} neexistuje.',
    itemError: 'Řádek {line}: seznam nemá prvek {item}.',
    memoryLimit: 'Řádek {line}: text nebo seznam je příliš dlouhý.',
    recursionLimit: 'Řádek {line}: příliš mnoho vnořených volání funkcí.',
    timeout: 'Program běžel příliš dlouho, aniž by požádal o vstup.',
    unknownLanguage: 'Neznámý jazyk: {language}.'
  },
  conversion: {
    mixedTypes:
      'Řádek {line}: {target} tento program napsat nedokáže: {name} dostává hodnoty dvou druhů, třeba číslo a text.',
    mixedItems:
      'Řádek {line}: {target} tento program napsat nedokáže: seznam má položky dvou druhů, třeba čísla a texty.'
  }
};

export default translation;
