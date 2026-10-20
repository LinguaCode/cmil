//packages
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {Session, check, languages, messageOf, type ProgramError, type Step} from '../src/index.ts';
import translations from '../src/translations/index.ts';
import {ERROR} from '../src/constants/index.ts';

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
        'repeat 3 times\n    a = 0\n    while 1 < 2\n        a = a + 1\n        if a == 2\n            break\n    output a'
      );
      assert.deepStrictEqual(output, ['2', '2', '2']);
    });

    it('continue skips to the next iteration', () => {
      const {output} = run('a = 0\ndo\n    a = a + 1\n    if a == 2\n        continue\n    output a\nwhile a < 4');
      assert.deepStrictEqual(output, ['1', '3', '4']);
    });

    it('break outside a loop is a syntax error', () => {
      assert.deepStrictEqual(run('output 1\nbreak').error, {id: 'syntaxError', line: 2, column: 1});
    });
  });

  describe('structure', () => {
    it('an unexpected indent is an indent error', () => {
      assert.deepStrictEqual(run('output 1\n    output 2').error, {id: 'indentError', line: 2});
    });

    it('a dedent to no open block is an indent error', () => {
      assert.deepStrictEqual(run('if 1 < 2\n        output 1\n    output 2').error, {id: 'indentError', line: 3});
    });

    it('comments and blank lines are not indented', () => {
      const {output, error} = run('  # comment\n\n  \noutput "a # b"');
      assert.deepStrictEqual(output, ['a # b']);
      assert.strictEqual(error, undefined);
    });

    it('deeply nested expressions are a syntax error', () => {
      assert.strictEqual(run(`output ${'('.repeat(1000)}1${')'.repeat(1000)}`).error?.id, 'syntaxError');
    });

    it('deeply nested blocks are a syntax error', () => {
      const code = Array.from({length: 120}, (_, level) => `${'    '.repeat(level)}if 1 < 2`).join('\n');
      assert.strictEqual(run(code).error?.id, 'syntaxError');
    });

    it('a math function with a wrong count of arguments', () => {
      assert.deepStrictEqual(run('output power(2)').error, {id: 'argumentError', line: 1, column: 8});
    });

    it('an unterminated text is a syntax error', () => {
      assert.deepStrictEqual(run('x = 1\noutput "abc').error, {id: 'syntaxError', line: 2, column: 8});
    });

    it('else with more words is a syntax error', () => {
      assert.deepStrictEqual(run('if 1 < 2\n    output 1\nelse 5').error, {id: 'syntaxError', line: 3, column: 6});
    });

    it('a statement starting with a value is a syntax error', () => {
      assert.deepStrictEqual(run('5 + 5').error, {id: 'syntaxError', line: 1, column: 1});
    });

    it('remainder', () => {
      assert.deepStrictEqual(run('output 17 % 5').output, ['2']);
    });
  });

  describe('columns', () => {
    it('point at the token of the error, counting the indentation', () => {
      assert.deepStrictEqual(run('if 1 < 2\n    output 1 +* 2').error, {id: 'syntaxError', line: 2, column: 15});
      assert.deepStrictEqual(run('output 1x').error, {id: 'syntaxError', line: 1, column: 9});
      assert.deepStrictEqual(run('output 1 & 2').error, {id: 'syntaxError', line: 1, column: 10});
      assert.deepStrictEqual(run('output (1').error, {id: 'syntaxError', line: 1});
    });

    it('point at an undefined variable', () => {
      assert.deepStrictEqual(run('a = 1\noutput a + b').error, {
        id: 'undefinedVariable',
        line: 2,
        column: 12,
        variable: 'b'
      });
    });
  });

  describe('memory', () => {
    it('a too long input', () => {
      assert.deepStrictEqual(run('input x', ['a'.repeat(1000001)]).error, {id: 'memoryLimit', line: 1});
    });

    it('too much output in one step', () => {
      const {output, error} = run('x = "a"\nrepeat 19 times\n    x = x + x\nrepeat 20 times\n    output x');
      assert.deepStrictEqual(error, {id: 'memoryLimit', line: 5});
      assert.strictEqual(output.join('\n').length, 19 * (524288 + 1) - 1);
    });
  });

  describe('input and output', () => {
    it('many inputs', () => {
      const inputs = Array.from({length: 2000}, (_, index) => index);
      const {output, error} = run('s = 0\nrepeat 2000 times\n    input n\n    s = s + n\noutput s', inputs);
      assert.deepStrictEqual(output, ['1999000']);
      assert.strictEqual(error, undefined);
    });

    it('an empty input is asked for again', () => {
      const {steps} = run('input x\noutput x', ['', 'a']);
      assert.deepStrictEqual(steps, [
        {state: 'input', output: []},
        {state: 'input', output: []},
        {state: 'end', output: ['a']}
      ]);
    });

    it('every step returns the lines printed since the last one', () => {
      const {steps} = run('output 1\noutput 2\ninput x\noutput x', ['3']);
      assert.deepStrictEqual(steps, [
        {state: 'input', output: ['1', '2']},
        {state: 'end', output: ['3']}
      ]);
    });

    it('a text with a new line is one line of output', () => {
      assert.deepStrictEqual(run('output "a\\nb"').output, ['a\nb']);
    });

    it('empty text is not printed', () => {
      assert.deepStrictEqual(run('output ""\noutput 1').output, ['1']);
    });
  });

  describe('session', () => {
    it('an unknown language ends the session with unknownLanguage', () => {
      for (const language of ['xx', 'constructor']) {
        assert.deepStrictEqual(new Session('output 1', language).run(), {
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
      const session = new Session('input name\noutput name', 'en');
      assert.deepStrictEqual(session.run(), {state: 'input', output: []});
      assert.deepStrictEqual(session.run(), {state: 'input', output: []});
      assert.deepStrictEqual(session.input('Ani'), {state: 'end', output: ['Ani']});
      assert.deepStrictEqual(session.input('again'), {state: 'end', output: []});
    });

    it('the error stays with the ended session', () => {
      const session = new Session('output 1\noutput x', 'en');
      const error = {id: 'undefinedVariable', line: 2, column: 8, variable: 'x'};
      assert.deepStrictEqual(session.run(), {state: 'end', output: ['1'], error});
      assert.deepStrictEqual(session.run(), {state: 'end', output: [], error});
    });

    it('stop ends a session waiting for input', () => {
      const session = new Session('input name\noutput name', 'en');
      session.run();
      session.stop();
      assert.deepStrictEqual(session.input('Ani'), {state: 'end', output: []});
    });

    it('maxSteps counts each step on its own', () => {
      const code = 'repeat 3 times\n    input x\n    n = 0\n    while n < 20\n        n = n + 1\n    output x';
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
      assert.deepStrictEqual(Object.keys(new Session('output 1', 'en')), []);
    });
  });

  describe('check', () => {
    it('returns null for a program without errors before it runs', () => {
      assert.strictEqual(check('input x\noutput y', 'en'), null);
    });

    it('returns the first syntax, indentation, argument or language error', () => {
      assert.deepStrictEqual(check('output 1\noutput (', 'en'), {id: 'syntaxError', line: 2});
      assert.deepStrictEqual(check('output 1\n  output 2', 'en'), {id: 'indentError', line: 2});
      assert.deepStrictEqual(check('output sin(1, 2)', 'en'), {id: 'argumentError', line: 1, column: 8});
      assert.deepStrictEqual(check('output 1', 'xx'), {id: 'unknownLanguage', language: 'xx'});
    });
  });

  describe('messages', () => {
    const errors: ProgramError[] = [
      {id: 'syntaxError', line: 2, column: 3},
      {id: 'indentError', line: 2},
      {id: 'argumentError', line: 2},
      {id: 'undefinedVariable', line: 2, column: 3, variable: 'abc'},
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
      assert.strictEqual(messageOf(errors[3], 'en'), 'Line 2: abc has no value yet.');
      assert.strictEqual(messageOf(errors[0], 'hy-AM'), 'Շարահյուսական սխալ 2-րդ տողում։');
      languages.forEach(language => {
        errors.forEach(error => assert.doesNotMatch(messageOf(error, language), /\{\w+\}/, `${language}: ${error.id}`));
      });
    });

    it('an unknown language gets the English message', () => {
      assert.strictEqual(messageOf({id: 'timeout'}, 'xx'), messageOf({id: 'timeout'}, 'en'));
    });
  });
});
