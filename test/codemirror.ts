/**
 * CMIL in CodeMirror, the entries cmil/codemirror and cmil/codemirror/targets: the colors, the indentation, the
 * quotes, the completions, the marks of errors and warnings, the linked lines, and the colors of the targets.
 */
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {ensureSyntaxTree, getIndentation, getIndentUnit, highlightingFor, language} from '@codemirror/language';
import {EditorSelection, EditorState, Text} from '@codemirror/state';
import {EditorView, type DecorationSet} from '@codemirror/view';
import {highlightTree, tags} from '@lezer/highlight';

import {check, convert, languages, targets, translate, warningsOf} from '../src/index.ts';
import {
  cmil,
  cmilLanguage,
  closeComposed,
  commandCompletions,
  diagnosticOf,
  highlighter,
  indentationOf,
  insideText,
  linkedLines,
  markLines,
  namesOf,
  tokenClasses,
  tokensOf,
  typeQuote
} from '../src/codemirror/index.ts';
import {targetLanguage} from '../src/codemirror/targets.ts';
import successes from './collection/successes/index.ts';
import type {Case, Source} from './collection/types.ts';

const casesOf = (sources: Source[]): Case[] =>
  sources.flatMap(source => ('sources' in source ? casesOf(source.sources) : [source]));

//the classes of the parts of a program, as the editor colors them
const classesOf = (code: string, language: string) => {
  const tree = cmilLanguage(language).parser.parse(code);
  const parts: string[] = [];
  highlightTree(tree, highlighter, (from, to, classes) => parts.push(`${classes}:${code.slice(from, to)}`));
  return parts;
};

//types a character at the cursor, shown as |, or over the selection, shown as [ and ]
const type = (code: string, text: string, language: string) => {
  const start = code.includes('[') ? code.indexOf('[') : code.indexOf('|');
  const end = code.includes(']') ? code.indexOf(']') - 1 : start;
  const doc = code.replace(/[[\]|]/g, '');
  const state = EditorState.create({doc, selection: EditorSelection.single(start, end)});
  const transaction = typeQuote(state, text, language);
  if (!transaction) return null;

  const {from, to} = transaction.state.selection.main;
  const result = transaction.state.doc.toString();
  return from === to
    ? `${result.slice(0, from)}|${result.slice(from)}`
    : `${result.slice(0, from)}[${result.slice(from, to)}]${result.slice(to)}`;
};

