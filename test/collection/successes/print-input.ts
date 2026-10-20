import type {Source} from '../types.ts';

const sources: Source[] = [
  {
    group: 'print and input',
    sources: [
      {title: 'print several values', code: 'print 1, "a", true', output: '1 a true'},
      {title: 'commas of a function stay in it', code: 'print power(2, 3), 1', output: '8 1'},
      {title: 'texts in the quotes of every language', code: 'print «a» + "b" + \'c\'', output: 'abc'},
      {title: 'texts in the quotes of English', code: 'print “Hi, ” + "Ani"', output: 'Hi, Ani'},
      {
        title: 'input after its question',
        code: 'print "Your name?"\ninput name\nprint "Hi " + name',
        inputs: ['Ani'],
        output: 'Your name?\nHi Ani'
      },
      {title: 'cot and arccot', code: 'print round(cot(1), 3)\nprint round(arccot(1), 3)', output: '0.642\n0.785'}
    ]
  }
];

export default sources;
