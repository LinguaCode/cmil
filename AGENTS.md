# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex and others) working in this repository.

## Purpose

CMIL (Clarified Multilingual Intermediate Language) is the language core behind LinguaCode, a platform that teaches children programming in their native language. This file owns agent behaviour for the whole repository.

The project had no commits between 2020-05-30 and its revival in 2026, which rebuilt its tooling, core and tests. Verify anything below against the code before acting on it.

## Current State

Verified on 2026-10-23. Update this section when a fact changes.

- **Runtime:** Node.js, TypeScript with `strict`, published as ES modules. `engines.node` is `>= 24`. Imports between sources end in `.ts`; `tsc` rewrites them to `.js` in the build. Keep the syntax erasable (`erasableSyntaxOnly`: no enums, namespaces or parameter properties), because Node.js runs the sources directly in the tests. Browser use goes through the consumer's bundler.
- **Public API:** `src/index.ts` exports only named exports:
  - `Session(sourceCode, language, {maxSteps, random})` (`src/session.ts`), whose `run()` and `input(value)` return a step, `{state: 'input', output}` or `{state: 'end', output, error?}`, and `stop()`. `random` gives the numbers of `random()`, `Math.random` by default. Its state is in `#` private fields; an unknown language ends it with `unknownLanguage`.
  - `check(sourceCode, language)`, the first error before running, or `null`.
  - `programOf(sourceCode, language)` (`src/program.ts`), the tree of a program for tools (`docs/tree.md`, format `TREE_FORMAT`), or `{error}`.
  - `convert(sourceCode, language, target)` (`src/convert/`, also the entry `cmil/convert`, which has only it, for pages that load the converters when they need them) and `targets` (`src/targets.ts`, which loads no converter), a program in C++, Python, C#, Java, C, JavaScript, Pascal, Go, Kotlin, Swift, Rust, PHP, Ruby, Lua, BASIC, Visual Basic, Fortran, Tcl, COBOL or x86-64 assembly (C# and Java modern and classic: `csharp`, `csharp-classic`, `java`, `java-classic`; assembly in the Intel and AT&T syntaxes of the GNU assembler and in NASM's: `x86-64`, `x86-64-att`, `x86-64-nasm`) with the CMIL line of each line, or the `problems` a typed language has with it, or `{error}`; `problemOf(problem, language)` gives their messages (`docs/converting.md`).
  - `messageOf(error, language)` (`src/messages.ts`), from the `messages` of each language.
  - `segmentsOf(line, language)`, `commandsOf(language)` and `quotesOf(language)` (`src/editor.ts`), for editors that color and complete programs.
  - `languages`, the language codes, and `translate(sourceCode, from, to)`, a program in another language: names that are commands there get a trailing `_`, and an unknown language throws.
  - the types `Step`, `SessionOptions`, `ProgramError`, `LineSegment`, `CommandKind` and `Quotes`.

  CommonJS code uses `const {Session} = require('cmil')`.
