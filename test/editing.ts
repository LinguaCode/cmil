//packages
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {
  SEMANTIC_TOKEN_TYPES,
  check,
  completionsAt,
  languageOf,
  languages,
  problemsOf,
  segmentsOf,
  tokensOfProgram,
  translate
} from '../src/index.ts';
import successes from './collection/successes/index.ts';
import type {Case, Source} from './collection/types.ts';

const casesOf = (sources: Source[]): Case[] =>
  sources.flatMap(source => ('sources' in source ? casesOf(source.sources) : [source]));

//the text of each token, from its place in the program
const textsOf = (code: string, language: string) => {
  const lines = code.replace(/\r/g, '').split('\n');
  return tokensOfProgram(code, language).map(({line, character, length, type}) => ({
    text: lines[line].slice(character, character + length),
    type
  }));
};

describe('editing', () => {
  describe('tokensOfProgram', () => {
    it('gives each token its line and its character from 0, and its length', () => {
      assert.deepStrictEqual(tokensOfProgram('x = 1\nif x > pi\n    print(x) # one', 'en'), [
        {line: 0, character: 0, length: 1, type: 'variable', token: 'name'},
        {line: 0, character: 2, length: 1, type: 'operator', token: 'symbol'},
        {line: 0, character: 4, length: 1, type: 'number', token: 'number'},
        {line: 1, character: 0, length: 2, type: 'keyword', token: 'block'},
        {line: 1, character: 3, length: 1, type: 'variable', token: 'name'},
        {line: 1, character: 5, length: 1, type: 'operator', token: 'symbol'},
        {line: 1, character: 7, length: 2, type: 'enumMember', token: 'value'},
        {line: 2, character: 4, length: 5, type: 'function', token: 'function'},
        {line: 2, character: 9, length: 1, type: 'operator', token: 'symbol'},
        {line: 2, character: 10, length: 1, type: 'variable', token: 'name'},
        {line: 2, character: 11, length: 1, type: 'operator', token: 'symbol'},
        {line: 2, character: 13, length: 5, type: 'comment', token: 'comment'}
      ]);
    });

    it('counts characters in UTF-16 code units, and reads Windows line endings', () => {
      assert.deepStrictEqual(textsOf('print("😀 {x}") ; y\r\nարտածել(«Բարև»)', 'en'), [
        {text: 'print', type: 'function'},
        {text: '(', type: 'operator'},
        {text: '"😀 ', type: 'string'},
        {text: '{', type: 'operator'},
        {text: 'x', type: 'variable'},
        {text: '}', type: 'operator'},
        {text: '"', type: 'string'},
        {text: ')', type: 'operator'},
        {text: 'y', type: 'variable'},
        {text: 'արտածել', type: 'variable'},
        {text: '(', type: 'operator'},
        {text: '«Բարև»', type: 'string'},
        {text: ')', type: 'operator'}
      ]);
      assert.deepStrictEqual(tokensOfProgram('print("😀") x', 'en').at(-1), {
        line: 0,
        character: 12,
        length: 1,
        type: 'variable',
        token: 'name'
      });
    });

    it('gives the tokens of every spec program in every language in order and apart, each of a type of the legend', () => {
      const programs = casesOf(successes).map(source => source.code || '');
      languages.forEach(language => {
        programs.forEach(program => {
          const code = translate(program, 'en', language);
          const lines = code.split('\n');
          let last = {line: 0, end: 0};
          for (const {line, character, length, type} of tokensOfProgram(code, language)) {
            assert.ok(SEMANTIC_TOKEN_TYPES.includes(type), `${language}: ${type}`);
            assert.ok(length > 0 && character + length <= lines[line].length, `${language}: ${code}`);
            assert.ok(line > last.line || (line === last.line && character >= last.end), `${language}: ${code}`);
            last = {line, end: character + length};
          }
          //every character but spaces has a token
          const units = lines.map(line => line.split(''));
          tokensOfProgram(code, language).forEach(({line, character, length}) => {
            units[line].fill(' ', character, character + length);
          });
          assert.ok(
            units.every(line => !line.join('').trim()),
            `${language}: ${code}`
          );
        });
      });
    });

    it('has a legend of the types of the Language Server Protocol', () => {
      assert.ok(Object.isFrozen(SEMANTIC_TOKEN_TYPES));
      assert.deepStrictEqual(
        [...SEMANTIC_TOKEN_TYPES],
        ['keyword', 'function', 'variable', 'enumMember', 'string', 'number', 'comment', 'operator']
      );
    });
  });

  describe('problemsOf', () => {
    it('gives the first error, from its column to the end of its value, with its message', () => {
      assert.deepStrictEqual(problemsOf('x = 1\nx = power(1)', 'en'), [
        {
          from: {line: 1, character: 4},
          to: {line: 1, character: 12},
          severity: 'error',
          message: 'Line 2: power takes 2 values.'
        }
      ]);
    });

    it('marks the whole line of an error without a column, from its indentation', () => {
      assert.deepStrictEqual(problemsOf('if 1 < 2\n    x = (', 'en'), [
        {
          from: {line: 1, character: 4},
          to: {line: 1, character: 9},
          severity: 'error',
          message: 'Syntax error on line 2.'
        }
      ]);
    });

    it('gives the warnings of a program without errors, with the messages in another language', () => {
      assert.deepStrictEqual(problemsOf('արտածել(պատասխան == «5»)\r\nարտածել(«5» != 1)', 'hy-AM', 'en'), [
        {
          from: {line: 0, character: 20},
          to: {line: 0, character: 23},
          severity: 'warning',
          message:
            '«5» is a text: an answer like 5 is a number, and a number never equals a text. Write 5 without the quotes.'
        },
        {
          from: {line: 1, character: 8},
          to: {line: 1, character: 11},
          severity: 'warning',
          message:
            '«5» is a text: an answer like 5 is a number, and a number never equals a text. Write 5 without the quotes.'
        }
      ]);
    });

    it('has no problems for a program that runs', () => {
      assert.deepStrictEqual(problemsOf('print("Hi")', 'en'), []);
    });
  });

  describe('completionsAt', () => {
    it('completes the commands of the language and the names of the program, but not the name being typed', () => {
      const completions = completionsAt('count = 1\ntotal = count\nco', 'en', {line: 2, character: 2});
      assert.ok(completions.some(({label, kind}) => label === 'print' && kind === 'function'));
      assert.ok(completions.some(({label, kind}) => label === 'while' && kind === 'keyword'));
      assert.ok(completions.some(({label, kind}) => label === 'pi' && kind === 'constant'));
      assert.deepStrictEqual(
        completions.filter(({kind}) => kind === 'variable'),
        [
          {label: 'count', kind: 'variable'},
          {label: 'total', kind: 'variable'}
        ]
      );
    });

    it('completes the words of the program’s language', () => {
      const completions = completionsAt('ար', 'hy-AM', {line: 0, character: 2});
      assert.ok(completions.some(({label}) => label === 'արտածել'));
      assert.ok(!completions.some(({label}) => label === 'print'));
    });

    it('completes nothing inside a text or a comment', () => {
      assert.deepStrictEqual(completionsAt('print("pr', 'en', {line: 0, character: 9}), []);
      assert.deepStrictEqual(completionsAt('x = 1 # pr', 'en', {line: 0, character: 10}), []);
      assert.ok(completionsAt('print("pr") + pr', 'en', {line: 0, character: 16}).length);
    });
  });

  describe('languageOf', () => {
    it('finds the language whose commands a program uses most', () => {
      assert.strictEqual(languageOf('արտածել(«Բարև»)'), 'hy-AM');
      assert.strictEqual(languageOf('name = input()\nprint(name)', ['en', 'hy-AM']), 'en');
      assert.strictEqual(languageOf('# print\nx = "while"', ['en', 'hy-AM']), null);
    });

    it('finds no language for a tie', () => {
      assert.strictEqual(languageOf('print(1)\nարտածել(1)', ['en', 'hy-AM']), null);
    });

    //the programs that use a command
    const programs = casesOf(successes)
      .map(({code}) => code ?? '')
      .filter(code => code.split('\n').some(line => segmentsOf(line, 'en').some(({type}) => type === 'keyword')));
    languages.forEach(language => {
      it(`finds the language of every spec program in ${language}, or none when another writes it the same`, () => {
        programs.forEach(program => {
          const code = translate(program, 'en', language);
          const found = languageOf(code);
          if (found === language) return;
          assert.strictEqual(found, null, code);
          const twin = languages.some(
            other => other !== language && !check(code, other) && translate(code, language, other) === code
          );
          assert.ok(twin, code);
        });
      });
    });
  });
});
