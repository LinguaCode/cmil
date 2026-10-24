import type {Source} from '../types.ts';

const sources: Source[] = [
  {
    group: 'for',
    sources: [
      {title: 'counts up, both ends included', code: 'for i from 1 to 5\n    print(i)', output: '1\n2\n3\n4\n5'},
      {title: 'counts with a step', code: 'for i from 0 to 10 step 5\n    print(i)', output: '0\n5\n10'},
      {
        title: 'counts down with a negative step',
        code: 'for i from 10 to 1 step -3\n    print(i)',
        output: '10\n7\n4\n1'
      },
      {
        title: 'a step in a variable counts down when it is negative',
        code: 's = -1\nfor i from 3 to 1 step s\n    print(i)',
        output: '3\n2\n1'
      },
      {
        title: 'a step of minus a variable counts up when the variable is negative',
        code: 'n = -2\nfor i from 1 to 5 step -n\n    print(i)',
        output: '1\n3\n5'
      },
      {
        title: 'a decimal step in a variable counts down when it is negative',
        code: 's = -0.5\nfor x from 1 to 0 step s\n    print(x)',
        output: '1\n0.5\n0'
      },
      {
        title: 'a whole counter down to a decimal last value by a step in a variable',
        code: 's = -1\nlast = 0.5\nfor i from 3 to last step s\n    print(i)',
        output: '3\n2\n1'
      },
      {
        title: 'decimal steps add up exactly',
        code: 'for x from 0 to 1 step 0.25\n    print(x)',
        output: '0\n0.25\n0.5\n0.75\n1'
      },
      {
        title: 'continue goes on to the next step, also a decimal one',
        code: 'for x from 0 to 1 step 0.25\n    if x == 0.5\n        continue\n    print(x)\nfor i from 1 to 5 step 2\n    if i == 3\n        continue\n    print(i)',
        output: '0\n0.25\n0.75\n1\n1\n5'
      },
      {
        title: 'no pass when the end comes first',
        code: 'for i from 5 to 1\n    print(i)\nprint("done")',
        output: 'done'
      },
      {
        title: 'the bounds are read once',
        code: 'n = 3\nfor i from 1 to n\n    n = n + 1\n    print(i)',
        output: '1\n2\n3'
      },
      {
        title: 'a last value with decimals ends at the last whole number the counter reaches',
        code: 'for i from 1 to 15 / 4\n    print(i)\nfor i from 5 to 7 / 4 step -1\n    print(i)',
        output: '1\n2\n3\n5\n4\n3\n2'
      },
      {title: 'a decimal counter counts by 1', code: 'for x from 0.5 to 3\n    print(x)', output: '0.5\n1.5\n2.5'},
      {
        title: 'a last value that asks is asked once',
        code: 'for i from 1 to input()\n    print(i)',
        inputs: [3],
        output: '1\n2\n3'
      },
      {
        title: 'a step that asks is asked once',
        code: 'for i from 1 to 5 step input()\n    print(i)',
        inputs: [2],
        output: '1\n3\n5'
      },
      {
        title: 'bounds that ask are asked in their order',
        code: 'for i from input() to input()\n    print(i)',
        inputs: [2, 3],
        output: '2\n3'
      },
      {
        title: 'bounds that call functions call them once, in their order',
        code: 'function first()\n    print("first")\n    return 1\nfunction last()\n    print("last")\n    return 2\nfor i from first() to last()\n    print(i)',
        output: 'first\nlast\n1\n2'
      },
      {
        title: 'a last value of a list the loop changes is read once',
        code: 'items = [1, 2]\nfor i from 1 to length_of(items)\n    add(items, i)\nprint(length_of(items))',
        output: '4'
      },
      {
        title: 'a decimal counter reads its last value and its step once',
        code: 'n = 1\ns = 0.5\nfor x from 0 to n step s\n    n = 0\n    s = 2\n    print(x)',
        output: '0\n0.5\n1'
      },
      {
        title: 'the variable keeps its last value',
        code: 'for i from 1 to 3\n    print(i)\nprint("last " + i)',
        output: '1\n2\n3\nlast 3'
      },
      {
        title: 'break and continue',
        code: 'for i from 1 to 10\n    if i == 3\n        continue\n    if i == 5\n        break\n    print(i)',
        output: '1\n2\n4'
      },
      {
        title: 'nested',
        code: 'for i from 1 to 2\n    for j from 1 to 2\n        print(i * 10 + j)',
        output: '11\n12\n21\n22'
      },
      {
        title: 'with input',
        code: 'total = 0\nfor i from 1 to 3\n    n = input()\n    total = total + n\nprint(total)',
        inputs: [1, 2, 3],
        output: '6'
      }
    ]
  }
];

export default sources;
