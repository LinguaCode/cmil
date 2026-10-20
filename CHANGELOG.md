## Unreleased

  - **[add]** texts: each language has its own quotes besides `«…»`, `"…"` and `'…'`, like `“…”` in English, `„…“` in German or `「…」` in Japanese; `docs/translations.md` lists them.
  - **[change]** `translate()`: texts are written in the main quotes of the language a program is translated into, like `«…»` in Armenian, with their escapes.
  - **[change]** output: a list prints its texts in the main quotes of the program's language, like `[«ա»]` in Armenian.
  - **[add]** lists: `x in list` is `true` when a list has a value, and `text in text` when a text has another; `remove x out of list` takes out the first item `==` to x, and a value the list doesn't have is the new `itemError`.
  - **[add]** texts: `split(text)` gives the words of a text, `split(text, separator)` its parts, and `join(list, separator)` joins the items of a list into a text.
  - **[change]** words: `in` reads in conditions too, so in Armenian it is `մեջ` instead of `ից`, and `into` is `վերջում` instead of `մեջ`; in Russian `in` is `среди`, in Japanese `の中`, in Czech `mezi`, Slovak `medzi`, Slovenian `med`, Serbian `међу` and Hungarian `között`. The words of `remove`, `out of`, `split` and `join` are in every language; those of 28 languages need a native review.
  - **[add]** API: `segmentsOf(line, language)` splits a line into the parts an editor colors, `commandsOf(language)` lists the commands of a language with their words and kinds, and `quotesOf(language)` its quotes.
  - **[change]** errors: an `argumentError` has the `function` as written and the counts `min` and `max` of values it takes, and its message says so, like "Line 3: power takes 2 values."; a call of a function of the program without its `)` is a `syntaxError`. Messages may have plural forms, chosen with `Intl.PluralRules`.

## 0.9.0-alpha.0 (2026-10-20)

  - **[add]** loops: `for i from 1 to 10`, with an optional `step 2` or a negative step to count down; the bounds are read once and both ends are included. The words `for`, `from`, `to` and `step` are in every language; those of 28 languages need a native review.
  - **[add]** lists: `[1, 2, "a"]` and `[]`, items read with `list[1]`, counted from 1, and replaced with `list[1] = x`, `add x into list`, and `for x in list`, which also passes the letters of a text. A list is shared when it is assigned, printed like `[1, 2, "a"]`, and equal to another list with equal items. An index outside a list or a text is the new error `indexError`, with its `index`. A list may have 1,000,000 items (`memoryLimit`).
  - **[add]** texts: `text[1]` reads a letter, and the functions `length_of(x)`, `uppercase(t)`, `lowercase(t)`, `to_number(t)` and `to_text(x)`. The words of the new commands are in every language; those of 28 languages need a native review.
  - **[change]** messages: `argumentError` says "a function" instead of "a math function", and `memoryLimit` names lists too.
  - **[add]** functions: `function name(a, b)` with a body under it, `return value` or `return`, and calls like `name(1, 2)` in expressions or on their own line. Functions are defined at the top of the program and can be called before their definition; a function knows only its parameters and its own variables, and can wait for input. The new errors are `undefinedFunction` and an argument count that doesn't fit, found before the program runs, `noValue` for the value of a call that has none, and `recursionLimit` for more than 1000 calls inside each other. The word `return` is in every language; those of 28 languages need a native review.
  - **[change]** errors: a call of a name that isn't a function, like `eval("1")`, is an `undefinedFunction` instead of a `syntaxError`.

## 0.8.0-alpha.0 (2026-10-20)

  - **[change]** translations: each language file is a typed record of the words of each command, like `and: ['և', 'եւ', 'ու']`, instead of a list of definitions separated with `|`; TypeScript checks that every command has words. Notes for native speakers are in its `notes`.
  - **[change]** source: the constants are one file, `src/constants/index.ts`, and the command ids lose the `@` of the removed `@output` form. The debug logger is removed.
  - **[change]** API: `Session` replaces `CodeSubmit`. `run()` starts a program and `input(value)` continues it; both return a step, `{state: 'input', output}` or `{state: 'end', output, error}`, with the lines printed since the last step, one per `output`. There are no callbacks, and no default export: CommonJS code uses `const {Session} = require('cmil')`.
  - **[add]** API: `check(sourceCode, language)` returns the first error of a program before it runs, and `messageOf(error, language)` its message in every language; the messages are in `src/translations`.
  - **[change]** errors: an error is `{id, …}` instead of `{errorId, param}`, with the column of its token, counted from 1, for syntax, argument and undefined variable errors. `functionArgumentSyntaxError` is renamed `argumentError`.
  - **[change]** limits: a program may run 1,000,000 steps between two inputs, instead of 100,000 steps and 666 ms, so for example finding the primes below 3000 no longer times out; `new Session(sourceCode, language, {maxSteps})` sets another limit. The core has no clock any more and reads no environment variable; a host stops a hung worker itself.
  - **[change]** values: values are never converted into another type. Arithmetic takes numbers, `+` also joins a text with any value, `==` never converts (`"5" == 5` is false), and `<`, `>` compare two numbers or two texts. Conditions, `and`, `or` and `not` take booleans. Anything else is one of the new errors `typeError`, `conditionError`, `divisionByZero` or `mathError`, with the line, the column and, for `typeError` and `mathError`, the operator in the words of the program's language. NaN and Infinity no longer exist.
  - **[change]** output: booleans are printed in the words of the program's language, like `ճիշտ` in Armenian, instead of `<true/>` and `<false/>`.
  - **[change]** numbers: printed and compared with 12 significant digits, so `0.1 + 0.2` prints `0.3` and equals `0.3`, and always with all their digits, like `0.0000001` instead of `1e-7`. Trigonometry is rounded to 12 decimals instead of 10, so `sin(pi)` is still `0`.
  - **[fix]** loops: `repeat N times` reads N once, so changing N in the loop no longer makes it endless. N must be a whole number, not below 0.
  - **[add]** math: `round(x, digits)` rounds to a count of decimals.
  - **[change]** commands: English `output` is `print`, and `ctg` and `arcctg` are `cot` and `arccot`, as in English mathematics; the command ids follow. The words of the other languages don't change.
  - **[add]** commands: `print a, b` prints several values on one line, separated by spaces, and `input "Your name?" name` asks with a prompt, which the input step returns as `prompt`.
  - **[add]** errors: `=` inside an expression, like `if x = 5`, is an `equalsError`, whose message says to compare with `==`.

