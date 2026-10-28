//packages
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {commandsOf, languages, quotesOf, segmentsOf, translate, warningsOf} from '../src/index.ts';
import {COMMAND} from '../src/constants/index.ts';
import successes from './collection/successes/index.ts';
import type {Case, Source} from './collection/types.ts';

const casesOf = (sources: Source[]): Case[] =>
  sources.flatMap(source => ('sources' in source ? casesOf(source.sources) : [source]));

describe('editor', () => {
  describe('segmentsOf', () => {
    it('splits a line into the parts an editor colors', () => {
      assert.deepStrictEqual(segmentsOf('print(1.5 + x) # hi', 'en'), [
        {type: 'keyword', text: 'print', command: 'print'},
        {type: 'operator', text: '('},
        {type: 'number', text: '1.5'},
        {type: 'space', text: ' '},
        {type: 'operator', text: '+'},
        {type: 'space', text: ' '},
        {type: 'name', text: 'x'},
        {type: 'operator', text: ')'},
        {type: 'space', text: ' '},
        {type: 'comment', text: '# hi'}
      ]);
    });

    it('splits a text with code into its texts, its braces and its code', () => {
      assert.deepStrictEqual(
        segmentsOf('print("Hi, {name}!")', 'en').map(({type, text}) => `${type}:${text}`),
        [
          'keyword:print',
          'operator:(',
          'string:"Hi, ',
          'operator:{',
          'name:name',
          'operator:}',
          'string:!"',
          'operator:)'
        ]
      );
    });

    it('reads the texts and numbers of the language, and marks the rest as other', () => {
      assert.deepStrictEqual(
        segmentsOf('արտածել(«ա» >= 2․5, 1x @)', 'hy-AM').map(({type, text}) => `${type}:${text}`),
        [
          'keyword:արտածել',
          'operator:(',
          'string:«ա»',
          'space: ',
          'operator:>=',
          'space: ',
          'number:2․5',
          'operator:,',
          'space: ',
          'other:1x',
          'space: ',
          'other:@',
          'operator:)'
        ]
      );
    });

    it('makes up every line of the spec programs in every language', () => {
      const programs = casesOf(successes).map(source => source.code || '');
      languages.forEach(language => {
        programs.forEach(program => {
          translate(program, 'en', language)
            .split('\n')
            .forEach(line => {
              const segments = segmentsOf(line, language);
              assert.strictEqual(segments.map(({text}) => text).join(''), line, `${language}: ${line}`);
            });
        });
      });
    });
  });

  describe('commandsOf', () => {
    it('gives every command of every language its words and its kind', () => {
      languages.forEach(language => {
        const commands = commandsOf(language);
        assert.deepStrictEqual(commands.map(({command}) => command).sort(), Object.values(COMMAND).sort());
        commands.forEach(({words, kind}) => {
          assert.ok(words.length, language);
          assert.ok(['block', 'statement', 'part', 'operator', 'value', 'function'].includes(kind), language);
        });
      });
      assert.deepStrictEqual(
        commandsOf('hy-AM').find(({command}) => command === 'if'),
        {command: 'if', words: ['եթե'], kind: 'block'}
      );
    });
  });

  describe('quotesOf', () => {
    it('gives the main quotes of a language first, then the others it reads', () => {
      assert.deepStrictEqual(quotesOf('de'), [
        ['„', '“'],
        ['»', '«'],
        ['"', '"'],
        ["'", "'"],
        ['«', '»']
      ]);
      assert.deepStrictEqual(quotesOf('hy-AM'), [
        ['«', '»'],
        ['"', '"'],
        ["'", "'"]
      ]);
    });

    it('rejects an unknown language', () => {
      assert.throws(() => quotesOf('xx'), /Unknown language: xx/);
      assert.throws(() => segmentsOf('', 'xx'), /Unknown language: xx/);
      assert.throws(() => commandsOf('xx'), /Unknown language: xx/);
      assert.throws(() => warningsOf('', 'xx'), /Unknown language: xx/);
    });
  });

  describe('warningsOf', () => {
    it('warns about a text that holds a number and is compared, which an answer never equals', () => {
      assert.deepStrictEqual(warningsOf('pin = input()\nwhile pin != "1234"\n    pin = input()', 'en'), [
        {id: 'numberText', line: 2, column: 14, text: '"1234"', number: '1234'}
      ]);
      assert.deepStrictEqual(warningsOf('if "7" == x or x == « -2.5 » # 3\n    print(x)', 'en'), [
        {id: 'numberText', line: 1, column: 4, text: '"7"', number: '7'},
        {id: 'numberText', line: 1, column: 21, text: '« -2.5 »', number: '-2.5'}
      ]);
      assert.deepStrictEqual(warningsOf('արտածել(պատասխան == «5»)', 'hy-AM'), [
        {id: 'numberText', line: 1, column: 21, text: '«5»', number: '5'}
      ]);
    });

    it("doesn't warn about a text that isn't a number as an answer is, isn't compared, or isn't closed", () => {
      assert.deepStrictEqual(
        warningsOf(
          'if x == "yes" or x == 7 or "1" + x == "12a" or x == "0x10" or x == ""\n    print("1") # == "2"',
          'en'
        ),
        []
      );
      assert.deepStrictEqual(warningsOf('if x == "1{y}"\n    print(x)', 'en'), []);
      assert.deepStrictEqual(warningsOf('print(x == "12', 'en'), []);
    });
  });
});
