//the words of the CMIL commands in Japanese
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['入力'],
    output: ['出力'],
    if: ['もし'],
    else: ['そうでなければ'],
    then: ['ならば'],
    or: ['または'],
    and: ['かつ'],
    not: ['でない'],
    false: ['偽'],
    true: ['真'],
    do: ['する'],
    while: ['しばらくの間'],
    repeat: ['繰り返す'],
    times: ['回'],
    break: ['中断'],
    continue: ['続ける'],
    function: ['関数'],
    random: ['乱数'],
    pow: ['べき乗'],
    sqr: ['二乗'],
    sqrt: ['平方根'],
    round: ['四捨五入'],
    floor: ['切り捨て'],
    ceil: ['切り上げ'],
    abs: ['絶対値'],
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
    while: 'Means for a while; which word fits before the condition? DNCL puts the condition first: 〈condition〉の間.'
  }
};

export default translation;
