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
      {title: 'a variable in a text', code: 'name = "Ani"\nprint("Hi, {name}!")', output: 'Hi, Ani!'},
      {
        title: 'an expression in a text',
        code: 'apples = 3\npears = 5\nprint("{apples} apples and {pears} pears make {apples + pears} fruits.")',
        output: '3 apples and 5 pears make 8 fruits.'
      },
      {
        title: 'values in a text as print writes them',
        code: 'print("{0.1 + 0.2} {2 > 1} {[1, "a"]} {7 / 2}")',
        output: '0.3 true [1, "a"] 3.5'
      },
      {title: 'a brace that stays a brace', code: 'print("\\{x} and }")', output: '{x} and }'},
      {title: 'a text in the braces of a text', code: 'name = "Ani"\nprint("{name + "!"}")', output: 'Ani!'},
      {
        title: 'a call in a text',
        code: 'function twice(x)\n    return x * 2\nprint("{twice(21)} and {twice(1)}")',
        output: '42 and 2'
      },
      {
        title: 'an input in the braces of a text',
        code: 'print("Your name?")\nprint("Hi, {input()}!")',
        inputs: ['Ani'],
        output: 'Your name?\nHi, Ani!'
      },
      {title: 'code in texts in every quote', code: 'x = 1\nprint(«{x}» + \'{x}\' + "{x}")', output: '111'},
      {title: 'cot and arccot', code: 'print(round(cot(1), 3))\nprint(round(arccot(1), 3))', output: '0.642\n0.785'}
    ]
  }
];

export default sources;
