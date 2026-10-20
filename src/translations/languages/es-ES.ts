//the words of the CMIL commands in Spanish
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['introducir'],
    output: ['salida'],
    if: ['si'],
    else: ['sino'],
    then: ['entonces'],
    or: ['o'],
    and: ['y'],
    not: ['no'],
    false: ['falso'],
    true: ['verdadero'],
    do: ['hacer'],
    while: ['mientras'],
    repeat: ['repetir'],
    times: ['veces'],
    break: ['abortar'],
    continue: ['continuar'],
    function: ['función'],
    random: ['aleatorio'],
    pow: ['potencia'],
    sqr: ['cuadrado'],
    sqrt: ['raíz_cuadrada'],
    round: ['redondear'],
    floor: ['suelo'],
    ceil: ['techo'],
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
    e: ['e']
  },
  notes: {
    break: 'Harsh for children; would interrumpir or salir be better?'
  },
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'Error de sintaxis en la línea {line}.',
    indentError: 'Error de sangría en la línea {line}: sangra los bloques con 4 espacios.',
    argumentError: 'Línea {line}: una función matemática tiene argumentos incorrectos.',
    undefinedVariable: 'Línea {line}: {variable} todavía no tiene valor.',
    typeError: 'Línea {line}: {operator} no funciona con estos valores.',
    conditionError: 'Línea {line}: una condición debe ser verdadera o falsa.',
    divisionByZero: 'Línea {line}: división entre cero.',
    mathError: 'Línea {line}: {operator} no tiene resultado para este valor.',
    memoryLimit: 'Línea {line}: un texto se hizo demasiado largo.',
    timeout: 'El programa se ejecutó demasiado tiempo sin pedir una entrada.',
    unknownLanguage: 'Idioma desconocido: {language}.'
  }
};

export default translation;
