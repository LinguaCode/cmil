//packages
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {commandsOf, languages, quotesOf, segmentsOf, translate} from '../src/index.ts';
import {COMMAND} from '../src/constants/index.ts';
import successes from './collection/successes/index.ts';
import type {Case, Source} from './collection/types.ts';

const casesOf = (sources: Source[]): Case[] =>
  sources.flatMap(source => ('sources' in source ? casesOf(source.sources) : [source]));

describe('editor', () => {
  describe('segmentsOf', () => {
    it('splits a line into the parts an editor colors', () => {
      assert.deepStrictEqual(segmentsOf('print 1.5 + x # hi', 'en'), [
        {type: 'keyword', text: 'print', command: 'print'},
        {type: 'space', text: ' '},
        {type: 'number', text: '1.5'},
        {type: 'space', text: ' '},
        {type: 'operator', text: '+'},
        {type: 'space', text: ' '},
        {type: 'name', text: 'x'},
        {type: 'space', text: ' '},
        {type: 'comment', text: '# hi'}
      ]);
    });

    it('reads the texts and numbers of the language, and marks the rest as other', () => {
      assert.deepStrictEqual(
        segmentsOf('տպել «ա» >= 2․5, 1x @', 'hy-AM').map(({type, text}) => `${type}:${text}`),
        [
          'keyword:տպել',
          'space: ',
          'string:«ա»',
          'space: ',
          'operator:>=',
          'space: ',
          'number:2․5',
          'operator:,',
          'space: ',
          'other:1x',
          'space: ',
          'other:@'
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
    });
  });
});
