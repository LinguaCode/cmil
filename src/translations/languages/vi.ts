//the words of the CMIL commands in Vietnamese
import type {Translation} from '../types.ts';

const translation: Translation = {
  words: {
    input: ['đầu_vào'],
    output: ['ra'],
    if: ['nếu'],
    else: ['ngược_lại'],
    then: ['thì'],
    or: ['hay'],
    and: ['và'],
    not: ['không'],
    false: ['sai'],
    true: ['đúng'],
    do: ['làm'],
    while: ['trong_khi'],
    repeat: ['lặp_lại'],
    times: ['lần'],
    break: ['dừng'],
    continue: ['tiếp_tục'],
    function: ['hàm'],
    random: ['ngẫu_nhiên'],
    pow: ['lũy_thừa'],
    sqr: ['bình_phương'],
    sqrt: ['căn_bậc_hai'],
    round: ['làm_tròn'],
    floor: ['làm_tròn_xuống'],
    ceil: ['làm_tròn_lên'],
    abs: ['mô_đun'],
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
  //translated without a native speaker: the messages need a native review
  messages: {
    syntaxError: 'Lỗi cú pháp ở dòng {line}.',
    indentError: 'Lỗi thụt lề ở dòng {line}: hãy thụt lề các khối 4 dấu cách.',
    argumentError: 'Dòng {line}: một hàm toán học có đối số sai.',
    undefinedVariable: 'Dòng {line}: {variable} chưa có giá trị.',
    memoryLimit: 'Dòng {line}: một văn bản đã quá dài.',
    timeout: 'Chương trình chạy quá lâu mà không yêu cầu dữ liệu vào.',
    unknownLanguage: 'Ngôn ngữ không xác định: {language}.'
  }
};

export default translation;
