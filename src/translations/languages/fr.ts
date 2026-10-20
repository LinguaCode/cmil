//the words of the CMIL commands in French
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['entrée'],
    output: ['sortie'],
    if: ['si'],
    else: ['sinon'],
    then: ['alors'],
    or: ['ou'],
    and: ['et'],
    not: ['non'],
    false: ['faux'],
    true: ['vrai'],
    do: ['faire'],
    while: ['tant_que'],
    repeat: ['répéter'],
    times: ['fois'],
    break: ['arrêter'],
    continue: ['continuer'],
    function: ['fonction'],
    random: ['aléatoire'],
    pow: ['puissance'],
    sqr: ['carré'],
    sqrt: ['racine_carrée'],
    round: ['arrondir'],
    floor: ['plancher'],
    ceil: ['plafond'],
    abs: ['valeur_absolue'],
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
    syntaxError: 'Erreur de syntaxe à la ligne {line}.',
    indentError: "Erreur d'indentation à la ligne {line} : indentez les blocs de 4 espaces.",
    argumentError: 'Ligne {line} : une fonction mathématique a de mauvais arguments.',
    undefinedVariable: 'Ligne {line} : {variable} n’a pas encore de valeur.',
    typeError: 'Ligne {line} : {operator} ne fonctionne pas avec ces valeurs.',
    conditionError: 'Ligne {line} : une condition doit être vraie ou fausse.',
    divisionByZero: 'Ligne {line} : division par zéro.',
    mathError: 'Ligne {line} : {operator} n’a pas de résultat pour cette valeur.',
    memoryLimit: 'Ligne {line} : un texte est devenu trop long.',
    timeout: 'Le programme a tourné trop longtemps sans demander d’entrée.',
    unknownLanguage: 'Langue inconnue : {language}.'
  }
};

export default translation;
