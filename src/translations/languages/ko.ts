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
    not: ['아님'],
    false: ['거짓'],
    true: ['참'],
    do: ['실행'],
    while: ['동안'],
    repeat: ['반복'],
    times: ['번'],
    break: ['중단'],
    continue: ['계속'],
    for: ['각각'],
    from: ['부터'],
    to: ['까지'],
    step: ['간격'],
    in: ['안의'],
    add: ['추가'],
    remove: ['삭제'],
    function: ['함수'],
    return: ['반환'],
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
    e: ['e'],
    length: ['길이'],
    upper: ['대문자'],
    lower: ['소문자'],
    number: ['숫자로'],
    text: ['문자열로'],
    split: ['나누기'],
    join: ['합치기']
  },
  quotes: [['“', '”']],
  messages: {
    syntaxError: '{line}번째 줄에 문법 오류가 있습니다.',
    indentError: '{line}번째 줄 들여쓰기 오류: 블록은 4칸씩 들여 쓰세요.',
    argumentError: '{line}번째 줄: {function}은(는) 값을 {count}개 받습니다.',
    equalsError: '{line}번째 줄: 비교하려면 = 대신 ==를 쓰세요.',
    nameError: '{line}번째 줄: {name}은(는) 명령이라서 이름으로 쓸 수 없습니다. 다른 이름을 고르세요.',
    undefinedVariable: '{line}번째 줄: {variable}에 아직 값이 없습니다.',
    undefinedFunction: '{line}번째 줄: {function} 함수가 없습니다.',
    noValue: '{line}번째 줄: {function}은(는) 값을 반환하지 않습니다.',
    typeError: '{line}번째 줄: {operator}은(는) 이 값들과 함께 쓸 수 없습니다.',
    listAsText:
      '{line}번째 줄: 목록은 그대로 출력할 수 없습니다. {join}(으)로 항목들을 텍스트로 이어 붙이거나 하나씩 출력하세요.',
    conditionError: '{line}번째 줄: 조건은 참이나 거짓이어야 합니다.',
    divisionByZero: '{line}번째 줄: 0으로 나눌 수 없습니다.',
    mathError: '{line}번째 줄: 이 값에서는 {operator}의 결과가 없습니다.',
    indexError: '{line}번째 줄: {index}번째 항목이 없습니다.',
    itemError: '{line}번째 줄: 목록에 {item} 항목이 없습니다.',
    memoryLimit: '{line}번째 줄: 텍스트나 목록이 너무 길어졌습니다.',
    recursionLimit: '{line}번째 줄: 함수 호출이 너무 깊게 중첩되었습니다.',
    timeout: '프로그램이 입력을 요청하지 않고 너무 오래 실행되었습니다.',
    unknownLanguage: '알 수 없는 언어: {language}'
  },
  warnings: {
    numberText:
      '{text}은(는) 글자예요. {number} 같은 답은 숫자라서 글자와 절대 같지 않아요. 따옴표 없이 쓰세요: {number}'
  },
  conversion: {
    mixedTypes:
      '{line}번째 줄: {target}(으)로는 이 프로그램을 쓸 수 없습니다. {name}에 숫자와 글자처럼 두 종류의 값이 들어갑니다.',
    mixedItems:
      '{line}번째 줄: {target}(으)로는 이 프로그램을 쓸 수 없습니다. 목록에 숫자와 글자처럼 두 종류의 항목이 있습니다.',
    fixedArrays:
      '{line}번째 줄: {target}(으)로는 입문 과정의 고정 배열로 이 프로그램을 쓸 수 없습니다. 목록의 목록이나 목록을 돌려주는 함수 같은 것입니다.'
  }
};

export default translation;
