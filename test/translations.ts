//packages
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {describe, it} from 'node:test';

import translations from '../src/translations/index.ts';
import CodeSubmit, {languages, type SessionEnd} from '../src/index.ts';
import {DOCS_PATH, translationsTable} from '../scripts/translations-table.ts';

const LANGUAGES_PATH = path.join(import.meta.dirname, '../src/translations/languages');

const commandsOf = (language: string) => translations[language].map(instance => instance.command).sort();

//the first word of a command in a language
const wordOf = (language: string, command: string) =>
  translations[language].find(instance => instance.command === command)?.definition.split('|')[0] ?? '';

const run = (code: string, language: string) =>
  new Promise<{output: string[]; result: SessionEnd}>(resolve => {
    const output: string[] = [];
    new CodeSubmit(code, language)
      .onOutput(text => output.push(text))
      .onInputRequest(() => {})
      .onSessionEnd(result => resolve({output, result}))
      .execute();
  });

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

      translations[language].forEach(({command, definition}) => {
        assert.ok(typeof definition === 'string' && definition.length, `${language}: ${command}`);
      });
    });

    it(`${language} gives every word one command`, () => {
      const commands = new Map<string, string>();
      translations[language].forEach(({command, definition}) => {
        definition.split('|').forEach(word => {
          const key = word.trim().toLowerCase();
          assert.ok(!commands.has(key) || commands.get(key) === command, `${key}: ${commands.get(key)} and ${command}`);
          commands.set(key, command);
        });
      });
    });

    it(`${language} runs its constants, booleans and ceil`, async () => {
      const word = (command: string) => wordOf(language, command);
      const lines = [
        `${word('@output')} ${word('@pi')} > 3`,
        `${word('@output')} ${word('@e')} > 2`,
        `${word('@output')} ${word('@true')} ${word('@and')} ${word('@not')} ${word('@false')}`,
        `${word('@output')} ${word('@ceil')}(1.2)`
      ];
      const {output, result} = await run(lines.join('\n'), language);
      assert.strictEqual(result.errorId, undefined, `${language}: ${JSON.stringify(result)}\n${lines.join('\n')}`);
      assert.deepStrictEqual(output, ['<true/>\n<true/>\n<true/>\n2']);
    });
  });
});
