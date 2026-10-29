/**
 * The parts of convert() and of the colors of its targets: their cores without any writer, and the entries of the
 * writers, cmil/convert/<writer> and cmil/codemirror/targets/<writer>, which each give the cores their targets once
 * imported. Node.js runs each test file in a process of its own, so here nothing has loaded a writer before.
 */
//packages
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {describe, it} from 'node:test';

import {convert} from '../src/convert/core.ts';
import {writerOf} from '../src/convert/registry.ts';
import {targetLanguage} from '../src/codemirror/targets/core.ts';
import {supportOf} from '../src/codemirror/targets/registry.ts';
import {targets} from '../src/index.ts';

const SOURCE = path.resolve(import.meta.dirname, '../src');
const WRITERS = [...new Set(targets.map(({writer}) => writer))];

//the modules a module imports, and those they import, without the types: relative ones as paths, packages by name
const importsOf = (file: string, found = new Set<string>()): Set<string> => {
  const code = fs.readFileSync(file, 'utf8');
  const pattern = /(?:^|\n)\s*(?:import|export)\s+(type\s+)?(?:[^;'"]*?\sfrom\s+)?'([^']+)'|import\('([^']+)'\)/g;
  for (const [, type, from, loaded] of code.matchAll(pattern)) {
    const specifier = from ?? loaded;
    if (type) continue;
    if (!specifier.startsWith('.')) {
      found.add(specifier);
      continue;
    }
    const module = path.resolve(path.dirname(file), specifier);
    if (found.has(module)) continue;
    found.add(module);
    importsOf(module, found);
  }
  return found;
};

describe('parts', () => {
  it('has the parts of every writer, for convert() and for the colors', () => {
    assert.strictEqual(WRITERS.length, 20);
    for (const writer of WRITERS) {
      assert.ok(fs.existsSync(path.join(SOURCE, 'convert/writers', `${writer}.ts`)), writer);
      assert.ok(fs.existsSync(path.join(SOURCE, 'codemirror/targets/writers', `${writer}.ts`)), writer);
    }
    assert.deepStrictEqual(
      fs.readdirSync(path.join(SOURCE, 'convert/writers')).sort(),
      WRITERS.map(writer => `${writer}.ts`).sort()
    );
    assert.deepStrictEqual(
      fs.readdirSync(path.join(SOURCE, 'codemirror/targets/writers')).sort(),
      WRITERS.map(writer => `${writer}.ts`).sort()
    );
  });

  it('loads no writer and no language of CodeMirror with the cores', () => {
    const convertCore = [...importsOf(path.join(SOURCE, 'convert/core.ts'))];
    assert.deepStrictEqual(
      convertCore.filter(module => /[/\\]convert[/\\](targets|writers)[/\\]/.test(module)),
      []
    );
    assert.deepStrictEqual(
      convertCore.filter(module => !module.startsWith('/')),
      []
    );
    const colorsCore = [...importsOf(path.join(SOURCE, 'codemirror/targets/core.ts'))];
    assert.deepStrictEqual(
      colorsCore.filter(module => /writers|@codemirror\/(lang-|legacy-modes)/.test(module)),
      []
    );
  });

  it('keeps CodeMirror out of the core entry, which a language server takes', () => {
    const modules = [...importsOf(path.join(SOURCE, 'index.ts'))];
    assert.deepStrictEqual(
      modules.filter(module => !module.startsWith('/') || /[/\\]codemirror[/\\]/.test(module)),
      []
    );
  });

  it('marks only the parts as doing something when they load, and exports them', () => {
    //a bundler leaves out a module of no side effects whose exports aren't used, with what it imports, so a module
    //that registers a writer, which exports nothing, must be marked; and only those, or the entry cmil, which has
    //convert(), would bring every writer to a page that never converts
    const {exports, sideEffects} = JSON.parse(fs.readFileSync(path.join(SOURCE, '../package.json'), 'utf8')) as {
      exports: Record<string, {default: string}>;
      sideEffects: string[];
    };
    assert.deepStrictEqual(sideEffects, ['./dist/convert/writers/*.js', './dist/codemirror/targets/writers/*.js']);
    assert.strictEqual(exports['./convert/*'].default, './dist/convert/writers/*.js');
    assert.strictEqual(exports['./codemirror/targets/*'].default, './dist/codemirror/targets/writers/*.js');
    assert.strictEqual(exports['./convert/core'].default, './dist/convert/core.js');
    assert.strictEqual(exports['./codemirror/targets/core'].default, './dist/codemirror/targets/core.js');

    const registering = fs
      .readdirSync(SOURCE, {recursive: true, encoding: 'utf8'})
      .filter(file => file.endsWith('.ts'))
      .filter(file => /^register(Writers|TargetLanguages)\(/m.test(fs.readFileSync(path.join(SOURCE, file), 'utf8')))
      .map(file => file.split(path.sep).join('/'))
      .sort();
    assert.deepStrictEqual(
      registering,
      WRITERS.flatMap(writer => [`codemirror/targets/writers/${writer}.ts`, `convert/writers/${writer}.ts`]).sort()
    );
  });

  it('converts into a target once its writer is imported', async () => {
    assert.throws(() => convert('print(1)', 'en', 'klingon'), /Unknown target: klingon/);
    assert.throws(
      () => convert('print(1)', 'en', 'csharp'),
      /The writer of csharp isn't loaded: import cmil\/convert\/csharp/
    );

    await import('../src/convert/writers/csharp.ts');
    for (const target of ['csharp', 'csharp-classic']) {
      const conversion = convert('print(1)', 'en', target);
      assert.ok('code' in conversion && conversion.code.includes('Console.WriteLine'), target);
    }
    assert.throws(() => convert('print(1)', 'en', 'java'), /import cmil\/convert\/java/);
  });

  it('colors a target once its colors are imported', async () => {
    await assert.rejects(targetLanguage('klingon'), /Unknown target: klingon/);
    await assert.rejects(
      targetLanguage('x86-64-nasm'),
      /The colors of x86-64-nasm aren't loaded: import cmil\/codemirror\/targets\/assembly/
    );

    await import('../src/codemirror/targets/writers/assembly.ts');
    for (const target of ['x86-64', 'x86-64-att', 'x86-64-nasm']) assert.ok(await targetLanguage(target), target);
    await assert.rejects(targetLanguage('cpp'), /import cmil\/codemirror\/targets\/cpp/);
  });

  it('gives each writer exactly its targets', async () => {
    for (const writer of WRITERS) {
      const own = targets.filter(target => target.writer === writer).map(({id}) => id);
      const {supports} = (await import(`../src/codemirror/targets/writers/${writer}.ts`)) as {supports: object};
      assert.deepStrictEqual(Object.keys(supports).sort(), [...own].sort(), writer);
      await import(`../src/convert/writers/${writer}.ts`);
      own.forEach(id => assert.ok(writerOf(id) && supportOf(id), id));
    }
    targets.forEach(({id}) => assert.ok(writerOf(id) && supportOf(id), id));
  });
});
