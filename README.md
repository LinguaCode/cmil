[![Crowdin](https://d322cqt584bo4o.cloudfront.net/linguacode/localized.svg)](https://crowdin.com/project/linguacode)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg?style=flat-square)](https://www.gnu.org/licenses/gpl-3.0.html)

# CMIL - Clarified Multilingual Intermediate Language

The goal of CMIL is to create a common programming language, which will be designed for people of all nationalities and all ages, which will easily learn basic programming knowledge in purpose of to later switching to professional programming languages.
Arman Yeghiazaryan is the author and the legal owner of the standard of CMIL. All copies of the standard outside the site of https://linguacode.me will be considered illegal and the author of the copy is liable to legal punishment.

# LinguaCode - Social Coding Platform For Everyone
**LinguaCode** is a social coding platform and is designed especially for children, where they can learn programming and share their codes with their native language and without the necessity of knowing English.

Due to our solution children can not only get acquainted and study the basic elements of programming, but can also easily pass to professional programming languages. Knowing English is very important, but a language must not be a barrier for learning programming. 

With LinguaCode one can not only study programming, but also learn languages.

## How to make contributions?
Please read and follow the steps in the [CONTRIBUTING.md](https://github.com/LinguaCode/cmil/blob/master/CONTRIBUTING.md).

AI coding agents should follow [AGENTS.md](https://github.com/LinguaCode/cmil/blob/master/AGENTS.md).

## How to get started?
#### Requirements
[Node.js](https://nodejs.org), tested on Node.js 24 LTS and 22.

#### Install
CMIL isn't published to npm. Clone the repository, install its dependencies and build it:
```
git clone https://github.com/LinguaCode/cmil.git
cd cmil
npm install
npm run build
```
`npm run build` compiles `src/` with Babel into `build/`, the entry point of the package.

#### Usage
CMIL is a library: it exports the `CodeSubmit` class, which runs one program written in one of the [LinguaCode languages](https://github.com/LinguaCode/linguacode-translations/tree/master/languages), for example `en`, `ru` or `hy-AM`.
```js
const CodeSubmit = require('./build');

const codeSubmit = new CodeSubmit('output "What is your name?"\ninput name\noutput "Hello, " + name', 'en');

codeSubmit
  .onOutput(output => console.log(output))
  .onInputRequest(() => codeSubmit.inputEmitter('Ani'))
  .onSessionEnd(error => {
    if (error.errorId) {
      console.error(error.errorId, error.param);
    }
  })
  .execute();
```
- `onOutput(callback)`: receives the text printed by the program.
- `onInputRequest(callback)`: called when the program waits for input; pass the value to `codeSubmit.inputEmitter(value)`.
- `onSessionEnd(callback)`: called when the program ends. On an error, `errorId` is set (for example `syntaxError`, `undefinedVariable` or `timeout`) and `param` holds details such as `line` or `variable`.

#### Run tests
`npm test`

The tests run every case of [`test/collection`](test/collection), the specification of the language, against `CodeSubmit`.

## Screenshot

![0.0.1](/screenshots/demonstration_0.0.1.gif)

## Changelog
Please read the changelog in the [CHANGELOG.md](https://github.com/LinguaCode/cmil/blob/master/CHANGELOG.md).