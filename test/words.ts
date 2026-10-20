//packages
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {scan} from '../src/core/words.ts';
import translations from '../src/translations/index.ts';
import {Session, languages, translate} from '../src/index.ts';
import successes from './collection/successes/index.ts';
import errors from './collection/errors/index.ts';
import tutorials from './collection/tutorials.ts';
import type {Case, Source} from './collection/types.ts';

/**
 * Runs a program and answers every input request from inputs.
 * Returns the output and the error id and line of the session end, or 'no inputs left'.
 */
const run = (code: string, language: string, inputs: (string | number)[] = []) => {
  const queue = inputs.slice();
  const session = new Session(code, language);

  let step = session.run();
  let output = step.output;
  while (step.state === 'input' && queue.length) {
    step = session.input(queue.shift() as string | number);
    output = output.concat(step.output);
  }

  if (step.state === 'input') return {output, errorId: 'no inputs left', line: undefined};
  const {error} = step;
  return {output, errorId: error?.id, line: error && 'line' in error ? error.line : undefined};
};

const outputOf = (code: string, language: string) => {
  const {output, errorId} = run(code, language);
  assert.strictEqual(errorId, undefined, `${language}: ${code}`);
  return output.join('\n');
};

const casesOf = (sources: Source[]): Case[] =>
  sources.flatMap(source => ('sources' in source ? casesOf(source.sources) : [source]));

//the spec programs, without the timeouts, which take long and stop at a different point each time
const programs = [
  ...casesOf(successes).map(source => ({source, language: 'en'})),
  ...casesOf(errors).map(source => ({source, language: 'en'})),
  ...casesOf(tutorials).map(source => ({source, language: 'hy-AM'}))
].filter(({source}) => !source.skip && !source.todo && source.errorId !== 'timeout');

