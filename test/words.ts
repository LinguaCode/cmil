//packages
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {quote, scan, wordsOf} from '../src/core/words.ts';
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

//a program prints true and false in the words of its language; these are the words of another language
const sameBooleans = (lines: string[], from: string, to: string) => {
  const words = new Map(
    (['true', 'false'] as const).map(command => [
      translations[from].words[command][0],
      translations[to].words[command][0]
    ])
  );
  const alternatives = [...words.keys()].map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const pattern = new RegExp(`(?<![\\p{L}\\p{M}\\p{N}_])(${alternatives})(?![\\p{L}\\p{M}\\p{N}_])`, 'gu');
  return lines.map(line => line.replace(pattern, word => words.get(word) ?? word));
};

//a program prints the texts in its lists in the quotes of its language; these are the quotes of another language
const sameQuotes = (lines: string[], from: string, to: string) => {
  const [open, close] = wordsOf(from).main;
  const target = wordsOf(to).main;

  return lines.map(line => {
    let result = '';
    let depth = 0;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '[') depth++;
      if (line[i] === ']') depth--;
      if (!depth || line[i] !== open) {
        result += line[i];
        continue;
      }

      //a text in a list, with its escapes
      let value = '';
      for (i++; i < line.length && line[i] !== close; i++) {
        if (line[i] !== '\\') {
          value += line[i];
        } else {
          const escaped = line[++i];
          value += escaped === 'n' ? '\n' : escaped === 't' ? '\t' : escaped;
        }
      }
      result += quote(value, target);
    }
    return result;
  });
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
      assert.deepStrictEqual(scan('print(x + «print») # print', 'en'), [
        {type: 'keyword', command: 'print', text: 'print'},
        {type: 'other', text: '('},
        {type: 'name', text: 'x'},
        {type: 'other', text: ' + '},
        {type: 'string', text: '«print»', value: 'print', closed: true},
        {type: 'other', text: ') '},
        {type: 'comment', text: '# print'}
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
      assert.strictEqual(outputOf('if 1<pi then\n    print(1)', 'en'), '1');
      assert.strictEqual(outputOf('print(2>e)', 'en'), 'false');
      assert.strictEqual(outputOf('x = true\nprint(x!=true)', 'en'), 'false');
      assert.strictEqual(outputOf('print(2*pi>6)', 'en'), 'true');
    });

    it('keywords that contain another keyword', () => {
      assert.strictEqual(outputOf('print(square(3))\nprint(square_root(16))', 'en'), '9\n4');
      assert.strictEqual(outputOf('výstup(mocnina(2, 3))\nvýstup(druhá_mocnina(3))', 'cs'), '8\n9');
      assert.strictEqual(
        outputOf('sortida(arrodonir(2.5))\nsortida(arrodonir_avall(2.5))\nsortida(arrodonir_amunt(2.2))', 'ca'),
        '3\n2\n3'
      );
      assert.strictEqual(outputOf('scrivi(e_numero > 2 e vero)', 'it'), 'vero');
      assert.strictEqual(outputOf('i = 0\nså_lenge i < 2\n    i = i + 1\nhvis i == 2 så\n    skriv_ut(i)', 'no'), '2');
      assert.strictEqual(
        outputOf('i = 0\nniin_kauan_kuin i < 2\n    i = i + 1\njos i == 2 niin\n    tulosta(i)', 'fi'),
        '2'
      );
      assert.strictEqual(
        outputOf('вывести(округлить(2.5))\nвывести(округлить_вниз(2.5))\nвывести(округлить_вверх(2.2))', 'ru'),
        '3\n2\n3'
      );
      assert.strictEqual(outputOf('izhod(res)\nizhod(ni_res)', 'sl'), 'res\nni_res');
      assert.strictEqual(outputOf('izhod(kvadrat(3))\nizhod(kvadratni_koren(16))', 'sl'), '9\n4');
      assert.strictEqual(
        outputOf('shkruaj(e vërtetë)\nshkruaj(e rreme)\nshkruaj(e > 2)', 'sq'),
        'e vërtetë\ne rreme\ne vërtetë'
      );
    });

    it('two-word keywords, with any spaces between the words', () => {
      assert.strictEqual(outputOf('nëse e vërtetë atëherë\n    shkruaj(7)', 'sq'), '7');
      assert.strictEqual(outputOf('nëse e  \tvërtetë atëherë\n    shkruaj(7)', 'sq'), '7');
    });

    it('keywords in any case', () => {
      assert.strictEqual(outputOf('PRINT(5)\nPrint(Pi > 3)', 'en'), '5\ntrue');
      assert.strictEqual(outputOf('ԱՐՏԱԾԵԼ(ՃԻՇՏ)', 'hy-AM'), 'ճիշտ');
    });

    it('words in texts and comments are not keywords', () => {
      assert.strictEqual(
        outputOf('print(«print»)\nprint("say \\"print\\" now")\nprint(\'it\\\'s print\') # print 2', 'en'),
        'print\nsay "print" now\nit\'s print'
      );
    });

    it('names that contain a keyword', () => {
      assert.strictEqual(
        outputOf('print_x = 3\nx_print = 4\nprintx = 5\nprint(print_x + x_print + printx)', 'en'),
        '12'
      );
    });

    it('a number joined to a word is a syntax error', () => {
      assert.deepStrictEqual(run('print(2pi)', 'en'), {output: [], errorId: 'syntaxError', line: 1});
    });

    it('@ is not part of the language', () => {
      assert.deepStrictEqual(run('@output 1', 'en'), {output: [], errorId: 'syntaxError', line: 1});
    });
  });

  describe('translate', () => {
    const program = 'name = input()\nif name == "Ani" then\n    print("output " + name)\nelse\n    print(name)';

    it('translates commands and the quotes of texts, and keeps names', () => {
      assert.strictEqual(
        translate(program, 'en', 'hy-AM'),
        'name = մուտքագրել()\nեթե name == «Ani» ապա\n    արտածել(«output » + name)\nայլապես\n    արտածել(name)'
      );
    });

    it('writes texts in the quotes of the language, with their escapes', () => {
      assert.strictEqual(translate('print("a » b")', 'en', 'hy-AM'), 'արտածել(«a \\» b»)');
      assert.strictEqual(translate('print("a\\\\b\\n\\tc")', 'en', 'de'), 'ausgeben(„a\\\\b\\n\\tc“)');
      assert.strictEqual(translate('出力(「a」 + 『b』)', 'ja', 'en'), 'print("a" + "b")');
      //an unclosed text stays as written
      assert.strictEqual(translate('print("a', 'en', 'ru'), 'вывести("a');
    });

    it('reads the quotes of every language, and those of every language in each', () => {
      languages.forEach(language => {
        const own = translations[language].quotes;
        [...own, ['"', '"'], ["'", "'"], ['«', '»']].forEach(([open, close]) => {
          const segments = scan(`x = ${open}a ${close === open ? '' : open}b${close}`, language);
          assert.deepStrictEqual(
            segments.filter(segment => segment.type === 'string').map(segment => 'value' in segment && segment.value),
            [`a ${close === open ? '' : open}b`],
            `${language}: ${open}${close}`
          );
        });
        assert.strictEqual(
          translate('print("a")', 'en', language).endsWith(`(${own[0][0]}a${own[0][1]})`),
          true,
          language
        );
      });
    });

    it('translates back to the same program', () => {
      assert.strictEqual(translate(translate(program, 'en', 'ru'), 'ru', 'en'), program);
    });

    it('keeps spacing, texts and comments', () => {
      assert.strictEqual(
        translate('print(1<pi)  # output pi\n\n    print(«if»)', 'en', 'ru'),
        'вывести(1<pi)  # output pi\n\n    вывести(«if»)'
      );
    });

    it('translates a two-word keyword', () => {
      assert.strictEqual(translate('print(true)', 'en', 'sq'), 'shkruaj(e vërtetë)');
      assert.strictEqual(translate('shkruaj(e  rreme)', 'sq', 'en'), 'print(false)');
    });

    it('renames a name that is a keyword in the other language, the same everywhere', () => {
      //i is the Catalan and
      assert.strictEqual(translate('i = 1\nI = i + 1\nprint(i)', 'en', 'ca'), 'i_ = 1\nI_ = i_ + 1\nsortida(i_)');
    });

    it('renames to a name the program does not use', () => {
      assert.strictEqual(translate('i = 1\ni_ = 2\nprint(i + i_)', 'en', 'ca'), 'i__ = 1\ni_ = 2\nsortida(i__ + i_)');
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
          const result = run(translated, to, source.inputs);
          assert.deepStrictEqual(
            {...result, output: sameQuotes(sameBooleans(result.output, to, language), to, language)},
            expected,
            `${source.title}:\n${translated}`
          );
        }
      });
    });
  });
});
