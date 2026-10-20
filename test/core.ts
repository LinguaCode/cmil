//packages
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {Session, check, languages, messageOf, type ProgramError, type Step} from '../src/index.ts';
import translations from '../src/translations/index.ts';
import {ERROR, MAX_LIST_LENGTH} from '../src/constants/index.ts';
import * as values from '../src/core/values.ts';

/**
 * Runs a program and answers every input request from inputs.
 * Returns the steps of the session, all its output and its error.
 */
const run = (code: string, inputs: (string | number)[] = [], language = 'en') => {
  const session = new Session(code, language);
  const steps: Step[] = [session.run()];

  let step = steps[0];
  while (step.state === 'input' && inputs.length) {
    step = session.input(inputs.shift() as string | number);
    steps.push(step);
  }

  return {
    steps,
    output: steps.flatMap(({output}) => output),
    error: step.state === 'end' ? step.error : undefined
  };
};

describe('core', () => {
  describe('loops', () => {
    it('break leaves the innermost loop', () => {
      const {output} = run(
        'repeat 3 times\n    a = 0\n    while 1 < 2\n        a = a + 1\n        if a == 2\n            break\n    print a'
      );
      assert.deepStrictEqual(output, ['2', '2', '2']);
    });

    it('continue skips to the next iteration', () => {
      const {output} = run('a = 0\ndo\n    a = a + 1\n    if a == 2\n        continue\n    print a\nwhile a < 4');
      assert.deepStrictEqual(output, ['1', '3', '4']);
    });

    it('break outside a loop is a syntax error', () => {
      assert.deepStrictEqual(run('print 1\nbreak').error, {id: 'syntaxError', line: 2, column: 1});
    });
  });

  describe('structure', () => {
    it('an unexpected indent is an indent error', () => {
      assert.deepStrictEqual(run('print 1\n    print 2').error, {id: 'indentError', line: 2});
    });

    it('a dedent to no open block is an indent error', () => {
      assert.deepStrictEqual(run('if 1 < 2\n        print 1\n    print 2').error, {id: 'indentError', line: 3});
    });

    it('comments and blank lines are not indented', () => {
      const {output, error} = run('  # comment\n\n  \nprint "a # b"');
      assert.deepStrictEqual(output, ['a # b']);
      assert.strictEqual(error, undefined);
    });

    it('deeply nested expressions are a syntax error', () => {
      assert.strictEqual(run(`print ${'('.repeat(1000)}1${')'.repeat(1000)}`).error?.id, 'syntaxError');
    });

    it('deeply nested blocks are a syntax error', () => {
      const code = Array.from({length: 120}, (_, level) => `${'    '.repeat(level)}if 1 < 2`).join('\n');
      assert.strictEqual(run(code).error?.id, 'syntaxError');
    });

    it('a math function with a wrong count of arguments', () => {
      assert.deepStrictEqual(run('print power(2)').error, {id: 'argumentError', line: 1, column: 7});
    });

    it('an unterminated text is a syntax error', () => {
      assert.deepStrictEqual(run('x = 1\nprint "abc').error, {id: 'syntaxError', line: 2, column: 7});
    });

    it('else with more words is a syntax error', () => {
      assert.deepStrictEqual(run('if 1 < 2\n    print 1\nelse 5').error, {id: 'syntaxError', line: 3, column: 6});
    });

    it('a statement starting with a value is a syntax error', () => {
      assert.deepStrictEqual(run('5 + 5').error, {id: 'syntaxError', line: 1, column: 1});
    });

    it('remainder', () => {
      assert.deepStrictEqual(run('print 17 % 5').output, ['2']);
    });
  });

  describe('columns', () => {
    it('point at the token of the error, counting the indentation', () => {
      assert.deepStrictEqual(run('if 1 < 2\n    print 1 +* 2').error, {id: 'syntaxError', line: 2, column: 14});
      assert.deepStrictEqual(run('print 1x').error, {id: 'syntaxError', line: 1, column: 8});
      assert.deepStrictEqual(run('print 1 & 2').error, {id: 'syntaxError', line: 1, column: 9});
      assert.deepStrictEqual(run('print (1').error, {id: 'syntaxError', line: 1});
    });

    it('point at an undefined variable', () => {
      assert.deepStrictEqual(run('a = 1\nprint a + b').error, {
        id: 'undefinedVariable',
        line: 2,
        column: 11,
        variable: 'b'
      });
    });
  });

  describe('values', () => {
    it("an error of a value names its operator in the program's language, at its column", () => {
      assert.deepStrictEqual(run('print 1 + true').error, {id: 'typeError', line: 1, column: 9, operator: '+'});
      assert.deepStrictEqual(run('տպել ոչ 5', [], 'hy-AM').error, {
        id: 'typeError',
        line: 1,
        column: 6,
        operator: 'ոչ'
      });
      assert.deepStrictEqual(run('print square_root(-4)').error, {
        id: 'mathError',
        line: 1,
        column: 7,
        operator: 'square_root'
      });
      assert.deepStrictEqual(run('print 1 / 0').error, {id: 'divisionByZero', line: 1, column: 9});
      assert.deepStrictEqual(run('repeat "a" times\n    print 1').error, {
        id: 'typeError',
        line: 1,
        operator: 'repeat'
      });
    });

    it('booleans print in the words of the language', () => {
      assert.deepStrictEqual(run('տպել 1 < 2', [], 'hy-AM').output, ['ճիշտ']);
      assert.deepStrictEqual(run('вывести "x: " + (1 > 2)', [], 'ru').output, ['x: ложь']);
    });

    it('and and or skip their right side when the left one decides', () => {
      assert.deepStrictEqual(run('print false and x\nprint true or x').output, ['false', 'true']);
    });
  });

  describe('lists', () => {
    it('an indexError points at the [ of its index, with the index', () => {
      assert.deepStrictEqual(run('a = [1]\nprint a[2]').error, {id: 'indexError', line: 2, column: 8, index: 2});
      assert.deepStrictEqual(run('a = [1]\na[0] = 5').error, {id: 'indexError', line: 2, column: 2, index: 0});
      assert.deepStrictEqual(run('print [1, 2, 3][0.1 * 3 * 10]').output, ['3']);
    });

    it("an error of a list names its operator in the program's language", () => {
      assert.deepStrictEqual(run('print 5[1]').error, {id: 'typeError', line: 1, column: 8, operator: '[]'});
      assert.deepStrictEqual(run('ավելացնել 1 մեջ 5', [], 'hy-AM').error, {
        id: 'typeError',
        line: 1,
        operator: 'ավելացնել'
      });
      assert.deepStrictEqual(run('յուրաքանչյուր x ից 5\n    տպել x', [], 'hy-AM').error, {
        id: 'typeError',
        line: 1,
        operator: 'ից'
      });
    });

    it('booleans in a list print in the words of the language', () => {
      assert.deepStrictEqual(run('տպել [ճիշտ, սխալ, "ա"]', [], 'hy-AM').output, ['[ճիշտ, սխալ, "ա"]']);
    });

    it('lists inside themselves compare', () => {
      const code = 'a = [1]\nadd a into a\nb = [1]\nadd b into b\nc = [2]\nadd c into c\nprint a == b, a == c';
      assert.deepStrictEqual(run(code).output, ['true false']);
    });

    it('deep lists print and compare without overflowing the stack', () => {
      const code = 'x = []\ny = []\nrepeat 100000 times\n    x = [x]\n    y = [y]\nprint x == y, length_of(to_text(x))';
      assert.deepStrictEqual(run(code).output, ['true 200002']);
    });

    it('a list shared many times is printed until its text is too long', () => {
      const {error} = run('b = []\nrepeat 40 times\n    b = [b, b]\nprint b == b, length_of(b)\nprint to_text(b)');
      assert.deepStrictEqual(error, {id: 'memoryLimit', line: 5});
    });

    it('a list grows to MAX_LIST_LENGTH items', () => {
      assert.throws(
        () => values.add(1, new Array(MAX_LIST_LENGTH).fill(0)),
        (error: values.ValueError) => error.id === 'memoryLimit'
      );
      const list = new Array(MAX_LIST_LENGTH - 1).fill(0);
      values.add(1, list);
      assert.strictEqual(list.length, MAX_LIST_LENGTH);
    });
  });

  describe('memory', () => {
    it('a too long input', () => {
      assert.deepStrictEqual(run('input x', ['a'.repeat(1000001)]).error, {id: 'memoryLimit', line: 1});
    });

    it('too much output in one step', () => {
      const {output, error} = run('x = "a"\nrepeat 19 times\n    x = x + x\nrepeat 20 times\n    print x');
      assert.deepStrictEqual(error, {id: 'memoryLimit', line: 5});
      assert.strictEqual(output.join('\n').length, 19 * (524288 + 1) - 1);
    });
  });

  describe('input and output', () => {
    it('many inputs', () => {
      const inputs = Array.from({length: 2000}, (_, index) => index);
      const {output, error} = run('s = 0\nrepeat 2000 times\n    input n\n    s = s + n\nprint s', inputs);
      assert.deepStrictEqual(output, ['1999000']);
      assert.strictEqual(error, undefined);
    });

    it('an empty input is asked for again', () => {
      const {steps} = run('input x\nprint x', ['', 'a']);
      assert.deepStrictEqual(steps, [
        {state: 'input', output: []},
        {state: 'input', output: []},
        {state: 'end', output: ['a']}
      ]);
    });

    it('every step returns the lines printed since the last one', () => {
      const {steps} = run('print 1\nprint 2\ninput x\nprint x', ['3']);
      assert.deepStrictEqual(steps, [
        {state: 'input', output: ['1', '2']},
        {state: 'end', output: ['3']}
      ]);
    });

    it('the prompt of an input comes with its step', () => {
      const session = new Session('input "Your name?" name\nprint "Hi " + name\ninput age', 'en');
      assert.deepStrictEqual(session.run(), {state: 'input', output: [], prompt: 'Your name?'});
      assert.deepStrictEqual(session.input(''), {state: 'input', output: [], prompt: 'Your name?'});
      assert.deepStrictEqual(session.input('Ani'), {state: 'input', output: ['Hi Ani']});
    });

    it('= in an expression points at the =', () => {
      assert.deepStrictEqual(run('x = 5\nif x = 5\n    print 1').error, {id: 'equalsError', line: 2, column: 6});
    });

    it('a text with a new line is one line of output', () => {
      assert.deepStrictEqual(run('print "a\\nb"').output, ['a\nb']);
    });

    it('empty text is not printed', () => {
      assert.deepStrictEqual(run('print ""\nprint 1').output, ['1']);
    });
  });

  describe('session', () => {
    it('an unknown language ends the session with unknownLanguage', () => {
      for (const language of ['xx', 'constructor']) {
        assert.deepStrictEqual(new Session('print 1', language).run(), {
          state: 'end',
          output: [],
          error: {id: 'unknownLanguage', language}
        });
      }
    });

    it('input before run() is a mistake of the caller', () => {
      assert.throws(() => new Session('input x', 'en').input('a'), /Call run\(\) before input\(\)/);
    });

    it('run() again, and input after the end, return the state without output', () => {
      const session = new Session('input name\nprint name', 'en');
      assert.deepStrictEqual(session.run(), {state: 'input', output: []});
      assert.deepStrictEqual(session.run(), {state: 'input', output: []});
      assert.deepStrictEqual(session.input('Ani'), {state: 'end', output: ['Ani']});
      assert.deepStrictEqual(session.input('again'), {state: 'end', output: []});
    });

    it('the error stays with the ended session', () => {
      const session = new Session('print 1\nprint x', 'en');
      const error = {id: 'undefinedVariable', line: 2, column: 7, variable: 'x'};
      assert.deepStrictEqual(session.run(), {state: 'end', output: ['1'], error});
      assert.deepStrictEqual(session.run(), {state: 'end', output: [], error});
    });

    it('stop ends a session waiting for input', () => {
      const session = new Session('input name\nprint name', 'en');
      session.run();
      session.stop();
      assert.deepStrictEqual(session.input('Ani'), {state: 'end', output: []});
    });

    it('maxSteps counts each step on its own', () => {
      const code = 'repeat 3 times\n    input x\n    n = 0\n    while n < 20\n        n = n + 1\n    print x';
      const session = new Session(code, 'en', {maxSteps: 100});
      session.run();
      assert.deepStrictEqual(session.input(1), {state: 'input', output: ['1']});
      assert.deepStrictEqual(session.input(2), {state: 'input', output: ['2']});

      //a pass of the loop takes about 65 steps
      const tight = new Session(code, 'en', {maxSteps: 50});
      tight.run();
      assert.deepStrictEqual(tight.input(1), {state: 'end', output: [], error: {id: 'timeout'}});
    });

    it('the state of a session is private', () => {
      assert.deepStrictEqual(Object.keys(new Session('print 1', 'en')), []);
    });
  });

  describe('check', () => {
    it('returns null for a program without errors before it runs', () => {
      assert.strictEqual(check('input x\nprint y', 'en'), null);
    });

    it('returns the first syntax, indentation, argument or language error', () => {
      assert.deepStrictEqual(check('print 1\nprint (', 'en'), {id: 'syntaxError', line: 2});
      assert.deepStrictEqual(check('print 1\n  output 2', 'en'), {id: 'indentError', line: 2});
      assert.deepStrictEqual(check('print sin(1, 2)', 'en'), {id: 'argumentError', line: 1, column: 7});
      assert.deepStrictEqual(check('print 1', 'xx'), {id: 'unknownLanguage', language: 'xx'});
    });
  });

  describe('messages', () => {
    const errors: ProgramError[] = [
      {id: 'syntaxError', line: 2, column: 3},
      {id: 'equalsError', line: 2, column: 3},
      {id: 'indentError', line: 2},
      {id: 'argumentError', line: 2},
      {id: 'undefinedVariable', line: 2, column: 3, variable: 'abc'},
      {id: 'typeError', line: 2, column: 3, operator: '-'},
      {id: 'conditionError', line: 2},
      {id: 'divisionByZero', line: 2, column: 3},
      {id: 'mathError', line: 2, column: 3, operator: 'square_root'},
      {id: 'indexError', line: 2, column: 3, index: 5},
      {id: 'memoryLimit', line: 2},
      {id: 'timeout'},
      {id: 'unknownLanguage', language: 'xx'}
    ];

    it('every error has a message in every language', () => {
      assert.deepStrictEqual(errors.map(({id}) => id).sort(), Object.values(ERROR).sort());
      languages.forEach(language => {
        assert.deepStrictEqual(Object.keys(translations[language].messages).sort(), Object.values(ERROR).sort());
      });
    });

    it('messages have the placeholders of the English ones', () => {
      const placeholders = (text: string) => (text.match(/\{\w+\}/g) || []).sort();
      languages.forEach(language => {
        Object.values(ERROR).forEach(id => {
          assert.deepStrictEqual(
            placeholders(translations[language].messages[id]),
            placeholders(translations.en.messages[id]),
            `${language}: ${id}`
          );
        });
      });
    });

    it('fills the placeholders', () => {
      const byId = (id: string) => errors.find(error => error.id === id) as ProgramError;
      assert.strictEqual(messageOf(byId('undefinedVariable'), 'en'), 'Line 2: abc has no value yet.');
      assert.strictEqual(messageOf(byId('syntaxError'), 'hy-AM'), 'Շարահյուսական սխալ 2-րդ տողում։');
      languages.forEach(language => {
        errors.forEach(error => assert.doesNotMatch(messageOf(error, language), /\{\w+\}/, `${language}: ${error.id}`));
      });
    });

    it('an unknown language gets the English message', () => {
      assert.strictEqual(messageOf({id: 'timeout'}, 'xx'), messageOf({id: 'timeout'}, 'en'));
    });
  });
});
