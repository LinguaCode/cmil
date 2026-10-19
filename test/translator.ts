//packages
import assert from 'node:assert';
import {describe, it} from 'node:test';

import * as translator from '../src/translator/index.ts';
import {translate} from '../src/index.ts';

const conversions = [
  {
    name: 'simple function',
    text: 'տպել("բարեւ")',
    code: '@output("բարեւ")'
  },
  {
    name: 'with content',
    text: 'եթե (4 > 2)\n    տպել("բարեւ")',
    code: '@if (4 > 2)\n    @output("բարեւ")'
  }
];

describe('translator', () => {
  conversions.forEach(({name, text, code}) => {
    it(`${name}: text to code and back`, () => {
      assert.strictEqual(translator.toCode(text, 'hy-AM'), code);
      assert.strictEqual(translator.toText(code, 'hy-AM'), text);
    });
  });

  it('translates hy-AM to ru', () => {
    assert.strictEqual(translator.translate('տպել("բարեւ")', 'hy-AM', 'ru'), 'вывести("բարեւ")');
  });

  it('rejects an unknown language', () => {
    assert.throws(() => translator.toCode('x', 'xx'), /Language was not specified/);
  });

  describe('translate', () => {
    const program = 'input name\nif name == "Ani" then\n    output "output " + name\nelse\n    output name';

    it('translates commands and keeps texts and names', () => {
      assert.strictEqual(
        translate(program, 'en', 'hy-AM'),
        'մուտքագրել name\nեթե name == "Ani" ապա\n    տպել "output " + name\nայլապես\n    տպել name'
      );
    });

    it('translates back to the same program', () => {
      assert.strictEqual(translate(translate(program, 'en', 'ru'), 'ru', 'en'), program);
    });

    it('rejects an unknown language', () => {
      assert.throws(() => translate(program, 'en', 'xx'), /Unknown language: xx/);
      assert.throws(() => translate(program, 'constructor', 'en'), /Unknown language: constructor/);
    });
  });
});
