import type {Source} from '../types.ts';

//values are never converted: an operator, a condition or a function with values it doesn't take is an error
const sources: Source[] = [
  {
    group: 'values',
    sources: [
      {title: 'text times a number', code: 'output "abc" * 2', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'text minus a number', code: 'output "2" - 1', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'boolean plus a number', code: 'output true + 1', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'minus a text', code: 'output -"a"', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'number compared with a text', code: 'output 1 < "2"', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'not of a number', code: 'output not 0', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'and of numbers', code: 'output 1 and 2', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'math function of a text', code: 'output square_root("16")', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'random of a decimal number', code: 'output random(2.5)', errorId: 'typeError', errorParam: {line: 1}},
      {
        title: 'output before a type error',
        code: 'output 1\noutput "a" * 2',
        errorId: 'typeError',
        errorParam: {line: 2},
        output: '1'
      },
      {title: 'number as a condition', code: 'if 0\n    output 1', errorId: 'conditionError', errorParam: {line: 1}},
      {
        title: 'text as a loop condition',
        code: 'x = "a"\nwhile x\n    output x',
        errorId: 'conditionError',
        errorParam: {line: 2}
      },
      {title: 'division by zero', code: 'output 1 / 0', errorId: 'divisionByZero', errorParam: {line: 1}},
      {title: 'remainder by zero', code: 'x = 0\noutput 5 % x', errorId: 'divisionByZero', errorParam: {line: 2}},
      {
        title: 'square root of a negative number',
        code: 'output square_root(-1)',
        errorId: 'mathError',
        errorParam: {line: 1}
      },
      {title: 'logarithm of zero', code: 'output ln(0)', errorId: 'mathError', errorParam: {line: 1}},
      {title: 'tangent of a right angle', code: 'output tan(pi / 2)', errorId: 'mathError', errorParam: {line: 1}},
      {
        title: 'repeat a text times',
        code: 'repeat "2" times\n    output 1',
        errorId: 'typeError',
        errorParam: {line: 1}
      },
      {
        title: 'repeat a decimal number of times',
        code: 'repeat 2.5 times\n    output 1',
        errorId: 'typeError',
        errorParam: {line: 1}
      },
      {
        title: 'repeat a negative number of times',
        code: 'repeat -1 times\n    output 1',
        errorId: 'typeError',
        errorParam: {line: 1}
      }
    ]
  }
];

export default sources;
