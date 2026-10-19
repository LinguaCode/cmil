//packages
const assert = require('node:assert');
const {describe, it} = require('node:test');

const translator = require('../src/translator');

const conversions = [{
  name: 'simple function',
  text: 'տպել("բարեւ")',
  code: '@output("բարեւ")'
}, {
  name: 'with content',
  text: 'եթե (4 > 2)\n    տպել("բարեւ")',
  code: '@if (4 > 2)\n    @output("բարեւ")'
}];

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
});
