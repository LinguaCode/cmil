import type {Source} from '../types.ts';

const sources: Source[] = [
  {
    group: 'functions',
    sources: [
      {title: 'an unknown function', code: 'print(double(2))', errorId: 'undefinedFunction', errorParam: {line: 1}},
      {
        title: 'too few arguments',
        code: 'function f(a, b)\n    return a\nprint(f(1))',
        errorId: 'argumentError',
        errorParam: {line: 3}
      },
      {
        title: 'too many arguments',
        code: 'function f(a)\n    return a\nprint(f(1, 2))',
        errorId: 'argumentError',
        errorParam: {line: 3}
      },
      {
        title: 'the value of print, found before the program runs',
        code: 'print(1)\nx = print(2)',
        errorId: 'noValue',
        errorParam: {line: 2},
        output: ''
      },
      {
        title: 'print of print',
        code: 'print(print(1))',
        errorId: 'noValue',
        errorParam: {line: 1}
      },
      {
        title: 'the value of add',
        code: 'a = []\nif add(a, 1) == 1\n    print(a)',
        errorId: 'noValue',
        errorParam: {line: 2}
      },
      {
        title: 'the value of a function without one',
        code: 'function f()\n    print(1)\nx = f()',
        errorId: 'noValue',
        errorParam: {line: 3},
        output: '1'
      },
      {
        title: 'a variable of the program inside a function',
        code: 'x = 1\nfunction f()\n    return x\nprint(f())',
        errorId: 'undefinedVariable',
        errorParam: {line: 3, variable: 'x'}
      },
      {
        title: 'a variable of a function after its call',
        code: 'function f()\n    y = 2\nf()\nprint(y)',
        errorId: 'undefinedVariable',
        errorParam: {line: 4, variable: 'y'}
      },
      {
        title: 'a function that calls itself without end',
        code: 'function f(n)\n    return f(n + 1)\nprint(f(1))',
        errorId: 'recursionLimit',
        errorParam: {line: 2}
      },
      {
        title: 'an error in a function is on its line',
        code: 'function f(x)\n    return 1 / x\nprint(f(0))',
        errorId: 'divisionByZero',
        errorParam: {line: 2}
      },
      {title: 'return outside a function', code: 'return 1', errorId: 'syntaxError', errorParam: {line: 1}},
      {
        title: 'a function inside a block',
        code: 'if true\n    function f()\n        return 1',
        errorId: 'syntaxError',
        errorParam: {line: 2}
      },
      {
        title: 'a function defined twice',
        code: 'function f()\n    return 1\nfunction f()\n    return 2',
        errorId: 'syntaxError',
        errorParam: {line: 3}
      },
      {
        title: 'a parameter twice',
        code: 'function f(a, a)\n    return a',
        errorId: 'syntaxError',
        errorParam: {line: 1}
      },
      {
        title: 'a function without parentheses',
        code: 'function f\n    return 1',
        errorId: 'syntaxError',
        errorParam: {line: 1}
      },
      {
        title: 'break in a function outside a loop',
        code: 'function f()\n    break',
        errorId: 'syntaxError',
        errorParam: {line: 2}
      },
      {
        title: 'a call with an operator as a statement',
        code: 'function f()\n    return 1\nf() + 1',
        errorId: 'syntaxError',
        errorParam: {line: 3}
      }
    ]
  }
];

export default sources;
