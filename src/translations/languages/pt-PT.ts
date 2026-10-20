//the words of the CMIL commands in Portuguese
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['entrada'],
    output: ['saída'],
    if: ['se'],
    else: ['senão'],
    then: ['então'],
    or: ['ou'],
    and: ['e'],
    not: ['não'],
    false: ['falso'],
    true: ['verdadeiro'],
    do: ['fazer'],
    while: ['enquanto'],
    repeat: ['repita'],
    times: ['vezes'],
    break: ['interromper'],
    continue: ['continuar'],
    function: ['função'],
    random: ['aleatória'],
    pow: ['potência'],
    sqr: ['quadrado'],
    sqrt: ['raiz_quadrada'],
    round: ['arredondar'],
    floor: ['chão'],
    ceil: ['teto'],
    abs: ['valor_absoluto'],
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
    e: ['euler']
  },
  notes: {
    random: 'Feminine; should it be aleatório?',
    floor: 'Brazil uses piso; which word is used in Portugal?'
  },
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'Erro de sintaxe na linha {line}.',
    indentError: 'Erro de indentação na linha {line}: indente os blocos com 4 espaços.',
    argumentError: 'Linha {line}: uma função matemática tem argumentos errados.',
    undefinedVariable: 'Linha {line}: {variable} ainda não tem valor.',
    typeError: 'Linha {line}: {operator} não funciona com estes valores.',
    conditionError: 'Linha {line}: uma condição tem de ser verdadeira ou falsa.',
    divisionByZero: 'Linha {line}: divisão por zero.',
    mathError: 'Linha {line}: {operator} não tem resultado para este valor.',
    memoryLimit: 'Linha {line}: um texto ficou demasiado longo.',
    timeout: 'O programa correu demasiado tempo sem pedir entrada.',
    unknownLanguage: 'Língua desconhecida: {language}.'
  }
};

export default translation;
