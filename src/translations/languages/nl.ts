//the words of the CMIL commands in Dutch
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['invoer'],
    print: ['uitvoer'],
    if: ['als'],
    else: ['anders'],
    then: ['dan'],
    or: ['of'],
    and: ['en'],
    not: ['niet'],
    false: ['onwaar'],
    true: ['waar'],
    do: ['doen'],
    while: ['zolang'],
    repeat: ['herhaal'],
    times: ['keer'],
    break: ['onderbreek'],
    continue: ['doorgaan'],
    for: ['voor'],
    from: ['van'],
    to: ['tot'],
    step: ['stap'],
    function: ['functie'],
    random: ['willekeurig'],
    pow: ['macht'],
    sqr: ['kwadraat'],
    sqrt: ['vierkantswortel'],
    round: ['afronden'],
    floor: ['afronden_beneden'],
    ceil: ['afronden_boven'],
    abs: ['absolute_waarde'],
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
    syntaxError: 'Syntaxfout op regel {line}.',
    indentError: 'Inspringfout op regel {line}: spring blokken 4 spaties in.',
    argumentError: 'Regel {line}: een rekenfunctie heeft verkeerde argumenten.',
    equalsError: 'Regel {line}: schrijf == in plaats van = om te vergelijken.',
    undefinedVariable: 'Regel {line}: {variable} heeft nog geen waarde.',
    typeError: 'Regel {line}: {operator} werkt niet met deze waarden.',
    conditionError: 'Regel {line}: een voorwaarde moet waar of onwaar zijn.',
    divisionByZero: 'Regel {line}: delen door nul.',
    mathError: 'Regel {line}: {operator} heeft geen uitkomst voor deze waarde.',
    memoryLimit: 'Regel {line}: een tekst werd te lang.',
    timeout: 'Het programma liep te lang zonder om invoer te vragen.',
    unknownLanguage: 'Onbekende taal: {language}.'
  }
};

export default translation;
