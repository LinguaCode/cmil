import type {Source} from '../types.ts';

const sources: Source[] = [
  {
    group: 'lists',
    sources: [
      {
        title: 'a list prints its items, texts quoted',
        code: 'print [1, 2.5, "a", true, []]',
        output: '[1, 2.5, "a", true, []]'
      },
      {title: 'a list of lists', code: 'print [[1, 2], [3]]', output: '[[1, 2], [3]]'},
      {
        title: 'texts in a list are printed with their escapes',
        code: 'print ["say \\"hi\\"", "a\\\\b", "one\\ntwo"]',
        output: '["say \\"hi\\"", "a\\\\b", "one\\ntwo"]'
      },
      {title: 'items count from 1', code: 'a = [10, 20, 30]\nprint a[1]\nprint a[3]', output: '10\n30'},
      {title: 'an index can be computed', code: 'a = [10, 20, 30]\ni = 1\nprint a[i + 1]', output: '20'},
      {title: 'an item of an item', code: 'm = [[1, 2], [3, 4]]\nprint m[2][1]', output: '3'},
      {title: 'an item of a list written in place', code: 'print [5, 6][2]', output: '6'},
      {title: 'a letter of a text', code: 'print "hello"[2]', output: 'e'},
      {title: 'an item can be replaced', code: 'a = [1, 2, 3]\na[2] = 20\nprint a', output: '[1, 20, 3]'},
      {
        title: 'an item of an item can be replaced',
        code: 'm = [[1, 2], [3, 4]]\nm[1][2] = 5\nprint m',
        output: '[[1, 5], [3, 4]]'
      },
      {
        title: 'add puts a value at the end',
        code: 'a = []\nadd 1 into a\nadd "two" into a\nprint a',
        output: '[1, "two"]'
      },
      {title: 'add into an item', code: 'm = [[], []]\nadd 5 into m[2]\nprint m', output: '[[], [5]]'},
      {
        title: 'the length of a list and of a text',
        code: 'print length_of([1, 2, 3])\nprint length_of([])\nprint length_of("abc")',
        output: '3\n0\n3'
      },
      {
        title: 'an emoji is one letter',
        code: 'print length_of("😀!")\nprint "😀!"[1]',
        output: '2\n😀'
      },
      {
        title: 'a list is shared by the variables it is assigned to',
        code: 'a = [1]\nb = a\nadd 2 into b\nprint a',
        output: '[1, 2]'
      },
      {
        title: 'lists are equal when their items are',
        code: 'print [1, [2, "a"]] == [1, [2, "a"]]\nprint [1, 2] == [2, 1]\nprint [1] != [1]\nprint [] == ""',
        output: 'true\nfalse\nfalse\nfalse'
      },
      {title: 'numbers in lists compare like numbers', code: 'print [0.1 + 0.2] == [0.3]', output: 'true'},
      {title: 'a list joined into a text', code: 'print "items: " + [1, "a"]', output: 'items: [1, "a"]'},
      {title: 'a list inside itself', code: 'a = [1]\nadd a into a\nprint a', output: '[1, [...]]'},
      {
        title: 'in: a value in a list',
        code: 'basket = ["🍎", "🍐"]\nprint "🍎" in basket\nprint "🍋" in basket\nprint [1] in [[1], 2]',
        output: 'true\nfalse\ntrue'
      },
      {title: 'in: a text in a text', code: 'print "ell" in "hello"\nprint "x" in "hello"', output: 'true\nfalse'},
      {
        title: 'not in, with parentheses',
        code: 'basket = ["🍎"]\nif not ("🍋" in basket)\n    add "🍋" into basket\nprint basket',
        output: '["🍎", "🍋"]'
      },
      {
        title: 'remove takes out the first equal item',
        code: 'numbers = [1, 2, 3, 2]\nremove 2 out of numbers\nprint numbers',
        output: '[1, 3, 2]'
      },
      {
        title: 'remove out of an item',
        code: 'm = [[1, 2], [3]]\nremove 2 out of m[1]\nprint m',
        output: '[[1], [3]]'
      },
      {
        title: 'the inputs gathered in a list',
        code: 'names = []\nrepeat 3 times\n    input name\n    add name into names\nprint names',
        inputs: ['Ani', 'Aram', 5],
        output: '["Ani", "Aram", 5]'
      }
    ]
  },
  {
    group: 'for in',
    sources: [
      {title: 'passes the items of a list', code: 'for x in [3, 1, 2]\n    print x', output: '3\n1\n2'},
      {title: 'passes the letters of a text', code: 'for letter in "abc"\n    print letter', output: 'a\nb\nc'},
      {title: 'no pass for an empty list', code: 'for x in []\n    print x\nprint "done"', output: 'done'},
      {
        title: 'passes the items the list had when the loop started',
        code: 'a = [1, 2]\nfor x in a\n    add x * 10 into a\nprint a',
        output: '[1, 2, 10, 20]'
      },
      {
        title: 'break and continue',
        code: 'for x in [1, 2, 3, 4]\n    if x == 2\n        continue\n    if x == 4\n        break\n    print x',
        output: '1\n3'
      },
      {title: 'the variable keeps its last value', code: 'for x in [1, 2]\n    y = x\nprint x', output: '2'},
      {
        title: 'the sum of a list',
        code: 'total = 0\nfor x in [1, 2, 3]\n    total = total + x\nprint total',
        output: '6'
      }
    ]
  },
  {
    group: 'texts',
    sources: [
      {
        title: 'uppercase and lowercase',
        code: 'print uppercase("Hello")\nprint lowercase("Hello")',
        output: 'HELLO\nhello'
      },
      {title: 'uppercase of any alphabet', code: 'print uppercase("բարի")', output: 'ԲԱՐԻ'},
      {
        title: 'a text into a number',
        code: 'print to_number("12.5") + 1\nprint to_number(" -3 ") * 2',
        output: '13.5\n-6'
      },
      {title: 'a number stays a number', code: 'print to_number(7) + 1', output: '8'},
      {
        title: 'a number into a text',
        code: 'print to_text(5) + to_text(5)\nprint to_text(0.1 + 0.2)',
        output: '55\n0.3'
      },
      {title: 'a boolean into a text', code: 'print to_text(1 < 2) + "!"', output: 'true!'},
      {title: 'a list into a text', code: 'print length_of(to_text([1, "a"]))', output: '8'},
      {
        title: 'split a text into its words',
        code: 'print split("  one two   three ")\nprint length_of(split(""))',
        output: '["one", "two", "three"]\n0'
      },
      {title: 'split at a separator', code: 'print split("a,b,,c", ",")', output: '["a", "b", "", "c"]'},
      {title: 'split into letters', code: 'print split("ab😀", "")', output: '["a", "b", "😀"]'},
      {
        title: 'join the items of a list',
        code: 'print join(["a", "b"], ", ") + "|" + join([1, true, [2]], " ") + "|" + join([])',
        output: 'a, b|1 true [2]|'
      }
    ]
  }
];

export default sources;
