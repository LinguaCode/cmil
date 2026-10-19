//packages
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {describe, it} from 'node:test';

import translations from '../src/translations/index.ts';

const LANGUAGES_PATH = path.join(import.meta.dirname, '../src/translations/languages');

const commandsOf = (language: string) => translations[language].map(instance => instance.command).sort();

describe('translations', () => {
  it('index lists every language file', () => {
    const files = fs
      .readdirSync(LANGUAGES_PATH)
      .map(file => path.basename(file, '.ts'))
      .sort();

    assert.deepStrictEqual(Object.keys(translations).sort(), files);
  });

  Object.keys(translations).forEach(language => {
    it(`${language} defines every command`, () => {
      assert.deepStrictEqual(commandsOf(language), commandsOf('en'));

      translations[language].forEach(({command, definition}) => {
        assert.ok(typeof definition === 'string' && definition.length, `${language}: ${command}`);
      });
    });
  });
});
