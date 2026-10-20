//the words of the CMIL commands in Armenian
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['մուտքագրել'],
    output: ['տպել'],
    if: ['եթե'],
    else: ['այլապես'],
    then: ['ապա'],
    or: ['կամ'],
    and: ['և', 'եւ', 'ու'],
    not: ['ոչ'],
    false: ['սխալ'],
    true: ['ճիշտ'],
    do: ['անել'],
    while: ['մինչ'],
    repeat: ['կրկնել'],
    times: ['անգամ'],
    break: ['դադարեցնել'],
    continue: ['շարունակել'],
    function: ['ֆունկցիա'],
    random: ['պատահականություն'],
    pow: ['աստիճան'],
    sqr: ['քառակուսի'],
    sqrt: ['արմատ'],
    round: ['կլորացնել'],
    floor: ['ամբողջացնել_ներքև', 'ամբողջացնել_ներքեւ'],
    ceil: ['ամբողջացնել_վերև', 'ամբողջացնել_վերեւ'],
    abs: ['մոդուլ'],
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
    syntaxError: 'Շարահյուսական սխալ {line}-րդ տողում։',
    indentError: 'Նահանջի սխալ {line}-րդ տողում․ բլոկները նահանջեք 4 բացատով։',
    argumentError: '{line}-րդ տող․ մաթեմատիկական ֆունկցիայի արգումենտները սխալ են։',
    undefinedVariable: '{line}-րդ տող․ {variable}-ը դեռ արժեք չունի։',
    typeError: '{line}-րդ տող․ {operator}-ը չի աշխատում այս արժեքների հետ։',
    conditionError: '{line}-րդ տող․ պայմանը պետք է լինի ճիշտ կամ սխալ։',
    divisionByZero: '{line}-րդ տող․ զրոյի վրա բաժանում։',
    mathError: '{line}-րդ տող․ {operator}-ը այս արժեքի համար արդյունք չունի։',
    memoryLimit: '{line}-րդ տող․ տեքստը չափազանց երկար դարձավ։',
    timeout: 'Ծրագիրը չափազանց երկար աշխատեց՝ առանց մուտքագրում խնդրելու։',
    unknownLanguage: 'Անհայտ լեզու՝ {language}։'
  }
};

export default translation;
