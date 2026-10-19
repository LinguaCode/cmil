import type {Source} from '../types.ts';

const sources: Source[] = [
  {
    group: 'restrictions',
    sources: [
      {
        title: 'JavaScript function call',
        code: 'output eval("1")',
        errorId: 'syntaxError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'JavaScript property access',
        code: 'output (1).constructor',
        errorId: 'syntaxError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'JavaScript constructor in an assignment',
        code: 'x = this.constructor.constructor("return 1")()\noutput x',
        errorId: 'syntaxError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'template literal syntax in text',
        code: 'output "${1 + 1}"',
        output: '${1 + 1}'
      },
      {
        title: 'JavaScript in an input value',
        code: 'input x\noutput x',
        inputs: ["a'+(1+1)+'"],
        output: "a'+(1+1)+'"
      }
    ]
  }
];

export default sources;
