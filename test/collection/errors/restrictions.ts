import type {Source} from '../types.ts';

const sources: Source[] = [
  {
    group: 'restrictions',
    sources: [
      {
        title: 'JavaScript function call',
        code: 'print(eval("1"))',
        errorId: 'undefinedFunction',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'JavaScript property access',
        code: 'print((1).constructor)',
        errorId: 'syntaxError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'JavaScript constructor in an assignment',
        code: 'x = this.constructor.constructor("return 1")()\nprint(x)',
        errorId: 'syntaxError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'template literal syntax in text',
        code: 'print("${1 + 1}")',
        output: '${1 + 1}'
      },
      {
        title: 'JavaScript in an input value',
        code: 'x = input()\nprint(x)',
        inputs: ["a'+(1+1)+'"],
        output: "a'+(1+1)+'"
      }
    ]
  }
];

export default sources;
