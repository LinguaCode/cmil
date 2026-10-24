import type {Source} from '../types.ts';

const sources: Source[] = [
  {
    group: 'functions',
    sources: [
      {
        title: 'a function returns a value',
        code: 'function square_of(x)\n    return x * x\nprint(square_of(5) + 1)',
        output: '26'
      },
      {
        title: 'a function can be called before its definition',
        code: 'print(twice(3))\nfunction twice(x)\n    return x * 2',
        output: '6'
      },
      {
        title: 'a function calls one defined after it',
        code: 'function a()\n    return b() + 1\nfunction b()\n    return 1\nprint(a())',
        output: '2'
      },
      {
        title: 'a function gives a text it makes',
        code: 'function greet(name)\n    return "Hi, " + name + "!"\nprint(greet("Ani"))',
        output: 'Hi, Ani!'
      },
      {
        title: 'a function that is never called',
        code: 'function greet(name)\n    message = "Hi, " + name\n    print(message)\nprint("done")',
        output: 'done'
      },
      {
        title: 'a call as a statement',
        code: 'function greet(name)\n    print("Hello, " + name)\ngreet("Ani")\ngreet("Aram")',
        output: 'Hello, Ani\nHello, Aram'
      },
      {
        title: 'a call as a statement of a function that gives a value',
        code: 'function f()\n    print(1)\n    return 2\nf()',
        output: '1'
      },
      {title: 'without parameters', code: 'function hello()\n    return "hi"\nprint(hello())', output: 'hi'},
      {
        title: 'several parameters',
        code: 'function area(width, height)\n    return width * height\nprint(area(3, 4))',
        output: '12'
      },
      {
        title: 'seven parameters',
        code: 'function sum(a, b, c, d, f, g, h)\n    return a + b + c + d + f + g + h\nfunction last(a, b, c, d, f, g, h)\n    print(h)\nprint(sum(1, 2, 3, 4, 5, 6, 7))\nlast(1, 2, 3, 4, 5, 6, "seven")',
        output: '28\nseven'
      },
      {
        title: 'parameters the function changes',
        code: 'function count_down(n, word)\n    while n > 0\n        word = word + "!"\n        print(word)\n        n = n - 1\ncount_down(2, "go")',
        output: 'go!\ngo!!'
      },
      {
        title: 'calls in calls',
        code: 'function next_of(x)\n    return x + 1\nprint(next_of(next_of(next_of(1))))\nprint(next_of(1) * next_of(2))',
        output: '4\n6'
      },
      {
        title: 'a function calls itself',
        code: 'function fib(n)\n    if n < 2\n        return n\n    return fib(n - 1) + fib(n - 2)\nprint(fib(10))',
        output: '55'
      },
      {
        title: 'return ends the function',
        code: 'function first_even(list)\n    for x in list\n        if x % 2 == 0\n            return x\n    return -1\nprint(first_even([1, 3, 4, 6]))\nprint(first_even([1]))',
        output: '4\n-1'
      },
      {
        title: 'return without a value',
        code: 'function check(x)\n    if x < 0\n        print("negative")\n        return\n    print("fine")\ncheck(-1)\ncheck(1)',
        output: 'negative\nfine'
      },
      {
        title: 'a function knows only its parameters and its own variables',
        code: 'x = 1\nfunction f(y)\n    x = y * 10\n    return x\nprint(f(5))\nprint(x)',
        output: '50\n1'
      },
      {
        title: 'a variable and a parameter can have the name of a function',
        code: 'function total(total)\n    return total + 1\ntotal = total(2)\nprint(total)\nprint(total(total))',
        output: '3\n4'
      },
      {
        title: 'a list given to a function is shared',
        code: 'function fill(list)\n    add(list, 0)\nnumbers = []\nfill(numbers)\nfill(numbers)\nprint(join(numbers, ", "))',
        output: '0, 0'
      },
      {
        title: 'a list written in place, given to a function that changes it',
        code: 'function first_added(list)\n    add(list, 1)\n    return list[1]\nprint(first_added([]))',
        output: '1'
      },
      {
        title: 'a list a function gives, and its items',
        code: 'function pair()\n    return [5, 6]\ni = 1\nprint(pair()[2] + pair()[i])',
        output: '11'
      },
      {
        title: 'a function asks for input',
        code: 'function ask(question)\n    print(question)\n    answer = input()\n    return answer\nprint(ask("Name?") + " and " + ask("Friend?"))',
        inputs: ['Ani', 'Aram'],
        output: 'Name?\nFriend?\nAni and Aram'
      },
      {
        title: 'values are computed from left to right',
        code: 'function show(x)\n    print(x)\n    return x\nprint(show(1) + show(2))',
        output: '1\n2\n3'
      },
      {
        title: 'a value read before a call keeps its value',
        code: 'function change(list)\n    list[1] = 100\n    return 0\na = [1]\nprint(a[1] + change(a))\nprint(a[1])',
        output: '1\n100'
      },
      {
        title: "and and or skip a call they don't need",
        code: 'function yes()\n    print("called")\n    return true\nprint(false and yes())\nprint(true or yes())',
        output: 'false\ntrue'
      },
      {
        title: 'a call in a loop condition runs before each pass',
        code: 'function below(x, limit)\n    return x < limit\ni = 0\nwhile below(i, 3)\n    i = i + 1\nprint(i)',
        output: '3'
      }
    ]
  }
];

export default sources;