describe('codemirror', () => {
  describe('colors', () => {
    it('gives each kind of command its own token', () => {
      assert.deepStrictEqual(
        tokensOf('if x > 1 and not done # big', 'en').filter(({token}) => token),
        [
          {text: 'if', token: 'block'},
          {text: 'x', token: 'name'},
          {text: '>', token: 'symbol'},
          {text: '1', token: 'number'},
          {text: 'and', token: 'operator'},
          {text: 'not', token: 'operator'},
          {text: 'done', token: 'name'},
          {text: '# big', token: 'comment'}
        ]
      );
      assert.deepStrictEqual(
        tokensOf('for k in [true, pi]', 'en').map(({token}) => token),
        ['block', null, 'name', null, 'part', null, 'symbol', 'value', 'symbol', null, 'value', 'symbol']
      );
      assert.deepStrictEqual(
        tokensOf('print(power(2, 3)) @ break', 'en')
          .filter(({token}) => token)
          .map(({token}) => token),
        [
          'function',
          'symbol',
          'function',
          'symbol',
          'number',
          'symbol',
          'number',
          'symbol',
          'symbol',
          'invalid',
          'statement'
        ]
      );
    });

    it('reads the words and quotes of the language', () => {
      assert.deepStrictEqual(classesOf('արտածել(«բարև») # նշում', 'hy-AM'), [
        'cmil-function:արտածել',
        'cmil-symbol:(',
        'cmil-string:«բարև»',
        'cmil-symbol:)',
        'cmil-comment:# նշում'
      ]);
      assert.deepStrictEqual(classesOf('出力(「やあ」)', 'ja'), [
        'cmil-function:出力',
        'cmil-symbol:(',
        'cmil-string:「やあ」',
        'cmil-symbol:)'
      ]);
      assert.ok(classesOf('ausgeben(„Hallo“)', 'de').includes('cmil-string:„Hallo“'));
    });

    it('has a class for each kind of token', () => {
      assert.deepStrictEqual(Object.values(tokenClasses), [
        'cmil-block',
        'cmil-statement',
        'cmil-part',
        'cmil-operator',
        'cmil-value',
        'cmil-function',
        'cmil-name',
        'cmil-string',
        'cmil-number',
        'cmil-comment',
        'cmil-symbol',
        'cmil-invalid'
      ]);
      assert.ok(Object.isFrozen(tokenClasses));
    });

    it('colors every line of the spec programs in every language', () => {
      const programs = casesOf(successes).map(source => source.code || '');
      languages.forEach(language => {
        programs.forEach(program => {
          const code = translate(program, 'en', language);
          const invalid = classesOf(code, language).filter(part => part.startsWith('cmil-invalid'));
          assert.deepStrictEqual(invalid, [], `${language}: ${code}`);
        });
      });
    });
  });

  describe('cmil()', () => {
    it('gives an editor the language, its colors as classes and its indentation', () => {
      const state = EditorState.create({doc: 'եթե ա > 1\n', extensions: cmil('hy-AM')});
      assert.strictEqual(state.facet(language)?.name, 'cmil');
      assert.strictEqual(highlightingFor(state, [tags.string]), 'cmil-string');
      assert.strictEqual(getIndentUnit(state), 4);
      assert.strictEqual(getIndentation(state, state.doc.length), 4);
    });
  });

  describe('indentation', () => {
    const indent = (code: string, language = 'en') => {
      const lines = code.split('\n');
      return indentationOf(lines.slice(0, -1), lines.at(-1)!, language);
    };

    it('indents one level after a line that starts a block', () => {
      assert.strictEqual(indent('if x > 1\n'), 4);
      assert.strictEqual(indent('repeat 3 times\n'), 4);
      assert.strictEqual(indent('function f(a)\n'), 4);
      assert.strictEqual(indent('for k from 1 to 3\n    if k > 1\n'), 8);
      assert.strictEqual(indent('եթե ա > 1\n', 'hy-AM'), 4);
    });

    it('keeps the indentation after other lines and empty lines', () => {
      assert.strictEqual(indent('print 1\n'), 0);
      assert.strictEqual(indent('if x\n    print 1\n'), 4);
      assert.strictEqual(indent('if x\n    print 1\n\n'), 4);
      assert.strictEqual(indent(''), 0);
    });

    it('keeps the indentation after the while of do … while', () => {
      assert.strictEqual(indent('do\n    x = x + 1\nwhile x < 3\n'), 0);
      assert.strictEqual(indent('print 1\nwhile x < 3\n'), 4);
    });

    it('puts else under the nearest if that is not indented more', () => {
      assert.strictEqual(indent('if x\n    print 1\n    else'), 0);
      assert.strictEqual(indent('if a\n    if b\n        print 1\n        else'), 4);
      assert.strictEqual(indent('if a\n    if b\n        print 1\nelse'), 0);
      assert.strictEqual(indent('print 1\n    else'), 4);
    });
  });

  describe('quotes', () => {
    it('closes the quotes of the language', () => {
      assert.strictEqual(type('print |', '"', 'en'), 'print "|"');
      assert.strictEqual(type('print |', '„', 'de'), 'print „|“');
      assert.strictEqual(type('出力 |', '「', 'ja'), '出力 「|」');
      assert.strictEqual(type('արտածել |', '«', 'hy-AM'), 'արտածել «|»');
      assert.strictEqual(type('print |', '»', 'da'), 'print »|«');
      assert.strictEqual(type('print length(|)', "'", 'en'), "print length('|')");
    });

    it('wraps the selected text', () => {
      assert.strictEqual(type('print [hi]', '«', 'en'), 'print «[hi]»');
    });

    it('steps over the closing quote, and types quotes in texts and comments as they are', () => {
      assert.strictEqual(type('print "hi|"', '"', 'en'), 'print "hi"|');
      assert.strictEqual(type('print „hi|“', '“', 'de'), 'print „hi“|');
      assert.strictEqual(type('print "a|', '«', 'en'), null);
      assert.strictEqual(type('print 1 # a|', '"', 'en'), null);
      assert.strictEqual(type('print |x', '"', 'en'), null);
      assert.strictEqual(type('print |', 'a', 'en'), null);
    });

    it('closes a quote that an input method typed, after its composition', () => {
      //the cursor is after the quote the composition typed, at |
      const composed = (code: string, text: string, language: string) => {
        const doc = code.replace('|', '');
        const state = EditorState.create({doc, selection: EditorSelection.cursor(code.indexOf('|'))});
        const transaction = closeComposed(state, text, language);
        if (!transaction) return null;
        const {from} = transaction.state.selection.main;
        const result = transaction.state.doc.toString();
        return `${result.slice(0, from)}|${result.slice(from)}`;
      };
      assert.strictEqual(composed('出力 「|', '「', 'ja'), '出力 「|」');
      assert.strictEqual(composed('արտածել «|', '«', 'hy-AM'), 'արտածել «|»');
      assert.strictEqual(composed('print length(“|)', '“', 'en'), 'print length(“|”)');
      //not before a letter, not in a text, not a quote, and not when the quote isn't before the cursor
      assert.strictEqual(composed('出力 「|x', '「', 'ja'), null);
      assert.strictEqual(composed('出力 「あ「|', '「', 'ja'), null);
      assert.strictEqual(composed('出力 あ|', 'あ', 'ja'), null);
      assert.strictEqual(composed('出力 |', '「', 'ja'), null);
    });

    it('knows when the cursor is inside a text', () => {
      assert.strictEqual(insideText('print "a', 'en'), true);
      assert.strictEqual(insideText('print "a\\"', 'en'), true);
      assert.strictEqual(insideText('print "a"', 'en'), false);
      assert.strictEqual(insideText('print', 'en'), false);
      assert.strictEqual(insideText('# "', 'en'), true);
    });
  });

  describe('completions', () => {
    it('has every word of every command, and a function with its brackets', () => {
      const completions = commandCompletions('en');
      const of = (label: string) => completions.find(completion => completion.label === label);
      assert.strictEqual(of('while')?.type, 'keyword');
      assert.strictEqual(of('true')?.type, 'constant');
      assert.strictEqual(of('times')?.type, 'keyword');
      for (const label of ['power', 'print', 'input', 'add', 'remove']) {
        assert.strictEqual(of(label)?.type, 'function', label);
        assert.strictEqual(typeof of(label)?.apply, 'function', label);
      }
      assert.strictEqual(
        completions.some(({label}) => label === 'into' || label === 'out of'),
        false
      );
      assert.ok(commandCompletions('hy-AM').some(({label}) => label === 'արտածել'));
    });

    it('has the names of the program, but not the one being typed', () => {
      assert.deepStrictEqual(namesOf(['count = 1', 'print count + total', 'co'], 'en', 'co'), ['count', 'total']);
      assert.deepStrictEqual(namesOf(['print "text" # name'], 'en'), []);
    });
  });

  describe('marks', () => {
    const mark = (code: string, language = 'en') => {
      const doc = Text.of(code.split('\n'));
      const error = check(code, language);
      const diagnostic = error && diagnosticOf(doc, error, language);
      return diagnostic && {text: doc.sliceString(diagnostic.from, diagnostic.to), message: diagnostic.message};
    };

    const warnings = (code: string, language = 'en') => {
      const doc = Text.of(code.split('\n'));
      return warningsOf(code, language).flatMap(warning => {
        const diagnostic = diagnosticOf(doc, warning, language);
        if (!diagnostic) return [];
        const {from, to, severity, message} = diagnostic;
        return [{text: doc.sliceString(from, to), severity, message}];
      });
    };

    it('marks an error from its column to the end of its value or its line', () => {
      assert.deepStrictEqual(mark('x = 1\nx = power(1)'), {text: 'power(1)', message: 'Line 2: power takes 2 values.'});
      assert.deepStrictEqual(mark('print(power(1)) # two'), {
        text: 'power(1)',
        message: 'Line 1: power takes 2 values.'
      });
      assert.deepStrictEqual(mark('print([1, x = 2])'), {
        text: '= 2',
        message: 'Line 1: to compare, use == instead of =.'
      });
      assert.deepStrictEqual(mark('print(1))'), {text: ')', message: 'Syntax error on line 1.'});
    });

    it('marks the whole line of an error without a column, from its indentation', () => {
      assert.deepStrictEqual(mark('if 1 < 2\n    x = ('), {text: 'x = (', message: 'Syntax error on line 2.'});
    });

    it('marks nothing for an error without a line', () => {
      assert.strictEqual(diagnosticOf(Text.of(['']), {id: 'timeout'}, 'en'), null);
    });

    it('marks the text of a warning, with its message in the language of the program', () => {
      assert.deepStrictEqual(warnings('pin = input()\nwhile pin != "1234"\n    pin = input()'), [
        {
          text: '"1234"',
          severity: 'warning',
          message:
            '"1234" is a text: an answer like 1234 is a number, and a number never equals a text. Write 1234 without the quotes.'
        }
      ]);
      assert.deepStrictEqual(
        warnings('if "7" == x or x == « 2.5 »\n    print(x)').map(({text}) => text),
        ['"7"', '« 2.5 »']
      );
      assert.deepStrictEqual(warnings('արտածել(պատասխան == «5»)', 'hy-AM'), [
        {
          text: '«5»',
          severity: 'warning',
          message: '«5»-ը տեքստ է․ 5-ի պես պատասխանը թիվ է, իսկ թիվը երբեք հավասար չէ տեքստի։ Գրիր 5՝ առանց չակերտների։'
        }
      ]);
    });
  });

  describe('linked lines', () => {
    //the lines, from 1, the editor marks
    const marked = (state: EditorState) =>
      state
        .facet(EditorView.decorations)
        .filter((decorations): decorations is DecorationSet => typeof decorations !== 'function')
        .flatMap(decorations => {
          const lines: number[] = [];
          decorations.between(0, state.doc.length, from => {
            lines.push(state.doc.lineAt(from).number);
          });
          return lines;
        });

    it('marks the lines it is given, once each and in their order, and only those the editor has', () => {
      const state = EditorState.create({doc: 'a\nb\nc', extensions: linkedLines(() => {})});
      const next = state.update({effects: markLines.of([3, 1, 3, 9, 0])}).state;
      assert.deepStrictEqual(marked(next), [1, 3]);
      assert.deepStrictEqual(marked(next.update({effects: markLines.of([])}).state), []);
    });

    it('keeps the marks on their lines as the program changes', () => {
      const state = EditorState.create({doc: 'a\nb', extensions: linkedLines(() => {})});
      const next = state.update({effects: markLines.of([2])}).state;
      assert.deepStrictEqual(marked(next.update({changes: {from: 0, insert: 'x\n'}}).state), [3]);
    });
  });

  describe('targets', () => {
    //the classes of a converted program, as the editor of its target colors them
    const targetClasses = async (target: string) => {
      const conversion = convert('# hi\nx = 2\nprint("Hi " + to_text(x * 1.5))', 'en', target);
      assert.ok('code' in conversion, target);
      const state = EditorState.create({doc: conversion.code, extensions: await targetLanguage(target)});
      const tree = ensureSyntaxTree(state, state.doc.length, 5000);
      assert.ok(tree, target);
      const classes = new Set<string>();
      highlightTree(tree, {style: tags => highlightingFor(state, tags)}, (from, to, names) => {
        names.split(' ').forEach(name => classes.add(name));
      });
      return classes;
    };

    it('colors the programs of every target with the classes of CMIL', async () => {
      for (const {id} of targets) {
        const classes = await targetClasses(id);
        for (const name of ['cmil-string', 'cmil-comment']) assert.ok(classes.has(name), `${id}: ${name}`);
        assert.ok(
          [...classes].every(name => Object.values(tokenClasses).includes(name)),
          `${id}: ${[...classes].join(' ')}`
        );
      }
    });

    it('rejects an unknown target', async () => {
      await assert.rejects(targetLanguage('klingon'), /Unknown target: klingon/);
    });
  });
});
