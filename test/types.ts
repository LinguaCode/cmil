//the types of the values of programs, which the typed languages declare: of the variables of each scope, of the result
//of each function, and of each answer of input(), in the order of the program, with the values of two types
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {programOf, type ProgramTree} from '../src/index.ts';
import {typesOf, type Type, type Types} from '../src/convert/types.ts';
import type {Expression} from '../src/core/types.ts';

type Case = {
  title: string;
  code: string;
  variables?: Record<string, Record<string, Type>>;
  results?: Record<string, Type>;
  answers?: Type[];
  conflicts?: Types['conflicts'];
};

const CASES: Case[] = [
  {
    title: 'a number is whole when it is sure to be, else real',
    code: 'a = 1 + 2 * 3\nb = a / 2\nc = round(b)\nfor i from 0 to 1 step 0.5\n    a = a % 2',
    variables: {'': {a: 'whole', b: 'real', c: 'whole', i: 'real'}}
  },
  {
    title: 'an answer is a number where it is used as one, else a text',
    code: 'age = input()\nname = input()\nif age < 18\n    print("Hi " + name)',
    variables: {'': {age: 'real', name: 'text'}},
    answers: ['real', 'text']
  },
  {
    title: 'two answers added together are numbers',
    code: 'print(input() + input())',
    answers: ['real', 'real']
  },
  {
    title: 'a list has items of one type, parameters get the types of their arguments, and functions of their returns',
    code: 'function area(w, h)\n    return w * h\nt = [[1], []]\nadd(t[2], area(2, 3.5))\nprint(t)',
    variables: {'': {t: {list: {list: 'real'}}}, area: {w: 'whole', h: 'real'}},
    results: {area: 'real'},
    conflicts: []
  },
  {
    title: 'an answer given to a parameter that is a number is a number, also through a variable',
    code: 'function twice(x)\n    return x * 2\nprint(twice(input()))\nn = input()\nprint(twice(n))',
    variables: {'': {n: 'real'}, twice: {x: 'real'}},
    answers: ['real', 'real']
  },
  {
    title: 'an answer a function returns is a number where its result is used as one',
    code: 'function ask(question)\n    print(question)\n    return input()\nprint(ask("Age?") * 2)',
    results: {ask: 'real'},
    answers: ['real']
  },
  {
    title: 'answers given to a parameter used as a number, from a function and from input(), are numbers',
    code: 'function ask(question)\n    print(question)\n    return input()\nfunction twice(x)\n    return x + x\nprint(twice(ask("A number?")))\nprint(twice(input()))',
    variables: {'': {}, ask: {question: 'text'}, twice: {x: 'real'}},
    results: {ask: 'real', twice: 'real'},
    answers: ['real', 'real'],
    conflicts: []
  },
  {
    title: 'an answer added to a list of numbers, or to a list whose items are used as numbers, is a number',
    code: 'a = [1]\nadd(a, input())\nb = []\nadd(b, input())\nprint(b[1] * 2)\nc = ["x"]\nc[1] = input()',
    variables: {'': {a: {list: 'real'}, b: {list: 'real'}, c: {list: 'text'}}},
    answers: ['real', 'real', 'text']
  },
  {
    title: 'an answer in a list of numbers is a number',
    code: 'a = [input(), 2]\nb = [[input()], [1]]',
    variables: {'': {a: {list: 'real'}, b: {list: {list: 'real'}}}},
    answers: ['real', 'real']
  },
  {
    title: 'the answers for … in passes take the type of its variable',
    code: 'for x in [input(), input()]\n    print(x * 2)',
    variables: {'': {x: 'real'}},
    answers: ['real', 'real']
  },
  {
    title: 'a counter from the result of a function is whole when the result is',
    code: 'function first()\n    return 1\nfor i from first() to 3\n    print(i)',
    variables: {'': {i: 'whole'}, first: {}},
    results: {first: 'whole'}
  },
  {
    title: 'a value of two types is a conflict, at the line of the second one',
    code: 'x = 1\nprint(x)\nx = "one"\ny = [1, "a"]',
    conflicts: [
      {line: 3, name: 'x'},
      {line: 4, name: '[]'}
    ]
  },
  {
    title: 'a list that gets an item of another type is still a list, of items of two types',
    code: 'a = [1]\nadd(a, "x")\nb = [[1], ["y"]]',
    variables: {'': {a: {list: 'mixed'}, b: {list: {list: 'mixed'}}}},
    results: {},
    conflicts: [{line: 2, name: '[]'}]
  },
  {
    title: 'a value that is no list gets no items, where CMIL stops',
    code: 'x = 1\nadd(x, 2)\ny = "a"\ny[1] = "b"',
    variables: {'': {x: 'whole', y: 'text'}},
    conflicts: []
  },
  {
    title: 'a list wrapped in itself is a list of ever more lists, whose type never settles',
    code: 'x = []\nrepeat 3 times\n    x = [x]\na = []\nadd(a, a)',
    conflicts: [
      {line: 3, name: 'x'},
      {line: 5, name: 'a'}
    ]
  }
];

//the type of each input() of a program, in its order
const answersOf = (tree: ProgramTree, types: Types): Type[] => {
  const answers: Type[] = [];
  const walk = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') {
      if ((value as Expression).type === 'input') answers.push(types.expressions.get(value as Expression)!);
      Object.values(value).forEach(walk);
    }
  };
  walk(tree.statements);
  return answers;
};

describe('types', () => {
  for (const {title, code, ...expected} of CASES) {
    it(title, () => {
      const tree = programOf(code, 'en') as ProgramTree;
      const types = typesOf(tree.statements);
      const found = {
        variables: Object.fromEntries([...types.variables].map(([scope, names]) => [scope, Object.fromEntries(names)])),
        results: Object.fromEntries(types.results),
        answers: answersOf(tree, types),
        conflicts: types.conflicts
      };
      for (const key of Object.keys(expected) as (keyof typeof expected)[]) {
        assert.deepStrictEqual(found[key], expected[key], key);
      }
    });
  }
});
