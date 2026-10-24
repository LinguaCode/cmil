//the words of the CMIL commands in Catalan
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['entrada'],
    print: ['sortida'],
    if: ['si'],
    else: ['sinó'],
    then: ['llavors'],
    or: ['o'],
    and: ['i'],
    not: ['no'],
    false: ['fals'],
    true: ['cert'],
    do: ['fer'],
    while: ['mentre'],
    repeat: ['repetir'],
    times: ['vegades'],
    break: ['interrompre'],
    continue: ['continuar'],
    for: ['per'],
    from: ['de'],
    to: ['a'],
    step: ['pas'],
    in: ['en'],
    add: ['afegir'],
    remove: ['treure'],
    function: ['funció'],
    return: ['retorna'],
    random: ['aleatori'],
    pow: ['potència'],
    sqr: ['quadrat'],
    sqrt: ['arrel_quadrada'],
    round: ['arrodonir'],
    floor: ['arrodonir_avall'],
    ceil: ['arrodonir_amunt'],
    abs: ['valor_absolut'],
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
    length: ['longitud_de'],
    upper: ['majúscules'],
    lower: ['minúscules'],
    number: ['a_nombre'],
    text: ['a_text'],
    split: ['dividir'],
    join: ['unir']
  },
  quotes: [['«', '»']],
  messages: {
    syntaxError: 'Error de sintaxi a la línia {line}.',
    indentError: 'Error de sagnat a la línia {line}: sagna els blocs amb 4 espais.',
    argumentError: {
      one: 'Línia {line}: {function} rep {count} valor.',
      other: 'Línia {line}: {function} rep {count} valors.'
    },
    equalsError: 'Línia {line}: per comparar, escriu == en lloc de =.',
    nameError: "Línia {line}: {name} és una ordre, així que no pot ser un nom; tria'n un altre.",
    undefinedVariable: 'Línia {line}: {variable} encara no té valor.',
    undefinedFunction: 'Línia {line}: no existeix la funció {function}.',
    noValue: 'Línia {line}: {function} no retorna cap valor.',
    typeError: 'Línia {line}: {operator} no funciona amb aquests valors.',
    listAsText:
      "Línia {line}: una llista no s'escriu tal com és; uneix-ne els elements en un text amb {join}, o escriu-los un per un.",
    conditionError: 'Línia {line}: una condició ha de ser certa o falsa.',
    divisionByZero: 'Línia {line}: divisió per zero.',
    mathError: 'Línia {line}: {operator} no té resultat per a aquest valor.',
    indexError: 'Línia {line}: no hi ha cap element {index}.',
    itemError: "Línia {line}: la llista no té l'element {item}.",
    memoryLimit: 'Línia {line}: un text o una llista ha esdevingut massa llarg.',
    recursionLimit: 'Línia {line}: massa crides de funcions imbricades.',
    timeout: "El programa s'ha executat massa temps sense demanar cap entrada.",
    unknownLanguage: 'Llengua desconeguda: {language}.'
  },
  conversion: {
    mixedTypes:
      'Línia {line}: {target} no pot escriure aquest programa: {name} rep valors de dos tipus, com un nombre i un text.',
    mixedItems:
      'Línia {line}: {target} no pot escriure aquest programa: una llista té elements de dos tipus, com nombres i textos.',
    fixedArrays:
      'Línia {line}: {target} no pot escriure aquest programa amb les taules fixes d’un primer curs, com una llista de llistes o una funció que dona una llista.'
  }
};

export default translation;
