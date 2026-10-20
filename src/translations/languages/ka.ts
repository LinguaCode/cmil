//the words of the CMIL commands in Georgian
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['შეყვანის'],
    print: ['გამოშვება'],
    if: ['თუ'],
    else: ['სხვა'],
    then: ['მაშინ'],
    or: ['ან'],
    and: ['და'],
    not: ['არა'],
    false: ['ცრუ'],
    true: ['მართალია'],
    do: ['გააკეთე'],
    while: ['სანამ'],
    repeat: ['გაიმეორე'],
    times: ['ჯერ'],
    break: ['შეწყვიტე'],
    continue: ['გაგრძელება'],
    function: ['ფუნქცია'],
    random: ['შემთხვევითი'],
    pow: ['ხარისხი'],
    sqr: ['კვადრატი'],
    sqrt: ['კვადრატული_ფესვი'],
    round: ['დამრგვალება'],
    floor: ['დამრგვალება_ქვემოთ'],
    ceil: ['დამრგვალება_ზემოთ'],
    abs: ['მოდული'],
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
    input: 'Genitive (of input); should it be შეყვანა?',
    print: 'Means release; should it be გამოტანა?',
    else: 'Means other; should it be თორემ?',
    true: 'Means it is true; should it be ჭეშმარიტი?'
  },
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'სინტაქსური შეცდომა {line}-ე ხაზზე.',
    indentError: 'დაშორების შეცდომა {line}-ე ხაზზე: ბლოკები დააშორეთ 4 ჰარით.',
    argumentError: '{line}-ე ხაზი: მათემატიკურ ფუნქციას არასწორი არგუმენტები აქვს.',
    equalsError: '{line}-ე ხაზი: შესადარებლად დაწერეთ == და არა =.',
    undefinedVariable: '{line}-ე ხაზი: {variable}-ს ჯერ მნიშვნელობა არ აქვს.',
    typeError: '{line}-ე ხაზი: {operator} არ მუშაობს ამ მნიშვნელობებთან.',
    conditionError: '{line}-ე ხაზი: პირობა უნდა იყოს ჭეშმარიტი ან მცდარი.',
    divisionByZero: '{line}-ე ხაზი: ნულზე გაყოფა.',
    mathError: '{line}-ე ხაზი: {operator}-ს ამ მნიშვნელობისთვის შედეგი არ აქვს.',
    memoryLimit: '{line}-ე ხაზი: ტექსტი ზედმეტად გრძელი გახდა.',
    timeout: 'პროგრამა ზედმეტად დიდხანს მუშაობდა შეყვანის მოთხოვნის გარეშე.',
    unknownLanguage: 'უცნობი ენა: {language}.'
  }
};

export default translation;
