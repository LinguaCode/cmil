//packages
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const {describe, it} = require('node:test');

const translations = require('../src/translations');

const LANGUAGES_PATH = path.join(__dirname, '../src/translations/languages');

const commandsOf = language => translations[language].map(instance => instance.command).sort();

describe('translations', () => {
  it('index lists every language file', () => {
    const files = fs.readdirSync(LANGUAGES_PATH).map(file => path.basename(file, '.js')).sort();

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
