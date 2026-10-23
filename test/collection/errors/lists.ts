import type {Source} from '../types.ts';

//an index outside a list is an indexError; lists and texts with operators or functions they don't take are typeErrors
const sources: Source[] = [
  {
    group: 'lists',
    sources: [
      {title: 'an index after the end', code: 'a = [1, 2]\nprint(a[3])', errorId: 'indexError', errorParam: {line: 2}},
      {title: 'the index 0', code: 'print([1][0])', errorId: 'indexError', errorParam: {line: 1}},
      {title: 'a negative index', code: 'print([1][-1])', errorId: 'indexError', errorParam: {line: 1}},
      {title: 'a decimal index', code: 'print([1, 2][1.5])', errorId: 'indexError', errorParam: {line: 1}},
      {title: 'an index after the end of a text', code: 'print("ab"[3])', errorId: 'indexError', errorParam: {line: 1}},
      {title: 'an index of a number', code: 'x = 5\nprint(x[1])', errorId: 'typeError', errorParam: {line: 2}},
      {title: 'a text as an index', code: 'print([1]["1"])', errorId: 'typeError', errorParam: {line: 1}},
      {
        title: 'an item after the end replaced',
        code: 'a = [1]\na[2] = 5',
        errorId: 'indexError',
        errorParam: {line: 2}
      },
      {title: 'a letter replaced', code: 't = "abc"\nt[1] = "x"', errorId: 'typeError', errorParam: {line: 2}},
      {title: 'add into a text', code: 't = "abc"\nadd(t, "d")', errorId: 'typeError', errorParam: {line: 2}},
      {title: 'add with one value', code: 'a = []\nadd(a)', errorId: 'argumentError', errorParam: {line: 2}},
      {
        title: 'add without its parentheses',
        code: 'a = []\nadd 1 into a',
        errorId: 'argumentError',
        errorParam: {line: 2}
      },
      {title: 'add with the value first', code: 'a = []\nadd(1, a)', errorId: 'typeError', errorParam: {line: 2}},
      {
        title: 'remove an item not in the list',
        code: 'a = [1]\nremove(a, 2)',
        errorId: 'itemError',
        errorParam: {line: 2},
        output: ''
      },
      {title: 'remove out of a text', code: 'remove("abc", "a")', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'remove with one value', code: 'a = [1]\nremove(a)', errorId: 'argumentError', errorParam: {line: 2}},
      {title: 'in a number', code: 'print(1 in 5)', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'a number in a text', code: 'print(1 in "123")', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'for in a number', code: 'for x in 5\n    print(x)', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'a list plus a list', code: 'print([1] + [2])', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'lists compared with <', code: 'print([1] < [2])', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'a list as a condition', code: 'if []\n    print(1)', errorId: 'conditionError', errorParam: {line: 1}},
      {title: 'a list without its ]', code: 'print([1, 2)', errorId: 'syntaxError', errorParam: {line: 1}},
      {title: 'a list without an item', code: 'print([1, , 2])', errorId: 'syntaxError', errorParam: {line: 1}},
      {
        title: 'a list printed too long',
        code: 't = "a"\nrepeat 19 times\n    t = t + t\nprint([t, t])',
        errorId: 'memoryLimit',
        errorParam: {line: 4}
      }
    ]
  },
  {
    group: 'texts',
    sources: [
      {title: 'the length of a number', code: 'print(length_of(5))', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'uppercase of a number', code: 'print(uppercase(5))', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'a word into a number', code: 'print(to_number("five"))', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'a boolean into a number', code: 'print(to_number(true))', errorId: 'typeError', errorParam: {line: 1}},
      {
        title: 'a text function without its argument',
        code: 'print(to_text())',
        errorId: 'argumentError',
        errorParam: {line: 1}
      },
      {title: 'split of a number', code: 'print(split(5))', errorId: 'typeError', errorParam: {line: 1}},
      {title: 'join of a text', code: 'print(join("abc"))', errorId: 'typeError', errorParam: {line: 1}},
      {
        title: 'split with three values',
        code: 'print(split("a", "b", "c"))',
        errorId: 'argumentError',
        errorParam: {line: 1}
      }
    ]
  }
];

export default sources;
