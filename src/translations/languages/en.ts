//the words of the CMIL commands in English
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['input'],
    print: ['print'],
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
    cot: ['cot'],
    arcsin: ['arcsin'],
    arccos: ['arccos'],
    arctan: ['arctan'],
    arccot: ['arccot'],
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
    equalsError: 'Line {line}: to compare, use == instead of =.',
    undefinedVariable: 'Line {line}: {variable} has no value yet.',
    typeError: "Line {line}: {operator} doesn't work with these values.",
    conditionError: 'Line {line}: a condition must be true or false.',
    divisionByZero: 'Line {line}: division by zero.',
    mathError: 'Line {line}: {operator} has no result for this value.',
    memoryLimit: 'Line {line}: a text grew too long.',
    timeout: 'The program ran too long without asking for input.',
    unknownLanguage: 'Unknown language: {language}.'
  }
};

export default translation;
