//the words of the CMIL commands in Chinese
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['输入'],
    print: ['输出'],
    if: ['如果'],
    else: ['否则'],
    then: ['那么'],
    or: ['或者'],
    and: ['并且'],
    not: ['不'],
    false: ['假'],
    true: ['真'],
    do: ['做'],
    while: ['当'],
    repeat: ['重复'],
    times: ['次'],
    break: ['跳出'],
    continue: ['继续'],
    for: ['对于'],
    from: ['从'],
    to: ['到'],
    step: ['步长'],
    function: ['函数'],
    random: ['随机的'],
    pow: ['乘方'],
    sqr: ['平方'],
    sqrt: ['平方根'],
    round: ['四舍五入'],
    floor: ['向下取整'],
    ceil: ['向上取整'],
    abs: ['绝对值'],
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
    syntaxError: '第 {line} 行有语法错误。',
    indentError: '第 {line} 行缩进错误：代码块请缩进 4 个空格。',
    argumentError: '第 {line} 行：数学函数的参数不对。',
    equalsError: '第 {line} 行：比较时请用 ==，不要用 =。',
    undefinedVariable: '第 {line} 行：{variable} 还没有值。',
    typeError: '第 {line} 行：{operator} 不能用于这些值。',
    conditionError: '第 {line} 行：条件必须为真或假。',
    divisionByZero: '第 {line} 行：除数为零。',
    mathError: '第 {line} 行：{operator} 对这个值没有结果。',
    memoryLimit: '第 {line} 行：文本太长了。',
    timeout: '程序运行太久，却没有请求输入。',
    unknownLanguage: '未知语言：{language}'
  }
};

export default translation;
