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
    function: ['funció'],
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
    syntaxError: 'Error de sintaxi a la línia {line}.',
    indentError: 'Error de sagnat a la línia {line}: sagna els blocs amb 4 espais.',
    argumentError: 'Línia {line}: una funció matemàtica té arguments incorrectes.',
    equalsError: 'Línia {line}: per comparar, escriu == en lloc de =.',
    undefinedVariable: 'Línia {line}: {variable} encara no té valor.',
    typeError: 'Línia {line}: {operator} no funciona amb aquests valors.',
    conditionError: 'Línia {line}: una condició ha de ser certa o falsa.',
    divisionByZero: 'Línia {line}: divisió per zero.',
    mathError: 'Línia {line}: {operator} no té resultat per a aquest valor.',
    memoryLimit: 'Línia {line}: un text ha esdevingut massa llarg.',
    timeout: "El programa s'ha executat massa temps sense demanar cap entrada.",
    unknownLanguage: 'Llengua desconeguda: {language}.'
  }
};

export default translation;