describe('words', () => {
  describe('scan', () => {
    it('splits a line into keywords, names, texts, a comment and the rest', () => {
      assert.deepStrictEqual(scan('output x + «output» # output', 'en'), [
        {type: 'keyword', command: 'output', text: 'output'},
        {type: 'other', text: ' '},
        {type: 'name', text: 'x'},
        {type: 'other', text: ' + '},
        {type: 'string', text: '«output»', value: 'output', closed: true},
        {type: 'other', text: ' '},
        {type: 'comment', text: '# output'}
      ]);
    });

    it('finds keywords next to operators', () => {
      assert.deepStrictEqual(scan('1<pi', 'en'), [
        {type: 'other', text: '1<'},
        {type: 'keyword', command: 'pi', text: 'pi'}
      ]);
    });

    it('reads a two-word keyword as one', () => {
      assert.deepStrictEqual(scan('e vërtetë', 'sq'), [{type: 'keyword', command: 'true', text: 'e vërtetë'}]);
    });

    Object.keys(translations).forEach(language => {
      it(`${language}: every word is its own keyword, in any case`, () => {
        Object.entries(translations[language].words).forEach(([command, words]) => {
          words.forEach(word => {
            for (const text of [word, word.toUpperCase()]) {
              assert.deepStrictEqual(scan(text, language), [{type: 'keyword', command, text}], `${language}: ${text}`);
            }
          });
        });
      });

      it(`${language}: a word with more letters is a name`, () => {
        Object.values(translations[language].words).forEach(words => {
          words.forEach(word => {
            const text = `${word.replace(/\s+/g, '_')}_x`;
            assert.deepStrictEqual(scan(text, language), [{type: 'name', text}], `${language}: ${text}`);
          });
        });
      });
    });
  });

  describe('programs', () => {
    it('keywords next to operators', () => {
      assert.strictEqual(outputOf('if 1<pi then\n    output 1', 'en'), '1');
      assert.strictEqual(outputOf('output 2>e', 'en'), '<false/>');
      assert.strictEqual(outputOf('x = true\noutput x!=true', 'en'), '<false/>');
      assert.strictEqual(outputOf('output(2*pi>6)', 'en'), '<true/>');
    });

    it('keywords that contain another keyword', () => {
      assert.strictEqual(outputOf('output square(3)\noutput square_root(16)', 'en'), '9\n4');
      assert.strictEqual(outputOf('výstup mocnina(2, 3)\nvýstup druhá_mocnina(3)', 'cs'), '8\n9');
      assert.strictEqual(
        outputOf('sortida arrodonir(2.5)\nsortida arrodonir_avall(2.5)\nsortida arrodonir_amunt(2.2)', 'ca'),
        '3\n2\n3'
      );
      assert.strictEqual(outputOf('uscita e_numero > 2 e vero', 'it'), '<true/>');
      assert.strictEqual(
        outputOf('вывести округлить(2.5)\nвывести округлить_вниз(2.5)\nвывести округлить_вверх(2.2)', 'ru'),
        '3\n2\n3'
      );
      assert.strictEqual(outputOf('izhod res\nizhod ni_res', 'sl'), '<true/>\n<false/>');
      assert.strictEqual(outputOf('izhod kvadrat(3)\nizhod kvadratni_koren(16)', 'sl'), '9\n4');
      assert.strictEqual(
        outputOf('shkruaj e vërtetë\nshkruaj e rreme\nshkruaj e > 2', 'sq'),
        '<true/>\n<false/>\n<true/>'
      );
    });

    it('two-word keywords, with any spaces between the words', () => {
      assert.strictEqual(outputOf('nëse e vërtetë atëherë\n    shkruaj 7', 'sq'), '7');
      assert.strictEqual(outputOf('nëse e  \tvërtetë atëherë\n    shkruaj 7', 'sq'), '7');
    });

    it('keywords in any case', () => {
      assert.strictEqual(outputOf('OUTPUT 5\nOutput Pi > 3', 'en'), '5\n<true/>');
      assert.strictEqual(outputOf('ՏՊԵԼ ՃԻՇՏ', 'hy-AM'), '<true/>');
    });

    it('words in texts and comments are not keywords', () => {
      assert.strictEqual(
        outputOf('output «output»\noutput "say \\"output\\" now"\noutput \'it\\\'s output\' # output 2', 'en'),
        'output\nsay "output" now\nit\'s output'
      );
    });

    it('names that contain a keyword', () => {
      assert.strictEqual(
        outputOf('output_x = 3\nx_output = 4\noutputx = 5\noutput output_x + x_output + outputx', 'en'),
        '12'
      );
    });

    it('a number joined to a word is a syntax error', () => {
      assert.deepStrictEqual(run('output 2pi', 'en'), {output: [], errorId: 'syntaxError', line: 1});
    });

    it('@ is not part of the language', () => {
      assert.deepStrictEqual(run('@output 1', 'en'), {output: [], errorId: 'syntaxError', line: 1});
    });
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

    it('keeps spacing, texts and comments', () => {
      assert.strictEqual(
        translate('output  1<pi  # output pi\n\n    output(«if»)', 'en', 'ru'),
        'вывести  1<pi  # output pi\n\n    вывести(«if»)'
      );
    });

    it('translates a two-word keyword', () => {
      assert.strictEqual(translate('output true', 'en', 'sq'), 'shkruaj e vërtetë');
      assert.strictEqual(translate('shkruaj e  rreme', 'sq', 'en'), 'output false');
    });

    it('renames a name that is a keyword in the other language, the same everywhere', () => {
      //i is the Catalan and
      assert.strictEqual(translate('i = 1\nI = i + 1\noutput i', 'en', 'ca'), 'i_ = 1\nI_ = i_ + 1\nsortida i_');
    });

    it('renames to a name the program does not use', () => {
      assert.strictEqual(translate('i = 1\ni_ = 2\noutput i + i_', 'en', 'ca'), 'i__ = 1\ni_ = 2\nsortida i__ + i_');
    });

    it('rejects an unknown language', () => {
      assert.throws(() => translate(program, 'en', 'xx'), /Unknown language: xx/);
      assert.throws(() => translate(program, 'constructor', 'en'), /Unknown language: constructor/);
    });

    languages.forEach(to => {
      it(`spec programs run the same in ${to}`, () => {
        for (const {source, language} of programs) {
          const expected = run(source.code || '', language, source.inputs);
          const translated = translate(source.code || '', language, to);
          assert.deepStrictEqual(run(translated, to, source.inputs), expected, `${source.title}:\n${translated}`);
        }
      });
    });
  });
});
