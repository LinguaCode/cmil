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
        title: 'decimal steps add up exactly',
        code: 'for x from 0 to 1 step 0.25\n    print(x)',
        output: '0\n0.25\n0.5\n0.75\n1'
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
