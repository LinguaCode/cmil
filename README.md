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
Try CMIL in your browser, in any of its 32 languages, at the [CMIL playground](https://linguacode.otanim.com).

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
CMIL is a library: it exports the `CodeSubmit` class, which runs one program written in one of the [LinguaCode languages](src/translations/languages), for example `en`, `ru` or `hy-AM`. It's an ES module with TypeScript types; CommonJS code can use `const CodeSubmit = require('cmil')`.
```js
import CodeSubmit from 'cmil';

const codeSubmit = new CodeSubmit('output "What is your name?"\ninput name\noutput "Hello, " + name', 'en');

codeSubmit
  .onOutput(output => console.log(output))
  .onInputRequest(() => codeSubmit.input('Ani'))
  .onSessionEnd(error => {
    if (error.errorId) {
      console.error(error.errorId, error.param);
    }
  })
  .execute();
```
- `onOutput(callback)`: receives the text printed by the program.
- `onInputRequest(callback)`: called when the program waits for input; pass the value to `codeSubmit.input(value)`.
- `onSessionEnd(callback)`: called when the program ends. On an error, `errorId` is set (for example `syntaxError`, `undefinedVariable`, `timeout`, `memoryLimit` or `unknownLanguage`) and `param` holds details such as `line` or `variable`. Output printed before the error is sent first.
- `stop()`: ends the session, for example when the learner leaves; it takes no more input, and `onSessionEnd` isn't called.

`import {languages, translate} from 'cmil'`: `languages` lists the language codes, and `translate(sourceCode, from, to)` translates a program into another language, for example `translate('output "Hi"', 'en', 'hy-AM')` returns `'տպել "Hi"'`. Texts, comments and names stay as written, except a name that is a command in the other language, which gets a trailing `_`.

CMIL runs programs with its own interpreter, never as JavaScript, and limits their time and memory. See [docs/running.md](docs/running.md) for the limits and for running sessions in a worker.

#### Development
```
git clone https://github.com/LinguaCode/cmil.git
cd cmil
npm install
npm test
```
CMIL is written in TypeScript. `npm install` also builds `src/` into `dist/` (`npm run build`), and `npm run typecheck` checks the types.

`npm test` runs every case of [`test/collection`](test/collection), the specification of the language, against `CodeSubmit`, plus the tests of the interpreter, the keyword scanner, `translate()` and the translations; Node.js runs the TypeScript sources directly. `npm run coverage` also writes a coverage report into `coverage/`. `npm run lint` checks the code with ESLint and Prettier, and `npm run format` formats it.

## Documentation
- [The CMIL language](docs/language.md): commands, values, operators, math functions and errors.
- [Running CMIL programs](docs/running.md): limits, and running sessions in a worker.
- [Translations](docs/translations.md): the words of every language, and the words to check.

## Screenshot

![0.0.1](/screenshots/demonstration_0.0.1.gif)

## Changelog
Please read the changelog in the [CHANGELOG.md](https://github.com/LinguaCode/cmil/blob/master/CHANGELOG.md).