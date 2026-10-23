/**
 * The program tree, the types and the conversion into other languages. Every spec program is converted into each
 * language whose compiler or interpreter is installed, run with its inputs, and must print what CMIL prints; the cases
 * that can't, listed here with why, are what each language does differently (docs/converting.md).
 */
import assert from 'node:assert';
import {execFile, execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {promisify} from 'node:util';
import {after, before, describe, it} from 'node:test';

import {convert, languages, problemOf, programOf, targets, type ProgramTree} from '../src/index.ts';
import translations from '../src/translations/index.ts';
import {typesOf} from '../src/convert/types.ts';
import successes from './collection/successes/index.ts';
import tutorials from './collection/tutorials.ts';
import type {Case, Source} from './collection/types.ts';

const tree = (code: string, language = 'en') => programOf(code, language) as ProgramTree;
const codeOf = (code: string, target: string, language = 'en') => {
  const result = convert(code, language, target);
  assert.ok('code' in result, JSON.stringify(result));
  return result.code;
};

describe('program tree', () => {
  it('has the statements, the comments, the first spelling of each name and the constants', () => {
    const program = tree('# hello\nTotal = pi # a circle\nprint(total)');
    assert.strictEqual(program.format, 2);
    assert.deepStrictEqual(program.names, {total: 'Total'});
    assert.deepStrictEqual(program.comments, [
      {line: 1, column: 1, text: '# hello', trailing: false},
      {line: 2, column: 12, text: '# a circle', trailing: true}
    ]);
    assert.deepStrictEqual(program.statements[0], {
      type: 'assign',
      name: 'total',
      expression: {type: 'value', value: Math.PI, constant: 'pi'},
      line: 2
    });
  });

  it('has the texts with code in braces, and no comment in them', () => {
    const program = tree('x = 1\nprint("# {x + 1}") # one');
    assert.deepStrictEqual(program.statements[1], {
      type: 'print',
      expression: {
        type: 'template',
        parts: [
          '# ',
          {
            type: 'binary',
            operator: '+',
            left: {type: 'variable', name: 'x', column: 11},
            right: {type: 'value', value: 1},
            column: 13
          }
        ],
        column: 7
      },
      line: 2
    });
    assert.deepStrictEqual(program.comments, [{line: 2, column: 20, text: '# one', trailing: true}]);
  });

  it('has the lines of else and of do', () => {
    const program = tree('if true\n    print(1)\nelse\n    print(2)\ndo\n    print(3)\nwhile false');
    assert.strictEqual(program.statements[0].type === 'if' && program.statements[0].elseLine, 3);
    assert.strictEqual(program.statements[1].type === 'doWhile' && program.statements[1].doLine, 5);
  });

  it('is the first error of a program that has one, like check()', () => {
    assert.deepStrictEqual(programOf('print(1', 'en'), {
      error: {id: 'argumentError', line: 1, column: 1, function: 'print', min: 1, max: 1}
    });
    assert.deepStrictEqual(programOf('print(1)', 'xx'), {error: {id: 'unknownLanguage', language: 'xx'}});
  });
});

describe('types', () => {
  const typesIn = (code: string) => {
    const types = typesOf(tree(code).statements);
    return {
      variables: Object.fromEntries([...types.variables].map(([scope, names]) => [scope, Object.fromEntries(names)])),
      results: Object.fromEntries(types.results),
      conflicts: types.conflicts
    };
  };

  it('a number is whole when it is sure to be, else real', () => {
    assert.deepStrictEqual(
      typesIn('a = 1 + 2 * 3\nb = a / 2\nc = round(b)\nfor i from 0 to 1 step 0.5\n    a = a % 2').variables,
      {
        '': {a: 'whole', b: 'real', c: 'whole', i: 'real'}
      }
    );
  });

  it('an answer is a number where it is used as one, else a text', () => {
    assert.deepStrictEqual(typesIn('age = input()\nname = input()\nif age < 18\n    print("Hi " + name)').variables, {
      '': {age: 'real', name: 'text'}
    });
  });

  it('a list has items of one type, parameters get the types of their arguments, and functions of their returns', () => {
    assert.deepStrictEqual(
      typesIn('function area(w, h)\n    return w * h\nt = [[1], []]\nadd(t[2], area(2, 3.5))\nprint(t)'),
      {
        variables: {'': {t: {list: {list: 'real'}}}, area: {w: 'whole', h: 'real'}},
        results: {area: 'real'},
        conflicts: []
      }
    );
  });

  it('a value of two types is a conflict, at the line of the second one', () => {
    assert.deepStrictEqual(typesIn('x = 1\nprint(x)\nx = "one"\ny = [1, "a"]').conflicts, [
      {line: 3, name: 'x'},
      {line: 4, name: '[]'}
    ]);
  });
});

describe('conversion', () => {
  const program = '# ask a name\nprint("Your name?")\nname = input()\n\nprint("Hello, " + name) # greet';

  it('lists the targets, and refuses an unknown one', () => {
    assert.deepStrictEqual(
      targets.map(({id, name, extension}) => [id, name, extension]),
      [
        ['cpp', 'C++', 'cpp'],
        ['python', 'Python', 'py']
      ]
    );
    assert.throws(() => convert('print(1)', 'en', 'cobol'), /Unknown target: cobol/);
  });

  it('writes C++ as a teacher would, with the comments and blank lines of the program', () => {
    assert.strictEqual(
      codeOf(program, 'cpp'),
      [
        '#include <iostream>',
        '#include <string>',
        '',
        'int main() {',
        '    // ask a name',
        '    std::cout << "Your name?" << \'\\n\';',
        '    std::string name;',
        '    std::getline(std::cin >> std::ws, name);',
        '',
        '    std::cout << "Hello, " << name << \'\\n\'; // greet',
        '}',
        ''
      ].join('\n')
    );
  });

  it('writes Python nearly as it is', () => {
    assert.strictEqual(
      codeOf(program, 'python'),
      '# ask a name\nprint("Your name?")\nname = input()\n\nprint(f"Hello, {name}")  # greet\n'
    );
  });

  it('gives each line the CMIL line it comes from', () => {
    const result = convert(program, 'en', 'cpp');
    assert.ok('lines' in result);
    assert.deepStrictEqual(result.lines, [null, null, null, null, 1, 2, 3, 3, null, 5, null]);
  });

  it('writes loops, lists and functions in C++, with the types they need', () => {
    const code = [
      'function total(numbers)',
      '    sum = 0',
      '    for n in numbers',
      '        sum = sum + n',
      '    return sum',
      'scores = [7, 9]',
      'add(scores, 8)',
      'repeat 2 times',
      '    print(scores[1] / 2)',
      'for i from 3 to 1 step -1',
      '    print(i)',
      'print(total(scores))'
    ].join('\n');
    assert.strictEqual(
      codeOf(code, 'cpp'),
      [
        '#include <iostream>',
        '#include <vector>',
        '#include <iomanip>',
        '',
        'int total(const std::vector<int>& numbers) {',
        '    int sum = 0;',
        '    for (int n : numbers) {',
        '        sum = sum + n;',
        '    }',
        '    return sum;',
        '}',
        '',
        'int main() {',
        '    std::cout << std::setprecision(12); // print numbers with up to 12 digits, like CMIL',
        '    std::vector<int> scores = {7, 9};',
        '    scores.push_back(8);',
        //the program has its own i, so the counter of repeat is j
        '    for (int j = 0; j < 2; j++) {',
        "        std::cout << static_cast<double>(scores[0]) / 2 << '\\n';",
        '    }',
        '    for (int i = 3; i >= 1; i--) {',
        "        std::cout << i << '\\n';",
        '    }',
        "    std::cout << total(scores) << '\\n';",
        '}',
        ''
      ].join('\n')
    );
    assert.strictEqual(
      codeOf(code, 'python'),
      [
        'def total(numbers):',
        '    sum = 0',
        '    for n in numbers:',
        '        sum = sum + n',
        '    return sum',
        '',
        'scores = [7, 9]',
        'scores.append(8)',
        'for _ in range(2):',
        '    print(f"{scores[0] / 2:.12g}")',
        'for i in range(3, 0, -1):',
        '    print(i)',
        'print(total(scores))',
        ''
      ].join('\n')
    );
  });

  it("gives the problems of a program a typed language can't write, and the error of a program that has one", () => {
    assert.deepStrictEqual(convert('x = 1\nx = "one"\nprint([1, "a"])', 'en', 'cpp'), {
      problems: [
        {id: 'mixedTypes', line: 2, name: 'x', target: 'C++'},
        {id: 'mixedItems', line: 3, target: 'C++'}
      ]
    });
    assert.ok('code' in convert('x = 1\nx = "one"', 'en', 'python'));
    assert.deepStrictEqual(convert('print(', 'en', 'python'), {error: {id: 'syntaxError', line: 1}});
  });

  it('keeps names that are words of the language apart, and names of every alphabet', () => {
    assert.match(codeOf('int = 1\nprint(int)', 'cpp'), /int int_ = 1;/);
    assert.match(codeOf('print = 1', 'python', 'hy-AM'), /^print_ = 1$/m);
    assert.match(codeOf('անուն = «Անի»\nարտածել(անուն)', 'cpp', 'hy-AM'), /std::string անուն = "Անի";/);
  });

  it('every language has the messages of the problems, with the placeholders of the English ones', () => {
    const placeholders = (text: string) => [...text.matchAll(/\{\w+\}/g)].map(([found]) => found).sort();
    languages.forEach(language => {
      for (const id of ['mixedTypes', 'mixedItems'] as const) {
        assert.deepStrictEqual(
          placeholders(translations[language].conversion[id]),
          placeholders(translations.en.conversion[id]),
          `${language}: ${id}`
        );
      }
    });
    assert.strictEqual(
      problemOf({id: 'mixedTypes', line: 2, name: 'x', target: 'C++'}, 'en'),
      "Line 2: C++ can't write this program: x gets values of two kinds, like a number and a text."
    );
  });
});

//what each language does differently from CMIL, by the path of the spec cases it shows in
const SAME_AS_TEXT = 'an answer used only as a text stays a text, also when it is a number';
const DIFFERENT: Record<string, Record<string, string>> = {
  cpp: {
    'values > numbers > compared as printed': 'C++ compares real numbers exactly',
    'lists > numbers in lists compare like numbers': 'C++ compares real numbers exactly',
    'values > numbers > very small and very large numbers printed with all their digits': 'C++ prints an exponent',
    'values > numbers > trigonometry is exact at its angles': "C++ doesn't round trigonometry",
    'print and input > inputs in a list': SAME_AS_TEXT,
    'lists > the inputs gathered in a list': SAME_AS_TEXT,
    'print and input > input in a function, and as its argument': SAME_AS_TEXT,
    'for > the variable keeps its last value': 'the counter of a C++ for ends one step after the last value',
    'texts > uppercase of any alphabet': 'std::toupper changes only English letters',
    'functions > a function asks for input': 'C++ prints the parts of a line while it computes them'
  },
  python: {
    'values > numbers > compared as printed': 'Python compares real numbers exactly',
    'lists > numbers in lists compare like numbers': 'Python compares real numbers exactly',
    'values > numbers > very small and very large numbers printed with all their digits': 'Python prints an exponent',
    'values > numbers > trigonometry is exact at its angles': "Python doesn't round trigonometry",
    'print and input > inputs in a list': SAME_AS_TEXT,
    'lists > the inputs gathered in a list': SAME_AS_TEXT,
    'print and input > input in a function, and as its argument': SAME_AS_TEXT
  }
};

//the cases a typed language can't write: lists with items of two types
const UNWRITTEN: Record<string, string[]> = {
  cpp: [
    'lists > a list prints its items, texts quoted',
    'lists > add puts a value at the end',
    'lists > lists are equal when their items are',
    'lists > a list joined into a text',
    'lists > a list inside itself',
    'lists > in: a value in a list',
    'texts > a list into a text',
    'texts > join the items of a list',
    'print and input > values in a text as print writes them'
  ],
  python: []
};

type Spec = Case & {path: string; language: string};
const specOf = (sources: Source[], language: string, group: string[] = []): Spec[] =>
  sources.flatMap(source =>
    'sources' in source
      ? specOf(source.sources, language, [...group, source.group])
      : [{...source, language, path: [...group, source.title].join(' > ')}]
  );
const SPEC = [...specOf(successes, 'en'), ...specOf(tutorials, 'hy-AM')].filter(
  ({code, output, errorId}) => code && output !== undefined && !errorId
);

const has = (program: string) => {
  try {
    execFileSync('which', [program], {stdio: 'ignore'});
    return true;
  } catch {
    return false;
  }
};

const execute = promisify(execFile);

//runs a program with its answers, one on each line, and gives what it prints
const outputOf = (program: string, args: string[], inputs: (string | number)[]) =>
  new Promise<string>(resolve => {
    const child = execFile(program, args, {timeout: 10000}, (_error, stdout) => resolve(stdout.replace(/\n$/, '')));
    child.stdin!.on('error', () => {});
    child.stdin!.end(inputs.map(String).join('\n') + '\n');
  });

const RUNNERS: Record<
  string,
  {tool: string; run: (file: string, dir: string, inputs: Spec['inputs']) => Promise<string>}
> = {
  cpp: {
    tool: 'g++',
    run: async (file, dir, inputs = []) => {
      const binary = path.join(dir, path.basename(file, '.cpp'));
      await execute('nice', ['-n', '19', 'g++', '-std=c++20', '-o', binary, file]);
      return outputOf(binary, [], inputs);
    }
  },
  python: {tool: 'python3', run: (file, _dir, inputs = []) => outputOf('python3', [file], inputs)}
};

for (const {id, name} of targets) {
  const runner = RUNNERS[id];
  describe(`spec programs in ${name}`, {skip: !has(runner.tool) && `${runner.tool} is not installed`}, () => {
    const outputs = new Map<string, string | Error>();
    let dir = '';

    before(
      async () => {
        dir = await fs.mkdtemp(path.join(os.tmpdir(), `cmil-${id}-`));
        const queue = SPEC.map((spec, index) => ({spec, index}));
        const work = async () => {
          for (let next; (next = queue.shift());) {
            const result = convert(next.spec.code!, next.spec.language, id);
            if (!('code' in result)) continue;
            const file = path.join(dir, `${next.index}.${targets.find(target => target.id === id)!.extension}`);
            await fs.writeFile(file, result.code);
            try {
              outputs.set(next.spec.path, await runner.run(file, dir, next.spec.inputs));
            } catch (error) {
              outputs.set(next.spec.path, error as Error);
            }
          }
        };
        await Promise.all(Array.from({length: Math.max(1, Math.floor(os.availableParallelism() / 2))}, work));
        //compiling every spec program takes longer than one test may
      },
      {timeout: 20 * 60 * 1000}
    );

    after(() => fs.rm(dir, {recursive: true, force: true}));

    for (const spec of SPEC) {
      const different = DIFFERENT[id][spec.path];
      it(spec.path, {skip: different}, () => {
        const result = convert(spec.code!, spec.language, id);
        if (UNWRITTEN[id].includes(spec.path)) {
          assert.ok('problems' in result, `${name} should not write it`);
          return;
        }
        assert.ok('code' in result, JSON.stringify(result));
        const output = outputs.get(spec.path);
        if (output instanceof Error) assert.fail(`${output.message}\n${result.code}`);
        //Python prints True and False, where CMIL prints the words of the program's language
        const {words} = translations[spec.language];
        const printed =
          id === 'python' ? output!.replace(/\bTrue\b/g, words.true[0]).replace(/\bFalse\b/g, words.false[0]) : output;
        assert.strictEqual(printed, spec.output, result.code);
      });
    }
  });
}
