//the words of the CMIL commands in Georgian
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['შეყვანა'],
    print: ['გამოტანა'],
    if: ['თუ'],
    else: ['სხვა_შემთხვევაში'],
    then: ['მაშინ'],
    or: ['ან'],
    and: ['და'],
    not: ['არა'],
    false: ['მცდარი'],
    true: ['ჭეშმარიტი'],
    do: ['გააკეთე'],
    while: ['სანამ'],
    repeat: ['გაიმეორე'],
    times: ['ჯერ'],
    break: ['შეწყვიტე'],
    continue: ['გაგრძელება'],
    for: ['ციკლი'],
    from: ['საწყისი'],
    to: ['ბოლო'],
    step: ['ბიჯი'],
    in: ['შორის'],
    add: ['დაამატე'],
    remove: ['ამოიღე'],
    function: ['ფუნქცია'],
    return: ['დააბრუნე'],
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
    e: ['e'],
    length: ['სიგრძე'],
    upper: ['მთავრული'],
    lower: ['მხედრული'],
    number: ['რიცხვად'],
    text: ['ტექსტად'],
    split: ['გაყავი'],
    join: ['შეაერთე']
  },
  quotes: [['„', '“']],
  messages: {
    syntaxError: 'სინტაქსური შეცდომა {line}-ე ხაზზე.',
    indentError: 'დაშორების შეცდომა {line}-ე ხაზზე: ბლოკები დააშორეთ 4 ჰარით.',
    argumentError: '{line}-ე ხაზი: {function} იღებს {count} მნიშვნელობას.',
    equalsError: '{line}-ე ხაზი: შესადარებლად დაწერეთ == და არა =.',
    nameError: '{line}-ე ხაზი: {name} ბრძანებაა, ამიტომ სახელი ვერ იქნება; აირჩიეთ სხვა.',
    undefinedVariable: '{line}-ე ხაზი: {variable}-ს ჯერ მნიშვნელობა არ აქვს.',
    undefinedFunction: '{line}-ე ხაზი: ფუნქცია {function} არ არსებობს.',
    noValue: '{line}-ე ხაზი: {function} მნიშვნელობას არ აბრუნებს.',
    typeError: '{line}-ე ხაზი: {operator} არ მუშაობს ამ მნიშვნელობებთან.',
    listAsText:
      '{line}-ე ხაზი: სია ისე, როგორც არის, არ იბეჭდება; შეაერთეთ მისი ელემენტები ტექსტად {join}-ით, ან დაბეჭდეთ ისინი სათითაოდ.',
    conditionError: '{line}-ე ხაზი: პირობა უნდა იყოს ჭეშმარიტი ან მცდარი.',
    divisionByZero: '{line}-ე ხაზი: ნულზე გაყოფა.',
    mathError: '{line}-ე ხაზი: {operator}-ს ამ მნიშვნელობისთვის შედეგი არ აქვს.',
    indexError: '{line}-ე ხაზი: {index} ნომრის ელემენტი არ არსებობს.',
    itemError: '{line}-ე ხაზი: სიაში არ არის ელემენტი {item}.',
    memoryLimit: '{line}-ე ხაზი: ტექსტი ან სია ზედმეტად გრძელი გახდა.',
    recursionLimit: '{line}-ე ხაზი: ფუნქციების ჩადგმული გამოძახებები ზედმეტად ბევრია.',
    timeout: 'პროგრამა ზედმეტად დიდხანს მუშაობდა შეყვანის მოთხოვნის გარეშე.',
    unknownLanguage: 'უცნობი ენა: {language}.'
  },
  conversion: {
    mixedTypes:
      '{line}-ე ხაზი: {target} ამ პროგრამას ვერ დაწერს: {name} ორი სახის მნიშვნელობას იღებს, მაგალითად, რიცხვს და ტექსტს.',
    mixedItems:
      '{line}-ე ხაზი: {target} ამ პროგრამას ვერ დაწერს: სიაში ორი სახის ელემენტია, მაგალითად, რიცხვები და ტექსტები.',
    fixedArrays:
      '{line}-ე ხაზი: {target} ამ პროგრამას პირველი კურსის ფიქსირებული მასივებით ვერ დაწერს, მაგალითად, სიების სიას ან ფუნქციას, რომელიც სიას აბრუნებს.'
  }
};

export default translation;
