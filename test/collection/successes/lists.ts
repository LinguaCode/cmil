import type {Source} from '../types.ts';

const sources: Source[] = [
  {
    group: 'lists',
    sources: [
      {
        title: 'a list of lists',
        code: 't = [[1, 2], [3]]\nprint(length_of(t))\nprint(join(t[1], ", "))\nprint(join(t[2], ", "))',
        output: '2\n1, 2\n3'
      },
      {title: 'items count from 1', code: 'a = [10, 20, 30]\nprint(a[1])\nprint(a[3])', output: '10\n30'},
      {title: 'an index can be computed', code: 'a = [10, 20, 30]\ni = 1\nprint(a[i + 1])', output: '20'},
      {title: 'an item of an item', code: 'm = [[1, 2], [3, 4]]\nprint(m[2][1])', output: '3'},
      {title: 'an item of a list written in place', code: 'print([5, 6][2])', output: '6'},
      {title: 'a letter of a text', code: 'print("hello"[2])', output: 'e'},
      {
        title: 'an item can be replaced',
        code: 'a = [1, 2, 3]\na[2] = 20\nprint(join(a, ", "))',
        output: '1, 20, 3'
      },
      {
        title: 'an item replaced at a computed index',
        code: 'a = [1, 2, 3]\ni = 1\na[i + 1] = 9\nprint(join(a, " "))',
        output: '1 9 3'
      },
      {
        title: 'items compared with each other',
        code: 'a = [1000, 1000, 2000]\nprint(a[1] == a[2])\nprint(a[1] != a[3])',
        output: 'true\ntrue'
      },
      {
        title: 'a boolean item as a condition',
        code: 'flags = [true, false]\nif flags[1] and not flags[2]\n    print("yes")',
        output: 'yes'
      },
      {
        title: 'an item of an item can be replaced',
        code: 'm = [[1, 2], [3, 4]]\nm[1][2] = 5\nprint(join(m[1], ", "))\nprint(join(m[2], ", "))',
        output: '1, 5\n3, 4'
      },
      {
        title: 'add puts a value at the end',
        code: 'a = []\nadd(a, 1)\nadd(a, "two")\nprint(join(a, ", "))',
        output: '1, two'
      },
      {
        title: 'a whole number added to a list of decimal numbers',
        code: 'prices = [1.5]\ncount = 2\nadd(prices, count)\nprint(join(prices, " "))',
        output: '1.5 2'
      },
      {
        title: 'an empty list again',
        code: 'items = [1]\nitems = []\nprint(length_of(items))',
        output: '0'
      },
      {
        title: 'a list made in a loop is there after it',
        code: 'while true\n    row = [1]\n    break\nprint(row[1])',
        output: '1'
      },
      {
        title: 'add into an item',
        code: 'm = [[], []]\nadd(m[2], 5)\nprint(length_of(m[1]))\nprint(join(m[2], ", "))',
        output: '0\n5'
      },
      {
        title: 'the length of a list and of a text',
        code: 'print(length_of([1, 2, 3]))\nprint(length_of([]))\nprint(length_of("abc"))',
        output: '3\n0\n3'
      },
      {
        title: 'an emoji is one letter',
        code: 'print(length_of("😀!"))\nprint("😀!"[1])',
        output: '2\n😀'
      },
      {
        title: 'a list is shared by the variables it is assigned to',
        code: 'a = [1]\nb = a\nadd(b, 2)\nprint(join(a, ", "))',
        output: '1, 2'
      },
      {
        title: 'a list inside itself',
        code: 'a = [1]\nadd(a, a)\nprint(length_of(a))\na[2][1] = 5\nprint(a[1])',
        output: '2\n5'
      },
      {
        title: 'in: a value in a list',
        code: 'basket = ["🍎", "🍐"]\nprint("🍎" in basket)\nprint("🍋" in basket)',
        output: 'true\nfalse'
      },
      {
        title: 'in: a list written in a loop condition',
        code: 'n = 1\nwhile n in [1, 2]\n    n = n + 1\nprint(n)',
        output: '3'
      },
      {
        title: 'in: a number or a boolean in a list',
        code: 'print(2 in [1, 2])\nprint(2.5 in [0.5, 1.5])\nprint(false in [true])',
        output: 'true\nfalse\nfalse'
      },
      {title: 'in: a text in a text', code: 'print("ell" in "hello")\nprint("x" in "hello")', output: 'true\nfalse'},
      {
        title: 'not in, with parentheses',
        code: 'basket = ["🍎"]\nif not ("🍋" in basket)\n    add(basket, "🍋")\nprint(join(basket, ", "))',
        output: '🍎, 🍋'
      },
      {
        title: 'remove takes out the first equal item',
        code: 'numbers = [1, 2, 3, 2]\nremove(numbers, 2)\nprint(join(numbers, ", "))',
        output: '1, 3, 2'
      },
      {
        title: 'remove out of a list of reals, of texts or of booleans',
        code: 'reals = [0.5, 1.5]\nremove(reals, 0.5)\nwords = ["a", "b"]\nremove(words, "b")\nflags = [true, false]\nremove(flags, true)\nprint(join(reals) + " " + join(words) + " " + join(flags))',
        output: '1.5 a false'
      },
      {
        title: 'remove out of an item',
        code: 'm = [[1, 2], [3]]\nremove(m[1], 2)\nprint(join(m[1], ", "))\nprint(join(m[2], ", "))',
        output: '1\n3'
      },
      {
        title: 'the inputs gathered in a list',
        code: 'names = []\nrepeat 3 times\n    name = input()\n    add(names, name)\nprint(join(names, ", "))',
        inputs: ['Ani', 'Aram', 5],
        output: 'Ani, Aram, 5'
      }
    ]
  },
  {
    group: 'for in',
    sources: [
      {title: 'passes the items of a list', code: 'for x in [3, 1, 2]\n    print(x)', output: '3\n1\n2'},
      {title: 'passes the letters of a text', code: 'for letter in "abc"\n    print(letter)', output: 'a\nb\nc'},
      {title: 'no pass for an empty list', code: 'for x in []\n    print(x)\nprint("done")', output: 'done'},
      {
        title: 'passes the items the list had when the loop started',
        code: 'a = [1, 2]\nfor x in a\n    add(a, x * 10)\nprint(join(a, ", "))',
        output: '1, 2, 10, 20'
      },
      {
        title: 'break and continue',
        code: 'for x in [1, 2, 3, 4]\n    if x == 2\n        continue\n    if x == 4\n        break\n    print(x)',
        output: '1\n3'
      },
      {title: 'the variable keeps its last value', code: 'for x in [1, 2]\n    y = x\nprint(x)', output: '2'},
      {
        title: 'the sum of a list',
        code: 'total = 0\nfor x in [1, 2, 3]\n    total = total + x\nprint(total)',
        output: '6'
      }
    ]
  },
  {
    group: 'texts',
    sources: [
      {
        title: 'uppercase and lowercase',
        code: 'print(uppercase("Hello"))\nprint(lowercase("Hello"))',
        output: 'HELLO\nhello'
      },
      {title: 'uppercase of any alphabet', code: 'print(uppercase("բարի"))', output: 'ԲԱՐԻ'},
      {
        title: 'a text into a number',
        code: 'print(to_number("12.5") + 1)\nprint(to_number(" -3 ") * 2)',
        output: '13.5\n-6'
      },
      {title: 'a number stays a number', code: 'print(to_number(7) + 1)', output: '8'},
      {
        title: 'a number into a text',
        code: 'print(to_text(5) + to_text(5))\nprint(to_text(0.1 + 0.2))',
        output: '55\n0.3'
      },
      {title: 'a boolean into a text', code: 'print(to_text(1 < 2) + "!")', output: 'true!'},
      {
        title: 'a text into a text is the same text',
        code: 'print(to_text(5) == "5")\nprint(to_text("a") == "a")',
        output: 'true\ntrue'
      },
      {
        title: 'split a text into its words',
        code: 'print(join(split("  one two   three "), "|"))\nprint(length_of(split("")))',
        output: 'one|two|three\n0'
      },
      {title: 'split at a separator', code: 'print(join(split("a,b,,c", ","), "|"))', output: 'a|b||c'},
      {
        title: 'split at a separator of letters',
        code: 'print(join(split("one, two, three", ", "), "|"))',
        output: 'one|two|three'
      },
      {title: 'split into letters', code: 'print(join(split("ab😀", ""), "|"))', output: 'a|b|😀'},
      {
        title: 'join the items of a list',
        code: 'print(join(["a", "b"], ", ") + "|" + join([1, true, 2.5], " ") + "|" + join([]))',
        output: 'a, b|1 true 2.5|'
      },
      {
        title: 'join the items of a list of one type',
        code: 'print(join([1.5, 2], ", "))\nprint(join([true, false], " and "))',
        output: '1.5, 2\ntrue and false'
      }
    ]
  }
];

export default sources;
