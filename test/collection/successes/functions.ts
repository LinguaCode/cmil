import type {Source} from '../types.ts';

const sources: Source[] = [
  {
    group: 'functions',
    sources: [
      {
        title: 'a function returns a value',
        code: 'function square_of(x)\n    return x * x\nprint square_of(5) + 1',
        output: '26'
      },
      {
        title: 'a function can be called before its definition',
        code: 'print twice(3)\nfunction twice(x)\n    return x * 2',
        output: '6'
      },
      {
        title: 'a call as a statement',
        code: 'function greet(name)\n    print "Hello, " + name\ngreet("Ani")\ngreet("Aram")',
        output: 'Hello, Ani\nHello, Aram'
      },
      {title: 'without parameters', code: 'function hello()\n    return "hi"\nprint hello()', output: 'hi'},
      {
        title: 'several parameters',
        code: 'function area(width, height)\n    return width * height\nprint area(3, 4)',
        output: '12'
      },
      {
        title: 'calls in calls',
        code: 'function next_of(x)\n    return x + 1\nprint next_of(next_of(next_of(1)))\nprint next_of(1) * next_of(2)',
        output: '4\n6'
      },
      {
        title: 'a function calls itself',
        code: 'function fib(n)\n    if n < 2\n        return n\n    return fib(n - 1) + fib(n - 2)\nprint fib(10)',
        output: '55'
      },
      {
        title: 'return ends the function',
        code: 'function first_even(list)\n    for x in list\n        if x % 2 == 0\n            return x\n    return -1\nprint first_even([1, 3, 4, 6])\nprint first_even([1])',
        output: '4\n-1'
      },
      {
        title: 'return without a value',
        code: 'function check(x)\n    if x < 0\n        print "negative"\n        return\n    print "fine"\ncheck(-1)\ncheck(1)',
        output: 'negative\nfine'
      },
      {
        title: 'a function knows only its parameters and its own variables',
        code: 'x = 1\nfunction f(y)\n    x = y * 10\n    return x\nprint f(5)\nprint x',
        output: '50\n1'
      },
      {
        title: 'a list given to a function is shared',
        code: 'function fill(list)\n    add 0 into list\nnumbers = []\nfill(numbers)\nfill(numbers)\nprint numbers',
        output: '[0, 0]'
      },
      {
        title: 'a function asks for input',
        code: 'function ask(question)\n    print question\n    input answer\n    return answer\nprint ask("Name?") + " and " + ask("Friend?")',
        inputs: ['Ani', 'Aram'],
        output: 'Name?\nFriend?\nAni and Aram'
      },
      {
        title: 'values are computed from left to right',
        code: 'function show(x)\n    print x\n    return x\nprint show(1) + show(2)',
        output: '1\n2\n3'
      },
      {
        title: 'a value read before a call keeps its value',
        code: 'function change(list)\n    list[1] = 100\n    return 0\na = [1]\nprint a[1] + change(a)\nprint a[1]',
        output: '1\n100'
      },
      {
        title: "and and or skip a call they don't need",
        code: 'function yes()\n    print "called"\n    return true\nprint false and yes()\nprint true or yes()',
        output: 'false\ntrue'
      },
      {
        title: 'a call in a loop condition runs before each pass',
        code: 'function below(x, limit)\n    return x < limit\ni = 0\nwhile below(i, 3)\n    i = i + 1\nprint i',
        output: '3'
      }
    ]
  }
];

export default sources;
