//the words of the CMIL commands in English
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['input'],
    output: ['output'],
    if: ['if'],
    else: ['else'],
    then: ['then'],
    or: ['or'],
    and: ['and'],
    not: ['not'],
    false: ['false'],
    true: ['true'],
    do: ['do'],
    while: ['while'],
    repeat: ['repeat'],
    times: ['times'],
    break: ['break'],
    continue: ['continue'],
    function: ['function'],
    random: ['random'],
    pow: ['power'],
    sqr: ['square'],
    sqrt: ['square_root'],
    round: ['round'],
    floor: ['floor'],
    ceil: ['ceil'],
    abs: ['absolute_value'],
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
  messages: {
    syntaxError: 'Syntax error on line {line}.',
    indentError: 'Indentation error on line {line}: indent blocks by 4 spaces.',
    argumentError: 'Line {line}: a math function has the wrong arguments.',
    undefinedVariable: 'Line {line}: {variable} has no value yet.',
    memoryLimit: 'Line {line}: a text grew too long.',
    timeout: 'The program ran too long without asking for input.',
    unknownLanguage: 'Unknown language: {language}.'
  }
};

export default translation;
