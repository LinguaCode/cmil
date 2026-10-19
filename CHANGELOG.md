## Unreleased

  - **[change]** source: TypeScript with `strict`, checked in CI (`npm run typecheck`); the package ships type declarations.
  - **[change]** package: an ES module (`import CodeSubmit from 'cmil'`); CommonJS code can still `require('cmil')`. `npm install`, also from GitHub, builds `dist/` through `prepare`; `npm start` is removed.
  - **[fix]** languages: a language name like `constructor` is rejected with "Language was not specified." instead of failing with a `TypeError`.
  - **[add]** lint: ESLint and Prettier (`npm run lint`, `npm run format`), checked in CI.
  - **[add]** documentation: the language reference in `docs/language.md`, replacing the placeholder `DOCUMENTATION.md`.
  - **[change]** output: `true`, `false`, `NaN` and `Infinity` are printed as `<true/>`, `<false/>`, `<NaN/>` and `<Infinity/>` (LML standard, since 2019-09-04); tests updated from `${true}` / `${false}`.
  - **[fix]** tests: tutorials use the current Armenian commands `տպել` (output) and `մուտքագրել` (input) instead of `ելք` and `մուտք`, renamed in linguacode-translations on 2017-05-28.
  - **[fix]** tests: run in-process against `CodeSubmit`, the Socket.IO server they relied on was removed in 0.4.0-alpha.
  - **[fix]** errors: `undefinedVariable` is detected again.
  - **[change]** runtime: requires Node.js 24 or newer.
  - **[change]** package: `main` is `src/index.js`, the Babel build is removed, so installing from GitHub works without a build.
  - **[change]** tests: the Node.js test runner replaces Mocha, c8 replaces istanbul (`npm run coverage`).
  - **[add]** CI: GitHub Actions on Node.js 24 and 26, replacing Travis CI, Coveralls and Code Climate.
  - **[add]** `package-lock.json` is committed.
  - **[optimize]** dependencies: moment removed; a development install has 55 packages instead of about 400, with no known vulnerabilities instead of 58.
  - **[change]** packages: linguacode-constants, linguacode-translator and linguacode-translations are part of cmil (`src/constants`, `src/translator`, `src/translations`), and `src/libs/logger.js` replaces lingua-logger, with no git dependencies or install scripts.
  - **[add]** tests: every language defines every command; the translator converts code to text and back.
  - **[change]** core: programs run in cmil's own interpreter (lexer, parser, compiler and interpreter in `src/core`) instead of being converted to JavaScript and evaluated, so neither a program nor an input value can run JavaScript.
  - **[change]** errors: syntax and indentation errors are found before a program runs; every error except `timeout` reports its line, counted from the top of the program; output printed before an error is sent.
  - **[change]** output: words in texts stay as written; only boolean values, `NaN` and `Infinity` become markers, also when joined into text.
  - **[add]** errors: `memoryLimit`, when a text is longer than 1,000,000 characters or unsent output than 10,000,000.
  - **[change]** limits: between two inputs a program may run 100,000 steps besides 666 ms (`timeout`); blocks and expressions nest at most 100 levels.
  - **[change]** math functions with a wrong number of arguments end with `functionArgumentSyntaxError` instead of returning `<NaN/>`.
  - **[add]** commands: `break` and `continue` work in loops.
  - **[fix]** sessions: several programs can run at the same time; one waiting for input keeps its state.
  - **[optimize]** dependencies: none at runtime, lodash is no longer needed, so installing cmil adds only cmil; the tests run about five times faster.

## 0.4.0 (2016-11-12)

  - **[add]** tests: 32 (total 184).
  - **[add]** functions: math.
  - **[optimize]** syntax of input and output.
  - **[optimize]** huge amount of minor fixes and refactorings.

## 0.3.1 (2016-08-19)

  - **[optimize]** convert: ES5 to ES6;
  - **[optimize]** constants: separation;
  - **[status]** coverage: development: 100%, production: 98.436%.
  - **[status]** code climate: 3.86.

## 0.3.0 (2016-07-17)

  - **[add]** tests: 28 (total 152).
  - **[optimize]** compiler algorithm.
  - **[add]** output data collector.
  - **[change]** rename: "linguacode-api" to "core".
  - **[status]** coverage: development: 100%, production: 98.339%.
  - **[status]** code climate: 3.9.

## 0.2.5 (2016-07-11)

  - **[add]** tests: 2 (total 124).
  - **[optimize]** compiler algorithm.
  - **[fix]** builder;
  - **[fix]** input; repeat;
  - **[status]** coverage: development: 99.26%, production: 97.794%.
  - **[status]** code climate: 3.97.

## 0.2.4 (2016-07-07)

  - **[add]** tests: 26 (total 122).
  - **[optimize]** readme: include paths of CONTRIBUTING.md, CHANGELOG.md.
  - **[fix]** inner quote symbol detect fix: ", «, ».
  - **[status]** coverage: development: 99.26%, production: 97.782%.
  - **[status]** code climate: 3.64.

## 0.2.3 (2016-07-06)

  - **[add]** tests: 2 (total 96).
  - **[add]** module: moment.
  - **[add]** code compile timeout.
  - **[status]** coverage: development: 99.26%, production: 97.76%.
  - **[status]** code climate: 3.67.

## 0.2.2 (2016-07-05)

  - **[add]** tests: 39 (total 94).
  - **[add]** documentation:CONTRIBUTING.md
  - **[add]** module: linguacode-logger.
  - **[add]** tool: snyk.
  - **[add]** tool: travis.
  - **[add]** tool: coveralls.
  - **[add]** tool: code climate.
  - **[add]** tool: david: dependencies checker.
  - **[add]** tool: david: devDependencies checker.
  - **[add]** badge: Gratipay.
  - **[add]** badge: Beerpay.
  - **[add]** badge: license GPLv3.
  - **[optimize]** useless module remove from package.json file.
  - **[optimize]** ES6: 'var' to 'let' and 'const' convert.
  - **[optimize]** refactorings.
  - **[fix]** looping loop error initialize.
  - **[fix]** minor fixes.
  - **[status]** coverage: development: 99.24%, production: 97.72%.
  - **[status]** code climate: 3.7.

## 0.2.1 (2016-06-18)

  - **[new]** mocha test count: 55.
  - **[new]** include test coverage: istanbul.
  - **[fix]** empty code compile.
  - **[fix]** minor fixes.

## 0.2.0 (2016-06-11)

  - **[optimize]** Optimizations.
  - **[optimize]** public files deleted.
  - **[optimize]** repository files minimised from 6.7mb to 0.8mb.

## 0.0.2 (2015-09-13)

  - **[new]** gulp implementation.
  - **[optimize]** css files are now scss.
  - **[optimize]** html files are now jade.
  - **[optimize]** scripts are now minimised.
  - **[optimize]** public files minimised from 11.5mb to 6.7mb.

## 0.0.1 (2015-08-23)

  - **[new]** commands: variables.
  - **[new]** commands: output
  - **[new]** commands: if-else statements.
  - **[new]** commands: loops: repeats N times.
  - **[new]** translations: languages: Armenian, Russian, Georgian, Japanese.
  - **[new]** translations: multilingual syntax.
  - **[new]** translations: text translation via Yandex.
  - **[new]** IDE: toolbar: compile.
  - **[new]** IDE: toolbar: change translation.
  - **[new]** Terminal.
  - **[new]** syntax highlight.
  - **[new]** programming code is not case sensitive.
  - **[new]** unicode scope support..
