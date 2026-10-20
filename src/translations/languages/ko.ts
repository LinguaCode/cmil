//the words of the CMIL commands in Korean
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['입력'],
    print: ['출력'],
    if: ['만약'],
    else: ['아니면'],
    then: ['그러면'],
    or: ['또는'],
    and: ['그리고'],
    not: ['지'],
    false: ['거짓'],
    true: ['참'],
    do: ['실행'],
    while: ['동안'],
    repeat: ['반복'],
    times: ['번'],
    break: ['중단'],
    continue: ['계속'],
    function: ['함수'],
    random: ['난수'],
    pow: ['거듭제곱'],
    sqr: ['제곱'],
    sqrt: ['제곱근'],
    round: ['반올림'],
    floor: ['내림'],
    ceil: ['올림'],
    abs: ['절댓값'],
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
    not: 'A fragment of -지 않다; which word should logical not be?'
  },
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: '{line}번째 줄에 문법 오류가 있습니다.',
    indentError: '{line}번째 줄 들여쓰기 오류: 블록은 4칸씩 들여 쓰세요.',
    argumentError: '{line}번째 줄: 수학 함수의 인수가 잘못되었습니다.',
    equalsError: '{line}번째 줄: 비교하려면 = 대신 ==를 쓰세요.',
    undefinedVariable: '{line}번째 줄: {variable}에 아직 값이 없습니다.',
    typeError: '{line}번째 줄: {operator}은(는) 이 값들과 함께 쓸 수 없습니다.',
    conditionError: '{line}번째 줄: 조건은 참이나 거짓이어야 합니다.',
    divisionByZero: '{line}번째 줄: 0으로 나눌 수 없습니다.',
    mathError: '{line}번째 줄: 이 값에서는 {operator}의 결과가 없습니다.',
    memoryLimit: '{line}번째 줄: 텍스트가 너무 길어졌습니다.',
    timeout: '프로그램이 입력을 요청하지 않고 너무 오래 실행되었습니다.',
    unknownLanguage: '알 수 없는 언어: {language}'
  }
};

export default translation;
