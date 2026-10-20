//packages
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {describe, it} from 'node:test';

import type {Command} from '../src/constants/index.ts';
import translations from '../src/translations/index.ts';
import {Session, languages} from '../src/index.ts';
import {DOCS_PATH, translationsTable} from '../scripts/translations-table.ts';

const LANGUAGES_PATH = path.join(import.meta.dirname, '../src/translations/languages');

const commandsOf = (language: string) => Object.keys(translations[language].words).sort();

//the first word of a command in a language
const wordOf = (language: string, command: Command) => translations[language].words[command][0];

const run = (code: string, language: string) => new Session(code, language).run();

describe('translations', () => {
  it('index lists every language file', () => {
    const files = fs
      .readdirSync(LANGUAGES_PATH)
      .map(file => path.basename(file, '.ts'))
      .sort();

    assert.deepStrictEqual(Object.keys(translations).sort(), files);
    assert.deepStrictEqual([...languages].sort(), files);
  });

  it('docs/translations.md is up to date, run npm run translations-table', () => {
    assert.strictEqual(fs.readFileSync(DOCS_PATH, 'utf8'), translationsTable());
  });

  Object.keys(translations).forEach(language => {
    it(`${language} defines every command`, () => {
      assert.deepStrictEqual(commandsOf(language), commandsOf('en'));

      Object.entries(translations[language].words).forEach(([command, words]) => {
        assert.ok(words.length, `${language}: ${command}`);
        words.forEach(word => assert.ok(word.trim() === word && word.length, `${language}: ${command}: '${word}'`));
      });
    });

    it(`${language} gives every word one command`, () => {
      const commands = new Map<string, string>();
      Object.entries(translations[language].words).forEach(([command, words]) => {
        words.forEach(word => {
          const key = word.toLowerCase();
          assert.ok(!commands.has(key) || commands.get(key) === command, `${key}: ${commands.get(key)} and ${command}`);
          commands.set(key, command);
        });
      });
    });

    it(`${language} runs its constants, booleans and ceil`, () => {
      const word = (command: Command) => wordOf(language, command);
      const lines = [
        `${word('print')} ${word('pi')} > 3`,
        `${word('print')} ${word('e')} > 2`,
        `${word('print')} ${word('true')} ${word('and')} ${word('not')} ${word('false')}`,
        `${word('print')} ${word('ceil')}(1.2)`
      ];
      const step = run(lines.join('\n'), language);
      const yes = word('true');
      assert.deepStrictEqual(step, {state: 'end', output: [yes, yes, yes, '2']}, lines.join('\n'));
    });
  });
});