## 0.7.0-alpha.0 (2026-10-20)

  - **[fix]** commands: a command next to an operator is recognized, like `pi` and `e` in `if 1<pi` and `output 2>e`, which failed with `undefinedVariable`.
  - **[change]** commands: the lexer finds the words of each language itself, replacing the regex translator of `linguacode-translator` and its license file. A command is a whole word in any case, and the words of a two-word command, like Albanian `e vërtetë` (true), may be separated by any spaces.
  - **[change]** commands: the `@output` form of the commands is removed; `@` is a `syntaxError`.
  - **[change]** API: `translate()` keeps spacing, texts and comments, and renames a name that is a command in the other language with a trailing `_`, the same everywhere in the program, like `i` in Catalan, where it means and.
  - **[add]** tests: every word of every language is found as its command, and every spec program translated into every language runs the same.
  - **[fix]** translations: words in another sense are replaced in 29 languages, like town square for square, storey for floor, other for else and pause for break; if, then, else and while follow the school pseudocode of a language where it has one. Greek then is one word, `τότε`; Albanian false is `e rreme`, like `e vërtetë`; the constant e is also the Latin `e` in Ukrainian and Serbian.
  - **[add]** documentation: `docs/translations.md` lists the words of every language with their meaning, generated by `npm run translations-table` and checked by a test. A word's `note` asks native speakers to check it; 24 words have one.
  - **[add]** GitHub: a translation issue form, for native speakers to suggest a better word.

## 0.6.0-alpha.0 (2026-10-19)

  - **[change]** API: `codeSubmit.input(value)` replaces the `inputEmitter` getter.
  - **[change]** API: the state of `CodeSubmit` is private; only its methods are public.
  - **[change]** API: an unknown language ends the session with `unknownLanguage` and `param.language` instead of throwing an error.
  - **[add]** API: `stop()` ends a session, for example one waiting for input; `onSessionEnd` isn't called.
  - **[add]** API: `languages` lists the language codes, and `translate(sourceCode, from, to)` translates a program into another language.
  - **[fix]** translations: a word means one command in every language, which the tests check. pt-PT: the constant e is `euler`, since `e` means and; sl: do is `naredi`, since `ne` means not; th: and is `และ`, since `แล้ว` means then.
  - **[fix]** translations: words left in English are translated: false in el (`ψευδές`), nl (`onwaar`), ro (`fals`), sk (`nepravda`) and sl (`ni_res`); true in ca (`cert`); input in da (`indtast`) and fi (`syötä`); absolute value in ca (`valor_absolut`); square in vi (`bình_phương`); ceil in 20 languages, matching each language's floor.

## 0.5.0-alpha.0 (2026-10-19)

  - **[add]** releases: pushing a version tag, or running the release workflow on `master`, creates the GitHub Release, with its CHANGELOG section as notes, and publishes it to npm as `cmil` with npm trusted publishing from the first release candidate on; until then cmil installs from GitHub.
  - **[change]** package: `license` is `GPL-3.0-only`.
  - **[fix]** package: includes the license files of `src/constants`, `src/translations` and `src/translator`.
  - **[change]** README: names the author of CMIL and states the licenses, instead of restricting copies of the standard; links to the old website are removed.
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
  - **[change]** package: the Babel build is removed.
  - **[change]** tests: the Node.js test runner replaces Mocha, c8 replaces istanbul (`npm run coverage`).
  - **[add]** CI: GitHub Actions on Node.js 24 and 26, replacing Travis CI, Coveralls and Code Climate.
  - **[add]** `package-lock.json` is committed.
  - **[optimize]** dependencies: moment removed; a development install has 140 packages instead of about 400, with no known vulnerabilities instead of 58.
  - **[change]** packages: linguacode-constants, linguacode-translator and linguacode-translations are part of cmil (`src/constants`, `src/translator`, `src/translations`), and `src/libs/logger.ts` replaces lingua-logger, with no git dependencies or install scripts.
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
