import type {Source} from '../types.ts';

const sources: Source[] = [
  {
    group: 'values',
    sources: [
      {
        group: 'numbers',
        sources: [
          {
            title: 'printed with 12 significant digits',
            code: 'print(0.1 + 0.2)\nprint(10 / 3)',
            output: '0.3\n3.33333333333'
          },
          {title: 'compared as printed', code: 'print(0.1 + 0.2 == 0.3)\nprint(1 - 0.9 < 0.1)', output: 'true\nfalse'},
          {
            title: 'very small and very large numbers printed with all their digits',
            code: 'print(1 / 10000000)\nprint(-1 / 30000000)\nprint(power(10, 21))\nprint(1.5 * power(10, 25))',
            output: '0.0000001\n-0.0000000333333333333\n1000000000000000000000\n15000000000000000000000000'
          },
          {
            title: 'whole numbers printed whole',
            code: 'print(123456789012345)\nprint(2 / 4)',
            output: '123456789012345\n0.5'
          },
          {
            title: 'round to decimals',
            code: 'print(round(3.14159, 2))\nprint(round(1.005, 2))\nprint(round(1234, -2))',
            output: '3.14\n1.01\n1200'
          },
          {
            title: 'trigonometry is exact at its angles',
            code: 'print(sin(pi))\nprint(cos(pi / 2))\nprint(tan(pi / 4))',
            output: '0\n0\n1'
          }
        ]
      },
      {
        group: 'equality',
        sources: [
          {title: 'a text is not equal to a number', code: 'print("5" == 5)\nprint("" == 0)', output: 'false\nfalse'},
          {title: 'booleans', code: 'print(true == true)\nprint(true != false)', output: 'true\ntrue'},
          {
            title: 'texts in alphabetical order',
            code: 'print("b" > "a")\nprint("apple" < "pear")',
            output: 'true\ntrue'
          }
        ]
      },
      {
        group: 'texts',
        sources: [
          {title: 'a text joined with a boolean', code: 'print("x: " + true)', output: 'x: true'},
          {title: 'a text joined with a decimal number', code: 'print("x: " + 0.1 * 3)', output: 'x: 0.3'}
        ]
      },
      {
        title: 'repeat reads its count once',
        code: 'n = 3\nrepeat n times\n    n = n + 1\nprint(n)',
        output: '6'
      }
    ]
  }
];

export default sources;
