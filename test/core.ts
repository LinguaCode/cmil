//packages
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {Session, check, languages, messageOf, type ProgramError, type Step} from '../src/index.ts';
import translations, {type Plural} from '../src/translations/index.ts';
import {ERROR, MAX_LIST_LENGTH, MAX_RECURSION} from '../src/constants/index.ts';
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
        'repeat 3 times\n    a = 0\n    while 1 < 2\n        a = a + 1\n        if a == 2\n            break\n    print(a)'
      );
      assert.deepStrictEqual(output, ['2', '2', '2']);
    });

    it('continue skips to the next iteration', () => {
      const {output} = run('a = 0\ndo\n    a = a + 1\n    if a == 2\n        continue\n    print(a)\nwhile a < 4');
      assert.deepStrictEqual(output, ['1', '3', '4']);
    });

    it('break outside a loop is a syntax error', () => {
      assert.deepStrictEqual(run('print(1)\nbreak').error, {id: 'syntaxError', line: 2, column: 1});
    });
  });

  describe('structure', () => {
    it('an unexpected indent is an indent error', () => {
      assert.deepStrictEqual(run('print(1)\n    print(2)').error, {id: 'indentError', line: 2});
    });

    it('a dedent to no open block is an indent error', () => {
      assert.deepStrictEqual(run('if 1 < 2\n        print(1)\n    print(2)').error, {id: 'indentError', line: 3});
    });

    it('comments and blank lines are not indented', () => {
      const {output, error} = run('  # comment\n\n  \nprint("a # b")');
      assert.deepStrictEqual(output, ['a # b']);
      assert.strictEqual(error, undefined);
    });

    it('deeply nested expressions are a syntax error', () => {
      assert.strictEqual(run(`print(${'('.repeat(1000)}1${')'.repeat(1000)})`).error?.id, 'syntaxError');
    });

    it('deeply nested blocks are a syntax error', () => {
      const code = Array.from({length: 120}, (_, level) => `${'    '.repeat(level)}if 1 < 2`).join('\n');
      assert.strictEqual(run(code).error?.id, 'syntaxError');
    });

    it('a function of the language with a wrong count of arguments, or without its parentheses', () => {
      const error = {id: 'argumentError', line: 1, column: 7, function: 'power', min: 2, max: 2};
      assert.deepStrictEqual(run('print(power(2))').error, error);
      assert.deepStrictEqual(run('print(power 2, 3)').error, error);
      assert.deepStrictEqual(run('print(round(1, 2, 3))').error, {...error, function: 'round', min: 1, max: 2});
    });

    it('a function of the program with a wrong count of arguments, or without its parentheses', () => {
      const program = 'function f(a)\n    return a\n';
      assert.deepStrictEqual(run(`${program}print(f(1, 2))`).error, {
        id: 'argumentError',
        line: 3,
        column: 7,
        function: 'f',
        min: 1,
        max: 1
      });
      assert.deepStrictEqual(run(`${program}x = f(1`).error, {id: 'syntaxError', line: 3, column: 5});
      assert.deepStrictEqual(run(`${program}x = f 1`).error, {id: 'syntaxError', line: 3, column: 7});
    });

    it('an unterminated text is a syntax error', () => {
      assert.deepStrictEqual(run('x = 1\nprint("abc').error, {id: 'syntaxError', line: 2, column: 7});
    });

    it('else with more words is a syntax error', () => {
      assert.deepStrictEqual(run('if 1 < 2\n    print(1)\nelse 5').error, {id: 'syntaxError', line: 3, column: 6});
    });

    it('a statement starting with a value is a syntax error', () => {
      assert.deepStrictEqual(run('5 + 5').error, {id: 'syntaxError', line: 1, column: 1});
    });

    it('remainder', () => {
      assert.deepStrictEqual(run('print(17 % 5)').output, ['2']);
    });
  });

  describe('columns', () => {
    it('point at the token of the error, counting the indentation', () => {
      assert.deepStrictEqual(run('if 1 < 2\n    print(1 +* 2)').error, {id: 'syntaxError', line: 2, column: 14});
      assert.deepStrictEqual(run('print(1x)').error, {id: 'syntaxError', line: 1, column: 8});
      assert.deepStrictEqual(run('print(1 & 2)').error, {id: 'syntaxError', line: 1, column: 9});
      assert.deepStrictEqual(run('x = (1').error, {id: 'syntaxError', line: 1});
    });

    it('point at print, add and remove when they get another count of values or no parentheses', () => {
      const print = {id: 'argumentError', line: 1, column: 1, function: 'print', min: 1, max: 1};
      assert.deepStrictEqual(run('print("Fruits:", 3 + 5)').error, print);
      assert.deepStrictEqual(run('print(2,5)').error, print);
      assert.deepStrictEqual(run('print "Hi"').error, print);
      assert.deepStrictEqual(run('print(1').error, print);
      assert.deepStrictEqual(run('արտածել(«Միրգ՝», 8)', [], 'hy-AM').error, {...print, function: 'արտածել'});
      assert.deepStrictEqual(run('a = []\nadd 1 into a').error, {...print, line: 2, function: 'add', min: 2, max: 2});
      assert.deepStrictEqual(run('a = [1]\nREMOVE(a)').error, {...print, line: 2, function: 'REMOVE', min: 2, max: 2});
    });

    it('point at a value after the parentheses of print', () => {
      assert.deepStrictEqual(run('print("a") + "b"').error, {id: 'syntaxError', line: 1, column: 12});
      assert.deepStrictEqual(run('print(1)[1]').error, {id: 'syntaxError', line: 1, column: 9});
    });

    it('point at print, add and remove used as a value, before the program runs', () => {
      assert.deepStrictEqual(check('x = print(1)', 'en'), {id: 'noValue', line: 1, column: 5, function: 'print'});
      assert.deepStrictEqual(check('a = []\nprint(add(a, 1))', 'en'), {
        id: 'noValue',
        line: 2,
        column: 7,
        function: 'add'
      });
      assert.deepStrictEqual(check('x = 1 + արտածել(1)', 'hy-AM'), {
        id: 'noValue',
        line: 1,
        column: 9,
        function: 'արտածել'
      });
    });

    it('point at an undefined variable', () => {
      assert.deepStrictEqual(run('a = 1\nprint(a + b)').error, {
        id: 'undefinedVariable',
        line: 2,
        column: 11,
        variable: 'b'
      });
    });
  });

  describe('values', () => {
    it("an error of a value names its operator in the program's language, at its column", () => {
      assert.deepStrictEqual(run('print(1 + true)').error, {id: 'typeError', line: 1, column: 9, operator: '+'});
      assert.deepStrictEqual(run('արտածել(ոչ 5)', [], 'hy-AM').error, {
        id: 'typeError',
        line: 1,
        column: 9,
        operator: 'ոչ'
      });
      assert.deepStrictEqual(run('print(square_root(-4))').error, {
        id: 'mathError',
        line: 1,
        column: 7,
        operator: 'square_root'
      });
      assert.deepStrictEqual(run('print(1 / 0)').error, {id: 'divisionByZero', line: 1, column: 9});
      assert.deepStrictEqual(run('repeat "a" times\n    print(1)').error, {
        id: 'typeError',
        line: 1,
        operator: 'repeat'
      });
    });

    it('booleans print in the words of the language', () => {
      assert.deepStrictEqual(run('արտածել(1 < 2)', [], 'hy-AM').output, ['ճիշտ']);
      assert.deepStrictEqual(run('вывести("x: " + (1 > 2))', [], 'ru').output, ['x: ложь']);
    });

    it('and and or skip their right side when the left one decides', () => {
      assert.deepStrictEqual(run('print(false and x)\nprint(true or x)').output, ['false', 'true']);
    });
  });

  describe('lists', () => {
    it('an indexError points at the [ of its index, with the index', () => {
      assert.deepStrictEqual(run('a = [1]\nprint(a[2])').error, {id: 'indexError', line: 2, column: 8, index: 2});
      assert.deepStrictEqual(run('a = [1]\na[0] = 5').error, {id: 'indexError', line: 2, column: 2, index: 0});
      assert.deepStrictEqual(run('print([1, 2, 3][0.1 * 3 * 10])').output, ['3']);
    });

    it("an error of a list names its operator in the program's language", () => {
      assert.deepStrictEqual(run('print(5[1])').error, {id: 'typeError', line: 1, column: 8, operator: '[]'});
      assert.deepStrictEqual(run('ավելացնել(5, 1)', [], 'hy-AM').error, {
        id: 'typeError',
        line: 1,
        operator: 'ավելացնել'
      });
      assert.deepStrictEqual(run('հեռացնել(5, 1)', [], 'hy-AM').error, {
        id: 'typeError',
        line: 1,
        operator: 'հեռացնել'
      });
      assert.deepStrictEqual(run('յուրաքանչյուր x մեջ 5\n    արտածել(x)', [], 'hy-AM').error, {
        id: 'typeError',
        line: 1,
        operator: 'մեջ'
      });
      assert.deepStrictEqual(run('արտածել(1 մեջ 5)', [], 'hy-AM').error, {
        id: 'typeError',
        line: 1,
        column: 11,
        operator: 'մեջ'
      });
    });

    it('an itemError prints the item as in a list of the language', () => {
      assert.deepStrictEqual(run('զ = [1]\nհեռացնել(զ, «ա»)', [], 'hy-AM').error, {
        id: 'itemError',
        line: 2,
        item: '«ա»'
      });
      assert.deepStrictEqual(run('b = [1]\nremove(b, [2])').error, {id: 'itemError', line: 2, item: '[2]'});
    });

    it('booleans and texts in a list print in the words and quotes of the language', () => {
      assert.deepStrictEqual(run('արտածել([ճիշտ, սխալ, "ա"])', [], 'hy-AM').output, ['[ճիշտ, սխալ, «ա»]']);
    });

    it('lists inside themselves compare', () => {
      const code = 'a = [1]\nadd(a, a)\nb = [1]\nadd(b, b)\nc = [2]\nadd(c, c)\nprint(a == b)\nprint(a == c)';
      assert.deepStrictEqual(run(code).output, ['true', 'false']);
    });

    it('deep lists print and compare without overflowing the stack', () => {
      const code =
        'x = []\ny = []\nrepeat 100000 times\n    x = [x]\n    y = [y]\nprint(x == y)\nprint(length_of(to_text(x)))';
      assert.deepStrictEqual(run(code).output, ['true', '200002']);
    });

    it('a list shared many times is printed until its text is too long', () => {
      const {error} = run(
        'b = []\nrepeat 40 times\n    b = [b, b]\nprint(b == b)\nprint(length_of(b))\nprint(to_text(b))'
      );
      assert.deepStrictEqual(error, {id: 'memoryLimit', line: 6});
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

  describe('functions', () => {
    it('a function waits for input like the program', () => {
      const {steps} = run(
        'function ask(q)\n    print(q)\n    a = input()\n    return a\nprint(ask("A?") + ask("B?"))',
        [1, 2]
      );
      assert.deepStrictEqual(steps, [
        {state: 'input', output: ['A?']},
        {state: 'input', output: ['B?']},
        {state: 'end', output: ['3']}
      ]);
    });

    it(`calls nest up to ${MAX_RECURSION} deep`, () => {
      const code = (n: number) =>
        `function down(n)\n    if n == 1\n        return 1\n    return down(n - 1) + 1\nprint(down(${n}))`;
      assert.deepStrictEqual(run(code(MAX_RECURSION)).output, [String(MAX_RECURSION)]);
      assert.deepStrictEqual(run(code(MAX_RECURSION + 1)).error, {id: 'recursionLimit', line: 4});
    });

    it('noValue and undefinedFunction point at the call', () => {
      assert.deepStrictEqual(run('function f()\n    x = 1\nprint(1 + f())').error, {
        id: 'noValue',
        line: 3,
        column: 11,
        function: 'f'
      });
      assert.deepStrictEqual(check('print(1)\nprint(Double(2))', 'en'), {
        id: 'undefinedFunction',
        line: 2,
        column: 7,
        function: 'double'
      });
    });

    it('the calls of a program are checked in the order of its lines', () => {
      const code = 'function f()\n    return g()\nif true\n    print(h())\nelse\n    print(f())';
      assert.deepStrictEqual(check(code, 'en'), {id: 'undefinedFunction', line: 2, column: 12, function: 'g'});
      assert.deepStrictEqual(check('do\n    print(a())\nwhile b()', 'en'), {
        id: 'undefinedFunction',
        line: 2,
        column: 11,
        function: 'a'
      });
    });

    it('a function runs with its own loops', () => {
      const code =
        'function total(n)\n    sum = 0\n    repeat n times\n        sum = sum + n\n    return sum\nrepeat 2 times\n    print(total(3))';
      assert.deepStrictEqual(run(code).output, ['9', '9']);

      //each call counts the passes of its own loop
      const tree =
        'function leaves(depth)\n    if depth == 0\n        return 1\n    sum = 0\n    for branch in [1, 2]\n        repeat 2 times\n            sum = sum + leaves(depth - 1)\n    return sum\nprint(leaves(3))';
      assert.deepStrictEqual(run(tree).output, ['64']);
    });
  });

  describe('memory', () => {
    it('a too long input', () => {
      assert.deepStrictEqual(run('x = input()', ['a'.repeat(1000001)]).error, {id: 'memoryLimit', line: 1});
    });

    it('too much output in one step', () => {
      const {output, error} = run('x = "a"\nrepeat 19 times\n    x = x + x\nrepeat 20 times\n    print(x)');
      assert.deepStrictEqual(error, {id: 'memoryLimit', line: 5});
      assert.strictEqual(output.join('\n').length, 19 * (524288 + 1) - 1);
    });
  });

  describe('input and output', () => {
    it('many inputs', () => {
      const inputs = Array.from({length: 2000}, (_, index) => index);
      const {output, error} = run('s = 0\nrepeat 2000 times\n    n = input()\n    s = s + n\nprint(s)', inputs);
      assert.deepStrictEqual(output, ['1999000']);
      assert.strictEqual(error, undefined);
    });

    it('an empty input is asked for again', () => {
      const {steps} = run('x = input()\nprint(x)', ['', 'a']);
      assert.deepStrictEqual(steps, [
        {state: 'input', output: []},
        {state: 'input', output: []},
        {state: 'end', output: ['a']}
      ]);
    });

    it('every step returns the lines printed since the last one', () => {
      const {steps} = run('print(1)\nprint(2)\nx = input()\nprint(x)', ['3']);
      assert.deepStrictEqual(steps, [
        {state: 'input', output: ['1', '2']},
        {state: 'end', output: ['3']}
      ]);
    });

    it('an input only reads: its question is printed before it', () => {
      const session = new Session('print("Your name?")\nname = input()\nprint("Hi " + name)\nage = input()', 'en');
      assert.deepStrictEqual(session.run(), {state: 'input', output: ['Your name?']});
      assert.deepStrictEqual(session.input(''), {state: 'input', output: []});
      assert.deepStrictEqual(session.input('Ani'), {state: 'input', output: ['Hi Ani']});
    });

    it('input takes no value, and its answer is stored with =', () => {
      const input = {id: 'argumentError', line: 1, column: 8, function: 'input', min: 0, max: 0};
      assert.deepStrictEqual(check('name = input("Your name?")', 'en'), input);
      assert.deepStrictEqual(check('name = input', 'en'), input);
      assert.deepStrictEqual(check('անուն = մուտքագրել(«Անուն՞»)', 'hy-AM'), {
        ...input,
        column: 9,
        function: 'մուտքագրել'
      });
      assert.deepStrictEqual(check('input name', 'en'), {id: 'syntaxError', line: 1, column: 1});
      assert.deepStrictEqual(check('input()', 'en'), {id: 'syntaxError', line: 1, column: 1});
    });

    it('an input stops its line, which goes on with the values it computed before', () => {
      const code = 'function count()\n    print("call")\n    return 1\nprint(count() + input() + count() + input())';
      const session = new Session(code, 'en');
      assert.deepStrictEqual(session.run(), {state: 'input', output: ['call']});
      assert.deepStrictEqual(session.input(10), {state: 'input', output: ['call']});
      assert.deepStrictEqual(session.input(100), {state: 'end', output: ['112']});
    });

    it('= in an expression points at the =', () => {
      assert.deepStrictEqual(run('x = 5\nif x = 5\n    print(1)').error, {id: 'equalsError', line: 2, column: 6});
    });

    it('a text with a new line is one line of output', () => {
      assert.deepStrictEqual(run('print("a\\nb")').output, ['a\nb']);
    });

    it('an empty text prints an empty line', () => {
      assert.deepStrictEqual(run('print("")\nprint(1)').output, ['', '1']);
    });
  });

  describe('session', () => {
    it('an unknown language ends the session with unknownLanguage', () => {
      for (const language of ['xx', 'constructor']) {
        assert.deepStrictEqual(new Session('print(1)', language).run(), {
          state: 'end',
          output: [],
          error: {id: 'unknownLanguage', language}
        });
      }
    });

    it('input before run() is a mistake of the caller', () => {
      assert.throws(() => new Session('x = input()', 'en').input('a'), /Call run\(\) before input\(\)/);
    });

    it('run() again, and input after the end, return the state without output', () => {
      const session = new Session('name = input()\nprint(name)', 'en');
      assert.deepStrictEqual(session.run(), {state: 'input', output: []});
      assert.deepStrictEqual(session.run(), {state: 'input', output: []});
      assert.deepStrictEqual(session.input('Ani'), {state: 'end', output: ['Ani']});
      assert.deepStrictEqual(session.input('again'), {state: 'end', output: []});
    });

    it('the error stays with the ended session', () => {
      const session = new Session('print(1)\nprint(x)', 'en');
      const error = {id: 'undefinedVariable', line: 2, column: 7, variable: 'x'};
      assert.deepStrictEqual(session.run(), {state: 'end', output: ['1'], error});
      assert.deepStrictEqual(session.run(), {state: 'end', output: [], error});
    });

    it('stop ends a session waiting for input', () => {
      const session = new Session('name = input()\nprint(name)', 'en');
      session.run();
      session.stop();
      assert.deepStrictEqual(session.input('Ani'), {state: 'end', output: []});
    });

    it('maxSteps counts each step on its own', () => {
      const code = 'repeat 3 times\n    x = input()\n    n = 0\n    while n < 20\n        n = n + 1\n    print(x)';
      const session = new Session(code, 'en', {maxSteps: 100});
      session.run();
      assert.deepStrictEqual(session.input(1), {state: 'input', output: ['1']});
      assert.deepStrictEqual(session.input(2), {state: 'input', output: ['2']});

      //a pass of the loop takes about 65 steps
      const tight = new Session(code, 'en', {maxSteps: 50});
      tight.run();
      assert.deepStrictEqual(tight.input(1), {state: 'end', output: [], error: {id: 'timeout'}});
    });

    it('random() is made from the numbers of the random option', () => {
      //the same numbers each time: 0, 0.5, 0.99, 0, 0.5, …
      const numbers = () => {
        let call = 0;
        return () => [0, 0.5, 0.99][call++ % 3];
      };
      const code = 'repeat 4 times\n    print(random(1, 6))\nprint(random(10))';
      const first = new Session(code, 'en', {random: numbers()}).run();
      assert.deepStrictEqual(first, {state: 'end', output: ['1', '4', '6', '1', '5']});
      assert.deepStrictEqual(new Session(code, 'en', {random: numbers()}).run(), first);
    });

    it('the state of a session is private', () => {
      assert.deepStrictEqual(Object.keys(new Session('print(1)', 'en')), []);
    });
  });

  describe('check', () => {
    it('returns null for a program without errors before it runs', () => {
      assert.strictEqual(check('x = input()\nprint(y)', 'en'), null);
    });

    it('returns the first syntax, indentation, argument or language error', () => {
      assert.deepStrictEqual(check('print(1)\nprint(', 'en'), {id: 'syntaxError', line: 2});
      assert.deepStrictEqual(check('print(1)\n  output 2', 'en'), {id: 'indentError', line: 2});
      assert.deepStrictEqual(check('print(SIN(1, 2))', 'en'), {
        id: 'argumentError',
        line: 1,
        column: 7,
        function: 'SIN',
        min: 1,
        max: 1
      });
      assert.deepStrictEqual(check('print(1)', 'xx'), {id: 'unknownLanguage', language: 'xx'});
    });
  });

  describe('messages', () => {
    const errors: ProgramError[] = [
      {id: 'syntaxError', line: 2, column: 3},
      {id: 'equalsError', line: 2, column: 3},
      {id: 'indentError', line: 2},
      {id: 'argumentError', line: 2, column: 3, function: 'power', min: 2, max: 2},
      {id: 'undefinedVariable', line: 2, column: 3, variable: 'abc'},
      {id: 'undefinedFunction', line: 2, column: 3, function: 'abc'},
      {id: 'noValue', line: 2, column: 3, function: 'abc'},
      {id: 'typeError', line: 2, column: 3, operator: '-'},
      {id: 'conditionError', line: 2},
      {id: 'divisionByZero', line: 2, column: 3},
      {id: 'mathError', line: 2, column: 3, operator: 'square_root'},
      {id: 'indexError', line: 2, column: 3, index: 5},
      {id: 'itemError', line: 2, item: '"a"'},
      {id: 'memoryLimit', line: 2},
      {id: 'recursionLimit', line: 2},
      {id: 'timeout'},
      {id: 'unknownLanguage', language: 'xx'}
    ];

    it('every error has a message in every language', () => {
      assert.deepStrictEqual(errors.map(({id}) => id).sort(), Object.values(ERROR).sort());
      languages.forEach(language => {
        assert.deepStrictEqual(Object.keys(translations[language].messages).sort(), Object.values(ERROR).sort());
      });
    });

    it('messages, and each of their plural forms, have the placeholders of the English ones', () => {
      const placeholders = (text: string) => (text.match(/\{\w+\}/g) || []).sort();
      const formsOf = (message: string | Plural) => (typeof message === 'string' ? [message] : Object.values(message));
      languages.forEach(language => {
        Object.values(ERROR).forEach(id => {
          const english = placeholders(formsOf(translations.en.messages[id])[0]);
          formsOf(translations[language].messages[id]).forEach(form => {
            assert.deepStrictEqual(placeholders(form), english, `${language}: ${id}`);
          });
        });
      });
    });

    it('a message takes the plural form of its count in the language', () => {
      const argumentError = (name: string, min: number, max: number): ProgramError => ({
        id: 'argumentError',
        line: 3,
        column: 7,
        function: name,
        min,
        max
      });
      assert.strictEqual(messageOf(argumentError('power', 2, 2), 'en'), 'Line 3: power takes 2 values.');
      assert.strictEqual(messageOf(argumentError('sin', 1, 1), 'en'), 'Line 3: sin takes 1 value.');
      assert.strictEqual(messageOf(argumentError('round', 1, 2), 'en'), 'Line 3: round takes 1–2 values.');
      assert.strictEqual(messageOf(argumentError('синус', 1, 1), 'ru'), 'Строка 3: синус принимает 1 значение.');
      assert.strictEqual(messageOf(argumentError('степень', 2, 2), 'ru'), 'Строка 3: степень принимает 2 значения.');
      assert.strictEqual(messageOf(argumentError('f', 5, 5), 'ru'), 'Строка 3: f принимает 5 значений.');
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