- **Package entry:** `exports`, `main` and `types` point to `dist/`, which `npm run build` compiles from `src/` with type declarations (`tsconfig.build.json`): `cmil`, and `cmil/convert` for `convert()` alone. `"sideEffects": false` tells bundlers that no module does anything when it loads, so they leave out what a page or a worker doesn't use, like the converters of a worker that only runs programs; keep the modules to declarations, a module's own tables included. `prepare` runs the build on `npm install` in a clone and before `npm publish`. `dist/` is gitignored. `files` limits the package to it and to the license files of `src/constants/` and `src/translations/`. There is no `npm start`.
- **Releases:** `.github/workflows/release.yml` runs when a tag `v` plus the package version is pushed, or when it is run on `master` (Actions → release → Run workflow), which creates that tag on the commit. It checks the package and that the test workflow, which builds and runs the converted programs, passed on that commit, creates the GitHub Release with that version's `CHANGELOG.md` section as notes (alpha, beta and rc versions as pre-releases), and publishes to npm with trusted publishing (no token) under the `latest` tag. To release: set the version with `npm version <version> --no-git-tag-version`, give the CHANGELOG section that version and the date, merge, then run the workflow on `master` or push the tag. Cloud sessions can't push tags, so they run the workflow.
- **LinguaCode, the website:** https://linguacode.otanim.com runs CMIL in the browser, with lessons in every language. Its source is in the owner's private repository, which pins cmil to a release tag and publishes the page to Cloudflare. After a release, the owner bumps that tag there.
- **Publishing:** cmil goes to npm as `cmil` from its first release candidate; until then it installs from GitHub (npm 12 needs `--allow-git=root`). `release.yml` skips alpha and beta versions and versions already on npm.
- **Tests:** the Node.js test runner (`npm test` runs `test/*.ts` on the TypeScript sources, no build needed). `test/cmil.ts` runs every case of `test/collection/` in a `Session` (`successes` and `errors` in `en`, `tutorials` in `hy-AM`), plus a sessions test and a `maxSteps` test. A case may carry `todo` or `skip`, passed to the test runner. `test/core.ts` covers the interpreter's mechanics, the session, columns, `check()` and the messages of every language, `test/translations.ts` checks that every language defines every command, gives every word one command, runs its constants, booleans and `ceil`, and writes its messages in its own punctuation, and `docs/translations.md` is current, `test/words.ts` covers the keyword scanner and `translate()`, including every spec program translated into every language, `test/editor.ts` covers the editor functions, `test/types.ts` the types of the values, and `test/convert.ts` the program tree and the conversion: it compiles and runs every spec program in each target whose tool is installed (`g++`, `python3`, `dotnet`, `javac` of Java 25 in `JAVA_HOME` or on the path, `gcc` for C and the GNU assembler, `nasm`, Node.js for JavaScript, `fpc`, `go` with its `gofmt`, `kotlinc` in `KOTLIN_HOME` or on the path, `swiftc`, `rustc`, `php` with `mbstring`, `ruby`, `lua5.4`, `fbc` of FreeBASIC, `gfortran`, `tclsh`, and `cobc` of GnuCOBOL; in CI a missing one fails), and lists the cases of each target's differences, and what each target does where CMIL stops a program as it runs (`OUTCOMES`). `CMIL_TARGETS=c,x86-64 npm test` builds and runs the spec programs in those targets alone, and an empty `CMIL_TARGETS` in none; each target's suite is named by its language and its shape or syntax, like `spec programs in C# (classic)`. `test/runners.ts` has how each target builds and runs a program. All 8591 tests pass on Node.js 24 and 26, 190 of them skipped as those differences and as what a language leaves undefined; CI runs them on Node.js 24, and all but the built programs on 26 too.
- **Types:** `npm run typecheck` checks `src/`, `test/` and `scripts/` with `tsc` (`tsconfig.json`). The syntax tree, instruction and value types are in `src/core/types.ts`.
- **Coverage:** `npm run coverage` runs the tests under c8 and writes a text summary and `coverage/` (gitignored).
- **Snapshot:** `npm run snapshot` (`scripts/snapshot.ts`) converts every program of `test/collection/` into every target and lists each program whose conversion changed since the baseline that `npm run snapshot -- --save` writes into `.snapshot/` (gitignored), with its changed lines; `--targets c,x86-64` takes only those targets. Save a baseline before changing a converter: a refactor changes no conversion, and a fix only the programs it means to. `--programs` adds the programs of a JSON list of `{name, language, code}`, like every lesson and solution of the website in every language, which `npm run lesson-programs` writes into `lesson-programs.json` in the website's repository.
- **Lint and format:** ESLint (`eslint.config.js`, the recommended rules of ESLint and typescript-eslint) and Prettier (`.prettierrc.json`, matching the existing style; Markdown is not formatted). `npm run lint` checks both, `npm run format` rewrites with Prettier.
- **CI:** GitHub Actions (`.github/workflows/test.yml`), for every push and pull request: a `check` job on Node.js 24 and 26 runs `npm ci` (which builds `dist/`), `npm run lint`, `npm run typecheck`, `npm test` with an empty `CMIL_TARGETS`, so without building the converted programs, and a program through the built package; six `convert` jobs on Node.js 24 build and run the spec programs of a group of targets each, which its `CMIL_TARGETS` names, with only that group's tools: the runner's `g++` and `gcc` with NASM; Java 25 with the runner's `kotlinc`; the runner's .NET; the runner's Python, Node.js, PHP and Ruby with Lua and Tcl; Free Pascal, FreeBASIC, gfortran and GnuCOBOL; and Go with the runner's `rustc` and `swiftc`. A test checks that the groups have every target once.
- **Language specification:** the cases in `test/collection/` define expected language behaviour. They cover successes, values, loops, lists, functions, tutorials, and syntax, logic, restriction, value, list and function errors (391 cases).
- **Core:** programs never run as JavaScript. `src/core/lexer.ts` splits lines into tokens, with the words of the program's language found by `words.ts`, `parser.ts` builds the syntax tree, `compiler.ts` flattens it into instructions with jumps, and `interpreter.ts` runs them in a loop. All state belongs to one session, so sessions are independent. The functions of a program run in the same loop, with a stack of frames, so they can wait for input: an instruction with a call stops at the call, and when the function returns it runs again with the values it recorded before the call, so values are computed once and from left to right. An `input()` stops its instruction the same way until the answer comes.
- **Errors:** `{id, …}` (`ProgramError` in `src/core/types.ts`). Syntax, indentation, argument, name and undefined function errors are found before the program runs. Every error reports its absolute line, except `timeout` and `unknownLanguage`, and the column, from 1, where it points at a token. Output printed before an error comes with it.
- **Values** (`src/core/values.ts`): numbers, texts, booleans and lists, never converted into another type. Operators, conditions, functions, indexes and loops take only their types and report `typeError`, `conditionError`, `divisionByZero`, `mathError`, `indexError` or `itemError`; NaN and Infinity never appear. Lists are JavaScript arrays shared by reference, as in Python. A list is never a text: printing it, joining it into a text or `to_text` of it is a `listAsText`, and `==`, `!=`, `in` and `remove` of lists a `typeError`, so nothing walks a list to print or compare it. Numbers are printed, and compared, with 12 significant digits (`NUMBER_PRECISION`).
- **Commands:** keywords give a program its shape (`if`, `while`, `do`, `repeat … times`, `for`, `function`, `return`, `break`, `continue`); what does something or gives a value is called with parentheses, like `print(value)`, `name = input()`, `add(list, value)`, `remove(list, value)` and `sin(x)`. `print`, `add` and `remove` give no value (`noValue` before the program runs).
- **Output format:** every `print` prints one value on one line, an empty text an empty line; `+` joins values into one text, code in braces in a text puts its value into it (`"Hi, {name}"`, a `template` expression; `\{` is a brace), and another count of values is an `argumentError`. Booleans are printed in the first word of the program's language for `true` or `false`, also when joined into text; words in texts stay as written. A list isn't printed (`listAsText`, whose message names `join` in the program's language); `join(list, ", ")` puts its items into a text.
- **Limits** (`src/constants/index.ts`, see `docs/running.md`): in one call of `run()` or `input()` a program may run 1,000,000 steps, about half a second, or the session's `maxSteps` (`timeout`); the core has no clock, so hosts stop a hung worker themselves. A text may be 1,000,000 characters, a list 1,000,000 items, and the output of one call 10,000,000 characters (`memoryLimit`); blocks and expressions nest at most 100 levels (`syntaxError`), and calls of functions 1,000 (`recursionLimit`).
- **Dependencies:** none at runtime. The dev dependencies are TypeScript, c8, ESLint, typescript-eslint, Prettier and their configs. The former sibling packages live in this repository, each with its own license file:
  - `src/constants/index.ts`: the command ids, error ids, run states and limits, from `linguacode-constants` (MIT)
  - `src/translations/`: the words of each command in each language, from `linguacode-translations` (MIT); `types.ts` types a language file, `index.ts` lists the languages

  The old repositories are archived. `src/core/words.ts` replaces the translator of `linguacode-translator`, and `lingua-logger` is gone.
- **Lockfiles:** `package-lock.json` is committed; `yarn.lock` is gitignored.
- **Browser:** the core runs in browsers through a bundler; it touches `process` only behind a `typeof` check.
- **Badges:** the README shows the GitHub Actions and license badges. Travis CI, Coveralls and Code Climate are retired.
- **Translations:** translators send pull requests that change `src/translations/languages/` (see `CONTRIBUTING.md`), or suggest a word with the issue form `.github/ISSUE_TEMPLATE/translation.yml`. Anyone suggests a better text for the lessons or the interface of the website with `.github/ISSUE_TEMPLATE/page-translation.yml`, which the page fills in with the language and the lesson. `docs/translations.md` is generated from the translations by `npm run translations-table` (`scripts/translations-table.ts`, which also holds each language's name and each command's meaning). Each language file is a typed record of words per command id, the first word the main one; no word is marked for a review, and anyone may suggest a better one. Crowdin and Transifex are no longer used.
- **Version and changelog:** the version is `0.21.0-alpha.0`. `CHANGELOG.md` entries use the tags `**[add]**`, `**[optimize]**`, `**[fix]**`, `**[change]**` and `**[status]**`. Entries up to 0.2.1 also use `**[new]**`.
- **Branches:** `master` (default).

## Source Map

Read the files before relying on these descriptions.

- `src/index.ts`: the public API
- `src/session.ts`: `Session` and `check()`: compiles a program and runs it step by step
- `src/messages.ts`: `messageOf()` and `problemOf()`
- `src/program.ts`: `programOf()`, the program tree for tools
- `src/targets.ts`: `targets`, the languages of `convert()` apart from their writers
- `src/convert/`: `convert()`, in `index.ts` with the writer of each target: `types.ts` works out the types of the values, which typed languages need: the slots values go into, like variables, parameters, results and the items of lists, and the answers of `input()`, which take the type of where they go, `emit.ts` has what every target shares (lines with their CMIL line, comments and blank lines, names, where a typed language declares its variables, the facts of a program a target needs, like the step of a `for`, the helpers a program uses, `valueErrorOf()`, the `typeError`, `conditionError` or `listAsText` CMIL stops a program with where the types of its values show it, which `convert()` gives instead of code, and `fixedArraysLineOf()`, the first line that a target whose lists are arrays can't write, by the `FixedArrays` it declares), `code.ts` the expressions of a target as trees, which its `Grammar` brackets by the target's precedence and prints, and CMIL's math by the names most languages give it, `statements.ts` the writer of statements every target shares (comments, declarations, the bounds of a loop kept, fresh names, and blocks in braces, on lines of their own or indented, given how the target writes each statement), `latin.ts` names in Latin letters, and `targets/` writes each language with them
- `src/editor.ts`: `segmentsOf()`, `commandsOf()` and `quotesOf()`, with the kind of every command
- `src/core/types.ts`: types of tokens, lines, the syntax tree, instructions and values
- `src/core/words.ts`: the words of each language; `scan()` splits a line into keywords, names, texts and comments, `translateSource()` translates a program
- `src/core/lexer.ts`: tokens of each line; indentation, texts, numbers, identifiers and commands
- `src/core/parser.ts`: statements and blocks by indentation; expressions by precedence
- `src/core/compiler.ts`: flat instructions with jumps for conditions and loops, and the functions after the program
- `src/core/tree.ts`: the calls of functions in an expression
- `src/core/interpreter.ts`: runs the instructions of one session within the limits
- `src/core/values.ts`: text conversion, operators, lists, functions and constants
- `src/core/error.ts`: `CmilError`, which carries the `ProgramError` a session returns
- `src/constants/`, `src/translations/`: see **Dependencies** above
- `test/`: test harness (`cmil.ts`), test cases (`collection/`, typed by `collection/types.ts`), `core.ts`, `translations.ts`, `words.ts`, `editor.ts`, `types.ts` and `convert.ts`
- `scripts/translations-table.ts`: writes `docs/translations.md`
- `scripts/snapshot.ts`: the snapshot of the conversion
- `tsconfig.json`: type checking of `src/`, `test/` and `scripts/`; `tsconfig.build.json`: the build into `dist/`
- `docs/language.md`: the language reference; keep it in line with `test/collection`
- `docs/running.md`: limits and running sessions in a worker
- `docs/translations.md`: the words of every language, generated; don't edit it by hand
- `docs/converting.md`: how programs are written in each target, and how each differs from CMIL; keep it in line with `test/convert.ts`
- `docs/tree.md`: the program tree

## Commands

```bash
npm install        # also builds dist/ through prepare
npm run build      # tsc: src/ into dist/ with type declarations
npm run typecheck  # tsc on src/, test/ and scripts/, no output
npm test           # node --test on the .ts sources: test/collection in a Session, core, translations, words, editor
npm run coverage   # the same under c8
npm run lint       # ESLint and Prettier check
npm run format     # Prettier rewrite
npm run translations-table  # regenerate docs/translations.md
npm run snapshot   # the conversions changed since npm run snapshot -- --save
```

`package.json` is the source of truth for scripts.

## Safety Rules

**Ask before risky or destructive actions when the intent isn't certain.**

- `git revert`, `git reset`, `git checkout`, `git restore`, `git clean` and `git rebase`: don't assume scope. "Revert the latest changes" doesn't mean "discard all uncommitted work".
- Before any command that discards or overwrites uncommitted changes, back up first with `git stash push -m "backup before <what>"`. Check the stash with `git stash list`, and ask before discarding anything.
- **Never use `git stash pop`.** Use `git stash apply` and drop the stash only once the result is confirmed.
- Never push unless the owner asks. Never force-push or rewrite `master` history.
- After context compaction, be extra careful: you may have lost track of uncommitted work.

### Commits

- Never add `Co-Authored-By:` trailers, AI assistant, model or tool names, or any other attribution or provenance lines to commit messages. This overrides any tool default that appends them.

### Public Text From the Owner's Account

Issues, pull requests, reviews and comments are published under the owner's identity.

- Show the owner the exact final text and get approval for that wording before posting or editing it.
- Don't add AI-assistance disclosures, model or tool names, or authorship statements.

### License, Ownership and Credits

The repository is GPL-3.0 only (`LICENSE`, `"license": "GPL-3.0-only"`), except `src/constants/` and `src/translations/`, which stay MIT by the owner's decision. The README names the author of CMIL and states the licenses.

- Don't edit `LICENSE`, ownership or legal statements, `TEAM.md`, or author fields without an explicit instruction from the owner.
- Report apparent conflicts instead of resolving them yourself.

## Language Behaviour

- The cases in `test/collection/` are the language specification. Never change an expected output just to make a test pass. A behaviour change needs the owner's approval and a `CHANGELOG.md` entry.
- CMIL is multilingual. Keywords, statuses and messages come from `src/constants/` and `src/translations/`, so a change may need to span both. Don't hard-code language-specific text into the core.
- Keep Unicode identifiers working (`src/core/words.ts`).
- Keep the core able to run in a browser unless the owner decides otherwise.

## No Legacy Support

The project is pre-1.0 (see **Version and changelog** above).

- Keep internal formats, configuration and APIs on the current version only.
- Don't add fallback readers, dual-write paths, legacy aliases or compatibility branches.
- If a migration is needed, write it as an explicit, separate conversion step.
- CMIL source code written by users is governed by **Language Behaviour**, not by this rule.

## Modernization: Owner Decisions

The revival raises choices that belong to the owner. Present the options with trade-offs and a recommendation, then wait. Until a choice is made, keep changes within the current setup.

1. Target Node.js version: decided, `>= 24`, tested on 24 and 26. Revisit when an LTS line ends; check the schedule on the web, don't rely on memory.
2. CommonJS or ESM. JavaScript or TypeScript: decided, TypeScript with `strict`, published as ESM; `require('cmil')` keeps working for CommonJS.
3. Build step: decided, `tsc` into `dist/`, run by `prepare` in a clone and before publishing.
4. Test runner: decided, the Node.js test runner with c8 for coverage. The harness runs `test/collection/` directly in a `Session`.
5. Sibling dependencies: decided, brought into this repository.
6. Lockfile policy: decided, `package-lock.json` is committed.
7. CI: decided, GitHub Actions.
8. Linting and formatting: decided, ESLint and Prettier.
9. Library or server: decided, cmil stays a library only; `docs/running.md` shows how to run sessions in a worker.
10. Translation platform: decided, translations come as pull requests to this repository. Crowdin and Transifex are retired.
11. Publishing: decided, npm as `cmil` (the `@linguacode` npm scope belongs to someone else) from the first release candidate, semver, released by the release workflow, under the `latest` tag. Alpha and beta versions are GitHub Releases only.


## Working Style

- **Web search:** use it to check current versions, LTS status, deprecations and migration guides. Your training data may be out of date.
- **Scope:** do what was asked. Finish safe follow-ups that are within that scope, and report other issues you notice instead of silently expanding the change.
- **Lint, test and type errors:** when asked to fix them, fix all of them, including pre-existing errors and warnings.
- **Bug fixes:** after each fix, check the tests. If a test passed without catching the bug, fix its assertions. If nothing covers that code path, add a regression test.
- **Debugging:** keep logs focused and serialize objects with compact `JSON.stringify(value)`. Remove debugging logs once the owner confirms the fix.
- **Checks:** run the narrowest relevant check, with quiet output unless you are debugging a failure.
- **Processes:** track the processes you start and stop them when you finish. Don't stop processes the owner started.
- **Subagents:** don't spawn subagents or parallel agents unless the owner asks for it.
- **Documentation:** put permanent documentation under `docs/`. Keep this file short and link to deeper docs instead of copying them.
