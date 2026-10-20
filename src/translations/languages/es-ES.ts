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
  }
};

export default translation;
