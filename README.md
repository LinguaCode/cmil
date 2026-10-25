[![test](https://github.com/LinguaCode/cmil/actions/workflows/test.yml/badge.svg)](https://github.com/LinguaCode/cmil/actions/workflows/test.yml)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg?style=flat-square)](https://www.gnu.org/licenses/gpl-3.0.html)

# CMIL - Clarified Multilingual Intermediate Language

The goal of CMIL is to create a common programming language, which will be designed for people of all nationalities and all ages, which will easily learn basic programming knowledge in purpose of to later switching to professional programming languages.
Arman Yeghiazaryan is the author of the CMIL language. The code and documentation in this repository are free software under the [GPL-3.0](LICENSE) license, except `src/constants` and `src/translations`, which are under the MIT license.

# LinguaCode - Social Coding Platform For Everyone
**LinguaCode** is a social coding platform and is designed especially for children, where they can learn programming and share their codes with their native language and without the necessity of knowing English.

Due to our solution children can not only get acquainted and study the basic elements of programming, but can also easily pass to professional programming languages. Knowing English is very important, but a language must not be a barrier for learning programming. 

With LinguaCode one can not only study programming, but also learn languages.

## How to make contributions?
Please read and follow the steps in the [CONTRIBUTING.md](https://github.com/LinguaCode/cmil/blob/master/CONTRIBUTING.md).

AI coding agents should follow [AGENTS.md](https://github.com/LinguaCode/cmil/blob/master/AGENTS.md).

## How to get started?
Try CMIL in your browser, in any of its 32 languages, at [LinguaCode](https://linguacode.otanim.com), with lessons from a first `print` to functions.

#### Requirements
[Node.js](https://nodejs.org) 24 or newer.

#### Install
CMIL will be on npm from its first release candidate. Until then, install it from GitHub:
```
npm install github:LinguaCode/cmil
```
npm 12 refuses git dependencies by default, so with npm 12 add `--allow-git=root`:
```
npm install github:LinguaCode/cmil --allow-git=root
```

#### Usage
CMIL is a library. A `Session` runs one program written in one of the [LinguaCode languages](src/translations/languages), for example `en`, `ru` or `hy-AM`, step by step: `run()` starts it, and `input(value)` continues it when it waits for input. It's an ES module with TypeScript types; CommonJS code can use `const {Session} = require('cmil')`.
```js
import {Session, messageOf} from 'cmil';

const session = new Session('print("What is your name?")\nname = input()\nprint("Hello, " + name)', 'en');

let step = session.run(); // {state: 'input', output: ['What is your name?']}
step = session.input('Ani'); // {state: 'end', output: ['Hello, Ani']}

if (step.state === 'end' && step.error) {
  console.error(messageOf(step.error, 'en'));
}
```
- `run()`: starts the program, which runs until it waits for input or ends.
- `input(value)`: gives the program the input it waits for; an empty input is asked for again.
- Both return a step: `{state: 'input', output}` or `{state: 'end', output, error}`. `output` holds the lines printed since the last step, like the question a program prints before its input. `error` is set when the program ended with one, for example `{id: 'undefinedVariable', line: 2, column: 8, variable: 'x'}`; output printed before the error comes with it.
- `stop()`: ends the session, for example when the learner leaves; it takes no more input.
- `new Session(sourceCode, language, {maxSteps, random})`: a program may run 1,000,000 steps, about half a second, in one step before it ends with `timeout`. `random` gives the numbers `random()` is made from, from 0 up to 1 like `Math.random()`, the default; two sessions given the same numbers make the same random numbers, for example to check a learner's program against a solution.

`check(sourceCode, language)` returns the first error a program has before it runs, or `null`. `messageOf(error, language)` returns the message of an error in a language, for example `Syntax error on line 2.`

`import {languages, translate} from 'cmil'`: `languages` lists the language codes, and `translate(sourceCode, from, to)` translates a program into another language, for example `translate('print("Hi")', 'en', 'hy-AM')` returns `'արտածել(«Hi»)'`. Texts are written in the main quotes of the other language, and their values, comments and names stay as written, except a name that is a command in the other language, which gets a trailing `_`.

For editors, `segmentsOf(line, language)` splits a line into the parts to color, with the command of each keyword (`{type: 'keyword', text: 'արտածել', command: 'print'}`), and names, texts, numbers, comments, operators, spaces and other characters, which are syntax errors. `commandsOf(language)` lists the commands of a language with their words and their kind: `block` (like `if`, which indents the next line), `statement`, `part`, `operator`, `value` or `function` (like `print` or `sin`, which are called with parentheses). `quotesOf(language)` lists the quotes of texts in a language, its main quotes first.

`convert(sourceCode, language, target)` writes a program in another language, so a learner sees it in C++, Python, C#, Java, C, JavaScript, Pascal, Go, Kotlin, Swift, Rust, PHP, Ruby, Lua, BASIC, Visual Basic, Fortran, Tcl, COBOL or x86-64 assembly, C# and Java modern or classic, assembly in the Intel or AT&T syntax of the GNU assembler or in NASM's, line by line: `convert('print("Hi")', 'en', 'python')` gives `{code: 'print("Hi")\n', lines: [1]}`. `targets` lists the languages, and `programOf(sourceCode, language)` gives the tree of a program for other tools. `cmil/convert` gives `convert()` alone, so a page can load the converters when it first shows a program in another language, like `const {convert} = await import('cmil/convert')`: CMIL declares that its modules have no side effects, so a bundler leaves out what a page or a worker doesn't use. See [docs/converting.md](docs/converting.md) and [docs/tree.md](docs/tree.md).

CMIL runs programs with its own interpreter, never as JavaScript, and limits their steps and memory. See [docs/running.md](docs/running.md) for the limits and for running sessions in a worker.

#### Development
```
git clone https://github.com/LinguaCode/cmil.git
cd cmil
npm install
npm test
```
CMIL is written in TypeScript. `npm install` also builds `src/` into `dist/` (`npm run build`), and `npm run typecheck` checks the types.

`npm test` runs every case of [`test/collection`](test/collection), the specification of the language, in a `Session`, plus the tests of the interpreter, the keyword scanner, `translate()`, the editor functions, the translations and the conversion, which compiles and runs every spec program in C++, Python, C#, Java, C, JavaScript, Pascal, Go, Kotlin, Swift, Rust, PHP, Ruby, Lua, BASIC, Visual Basic, Fortran, Tcl, COBOL and x86-64 assembly when `g++`, `python3`, `dotnet` (for C# and Visual Basic), Java 25 (`JAVA_HOME`), `gcc` (for C and the GNU assembler), `nasm`, `fpc`, `go`, `kotlinc` (`KOTLIN_HOME`), `swiftc`, `rustc`, `php`, `ruby`, `lua5.4`, `fbc`, `gfortran`, `tclsh` and `cobc` are installed; Node.js runs the TypeScript sources directly. `CMIL_TARGETS=c,x86-64 npm test` builds and runs the spec programs in those targets alone. `npm run snapshot` lists every spec program whose conversion a change has changed since `npm run snapshot -- --save`. `npm run coverage` also writes a coverage report into `coverage/`. `npm run lint` checks the code with ESLint and Prettier, and `npm run format` formats it.

## Documentation
- [The CMIL language](docs/language.md): commands, values, operators, lists, functions and errors.
- [Running CMIL programs](docs/running.md): limits, and running sessions in a worker.
- [Translations](docs/translations.md): the words of every language.
- [Converting CMIL programs](docs/converting.md): CMIL programs in C++, Python, C#, Java (modern and classic), C, JavaScript, Pascal, Go, Kotlin, Swift, Rust, PHP, Ruby, Lua, BASIC, Visual Basic, Fortran, Tcl, COBOL and x86-64 assembly, and how they differ.
- [The program tree](docs/tree.md): the statements and expressions of a program, for tools.

## Screenshot

![0.0.1](/screenshots/demonstration_0.0.1.gif)

## Changelog
Please read the changelog in the [CHANGELOG.md](https://github.com/LinguaCode/cmil/blob/master/CHANGELOG.md).