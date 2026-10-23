import type {Source} from '../types.ts';

//values are never converted: an operator, a condition or a function with values it doesn't take is an error
const sources: Source[] = [
  {
    group: 'values',
    sources: [
      {title: 'text times a number', code: 'print("abc" * 2)', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'text minus a number', code: 'print("2" - 1)', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'boolean plus a number', code: 'print(true + 1)', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'minus a text', code: 'print(-"a")', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'number compared with a text', code: 'print(1 < "2")', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'not of a number', code: 'print(not 0)', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'and of numbers', code: 'print(1 and 2)', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'math function of a text', code: 'print(square_root("16"))', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'random of a decimal number', code: 'print(random(2.5))', errorId: 'typeError', errorParam: {line: 1}},
      {
        title: 'output before a type error',
        code: 'print(1)\nprint("a" * 2)',
        errorId: 'typeError',
        errorParam: {line: 2},
        output: '1'
      },
      {title: 'number as a condition', code: 'if 0\n    print(1)', errorId: 'conditionError', errorParam: {line: 1}},
      {
        title: 'text as a loop condition',
        code: 'x = "a"\nwhile x\n    print(x)',
        errorId: 'conditionError',
        errorParam: {line: 2}
      },
      {title: 'division by zero', code: 'print(1 / 0)', errorId: 'divisionByZero', errorParam: {line: 1}},
      {title: 'remainder by zero', code: 'x = 0\nprint(5 % x)', errorId: 'divisionByZero', errorParam: {line: 2}},
      {
        title: 'square root of a negative number',
        code: 'print(square_root(-1))',
        errorId: 'mathError',
        errorParam: {line: 1}
      },
      {title: 'logarithm of zero', code: 'print(ln(0))', errorId: 'mathError', errorParam: {line: 1}},
      {title: 'tangent of a right angle', code: 'print(tan(pi / 2))', errorId: 'mathError', errorParam: {line: 1}},
      {
        title: 'repeat a text times',
        code: 'repeat "2" times\n    print(1)',
        errorId: 'typeError',
        errorParam: {line: 1}
      },
      {
        title: 'repeat a decimal number of times',
        code: 'repeat 2.5 times\n    print(1)',
        errorId: 'typeError',
        errorParam: {line: 1}
      },
      {
        title: 'repeat a negative number of times',
        code: 'repeat -1 times\n    print(1)',
        errorId: 'typeError',
        errorParam: {line: 1}
      },
      {
        title: 'for to a text',
        code: 'for i from 1 to "a"\n    print(i)',
        errorId: 'typeError',
        errorParam: {line: 1}
      },
      {
        title: 'for with a step of 0',
        code: 'for i from 1 to 5 step 0\n    print(i)',
        errorId: 'typeError',
        errorParam: {line: 1}
      }
    ]
  }
];

export default sources;
