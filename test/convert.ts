/**
 * The program tree and the conversion into other languages. Every spec program is converted into each
 * language whose compiler or interpreter is installed, run with its inputs, and must print what CMIL prints; the cases
 * that can't, listed here with why, are what each language does differently (docs/converting.md).
 */
import assert from 'node:assert';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {after, before, describe, it} from 'node:test';

import {Session, convert, languages, problemOf, programOf, targets, translate, type ProgramTree} from '../src/index.ts';
import translations from '../src/translations/index.ts';
import {Helpers} from '../src/convert/emit.ts';
import {ERRORS, SUCCESSES as SPEC} from './collection/programs.ts';
import {RUNNERS, has, outputsOf} from './runners.ts';

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

describe('conversion', () => {
  const program = '# ask a name\nprint("Your name?")\nname = input()\n\nprint("Hello, " + name) # greet';

  it('lists the targets, and refuses an unknown one', () => {
    assert.deepStrictEqual(
      targets.map(({id, name, extension, style}) => [id, name, extension, style]),
      [
        ['cpp', 'C++', 'cpp', undefined],
        ['python', 'Python', 'py', undefined],
        ['csharp', 'C#', 'cs', 'modern'],
        ['csharp-classic', 'C#', 'cs', 'classic'],
        ['java', 'Java', 'java', 'modern'],
        ['java-classic', 'Java', 'java', 'classic'],
        ['c', 'C', 'c', undefined],
        ['javascript', 'JavaScript', 'js', undefined],
        ['pascal', 'Pascal', 'pas', undefined],
        ['go', 'Go', 'go', undefined],
        ['kotlin', 'Kotlin', 'kt', undefined],
        ['swift', 'Swift', 'swift', undefined],
        ['rust', 'Rust', 'rs', undefined],
        ['php', 'PHP', 'php', undefined],
        ['ruby', 'Ruby', 'rb', undefined],
        ['lua', 'Lua', 'lua', undefined],
        ['basic', 'BASIC', 'bas', undefined],
        ['visualbasic', 'Visual Basic', 'vb', undefined],
        ['fortran', 'Fortran', 'f90', undefined],
        ['tcl', 'Tcl', 'tcl', undefined],
        ['cobol', 'COBOL', 'cob', undefined],
        ['x86-64', 'x86-64 Assembly', 's', 'intel'],
        ['x86-64-att', 'x86-64 Assembly', 's', 'att'],
        ['x86-64-nasm', 'x86-64 Assembly', 'asm', 'nasm']
      ]
    );
    assert.throws(() => convert('print(1)', 'en', 'klingon'), /Unknown target: klingon/);
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

  it('writes C# with top-level statements, as dotnet new console does', () => {
    assert.strictEqual(
      codeOf(program, 'csharp'),
      [
        'using System;',
        '',
        '// ask a name',
        'Console.WriteLine("Your name?");',
        'string name = Console.ReadLine() ?? "";',
        '',
        'Console.WriteLine($"Hello, {name}"); // greet',
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

  it('writes loops, lists and functions in C#: local functions, collection expressions and numbers with a point', () => {
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
      'print("Total: {total(scores)} of {join(scores, ", ")}")'
    ].join('\n');
    assert.strictEqual(
      codeOf(code, 'csharp'),
      [
        'using System;',
        'using System.Collections.Generic;',
        'using System.Globalization;',
        '',
        '// numbers with a point, like 2.5, whatever the language of the computer',
        'CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;',
        '',
        'int total(List<int> numbers)',
        '{',
        '    int sum = 0;',
        '    foreach (int n in numbers)',
        '    {',
        '        sum = sum + n;',
        '    }',
        '    return sum;',
        '}',
        '',
        'List<int> scores = [7, 9];',
        'scores.Add(8);',
        'for (int i = 0; i < 2; i++)',
        '{',
        '    Console.WriteLine(((double)scores[0] / 2).ToString("G12"));',
        '}',
        'Console.WriteLine($"Total: {total(scores)} of {string.Join(", ", scores)}");',
        ''
      ].join('\n')
    );
  });

  it('writes classic C#, which builds with C# 7.3 too: a class Program, static methods and Main', () => {
    const code = [
      'function total(numbers)',
      '    sum = 0',
      '    for n in numbers',
      '        sum = sum + n',
      '    return sum',
      'scores = [7, 9]',
      'add(scores, random(6))',
      'name = input()',
      'print("Total: {total(scores)}, {name}")'
    ].join('\n');
    assert.strictEqual(
      codeOf(code, 'csharp-classic'),
      [
        'using System;',
        'using System.Collections.Generic;',
        '',
        'class Program',
        '{',
        '    // the random numbers of the program',
        '    static Random random = new Random();',
        '',
        '    static int total(List<int> numbers)',
        '    {',
        '        int sum = 0;',
        '        foreach (int n in numbers)',
        '        {',
        '            sum = sum + n;',
        '        }',
        '        return sum;',
        '    }',
        '',
        '    static void Main(string[] args)',
        '    {',
        '        List<int> scores = new List<int> { 7, 9 };',
        '        scores.Add(random.Next(1, 7));',
        '        string name = Console.ReadLine();',
        '        Console.WriteLine($"Total: {total(scores)}, {name}");',
        '    }',
        '}',
        ''
      ].join('\n')
    );
  });

  it('writes Java as a compact source file of Java 25, and as a class Main of any Java from 8', () => {
    const code = [
      'function total(numbers)',
      '    sum = 0',
      '    for n in numbers',
      '        sum = sum + n',
      '    return sum',
      'scores = [7, 9]',
      'add(scores, random(6))',
      'name = input()',
      'print("Total: {total(scores)}, {name}")'
    ].join('\n');
    const total = [
      'int total(List<Integer> numbers) {',
      '    int sum = 0;',
      '    for (int n : numbers) {',
      '        sum = sum + n;',
      '    }',
      '    return sum;',
      '}'
    ];
    assert.strictEqual(
      codeOf(code, 'java'),
      [
        '// the random numbers of the program',
        'Random random = new Random();',
        '',
        ...total,
        '',
        'void main() {',
        '    List<Integer> scores = new ArrayList<>(List.of(7, 9));',
        '    scores.add(random.nextInt(1, 7));',
        '    String name = IO.readln();',
        '    IO.println("Total: " + total(scores) + ", " + name);',
        '}',
        ''
      ].join('\n')
    );
    assert.strictEqual(
      codeOf(code, 'java-classic'),
      [
        'import java.util.ArrayList;',
        'import java.util.Arrays;',
        'import java.util.List;',
        'import java.util.Random;',
        'import java.util.Scanner;',
        '',
        'public class Main {',
        '    // the answers of the user',
        '    static Scanner input = new Scanner(System.in);',
        '',
        '    // the random numbers of the program',
        '    static Random random = new Random();',
        '',
        ...total.map(line => `    ${line.startsWith('int') ? 'static ' : ''}${line}`),
        '',
        '    public static void main(String[] args) {',
        '        List<Integer> scores = new ArrayList<>(Arrays.asList(7, 9));',
        '        scores.add(random.nextInt(6) + 1);',
        '        String name = input.nextLine();',
        '        System.out.println("Total: " + total(scores) + ", " + name);',
        '    }',
        '}',
        ''
      ].join('\n')
    );
  });

  it('writes C as a first course does: arrays with their counts, char arrays and printf', () => {
    const code = [
      'function total(numbers)',
      '    sum = 0',
      '    for n in numbers',
      '        sum = sum + n',
      '    return sum',
      'scores = [7, 9]',
      'add(scores, 8)',
      'name = input()',
      'print("Total: {total(scores)}, {name}")'
    ].join('\n');
    assert.strictEqual(
      codeOf(code, 'c'),
      [
        '#include <stdio.h>',
        '#include <string.h>',
        '',
        'int total(int numbers[], int numbers_count) {',
        '    int sum = 0;',
        '    for (int i = 0; i < numbers_count; i++) {',
        '        int n = numbers[i];',
        '        sum = sum + n;',
        '    }',
        '    return sum;',
        '}',
        '',
        'int main(void) {',
        '    int scores[100] = {7, 9};',
        '    int scores_count = 2;',
        '    scores[scores_count++] = 8;',
        '    char name[100];',
        '    fgets(name, sizeof name, stdin);',
        '    name[strcspn(name, "\\n")] = \'\\0\';',
        '    printf("Total: %d, %s\\n", total(scores, scores_count), name);',
        '    return 0;',
        '}',
        ''
      ].join('\n')
    );
    //a function that adds to a list gets a pointer to its count, and a list of texts is an array of char arrays
    const added = codeOf(
      'function more(list)\n    add(list, "b")\nletters = ["a"]\nmore(letters)\nprint(join(letters, ", "))',
      'c'
    );
    assert.match(
      added,
      /void more\(char list\[\]\[100\], int \*list_count\) \{\n {4}strcpy\(list\[\(\*list_count\)\+\+\], "b"\);/
    );
    assert.match(
      added,
      /more\(letters, &letters_count\);\n {4}char joined\[100\];\n {4}join_texts\(joined, letters, letters_count, ", "\);/
    );
  });

  it('writes JavaScript for the browser: console.log(), prompt(), template literals, and const for one value', () => {
    const code = [
      'function total(numbers)',
      '    sum = 0',
      '    for n in numbers',
      '        sum = sum + n',
      '    return sum',
      'scores = [7, 9]',
      'add(scores, 8)',
      'name = input()',
      'print("Total: {total(scores)}, {name}")'
    ].join('\n');
    assert.strictEqual(
      codeOf(code, 'javascript'),
      [
        'function total(numbers) {',
        '  let sum = 0;',
        '  for (const n of numbers) {',
        '    sum = sum + n;',
        '  }',
        '  return sum;',
        '}',
        '',
        'const scores = [7, 9];',
        'scores.push(8);',
        'const name = prompt();',
        'console.log(`Total: ${total(scores)}, ${name}`);',
        ''
      ].join('\n')
    );
  });

  it('writes Pascal with a var for every variable, named list types and writeln', () => {
    const code = [
      'function total(numbers)',
      '    sum = 0',
      '    for n in numbers',
      '        sum = sum + n',
      '    return sum',
      'scores = [7, 9]',
      'add(scores, 8)',
      'name = input()',
      'print("Total: {total(scores)}, {name}")'
    ].join('\n');
    assert.strictEqual(
      codeOf(code, 'pascal'),
      [
        'program Main;',
        '',
        '{$mode objfpc}{$H+}',
        '',
        'type',
        '  TIntegerArray = array of Integer;',
        '',
        'function total(const numbers: TIntegerArray): Integer;',
        'var',
        '  sum: Integer;',
        '  n: Integer;',
        'begin',
        '  sum := 0;',
        '  for n in numbers do',
        '  begin',
        '    sum := sum + n;',
        '  end;',
        '  Exit(sum);',
        'end;',
        '',
        'var',
        '  scores: TIntegerArray;',
        '  name: string;',
        'begin',
        '  scores := [7, 9];',
        '  SetLength(scores, Length(scores) + 1);',
        '  scores[High(scores)] := 8;',
        '  readln(name);',
        "  writeln('Total: ', total(scores), ', ', name);",
        'end.',
        ''
      ].join('\n')
    );
  });

  it('writes the names of every alphabet in Latin letters for Pascal, whose names have only them', () => {
    const armenian = codeOf('անուն = «Անի»\nԾիրան = 2\nարտածել(անուն + Ծիրան)', 'pascal', 'hy-AM');
    assert.match(armenian, /anun: string;\n {2}Tsiran: Integer;/);
    assert.match(armenian, /anun := 'Անի';/);
    assert.match(codeOf('имя = "Аня"\nвывести(имя)', 'pascal', 'ru'), /imya: string;/);
    //a name of no Latin letter, like a Chinese one, is numbered, and a word of Pascal, in any case, gets a _
    assert.match(codeOf('分数 = 1\n输出(分数)', 'pascal', 'zh-CN'), /name1: Integer;/);
    assert.match(codeOf('Begin = 1\nprint(Begin)', 'pascal'), /Begin_: Integer;/);
  });

  it('counts a Pascal for to the whole number a real last value lets it reach', () => {
    assert.match(
      codeOf('for d from 2 to square_root(10)\n    print(d)', 'pascal'),
      /for d := 2 to Floor\(Sqrt\(10\)\) do/
    );
    assert.match(codeOf('for d from 5 to 1.5 step -1\n    print(d)', 'pascal'), /for d := 5 downto Ceil\(1\.5\) do/);
  });

  it('writes Go as gofmt lays it out: slices, fmt.Printf with a format, and the helpers after main', () => {
    const code = [
      'function total(numbers)',
      '    sum = 0',
      '    for n in numbers',
      '        sum = sum + n',
      '    return sum',
      'scores = [7, 9]',
      'add(scores, 8)',
      'name = input()',
      'print("Total: {total(scores)}, {name}")'
    ].join('\n');
    assert.strictEqual(
      codeOf(code, 'go'),
      [
        'package main',
        '',
        'import (',
        '\t"bufio"',
        '\t"fmt"',
        '\t"os"',
        ')',
        '',
        'func total(numbers []int) int {',
        '\tsum := 0',
        '\tfor _, n := range numbers {',
        '\t\tsum = sum + n',
        '\t}',
        '\treturn sum',
        '}',
        '',
        'func main() {',
        '\tscores := []int{7, 9}',
        '\tscores = append(scores, 8)',
        '\tname := readText()',
        '\tfmt.Printf("Total: %d, %s\\n", total(scores), name)',
        '}',
        '',
        '// the answers of the user, a line at a time',
        'var scanner = bufio.NewScanner(os.Stdin)',
        '',
        '// an answer of the user, as a text',
        'func readText() string {',
        '\tscanner.Scan()',
        '\treturn scanner.Text()',
        '}',
        ''
      ].join('\n')
    );
  });

  it('spaces the operators of Go and lines up its comments after code as gofmt does', () => {
    const code = codeOf(
      'a = 1 # one\nlonger = 22 # two\nif a > 0 # three\n    print(a * 10 + longer)\nprint(round(a * 2.5, 1))',
      'go'
    );
    assert.match(code, /\ta := 1 {7}\/\/ one\n\tlonger := 22 \/\/ two\n\tif a > 0 \{ {3}\/\/ three\n/);
    assert.match(code, /fmt\.Println\(a\*10 \+ longer\)/);
    assert.match(code, /roundTo\(float64\(a\)\*2\.5, 1\)/);
  });

  it('gives a Go function a pointer to a list it changes', () => {
    const code = codeOf('function more(list)\n    add(list, 4)\n    list[1] = 0\nvalues = [1]\nmore(values)', 'go');
    assert.match(code, /func more\(list \*\[\]int\) \{\n\t\*list = append\(\*list, 4\)\n\t\(\*list\)\[0\] = 0\n\}/);
    assert.match(code, /more\(&values\)/);
  });

  it('writes Kotlin with val for one value, mutableListOf() and string templates', () => {
    const code = [
      'function total(numbers)',
      '    sum = 0',
      '    for n in numbers',
      '        sum = sum + n',
      '    return sum',
      'scores = [7, 9]',
      'add(scores, 8)',
      'name = input()',
      'print("Total: {total(scores)}, {name}")'
    ].join('\n');
    assert.strictEqual(
      codeOf(code, 'kotlin'),
      [
        'fun total(numbers: MutableList<Int>): Int {',
        '    var sum = 0',
        '    for (n in numbers) {',
        '        sum = sum + n',
        '    }',
        '    return sum',
        '}',
        '',
        'fun main() {',
        '    val scores = mutableListOf(7, 9)',
        '    scores.add(8)',
        '    val name = readln()',
        '    println("Total: ${total(scores)}, $name")',
        '}',
        ''
      ].join('\n')
    );
  });

  it('writes a name in a Kotlin template in braces when a letter follows it, and $ as \\$', () => {
    assert.match(
      codeOf('name = "Ani"\nprint("{name}s cost $5, {name}!")', 'kotlin'),
      /"\$\{name\}s cost \\\$5, \$name!"/
    );
  });

  it('repeats in Kotlin with repeat(), but with a loop for a block that breaks out of it', () => {
    assert.match(codeOf('repeat 3 times\n    print(1)', 'kotlin'), /repeat\(3\) \{\n {8}println\(1\)/);
    assert.match(codeOf('repeat 3 times\n    break', 'kotlin'), /for \(i in 1\.\.3\) \{\n {8}break/);
  });

  it('counts a Kotlin for over a range, and gives the counter the program reads after the loop each value', () => {
    assert.match(codeOf('for i from 10 to 1 step -2\n    print(i)', 'kotlin'), /for \(i in 10 downTo 1 step 2\)/);
    assert.match(
      codeOf('for j from 1 to 3\n    print(j)\nprint(j)', 'kotlin'),
      /var j = 0\n {4}for \(value in 1\.\.3\) \{\n {8}j = value\n/
    );
  });

  it('makes a whole number real where Kotlin needs a Double', () => {
    const code = codeOf(
      'x = 1\nx = x / 2\nn = 3\ny = 2.5\nprint(n / 2)\nprint(n == y)\nprint(square_root(n))',
      'kotlin'
    );
    assert.match(code, /var x = 1\.0\n/);
    assert.match(code, /show\(n\.toDouble\(\) \/ 2\)/);
    assert.match(code, /println\(n\.toDouble\(\) == y\)/);
    assert.match(code, /show\(sqrt\(n\.toDouble\(\)\)\)/);
  });

  it('writes Swift as a script, with let for one value, a var for a list it changes, and interpolation', () => {
    const code = [
      'function total(numbers)',
      '    sum = 0',
      '    for n in numbers',
      '        sum = sum + n',
      '    return sum',
      'scores = [7, 9]',
      'add(scores, 8)',
      'name = input()',
      'print("Total: {total(scores)}, {name}")'
    ].join('\n');
    assert.strictEqual(
      codeOf(code, 'swift'),
      [
        'func total(_ numbers: [Int]) -> Int {',
        '    var sum = 0',
        '    for n in numbers {',
        '        sum = sum + n',
        '    }',
        '    return sum',
        '}',
        '',
        'var scores = [7, 9]',
        'scores.append(8)',
        'let name = readLine() ?? ""',
        'print("Total: \\(total(scores)), \\(name)")',
        ''
      ].join('\n')
    );
  });

  it('gives a Swift function a list it changes inout, and removes an item by its index', () => {
    const code = codeOf(
      'function more(list)\n    add(list, 4)\nvalues = [1]\nmore(values)\nremove(values, 1)',
      'swift'
    );
    assert.match(code, /func more\(_ list: inout \[Int\]\) \{\n {4}list\.append\(4\)\n\}/);
    assert.match(
      code,
      /more\(&values\)\nif let index = values\.firstIndex\(of: 1\) \{\n {4}values\.remove\(at: index\)\n\}/
    );
  });

  it('makes a whole number a Double where Swift meets it with one', () => {
    const code = codeOf('x = 7\ny = x / 2 + 2.5 * x\nprint(x % 2.5)', 'swift');
    assert.match(code, /let y = Double\(x\) \/ 2 \+ 2\.5 \* Double\(x\)/);
    assert.match(code, /Double\(x\)\.truncatingRemainder\(dividingBy: 2\.5\)/);
  });

  it('counts a Swift for over a range of numbers written in the program, else with stride, which may count none', () => {
    assert.match(codeOf('for i from 1 to 3\n    print(1)', 'swift'), /for _ in 1\.\.\.3 \{/);
    assert.match(
      codeOf('for i from 5 to 1\n    print(i)', 'swift'),
      /for i in stride\(from: 5, through: 1, by: 1\) \{/
    );
    assert.match(
      codeOf('n = 10\nfor i from n to 1 step -2\n    print(i)', 'swift'),
      /for i in stride\(from: n, through: 1, by: -2\) \{/
    );
  });

  it('writes Rust with a mut for a variable that changes, a borrowed list, and println! with a format', () => {
    const code = [
      'function total(numbers)',
      '    sum = 0',
      '    for n in numbers',
      '        sum = sum + n',
      '    return sum',
      'scores = [7, 9]',
      'add(scores, 8)',
      'print("Total: {total(scores)}")'
    ].join('\n');
    assert.strictEqual(
      codeOf(code, 'rust'),
      [
        'fn total(numbers: &Vec<i64>) -> i64 {',
        '    let mut sum: i64 = 0;',
        '    for &n in numbers {',
        '        sum = sum + n;',
        '    }',
        '    return sum;',
        '}',
        '',
        'fn main() {',
        '    let mut scores = vec![7, 9];',
        '    scores.push(8);',
        '    println!("Total: {}", total(&scores));',
        '}',
        ''
      ].join('\n')
    );
  });

  it('gives a Rust function a list it changes as &mut, and a text as &str', () => {
    const code = codeOf('function more(list, word)\n    add(list, word)\nwords = ["a"]\nmore(words, "b")', 'rust');
    assert.match(code, /fn more\(list: &mut Vec<String>, word: &str\) \{\n {4}list\.push\(word\.to_string\(\)\);/);
    assert.match(code, /more\(&mut words, "b"\);/);
  });

  it('copies a text or a list in Rust where the program keeps it too, by clone()', () => {
    const code = codeOf('words = ["a"]\nword = "b"\nadd(words, word)\nfirst = words[1]\nprint(first + word)', 'rust');
    assert.match(code, /let mut words = vec!\["a"\.to_string\(\)\];\n {4}let word = "b"\.to_string\(\);/);
    assert.match(
      code,
      /words\.push\(word\.clone\(\)\);\n {4}let first = words\[0\]\.clone\(\);\n {4}println!\("\{first\}\{word\}"\);/
    );
  });

  it('counts a Rust for over a range, backwards with rev() and by a step with step_by()', () => {
    assert.match(
      codeOf('for i from 10 to 1 step -3\n    print(i)', 'rust'),
      /for i in \(1\.\.=10\)\.rev\(\)\.step_by\(3\) \{/
    );
    assert.match(
      codeOf('x = 7\nprint(x / 2 > 3)', 'rust'),
      /let x: i64 = 7;\n {4}println!\("\{\}", x as f64 \/ 2\.0 > 3\.0\);/
    );
  });

  it('writes PHP as PSR-12 lays it out, with variables in texts and other values joined with .', () => {
    const code = [
      'function total(numbers)',
      '    sum = 0',
      '    for n in numbers',
      '        sum = sum + n',
      '    return sum',
      'scores = [7, 9]',
      'add(scores, 8)',
      'name = input()',
      'print("Total: {total(scores)}, {name}!")'
    ].join('\n');
    assert.strictEqual(
      codeOf(code, 'php'),
      [
        '<?php',
        '',
        'function total(array $numbers): int',
        '{',
        '    $sum = 0;',
        '    foreach ($numbers as $n) {',
        '        $sum = $sum + $n;',
        '    }',
        '    return $sum;',
        '}',
        '',
        '$scores = [7, 9];',
        '$scores[] = 8;',
        '$name = rtrim(fgets(STDIN), "\\r\\n");',
        'echo "Total: " . total($scores) . ", $name!\\n";',
        ''
      ].join('\n')
    );
  });

  it('gives a PHP function a list it changes by reference, and compares texts with ===', () => {
    const code = codeOf(
      'function more(list)\n    add(list, 4)\nvalues = [1]\nmore(values)\nname = "1e3"\nprint(name == "1000")',
      'php'
    );
    assert.match(code, /function more\(array &\$list\): void\n\{\n {4}\$list\[\] = 4;\n\}/);
    assert.match(code, /more\(\$values\);/);
    assert.match(code, /echo \(\$name === "1000" \? "true" : "false"\) \. "\\n";/);
  });

  it('writes a $ in a PHP text as \\$, and a variable in braces when a letter or a mark past ASCII follows it', () => {
    assert.match(codeOf('name = "Ani"\nprint("{name}s cost $5")', 'php'), /echo "\{\$name\}s cost \\\$5\\n";/);
    assert.match(codeOf('line = "a"\nprint("{line}⭐ {line}")', 'php'), /echo "\{\$line\}⭐ \$line\\n";/);
  });

  it('writes Ruby with values in its texts, each for a list and the helpers first, which Ruby runs from the top', () => {
    const code = [
      'function total(numbers)',
      '    sum = 0',
      '    for n in numbers',
      '        sum = sum + n',
      '    return sum',
      'scores = [7, 9]',
      'add(scores, 8)',
      'name = input()',
      'print("Total: {total(scores)}, {name}! {total(scores) / 2}")'
    ].join('\n');
    const written = codeOf(code, 'ruby');
    assert.ok(written.indexOf('def show(') < written.indexOf('def total('));
    assert.ok(
      written.endsWith(
        [
          'def total(numbers)',
          '  sum = 0',
          '  numbers.each do |n|',
          '    sum = sum + n',
          '  end',
          '  return sum',
          'end',
          '',
          'scores = [7, 9]',
          'scores << 8',
          'name = gets.chomp',
          'puts "Total: #{total(scores)}, #{name}! #{show(total(scores).fdiv(2))}"',
          ''
        ].join('\n')
      ),
      written
    );
  });

  it('repeats in Ruby with times, but with a for for a loop that makes a variable the program has after it', () => {
    assert.match(codeOf('repeat 3 times\n    print("hi")', 'ruby'), /^3\.times do\n {2}puts "hi"\nend/m);
    assert.match(
      codeOf('repeat 2 times\n    last = 5\nprint(last)', 'ruby'),
      /^for _ in 1\.\.2\n {2}last = 5\nend\nputs last/m
    );
    assert.match(codeOf('for i from 1 to 3\n    print(i)\nprint(i)', 'ruby'), /^for i in 1\.\.3\n/m);
    assert.match(codeOf('for i from 10 to 1 step -2\n    print(i)', 'ruby'), /^10\.step\(1, -2\) do \|i\|/m);
  });

  it('starts a Ruby name with a small letter, since a name with a capital first is a constant', () => {
    assert.match(codeOf('X = 5\nX = X + 1\nprint(X)', 'ruby'), /^x = 5\nx = x \+ 1\nputs x/m);
  });

  it('writes Lua with local variables, tables that count from 1 as CMIL does, and texts joined with ..', () => {
    const code = [
      'function total(numbers)',
      '    sum = 0',
      '    for n in numbers',
      '        sum = sum + n',
      '    return sum',
      'scores = [7, 9]',
      'add(scores, 8)',
      'name = input()',
      'print("Total: {total(scores)}, {name}! {scores[1]}")'
    ].join('\n');
    assert.strictEqual(
      codeOf(code, 'lua'),
      [
        'function total(numbers)',
        '  local sum = 0',
        '  for _, n in ipairs(numbers) do',
        '    sum = sum + n',
        '  end',
        '  return sum',
        'end',
        '',
        'local scores = {7, 9}',
        'table.insert(scores, 8)',
        'local name = io.read()',
        'print("Total: " .. total(scores) .. ", " .. name .. "! " .. scores[1])',
        ''
      ].join('\n')
    );
  });

  it('declares a Lua local before the block that first gives it a value, when the program has it after it', () => {
    assert.match(
      codeOf('if 1 > 0\n    big = 1\nprint(big)', 'lua'),
      /^local big\nif 1 > 0 then\n {2}big = 1\nend\nprint\(big\)/m
    );
  });

  it('continues a Lua loop with goto continue, to a label at the end of its block', () => {
    assert.match(
      codeOf('for i from 1 to 5\n    if i == 2\n        continue\n    print(i)', 'lua'),
      /for i = 1, 5 do\n {2}if i == 2 then\n {4}goto continue\n {2}end\n {2}print\(i\)\n {2}::continue::\nend/
    );
  });

  it('writes a Lua not of a comparison in brackets, since not binds more tightly than ==', () => {
    assert.match(codeOf('a = 1\nprint(not (a == 2))', 'lua'), /print\(not \(a == 2\)\)/);
  });

  it('writes BASIC in FreeBASIC, with Dim, arrays that grow by ReDim Preserve, and the answers of Open Cons', () => {
    const code = [
      'function total(numbers)',
      '    sum = 0',
      '    for n in numbers',
      '        sum = sum + n',
      '    return sum',
      'scores = [7, 9]',
      'add(scores, 8)',
      'name = input()',
      'print("Total: {total(scores)}, {name}")'
    ].join('\n');
    assert.strictEqual(
      codeOf(code, 'basic'),
      [
        'Function total(numbers() As Integer) As Integer',
        '    Dim As Integer sum = 0',
        '    For i As Integer = 0 To UBound(numbers)',
        '        Dim As Integer n = numbers(i)',
        '        sum = sum + n',
        '    Next',
        '    Return sum',
        'End Function',
        '',
        "Open Cons For Input As #1 ' the answers of the user",
        'ReDim As Integer scores(1)',
        'scores(0) = 7',
        'scores(1) = 9',
        'ReDim Preserve scores(UBound(scores) + 1)',
        'scores(UBound(scores)) = 8',
        'Dim As String name_',
        'Line Input #1, name_',
        'Print "Total: " & total(scores()) & ", " & name_',
        ''
      ].join('\n')
    );
  });

  it('gives a BASIC list that never grows its items at once, and ends a loop with Exit', () => {
    const code = codeOf(
      'days = [1, 2]\nprint(days[2])\ni = 0\ndo\n    i = i + 1\n    if i == 2\n        break\nwhile i < 5',
      'basic'
    );
    assert.match(code, /^Dim As Integer days\(1\) = \{1, 2\}\nPrint Str\(days\(1\)\)/m);
    assert.match(code, /Do\n {4}i = i \+ 1\n {4}If i = 2 Then\n {8}Exit Do\n {4}End If\nLoop While i < 5/);
  });

  it("can't write a list of lists in BASIC, whose arrays can't hold one", () => {
    assert.deepStrictEqual(convert('a = [[1], [2]]\nprint(length_of(a))', 'en', 'basic'), {
      problems: [{id: 'fixedArrays', line: 1, target: 'BASIC'}]
    });
    //a loop whose condition needs an array of its own makes it before the loop, and again before each test
    assert.match(
      codeOf('t = "a"\nwhile length_of(split(t)) < 3\n    t = t + " b"', 'basic'),
      /SplitWords\(t, items\(\)\)\nDo While UBound\(items\) \+ 1 < 3\n {4}t = t & " b"\n {4}SplitWords\(t, items\(\)\)\nLoop/
    );
  });

  it('writes Visual Basic as dotnet new console -lang VB makes a program: a Module Program, under Option Strict On', () => {
    const code = [
      'function total(numbers)',
      '    sum = 0',
      '    for n in numbers',
      '        sum = sum + n',
      '    return sum',
      'scores = [7, 9]',
      'add(scores, 8)',
      'name = input()',
      'print("Total: {total(scores)}, {name}")'
    ].join('\n');
    assert.strictEqual(
      codeOf(code, 'visualbasic'),
      [
        'Option Strict On',
        '',
        'Imports System',
        'Imports System.Collections.Generic',
        '',
        'Module Program',
        '    Function total(numbers As List(Of Integer)) As Integer',
        '        Dim sum As Integer = 0',
        '        For Each n As Integer In numbers',
        '            sum = sum + n',
        '        Next',
        '        Return sum',
        '    End Function',
        '',
        '    Sub Main()',
        '        Dim scores As New List(Of Integer) From {7, 9}',
        '        scores.Add(8)',
        '        Dim name As String = Console.ReadLine()',
        '        Console.WriteLine($"Total: {total(scores)}, {name}")',
        '    End Sub',
        'End Module',
        ''
      ].join('\n')
    );
  });

  it('writes Visual Basic by its precedence, its words whatever their case, and a new list in brackets before a dot', () => {
    const code = codeOf(
      'math = 7\nlist = [1, 2]\nprint(math % 2 * 3)\nprint(not math == 2)\nprint(length_of([1, 2]))\nprint("a\\nb")\ndo\n    math = math - 1\n    if math == 2\n        break\nwhile math > 0',
      'visualbasic'
    );
    //math would hide Math; List is a type wherever Visual Basic expects one, so list can be a name
    assert.match(code, /Dim math_ As Integer = 7\n {8}Dim list As New List\(Of Integer\) From \{1, 2\}/);
    //Mod binds more loosely than *, and Not more loosely than =
    assert.match(code, /Console\.WriteLine\(\(math_ Mod 2\) \* 3\)/);
    assert.match(code, /If\(Not math_ = 2, "true", "false"\)/);
    assert.match(code, /Console\.WriteLine\(\(New List\(Of Integer\) From \{1, 2\}\)\.Count\)/);
    assert.match(code, /Console\.WriteLine\(\$"a\{vbLf\}b"\)/);
    assert.match(
      code,
      /Do\n {12}math_ = math_ - 1\n {12}If math_ = 2 Then\n {16}Exit Do\n {12}End If\n {8}Loop While math_ > 0/
    );
  });

  it('writes Fortran with every variable declared first, arrays that grow by [list, x] and functions after contains', () => {
    const code = [
      'function total(numbers)',
      '    sum = 0',
      '    for n in numbers',
      '        sum = sum + n',
      '    return sum',
      'scores = [7, 9]',
      'add(scores, 8)',
      'name = input()',
      'print("Total: {total(scores)}, {name}")'
    ].join('\n');
    const fortran = codeOf(code, 'fortran');
    assert.strictEqual(
      fortran.slice(0, fortran.indexOf('\n\n    ! an answer')),
      [
        'program main',
        '    implicit none',
        '',
        '    interface str',
        '        procedure str_integer',
        '    end interface',
        '',
        '    integer, allocatable :: scores(:)',
        '    character(len=:), allocatable :: name',
        '',
        '    scores = [7, 9]',
        '    scores = [scores, 8]',
        '    name = read_text()',
        '    print \'(a)\', "Total: " // str(total(scores)) // ", " // name',
        '',
        'contains',
        '    function total(numbers) result(answer)',
        '        integer, intent(in) :: numbers(:)',
        '        integer :: answer',
        '        integer :: sum',
        '        integer :: n',
        '        integer :: i',
        '',
        '        sum = 0',
        '        do i = 1, size(numbers)',
        '            n = numbers(i)',
        '            sum = sum + n',
        '        end do',
        '        answer = sum',
        '    end function total'
      ].join('\n')
    );
  });

  it('writes Fortran by its rules: no two operators in a row, real division, texts in lists, and do … while', () => {
    const code = codeOf(
      'x = 7\nprint(x * -2)\nprint(not x == 2)\nprint(7 / 2)\ndays = ["mon", "tue"]\nadd(days, "wed")\nprint(days[2])\ni = 0\ndo\n    i = i + 1\n    if i == 2\n        continue\nwhile i < 3',
      'fortran'
    );
    assert.match(code, /print '\(i0\)', x \* \(-2\)/);
    assert.match(code, /print '\(a\)', str\(\.not\. x == 2\)/);
    assert.match(code, /print '\(a\)', str\(7\.0_dp \/ 2\)/);
    assert.match(
      code,
      /days = \[string\("mon"\), string\("tue"\)\]\n {4}days = \[days, string\("wed"\)\]\n {4}print '\(a\)', days\(2\)%value/
    );
    //a continue of a do … while tests its condition first
    assert.match(
      code,
      /do\n {8}i = i \+ 1\n {8}if \(i == 2\) then\n {12}if \(i >= 3\) exit\n {12}cycle\n {8}end if\n {8}if \(i >= 3\) exit\n {4}end do/
    );
  });

  it('computes a value Fortran would print or read while it prints first, and cuts a long line after an &', () => {
    const asks = codeOf(
      'function ask(question)\n    print(question)\n    return input()\nprint(ask("Name?") + "!")',
      'fortran'
    );
    assert.match(asks, /shown = ask\("Name\?"\) \/\/ "!"\n {4}print '\(a\)', shown/);
    const long = codeOf(`print("${'word '.repeat(40)}")`, 'fortran');
    assert.ok(long.split('\n').every(line => new TextEncoder().encode(line).length <= 132));
    assert.match(long, /print '\(a\)', &\n {8}"word .*word&\n {8}& word/);
  });

  it('writes Tcl with procs first, values in texts, incr, foreach and lappend', () => {
    const code = [
      'function total(numbers)',
      '    sum = 0',
      '    for n in numbers',
      '        sum = sum + n',
      '    return sum',
      'scores = [7, 9]',
      'add(scores, 8)',
      'name = input()',
      'print("Total: {total(scores)}, {name}")'
    ].join('\n');
    assert.strictEqual(
      codeOf(code, 'tcl'),
      [
        'proc total {numbers} {',
        '    set sum 0',
        '    foreach n $numbers {',
        '        incr sum $n',
        '    }',
        '    return $sum',
        '}',
        '',
        'set scores [list 7 9]',
        'lappend scores 8',
        'set name [gets stdin]',
        'puts "Total: [total $scores], $name"',
        ''
      ].join('\n')
    );
  });

  it('writes Tcl arithmetic in expr, lists of lists by lset, a list a proc changes by upvar, and ;# comments', () => {
    const code = codeOf(
      'x = 7 # seven\nprint(x / 2)\nprint("{x}th {x}")\nfor i from 10 to 1 step -3\n    print(i)\nt = [[1, 2], [3]]\nadd(t[1], 5)\nt[2][1] = 4\nremove(t[1], 1)\nprint(join(t[1], ", "))\ndo\n    x = x - 1\nwhile x > 5',
      'tcl'
    );
    assert.match(
      code,
      /^set x 7 ;# seven\nputs \[show \[expr \{double\(\$x\) \/ 2\}\] number\]\nputs "\$\{x\}th \$x"$/m
    );
    assert.match(code, /for \{set i 10\} \{\$i >= 1\} \{incr i -3\} \{/);
    assert.match(
      code,
      /lset t 0 end\+1 5\nlset t 1 0 4\nlset t 0 \[remove_item \[lindex \$t 0\] 1\]\nputs \[join \[lindex \$t 0\] ", "\]/
    );
    assert.match(code, /while 1 \{\n {4}incr x -1\n {4}if \{\$x <= 5\} break\n\}/);
    const fill = codeOf('function fill(list)\n    add(list, 0)\nnumbers = []\nfill(numbers)', 'tcl');
    assert.match(fill, /proc fill \{listVar\} \{\n {4}upvar 1 \$listVar list\n {4}lappend list 0\n\}/);
    assert.match(fill, /^fill numbers$/m);
  });

  it('writes COBOL in free format: tables with their counts, numbers shown by edited fields, and functions CALLed', () => {
    const code = [
      'function total(numbers)',
      '    sum = 0',
      '    for n in numbers',
      '        sum = sum + n',
      '    return sum',
      'scores = [7, 9]',
      'add(scores, 8)',
      'name = input()',
      'print("Total: {total(scores)}, {name}")'
    ].join('\n');
    const cobol = codeOf(code, 'cobol');
    assert.strictEqual(
      cobol,
      [
        '       >>SOURCE FORMAT FREE',
        'IDENTIFICATION DIVISION.',
        'PROGRAM-ID. main-program.',
        'DATA DIVISION.',
        'WORKING-STORAGE SECTION.',
        '01 scores.',
        '    05 scores-count PIC 9(9) VALUE 0.',
        '    05 scores-item PIC S9(18) OCCURS 0 TO 1000 TIMES DEPENDING ON scores-count.',
        '01 name PIC X(1000).',
        '01 shown-number PIC -(18)9.',
        '01 whole-value PIC S9(18).',
        'PROCEDURE DIVISION.',
        '    MOVE 2 TO scores-count',
        '    MOVE 7 TO scores-item(1)',
        '    MOVE 9 TO scores-item(2)',
        '    ADD 1 TO scores-count',
        '    MOVE 8 TO scores-item(scores-count)',
        '    ACCEPT name',
        '    CALL "total" USING BY REFERENCE scores whole-value',
        '    MOVE whole-value TO shown-number',
        '    DISPLAY "Total: " FUNCTION TRIM(shown-number) ", " FUNCTION TRIM(name TRAILING)',
        '    STOP RUN.',
        'END PROGRAM main-program.',
        '',
        'IDENTIFICATION DIVISION.',
        'PROGRAM-ID. total.',
        'DATA DIVISION.',
        'LOCAL-STORAGE SECTION.',
        '01 the-sum PIC S9(18).',
        '01 n PIC S9(18).',
        '01 i PIC S9(18).',
        'LINKAGE SECTION.',
        '01 the-numbers.',
        '    05 the-numbers-count PIC 9(9).',
        '    05 the-numbers-item PIC S9(18) OCCURS 0 TO 1000 TIMES DEPENDING ON the-numbers-count.',
        '01 answer PIC S9(18).',
        'PROCEDURE DIVISION USING the-numbers answer.',
        '    MOVE 0 TO the-sum',
        '    PERFORM VARYING i FROM 1 BY 1 UNTIL i > the-numbers-count',
        '        MOVE the-numbers-item(i) TO n',
        '        ADD n TO the-sum',
        '    END-PERFORM',
        '    MOVE the-sum TO answer',
        '    GOBACK.',
        'END PROGRAM total.',
        ''
      ].join('\n')
    );
  });

  it('writes x86-64 assembly as a course does: variables in the frame by .set, lists by helpers, and printf', () => {
    const code = [
      'function total(numbers)',
      '    sum = 0',
      '    for n in numbers',
      '        sum = sum + n',
      '    return sum',
      'scores = [7, 9]',
      'add(scores, 8)',
      'name = input()',
      'print("Total: {total(scores)}, {name}")'
    ].join('\n');
    const assembly = codeOf(code, 'x86-64');
    assert.strictEqual(
      assembly.slice(0, assembly.indexOf('\n\n# an answer')),
      [
        '    .intel_syntax noprefix',
        '',
        '    .section .rodata',
        '.Lformat1:',
        '    .string "Total: %lld, %s\\n"',
        '.Lnew_line:',
        '    .string "\\n"',
        '',
        '    .text',
        '    .globl main',
        '',
        'total:',
        '    .set numbers, -8',
        '    .set sum, -16',
        '    .set n, -24',
        '    .set k, -32',
        '    push rbp',
        '    mov rbp, rsp',
        '    sub rsp, 32',
        '    mov qword ptr [rbp + numbers], rdi',
        '    mov qword ptr [rbp + sum], 0',
        '    mov qword ptr [rbp + k], 0',
        '.Lfor1:',
        '    mov rax, qword ptr [rbp + numbers]',
        '    mov rcx, qword ptr [rbp + k]',
        '    cmp rcx, qword ptr [rax]',
        '    jge .Lfor1_end',
        '    mov rax, qword ptr [rax + 8]',
        '    mov rax, qword ptr [rax + rcx*8]',
        '    mov qword ptr [rbp + n], rax',
        '    mov rax, qword ptr [rbp + sum]',
        '    add rax, qword ptr [rbp + n]',
        '    mov qword ptr [rbp + sum], rax',
        '.Lfor1_next:',
        '    inc qword ptr [rbp + k]',
        '    jmp .Lfor1',
        '.Lfor1_end:',
        '    mov rax, qword ptr [rbp + sum]',
        '    leave',
        '    ret',
        '',
        'main:',
        '    .set scores, -8',
        '    .set name, -16',
        '    push rbp',
        '    mov rbp, rsp',
        '    sub rsp, 16',
        '    call list_new',
        '    mov qword ptr [rbp + scores], rax',
        '    mov rdi, qword ptr [rbp + scores]',
        '    mov rsi, 7',
        '    call list_add',
        '    mov rdi, qword ptr [rbp + scores]',
        '    mov rsi, 9',
        '    call list_add',
        '    mov rdi, qword ptr [rbp + scores]',
        '    mov rsi, 8',
        '    call list_add',
        '    call read_text',
        '    mov qword ptr [rbp + name], rax',
        '    mov rdi, qword ptr [rbp + scores]',
        '    call total',
        '    mov rsi, rax',
        '    lea rdi, [rip + .Lformat1]',
        '    mov rdx, qword ptr [rbp + name]',
        '    mov eax, 0',
        '    call printf@PLT',
        '    mov eax, 0',
        '    leave',
        '    ret'
      ].join('\n')
    );
    //a name of a register, in any case, isn't a variable
    assert.match(codeOf('rax = 1\nAl = 2\nprint(rax + Al)', 'x86-64'), /\.set rax_, -8\n {4}\.set Al_, -16/);
  });

  it('writes x86-64 assembly in AT&T syntax: the source first, % before a register, $ before a number', () => {
    assert.strictEqual(
      codeOf('x = 5 # five\nwhile x > 3\n    print("x is {x}")\n    x = x - 1', 'x86-64-att'),
      [
        '    .section .rodata',
        '.Lformat1:',
        '    .string "x is %lld\\n"',
        '',
        '    .text',
        '    .globl main',
        '',
        'main:',
        '    .set x, -8',
        '    pushq %rbp',
        '    movq %rsp, %rbp',
        '    subq $16, %rsp',
        '    movq $5, x(%rbp) # five',
        '.Lwhile1:',
        '    cmpq $3, x(%rbp)',
        '    jle .Lwhile1_end',
        '    leaq .Lformat1(%rip), %rdi',
        '    movq x(%rbp), %rsi',
        '    movl $0, %eax',
        '    call printf@PLT',
        '    movq x(%rbp), %rax',
        '    subq $1, %rax',
        '    movq %rax, x(%rbp)',
        '    jmp .Lwhile1',
        '.Lwhile1_end:',
        '    movl $0, %eax',
        '    leave',
        '    ret',
        '',
        '    .section .note.GNU-stack,"",@progbits # the stack holds no code',
        ''
      ].join('\n')
    );
  });

  it('writes x86-64 assembly for NASM: its directives, a variable as a local label, and rel', () => {
    assert.strictEqual(
      codeOf('x = 5 # five\nwhile x > 3\n    print("x is {x}")\n    x = x - 1', 'x86-64-nasm'),
      [
        '    extern printf',
        '',
        '    section .rodata',
        'data.format1:',
        '    db `x is %lld\\n`, 0',
        '',
        '    section .text',
        '    global main',
        '',
        'main:',
        '    .x equ -8',
        '    push rbp',
        '    mov rbp, rsp',
        '    sub rsp, 16',
        '    mov qword [rbp + .x], 5 ; five',
        '.while1:',
        '    cmp qword [rbp + .x], 3',
        '    jle .while1_end',
        '    lea rdi, [rel data.format1]',
        '    mov rsi, qword [rbp + .x]',
        '    mov eax, 0',
        '    call printf wrt ..plt',
        '    mov rax, qword [rbp + .x]',
        '    sub rax, 1',
        '    mov qword [rbp + .x], rax',
        '    jmp .while1',
        '.while1_end:',
        '    mov eax, 0',
        '    leave',
        '    ret',
        '',
        '    section .note.GNU-stack noalloc noexec nowrite progbits ; the stack holds no code',
        ''
      ].join('\n')
    );
  });

  it('writes COBOL loops by PERFORM, more tests by EVALUATE TRUE, and a function that calls itself IS RECURSIVE', () => {
    const code = codeOf(
      'function countdown(n)\n    if n > 0\n        countdown(n - 1)\n    return -1\ni = 0\ndo\n    i = i + 1\n    if i == 2\n        continue\nwhile i < 3\nwhile i > 0\n    i = i - 1\nif i == 1\n    print(1)\nelse if i == 2\n    print(2)\nelse\n    print(3)',
      'cobol'
    );
    assert.match(
      code,
      /PERFORM WITH TEST AFTER UNTIL i >= 3\n {8}ADD 1 TO i\n {8}IF i = 2\n {12}EXIT PERFORM CYCLE\n {8}END-IF\n {4}END-PERFORM/
    );
    assert.match(code, /PERFORM UNTIL i <= 0\n {8}SUBTRACT 1 FROM i\n {4}END-PERFORM/);
    assert.match(
      code,
      /EVALUATE TRUE\n {4}WHEN i = 1\n[\s\S]*\n {4}WHEN i = 2\n[\s\S]*\n {4}WHEN OTHER\n[\s\S]*\n {4}END-EVALUATE/
    );
    assert.match(code, /PROGRAM-ID\. countdown IS RECURSIVE\./);
    //GnuCOBOL builds a COMPUTE of numbers only in the first program, so a function moves their value
    assert.match(code, /MOVE -1 TO answer/);
  });

  it('gives a lambda of C# and Visual Basic a parameter no variable of the program has, which C# 7.3 needs', () => {
    const code = 'item = 2\nprint(join([1.5, item], ", "))';
    assert.match(codeOf(code, 'csharp-classic'), /\.Select\(each => Show\(each\)\)/);
    assert.match(codeOf(code, 'visualbasic'), /\.Select\(Function\(each\) Show\(each\)\)/);
  });

  it('writes BASIC with If, ElseIf and Else, as FreeBASIC writes its words', () => {
    assert.strictEqual(
      codeOf('x = 1\nif x > 1\n    print(1)\nelse if x > 0\n    print(2)\nelse\n    print(3)', 'basic'),
      [
        'Dim As Integer x = 1',
        'If x > 1 Then',
        '    Print Str(1)',
        'ElseIf x > 0 Then',
        '    Print Str(2)',
        'Else',
        '    Print Str(3)',
        'End If',
        ''
      ].join('\n')
    );
  });

  it('writes the opposite of an opposite number in brackets, which two minus signs would make one less', () => {
    for (const {id} of targets.filter(({id}) => !id.startsWith('x86-64'))) {
      assert.match(codeOf('x = 5\nprint(-(-x))', id), /-\(-\$?x\)/, id);
    }
    //assembly has no expressions, but an instruction for each minus
    assert.match(codeOf('x = 5\nprint(-(-x))', 'x86-64'), /mov rax, qword ptr \[rbp \+ x\]\n {4}neg rax\n {4}neg rax/);
    assert.match(codeOf('x = 5\nprint(-(-x))', 'x86-64-att'), /movq x\(%rbp\), %rax\n {4}negq %rax\n {4}negq %rax/);
    assert.match(
      codeOf('x = 5\nprint(-(-x))', 'x86-64-nasm'),
      /mov rax, qword \[rbp \+ \.x\]\n {4}neg rax\n {4}neg rax/
    );
  });

  it('grows a text in C with strcat, and makes a text that reads itself in another one first', () => {
    const code = codeOf('line = "a"\nline = line + "⭐"\nline = "<" + line + ">"', 'c');
    assert.match(code, /strcat\(line, "⭐"\);/);
    assert.match(code, /char text\[100\];\n {4}snprintf\(text, 100, "<%s>", line\);\n {4}strcpy\(line, text\);/);
  });

  it("gives the problem of what C's fixed arrays can't hold, like a list of lists", () => {
    assert.deepStrictEqual(convert('t = [[1], [2]]\nprint(length_of(t))', 'en', 'c'), {
      problems: [{id: 'fixedArrays', line: 1, target: 'C'}]
    });
    assert.deepStrictEqual(convert('a = [1]\nb = a', 'en', 'c'), {
      problems: [{id: 'fixedArrays', line: 2, target: 'C'}]
    });
    assert.strictEqual(
      problemOf({id: 'fixedArrays', line: 1, target: 'C'}, 'en'),
      "Line 1: C can't write this program with the fixed arrays of a first course, like a list of lists or a function that gives a list."
    );
  });

  it('writes what Java needs where its objects differ from its values', () => {
    //texts are equal by equals(), remove(int) removes at a place, and a list of real numbers has 1.0
    const java = codeOf(
      'name = "Ann"\nprint(name == "Ann")\nlist = [1, 2]\nremove(list, 2)\nhalves = [0.5]\nadd(halves, 1)\nprint(halves[2])',
      'java'
    );
    assert.match(java, /IO\.println\(name\.equals\("Ann"\)\);/);
    assert.match(java, /list\.remove\(Integer\.valueOf\(2\)\);/);
    assert.match(java, /halves\.add\(1\.0\);/);
  });

  it('gives a list in C# the type of its place, also an empty one', () => {
    const code = 'words = []\nadd(words, "a")\nt = [[], ["x"]]\nadd(t, [])';
    assert.match(
      codeOf(code, 'csharp-classic'),
      /List<string> words = new List<string>\(\);[^]*List<List<string>> t = new List<List<string>> \{ new List<string>\(\), new List<string> \{ "x" \} \};\n\s+t\.Add\(new List<string>\(\)\);/
    );
    assert.match(
      codeOf(code, 'csharp'),
      /List<string> words = \[\];[^]*List<List<string>> t = \[\[\], \["x"\]\];\nt\.Add\(\[\]\);/
    );
  });

  it('writes the usings a C# program needs, also for a list it gets from a function', () => {
    assert.strictEqual(
      codeOf('words = split("a b")\nprint(length_of(words))', 'csharp'),
      [
        'using System;',
        'using System.Collections.Generic;',
        'using System.Linq;',
        '',
        'List<string> words = "a b".Split(\' \', StringSplitOptions.RemoveEmptyEntries).ToList();',
        'Console.WriteLine(words.Count);',
        ''
      ].join('\n')
    );
  });

  it("gives the problems of a program a typed language can't write, and the error of a program that has one", () => {
    assert.deepStrictEqual(convert('x = 1\nx = "one"\nt = [1, "a"]', 'en', 'cpp'), {
      problems: [
        {id: 'mixedTypes', line: 2, name: 'x', target: 'C++'},
        {id: 'mixedItems', line: 3, target: 'C++'}
      ]
    });
    assert.deepStrictEqual(convert('x = 1\nx = "one"', 'en', 'csharp'), {
      problems: [{id: 'mixedTypes', line: 2, name: 'x', target: 'C#'}]
    });
    assert.deepStrictEqual(convert('x = 1\nx = "one"', 'en', 'java-classic'), {
      problems: [{id: 'mixedTypes', line: 2, name: 'x', target: 'Java'}]
    });
    assert.ok('code' in convert('x = 1\nx = "one"', 'en', 'python'));
    assert.deepStrictEqual(convert('print(', 'en', 'python'), {error: {id: 'syntaxError', line: 1}});
  });

  it('gives the error CMIL stops with where the types show a value an operator, a function or a statement cannot take', () => {
    //short programs of every operator, function, index, condition and statement, with values of every type; a text
    //that is a number and an index of 1, so that CMIL's errors come of the types alone
    const values = ['1', '"2"', 'true', 'false', '[1]', '[[1]]'];
    const programs: string[] = [];
    for (const a of values) {
      programs.push(
        ...['print(x)', 'print("{x}")', 'print(-x)', 'print(not x)', 'x = x', 'print(to_text(x))'].map(
          line => `x = ${a}\n${line}`
        ),
        `x = ${a}\nif x\n    print(1)\nelse if not x\n    print(2)`,
        `x = ${a}\nwhile x\n    print(1)\n    break`,
        `x = ${a}\ndo\n    print(1)\nwhile x`,
        `x = ${a}\nrepeat x times\n    print(1)`,
        `x = ${a}\nfor i from x to 3 step x\n    print(i)`,
        `x = ${a}\nfor i in x\n    print(i)`,
        `function f(a)\n    return -a\nprint(f(${a}))`,
        ...['sin', 'square_root', 'round', 'length_of', 'uppercase', 'to_number', 'split', 'join'].map(
          name => `x = ${a}\nprint(${name}(x))`
        )
      );
      for (const b of values) {
        //where its left side decides, CMIL never computes the right side of and or or, which is checked all the same,
        //as a line is that may not run
        for (const operator of ['+', '-', '*', '/', '%', '==', '!=', '<', '>=', 'in', 'and', 'or']) {
          if (!(operator === 'and' && a === 'false') && !(operator === 'or' && a === 'true')) {
            programs.push(`x = ${a}\ny = ${b}\nprint(x ${operator} y)`);
          }
        }
        programs.push(
          ...[
            'print(x[y])',
            'x[y] = 1',
            'add(x, y)',
            'remove(x, y)',
            'print(power(x, y))',
            'print(split(x, y))',
            'print(join(x, y))'
          ].map(line => `x = ${a}\ny = ${b}\n${line}`)
        );
      }
    }
    //the first of two errors, in the order CMIL computes
    programs.push('t = [1]\nprint(uppercase(t) + -t)');
    const STATIC = ['typeError', 'conditionError', 'listAsText'];
    const errorOf = (code: string, language: string) => {
      const ran = new Session(code, language).run();
      return 'error' in ran && ran.error && STATIC.includes(ran.error.id) ? ran.error : undefined;
    };
    for (const code of programs) {
      for (const {id} of targets) {
        const result = convert(code, 'en', id);
        assert.deepStrictEqual('error' in result ? result.error : undefined, errorOf(code, 'en'), `${id}: ${code}`);
      }
      //the operator in the words of the program's language
      const armenian = translate(code, 'en', 'hy-AM');
      const result = convert(armenian, 'hy-AM', 'python');
      assert.deepStrictEqual('error' in result ? result.error : undefined, errorOf(armenian, 'hy-AM'), armenian);
    }
  });

  it('builds and runs the programs of every target in one job of CI', async () => {
    const workflow = await fs.readFile(path.join(import.meta.dirname, '../.github/workflows/test.yml'), 'utf8');
    const built = [...workflow.matchAll(/^ +targets: ([\w,-]+)$/gm)].flatMap(([, ids]) => ids.split(','));
    assert.deepStrictEqual(built.toSorted(), targets.map(({id}) => id).toSorted());
  });

  it('writes a value made on lines of its own in every kind of condition, where CMIL computes it', () => {
    //C, BASIC, Fortran and COBOL make these values, like a text or a list, before the statement they are in
    const setup = 'x = "a b"\nn = 1\nt = ["a", "b"]\nfunction asks()\n    return input()\n';
    const values = ['x + "!" == "a"', '"{x}" == "a"', 'uppercase(x) == "A"', 'to_text(n) == "1"', 'join(t) == "ab"'];
    values.push('x[1] == "a"', 'split(x)[1] == "a"', 'length_of(split(x)) > n', '[1, 2][n] == 1', 'x in [x + "b"]');
    values.push('n in [n, 2]', 'uppercase(input()) == "A"', 'length_of(split(asks())) > 1');
    const contexts = [
      (value: string) => `while ${value}\n    n = 2\n    if n == 3\n        continue\n    break`,
      (value: string) => `do\n    n = 2\nwhile ${value}`,
      (value: string) => `if n == 5\n    print(0)\nelse if ${value}\n    print(1)\nelse\n    print(2)`,
      (value: string) => `if n == 5 or ${value}\n    print(1)`,
      (value: string) => `while n < 3 and ${value}\n    n = n + 1`,
      (value: string) =>
        `function inside(x, n, t)\n    while ${value}\n        return 1\n    return 0\nprint(inside(x, n, t))`
    ];
    for (const value of values) {
      for (const context of contexts) {
        const code = setup + context(value);
        for (const id of ['c', 'basic', 'fortran', 'cobol']) {
          const result = convert(code, 'en', id);
          assert.ok('code' in result, `${id}: ${JSON.stringify(result)}\n${code}`);
        }
      }
    }
  });

  it('uses every helper of every target in a program of the specification, which builds and runs it', () => {
    const used = new Set<string>();
    const all = new Set<string>();
    const {write} = Helpers.prototype;
    Helpers.prototype.write = function (this: Helpers<{code: unknown}>, ...args) {
      for (const name of this.names) {
        all.add(name);
        if (this.has(name)) used.add(name);
      }
      return write.apply(this, args);
    };
    try {
      for (const {id} of targets) {
        used.clear();
        all.clear();
        for (const {code, language} of SPEC) convert(code!, language, id);
        assert.deepStrictEqual(
          [...all].filter(name => !used.has(name)),
          [],
          id
        );
      }
    } finally {
      Helpers.prototype.write = write;
    }
  });

  it('converts every program of the specification that stops with an error, or gives its error', () => {
    for (const {code, errorId, path: name} of ERRORS) {
      for (const {id} of targets) {
        const result = convert(code!, 'en', id);
        if ('error' in result) assert.strictEqual(result.error.id, errorId, `${id}: ${name}`);
      }
    }
  });

  it('joins booleans in the words of the language of the program, but in Python, which prints True', () => {
    for (const {id} of targets.filter(({id}) => id !== 'python')) {
      assert.match(codeOf('արտածել(միացնել([ճիշտ, սխալ], «, »))', id, 'hy-AM'), /ճիշտ/, id);
    }
  });

  it('keeps names that are words of the language apart, and names of every alphabet', () => {
    assert.match(codeOf('int = 1\nprint(int)', 'cpp'), /int int_ = 1;/);
    assert.match(codeOf('int = 1\nconsole = 2\nprint(int + console)', 'csharp'), /int int_ = 1;\nint console = 2;/);
    assert.match(codeOf('print = 1', 'python', 'hy-AM'), /^print_ = 1$/m);
    assert.match(codeOf('անուն = «Անի»\nարտածել(անուն)', 'cpp', 'hy-AM'), /std::string անուն = "Անի";/);
    assert.match(codeOf('անուն = «Անի»\nարտածել(անուն)', 'csharp', 'hy-AM'), /string անուն = "Անի";/);
    assert.match(codeOf('char = 1\nprint(char)', 'java'), /int char_ = 1;/);
    assert.match(codeOf('char = 1\nprint(char)', 'c'), /int char_ = 1;/);
    assert.match(codeOf('անուն = «Անի»\nարտածել(անուն)', 'java', 'hy-AM'), /String անուն = "Անի";/);
    //a variable named like a function, which CMIL tells apart
    assert.match(
      codeOf('function f(f)\n    return f\nf = f(1)\nprint(f)', 'c'),
      /int f\(int f_\) \{\n {4}return f_;\n\}/
    );
    assert.match(codeOf('function f(f)\n    return f\nf = f(1)\nprint(f)', 'python'), /^f_ = f\(1\)$/m);
  });

  it('every language has the messages of the problems, with the placeholders of the English ones', () => {
    const placeholders = (text: string) => [...text.matchAll(/\{\w+\}/g)].map(([found]) => found).sort();
    languages.forEach(language => {
      for (const id of ['mixedTypes', 'mixedItems', 'fixedArrays'] as const) {
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
const BY_USE = 'an answer is a number or a text by how the program uses it, not by what is typed';
const DIFFERENT: Record<string, Record<string, string>> = {
  cpp: {
    'values > numbers > compared as printed': 'C++ compares real numbers exactly',
    'values > numbers > very small and very large numbers printed with all their digits': 'C++ prints an exponent',
    'values > numbers > trigonometry is exact at its angles': "C++ doesn't round trigonometry",
    'print and input > input in a function, and as its argument': BY_USE,
    'values > numbers > the opposite of 0 is 0': 'C++ prints the opposite of 0, a negative zero, as -0',
    'for > the variable keeps its last value': 'the counter of a C++ for ends one step after the last value',
    'texts > uppercase of any alphabet': 'std::toupper changes only English letters',
    'functions > a function asks for input': 'C++ prints the parts of a line while it computes them'
  },
  python: {
    'values > numbers > compared as printed': 'Python compares real numbers exactly',
    'values > numbers > very small and very large numbers printed with all their digits': 'Python prints an exponent',
    'values > numbers > trigonometry is exact at its angles': "Python doesn't round trigonometry",
    'print and input > input in a function, and as its argument': BY_USE,
    'values > numbers > the opposite of 0 is 0': 'Python prints the opposite of 0, a negative zero, as -0'
  },
  csharp: {
    'values > numbers > compared as printed': 'C# compares real numbers exactly',
    'values > numbers > very small and very large numbers printed with all their digits': 'C# prints an exponent',
    'values > numbers > trigonometry is exact at its angles': "C# doesn't round trigonometry",
    'print and input > input in a function, and as its argument': BY_USE,
    'values > numbers > the opposite of 0 is 0': 'C# prints the opposite of 0, a negative zero, as -0',
    'for > the variable keeps its last value': 'the counter of a C# for ends one step after the last value',
    'lists > an emoji is one letter': 'a C# string counts an emoji as two letters',
    'texts > split into letters': 'a C# string counts an emoji as two letters'
  }
};

//the cases a typed language can't write: values of two types, like the items of a list
const MIXED = [
  'values > texts > a variable with values of two types, in a text',
  'lists > add puts a value at the end',
  'lists > a list inside itself',
  'texts > join the items of a list'
];
const UNWRITTEN: Record<string, string[]> = {
  cpp: MIXED,
  python: [],
  csharp: MIXED,
  'csharp-classic': MIXED,
  java: MIXED,
  'java-classic': MIXED,
  //and the cases C's fixed arrays can't hold
  javascript: [],
  php: [],
  ruby: [],
  lua: [],
  pascal: MIXED,
  go: MIXED,
  kotlin: MIXED,
  swift: MIXED,
  rust: MIXED,
  c: [
    ...MIXED,
    'functions > parameters the function changes',
    'functions > a list written in place, given to a function that changes it',
    'functions > a list a function gives, and its items',
    'lists > a list of lists',
    'lists > an item of an item',
    'lists > an item of an item can be replaced',
    'lists > add into an item',
    'lists > remove out of an item',
    'lists > a list is shared by the variables it is assigned to',
    'for in > passes the items the list had when the loop started'
  ],
  visualbasic: MIXED,
  tcl: MIXED,
  'x86-64': MIXED,
  'x86-64-att': MIXED,
  'x86-64-nasm': MIXED,
  cobol: [
    ...MIXED,
    'functions > a list a function gives, and its items',
    'lists > a list of lists',
    'lists > an item of an item',
    'lists > an item of an item can be replaced',
    'lists > add into an item',
    'lists > remove out of an item',
    'lists > a list is shared by the variables it is assigned to',
    'for in > passes the items the list had when the loop started'
  ],
  fortran: [
    ...MIXED,
    'lists > a list of lists',
    'lists > an item of an item',
    'lists > an item of an item can be replaced',
    'lists > add into an item',
    'lists > remove out of an item',
    'lists > a list is shared by the variables it is assigned to'
  ],
  basic: [
    ...MIXED,
    'functions > a list a function gives, and its items',
    'lists > a list of lists',
    'lists > an item of an item',
    'lists > an item of an item can be replaced',
    'lists > add into an item',
    'lists > remove out of an item',
    'lists > a list is shared by the variables it is assigned to',
    'for in > passes the items the list had when the loop started'
  ]
};
//the classic shapes differ as the modern ones do
DIFFERENT['csharp-classic'] = DIFFERENT.csharp;
DIFFERENT.java = {
  'values > numbers > compared as printed': 'Java compares real numbers exactly',
  'values > numbers > trigonometry is exact at its angles': "Java doesn't round trigonometry",
  'print and input > input in a function, and as its argument': BY_USE,
  'for > the variable keeps its last value': 'the counter of a Java for ends one step after the last value',
  'lists > an emoji is one letter': 'a Java String counts an emoji as two letters',
  'texts > split into letters': 'a Java String counts an emoji as two letters'
};
DIFFERENT['java-classic'] = DIFFERENT.java;
DIFFERENT.kotlin = {
  'values > numbers > compared as printed': 'Kotlin compares real numbers exactly',
  'values > numbers > trigonometry is exact at its angles': "Kotlin doesn't round trigonometry",
  'print and input > input in a function, and as its argument': BY_USE,
  'lists > an emoji is one letter': 'a Kotlin String counts an emoji as two letters',
  'texts > split into letters': 'a Kotlin String counts an emoji as two letters'
};
DIFFERENT.cobol = {
  'values > numbers > very small and very large numbers printed with all their digits':
    'COBOL computes whole numbers of up to 18 digits',
  'values > numbers > trigonometry is exact at its angles': "COBOL doesn't round trigonometry",
  'print and input > input in a function, and as its argument': BY_USE,
  'for > the variable keeps its last value':
    'the counter of a COBOL PERFORM VARYING ends one step after the last value',
  'texts > uppercase of any alphabet': 'UPPER-CASE changes only English letters',
  'functions > a value read before a call keeps its value': 'COBOL calls the functions of a statement before it'
};
DIFFERENT['x86-64'] = {
  'values > numbers > compared as printed': 'ucomisd compares real numbers exactly',
  'values > numbers > very small and very large numbers printed with all their digits': 'printf prints an exponent',
  'values > numbers > trigonometry is exact at its angles': "the C library doesn't round trigonometry",
  'print and input > input in a function, and as its argument': BY_USE,
  'texts > uppercase of any alphabet': 'toupper changes only English letters'
};
DIFFERENT['x86-64-att'] = DIFFERENT['x86-64'];
DIFFERENT['x86-64-nasm'] = DIFFERENT['x86-64'];
DIFFERENT.tcl = {
  'values > numbers > compared as printed': 'Tcl compares real numbers exactly',
  'values > numbers > very small and very large numbers printed with all their digits': 'Tcl prints an exponent',
  'values > numbers > trigonometry is exact at its angles': "Tcl doesn't round trigonometry",
  'print and input > input in a function, and as its argument': BY_USE,
  'values > numbers > the opposite of 0 is 0': 'Tcl prints the opposite of 0, a negative zero, as -0',
  'for > the variable keeps its last value': 'the counter of a Tcl for ends one step after the last value',
  'lists > an emoji is one letter': 'Tcl 8.6 counts an emoji as two letters',
  'lists > a list is shared by the variables it is assigned to': 'a list of Tcl is a value, which a variable copies'
};
DIFFERENT.fortran = {
  'values > numbers > compared as printed': 'Fortran compares real numbers exactly',
  'values > numbers > whole numbers printed whole': "a whole number past about two billion isn't an integer",
  'values > numbers > trigonometry is exact at its angles': "Fortran doesn't round trigonometry",
  'print and input > input in a function, and as its argument': BY_USE,
  'for > the variable keeps its last value': 'the counter of a Fortran do ends one step after the last value',
  'texts > uppercase of any alphabet': 'upper() changes only English letters'
};
DIFFERENT.visualbasic = {
  'values > numbers > compared as printed': 'Visual Basic compares real numbers exactly',
  'values > numbers > very small and very large numbers printed with all their digits':
    'Visual Basic prints an exponent',
  'values > numbers > trigonometry is exact at its angles': "Visual Basic doesn't round trigonometry",
  'print and input > input in a function, and as its argument': BY_USE,
  'values > numbers > the opposite of 0 is 0': 'Visual Basic prints the opposite of 0, a negative zero, as -0',
  'for > the variable keeps its last value': 'the counter of a Visual Basic For ends one step after the last value',
  'lists > an emoji is one letter': 'a .NET string counts an emoji as two letters',
  'texts > split into letters': 'a .NET string counts an emoji as two letters'
};
DIFFERENT.basic = {
  'values > numbers > compared as printed': 'FreeBASIC compares real numbers exactly',
  'values > numbers > very small and very large numbers printed with all their digits':
    'FreeBASIC prints them with an exponent',
  'values > numbers > trigonometry is exact at its angles': "FreeBASIC doesn't round trigonometry",
  'print and input > input in a function, and as its argument': BY_USE,
  'values > numbers > the opposite of 0 is 0': 'BASIC prints the opposite of 0, a negative zero, as -0',
  'for > the variable keeps its last value': 'the counter of a FreeBASIC For ends one step after the last value',
  'texts > uppercase of any alphabet': 'UCase() changes only English letters',
  'print and input > two inputs in a line are asked from left to right':
    'FreeBASIC computes the values joined with & from right to left',
  'functions > a function asks for input': 'FreeBASIC computes the values joined with & from right to left',
  'functions > a value read before a call keeps its value': 'FreeBASIC computes the operands of + from right to left'
};
DIFFERENT.lua = {
  'values > numbers > compared as printed': 'Lua compares real numbers exactly',
  'values > numbers > very small and very large numbers printed with all their digits':
    'Lua prints them with an exponent',
  'values > numbers > trigonometry is exact at its angles': "Lua doesn't round trigonometry",
  'print and input > input in a function, and as its argument': BY_USE,
  'values > numbers > the opposite of 0 is 0': 'Lua prints the opposite of 0, a negative zero, as -0',
  'texts > uppercase of any alphabet': 'string.upper() changes only English letters'
};
DIFFERENT.ruby = {
  'values > numbers > compared as printed': 'Ruby compares real numbers exactly',
  'values > numbers > very small and very large numbers printed with all their digits':
    'Ruby prints them with an exponent',
  'values > numbers > trigonometry is exact at its angles': "Ruby doesn't round trigonometry",
  'print and input > input in a function, and as its argument': BY_USE,
  'values > numbers > the opposite of 0 is 0': 'Ruby prints the opposite of 0, a negative zero, as -0'
};
DIFFERENT.php = {
  'values > numbers > compared as printed': 'PHP compares real numbers exactly',
  'values > numbers > very small and very large numbers printed with all their digits':
    'PHP prints them with an exponent',
  'values > numbers > trigonometry is exact at its angles': "PHP doesn't round trigonometry",
  'print and input > input in a function, and as its argument': BY_USE,
  'values > numbers > the opposite of 0 is 0': 'PHP prints the opposite of 0, a negative zero, as -0',
  'for > the variable keeps its last value': 'the counter of a PHP for ends one step after the last value',
  'lists > a list is shared by the variables it is assigned to': 'a PHP array is a value, which $b = $a copies',
  'lists > a list inside itself': 'a PHP array is a value, so a list added to itself is a copy'
};
DIFFERENT.rust = {
  'values > numbers > compared as printed': 'Rust compares real numbers exactly',
  'values > numbers > trigonometry is exact at its angles': "Rust doesn't round trigonometry",
  'print and input > input in a function, and as its argument': BY_USE,
  'lists > a list is shared by the variables it is assigned to': 'a Rust Vec has one owner, so b = a.clone() copies it'
};
DIFFERENT.swift = {
  'values > numbers > compared as printed': 'Swift compares real numbers exactly',
  'values > numbers > very small and very large numbers printed with all their digits':
    'Swift prints them with an exponent',
  'values > numbers > trigonometry is exact at its angles': "Swift doesn't round trigonometry",
  'print and input > input in a function, and as its argument': BY_USE,
  'values > numbers > the opposite of 0 is 0': 'Swift prints the opposite of 0, a negative zero, as -0',
  'lists > a list is shared by the variables it is assigned to': 'a Swift array is a value, which b = a copies'
};
DIFFERENT.go = {
  'values > numbers > very small and very large numbers printed with all their digits': 'Go prints an exponent',
  'values > numbers > trigonometry is exact at its angles': "Go doesn't round trigonometry",
  'print and input > input in a function, and as its argument': BY_USE,
  'values > numbers > the opposite of 0 is 0': 'Go prints the opposite of 0, a negative zero, as -0',
  'for > the variable keeps its last value': 'the counter of a Go for ends one step after the last value',
  'lists > a list is shared by the variables it is assigned to':
    'append() may give one of two variables of a slice a new array',
  'functions > a value read before a call keeps its value':
    'Go may read an item of a list after a call in the same expression'
};
DIFFERENT.pascal = {
  'values > numbers > very small and very large numbers printed with all their digits': 'Pascal prints an exponent',
  'values > numbers > trigonometry is exact at its angles': "Pascal doesn't round trigonometry",
  'print and input > input in a function, and as its argument': BY_USE,
  'lists > a list is shared by the variables it is assigned to': 'SetLength() copies an array that two variables share',
  'texts > uppercase of any alphabet': 'UpperCase() changes only English letters',
  'functions > a function asks for input': 'writeln prints each of its values as soon as it computes it'
};
DIFFERENT.javascript = {
  'values > numbers > compared as printed': 'JavaScript compares real numbers exactly',
  'values > numbers > trigonometry is exact at its angles': "JavaScript doesn't round trigonometry",
  'print and input > input in a function, and as its argument': BY_USE,
  'for > the variable keeps its last value': 'the counter of a JavaScript for ends one step after the last value',
  'lists > an emoji is one letter': 'a JavaScript string counts an emoji as two letters'
};
DIFFERENT.c = {
  'values > numbers > compared as printed': 'C compares real numbers exactly',
  'values > numbers > very small and very large numbers printed with all their digits': 'C prints an exponent',
  'values > numbers > trigonometry is exact at its angles': "C doesn't round trigonometry",
  'print and input > input in a function, and as its argument': BY_USE,
  'values > numbers > the opposite of 0 is 0': 'C prints the opposite of 0, a negative zero, as -0',
  'for > the variable keeps its last value': 'the counter of a C for ends one step after the last value',
  'texts > uppercase of any alphabet': 'toupper changes only English letters',
  'functions > a function asks for input':
    'C computes the values of a printf in any order, and a text a function makes is in one static array'
};

//programs that CMIL stops with an error as they run, each printing after where it stops, and what each target does
//with them (docs/converting.md): s stops, g goes on with another value, b doesn't build, for a number written in the
//program, and u reads or writes outside a list, which its language leaves undefined and which isn't checked
const STOPPED = [
  ['an index of 0', 'fruits = ["apple", "pear"]\nprint(fruits[0])'],
  ['an index after the end', 'fruits = ["apple", "pear"]\nprint(fruits[3])'],
  ['an item set after the end', 'fruits = ["apple", "pear"]\nfruits[3] = "plum"\nprint(join(fruits, ","))'],
  ['a letter after the end', 'word = "hi"\nprint(word[3])'],
  ['a division by 0', 'n = 0\nprint(1 / n)'],
  ['the remainder of a division by 0', 'n = 0\nprint(5 % n)'],
  ['the square root of -1', 'n = -1\nprint(square_root(n))'],
  [
    'remove of an item the list has not',
    'fruits = ["apple", "pear"]\nremove(fruits, "plum")\nprint(join(fruits, ","))'
  ],
  ['repeat a negative count of times', 'n = -1\nrepeat n times\n    print(1)'],
  ['a step of 0', 'n = 0\nfor i from 1 to 3 step n\n    print(i)\n    break'],
  ['a text that is no number into a number', 'print(to_number("abc"))']
].map(([title, code]) => ({title, code: `${code}\nprint("after")`, language: 'en'}));
const OUTCOMES: Record<string, string> = {
  cpp: 'uuuu gsg uggs',
  python: 'gsss sss sgss',
  csharp: 'ssss gsg gggs',
  java: 'ssss sss gggs',
  c: 'uuuu gsg gggg',
  javascript: 'gggg ggg gggg',
  pascal: 'uuuu sss gggs',
  go: 'bsss gsg gggg',
  kotlin: 'ssss sss gggs',
  swift: 'ssss gsg gssg',
  rust: 'bsss gbg gggg',
  php: 'gggg ssg gggg',
  ruby: 'gggg gss sgsg',
  lua: 'gggg gsg ggsg',
  basic: 'uuuu gsg gggg',
  visualbasic: 'ssss gsg gggs',
  fortran: 'uuuu sss gggs',
  tcl: 'gggg gss gggs',
  cobol: 'buuu ggg gggg',
  'x86-64': 'uuuu gsg gggg'
};
OUTCOMES['csharp-classic'] = OUTCOMES.csharp;
OUTCOMES['java-classic'] = OUTCOMES.java;
OUTCOMES['x86-64-att'] = OUTCOMES['x86-64'];
OUTCOMES['x86-64-nasm'] = OUTCOMES['x86-64'];

//CMIL_TARGETS=c,x86-64 builds and runs the programs in these targets alone, and an empty one in none
const CHOSEN = process.env.CMIL_TARGETS?.split(',').filter(Boolean);
const unknown = CHOSEN?.filter(id => !targets.some(target => target.id === id));
if (unknown?.length) throw new Error(`Unknown targets in CMIL_TARGETS: ${unknown.join(', ')}`);
//the second shape or syntax of a language, which names its suite
const STYLES: Record<string, string> = {classic: 'classic', intel: 'Intel', att: 'AT&T', nasm: 'NASM'};

for (const {id, name, style} of targets.filter(({id}) => !CHOSEN || CHOSEN.includes(id))) {
  const runner = RUNNERS[id];
  //CI has every tool, so there a missing one is a failure, not a skip
  const missing =
    !(runner.available ?? (() => has(runner.tool)))() && !process.env.CI && `${runner.tool} is not installed`;
  describe(`spec programs in ${name}${style && STYLES[style] ? ` (${STYLES[style]})` : ''}`, {skip: missing}, () => {
    const outputs = new Map<string, string | Error>();
    let dir = '';

    before(
      async () => {
        dir = await fs.mkdtemp(path.join(os.tmpdir(), `cmil-${id}-`));
        const programs = [
          ...SPEC.map(({path: title, code, language, inputs}) => ({title, code: code!, language, inputs})),
          ...STOPPED
        ];
        (await outputsOf(id, programs, dir)).forEach((output, index) => outputs.set(programs[index].title, output));
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

    STOPPED.forEach(({title}, index) => {
      const expected = OUTCOMES[id].replaceAll(' ', '')[index];
      it(`where CMIL stops: ${title}`, {skip: expected === 'u' && 'its language leaves it undefined'}, () => {
        const output = outputs.get(title)!;
        const outcome = output instanceof Error ? 'b' : output.split('\n').includes('after') ? 'g' : 's';
        assert.strictEqual(outcome, expected, output instanceof Error ? output.message : output);
      });
    });
  });
}
