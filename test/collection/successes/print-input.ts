import type {Source} from '../types.ts';

const sources: Source[] = [
  {
    group: 'print and input',
    sources: [
      {title: 'a text joined with a value', code: 'print("Fruits: " + (3 + 5))', output: 'Fruits: 8'},
      {title: 'values are joined from left to right', code: 'print("Fruits: " + 3 + 5)', output: 'Fruits: 35'},
      {
        title: 'the commas of a function and a list stay in them',
        code: 'print(power(2, 3) + length_of([1, 2]))',
        output: '10'
      },
      {title: 'texts in the quotes of every language', code: 'print(«a» + "b" + \'c\')', output: 'abc'},
      {title: 'texts in the quotes of English', code: 'print(“Hi, ” + "Ani")', output: 'Hi, Ani'},
      {
        title: 'input after its question',
        code: 'print("Your name?")\nname = input()\nprint("Hi " + name)',
        inputs: ['Ani'],
        output: 'Your name?\nHi Ani'
      },
      {title: 'an empty text prints an empty line', code: 'print("a")\nprint("")\nprint("b")', output: 'a\n\nb'},
      {
        title: 'input in a condition',
        code: 'print("Again?")\nif input() == "yes"\n    print("Again")',
        inputs: ['yes'],
        output: 'Again?\nAgain'
      },
      {
        title: 'two inputs in a line are asked from left to right',
        code: 'print("Two words?")\nprint(input() + " and " + input())',
        inputs: ['cats', 'dogs'],
        output: 'Two words?\ncats and dogs'
      },
      {
        title: 'inputs in a list',
        code: 'answers = [input(), input()]\nprint(answers)',
        inputs: [5, 'five'],
        output: '[5, "five"]'
      },
      {
        title: 'input in the condition of while',
        code: 'count = 0\nwhile input() != "stop"\n    count = count + 1\nprint(count)',
        inputs: ['a', 'b', 'stop'],
        output: '2'
      },
      {
        title: 'input in the condition of do … while',
        code: 'do\n    print("Password?")\nwhile input() != "secret"\nprint("Welcome")',
        inputs: ['open', 'secret'],
        output: 'Password?\nPassword?\nWelcome'
      },
      {
        title: 'input in a function, and as its argument',
        code: 'function ask(question)\n    print(question)\n    return input()\nfunction twice(x)\n    return x + x\nprint(twice(ask("A number?")))\nprint(twice(input()))',
        inputs: [21, 'ab'],
        output: 'A number?\n42\nabab'
      },
      {title: 'cot and arccot', code: 'print(round(cot(1), 3))\nprint(round(arccot(1), 3))', output: '0.642\n0.785'}
    ]
  }
];

export default sources;
