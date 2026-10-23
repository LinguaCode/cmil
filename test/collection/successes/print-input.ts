import type {Source} from '../types.ts';

const sources: Source[] = [
  {
    group: 'print and input',
    sources: [
      {title: 'a text joined with a value', code: 'print "Fruits: " + (3 + 5)', output: 'Fruits: 8'},
      {title: 'values are joined from left to right', code: 'print "Fruits: " + 3 + 5', output: 'Fruits: 35'},
      {
        title: 'the commas of a function and a list stay in them',
        code: 'print power(2, 3) + length_of([1, 2])',
        output: '10'
      },
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
