//packages
const assert = require('node:assert');
const {describe, it} = require('node:test');

const CodeSubmit = require('../src');

/**
 * Runs a program and answers every input request synchronously from inputs.
 * Resolves with the output chunks and the result of the session end.
 */
const run = (code, inputs = [], language = 'en') => new Promise(resolve => {
  const chunks = [];
  const codeSubmit = new CodeSubmit(code, language);

  codeSubmit
    .onOutput(chunk => chunks.push(chunk))
    .onInputRequest(() => codeSubmit.inputEmitter(inputs.shift()))
    .onSessionEnd(result => resolve({chunks, result}))
    .execute();
});

describe('core', () => {
  describe('loops', () => {
    it('break leaves the innermost loop', async () => {
      const {chunks} = await run('repeat 3 times\n    a = 0\n    while 1 < 2\n        a = a + 1\n        if a == 2\n            break\n    output a');
      assert.deepStrictEqual(chunks, ['2\n2\n2']);
    });

    it('continue skips to the next iteration', async () => {
      const {chunks} = await run('a = 0\ndo\n    a = a + 1\n    if a == 2\n        continue\n    output a\nwhile a < 4');
      assert.deepStrictEqual(chunks, ['1\n3\n4']);
    });

    it('break outside a loop is a syntax error', async () => {
      const {result} = await run('output 1\nbreak');
      assert.deepStrictEqual(result, {errorId: 'syntaxError', param: {line: 2}});
    });
  });

  describe('structure', () => {
    it('an unexpected indent is an indent error', async () => {
      const {result} = await run('output 1\n    output 2');
      assert.deepStrictEqual(result, {errorId: 'indentError', param: {line: 2}});
    });

    it('a dedent to no open block is an indent error', async () => {
      const {result} = await run('if 1 < 2\n        output 1\n    output 2');
      assert.deepStrictEqual(result, {errorId: 'indentError', param: {line: 3}});
    });

    it('comments and blank lines are not indented', async () => {
      const {chunks, result} = await run('  # comment\n\n  \noutput "a # b"');
      assert.deepStrictEqual(chunks, ['a # b']);
      assert.strictEqual(result.errorId, undefined);
    });

    it('deeply nested expressions are a syntax error', async () => {
      const {result} = await run(`output ${'('.repeat(1000)}1${')'.repeat(1000)}`);
      assert.deepStrictEqual(result, {errorId: 'syntaxError', param: {line: 1}});
    });

    it('deeply nested blocks are a syntax error', async () => {
      const code = Array.from({length: 120}, (_, level) => `${'    '.repeat(level)}if 1 < 2`).join('\n');
      const {result} = await run(code);
      assert.strictEqual(result.errorId, 'syntaxError');
    });

    it('a math function with a wrong count of arguments', async () => {
      const {result} = await run('output power(2)');
      assert.deepStrictEqual(result, {errorId: 'functionArgumentSyntaxError', param: {line: 1}});
    });

    it('an unterminated text is a syntax error', async () => {
      const {result} = await run('x = 1\noutput "abc');
      assert.deepStrictEqual(result, {errorId: 'syntaxError', param: {line: 2}});
    });

    it('else with more words is a syntax error', async () => {
      const {result} = await run('if 1 < 2\n    output 1\nelse 5');
      assert.deepStrictEqual(result, {errorId: 'syntaxError', param: {line: 3}});
    });

    it('a statement starting with a value is a syntax error', async () => {
      const {result} = await run('5 + 5');
      assert.deepStrictEqual(result, {errorId: 'syntaxError', param: {line: 1}});
    });

    it('remainder', async () => {
      const {chunks} = await run('output 17 % 5');
      assert.deepStrictEqual(chunks, ['2']);
    });
  });

  describe('memory', () => {
    it('a too long input', async () => {
      const {result} = await run('input x', ['a'.repeat(1000001)]);
      assert.deepStrictEqual(result, {errorId: 'memoryLimit', param: {line: 1}});
    });

    it('too much output waiting to be sent', async () => {
      const {chunks, result} = await run('x = "a"\nrepeat 19 times\n    x = x + x\nrepeat 20 times\n    output x');
      assert.deepStrictEqual(result, {errorId: 'memoryLimit', param: {line: 5}});
      assert.strictEqual(chunks.join('\n').length, 19 * (524288 + 1) - 1);
    });
  });

  describe('input and output', () => {
    it('inputs answered inside the request callback', async () => {
      const inputs = Array.from({length: 2000}, (_, index) => index);
      const {chunks, result} = await run('s = 0\nrepeat 2000 times\n    input n\n    s = s + n\noutput s', inputs);
      assert.deepStrictEqual(chunks, ['1999000']);
      assert.strictEqual(result.errorId, undefined);
    });

    it('an empty input is requested again', async () => {
      const {chunks} = await run('input x\noutput x', ['', 'a']);
      assert.deepStrictEqual(chunks, ['a']);
    });

    it('output is sent once per pause', async () => {
      const {chunks} = await run('output 1\noutput 2\ninput x\noutput x', ['3']);
      assert.deepStrictEqual(chunks, ['1\n2', '3']);
    });

    it('empty text is not printed', async () => {
      const {chunks} = await run('output ""\noutput 1');
      assert.deepStrictEqual(chunks, ['1']);
    });
  });

  it('an unknown language is rejected', () => {
    assert.throws(() => new CodeSubmit('output 1', 'xx').execute(), /Language was not specified/);
  });
});
