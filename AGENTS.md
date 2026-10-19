# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex and others) working in this repository.

## Purpose

CMIL (Clarified Multilingual Intermediate Language) is the language core behind [LinguaCode](https://linguacode.me), a platform that teaches children programming in their native language. This file owns agent behaviour for the whole repository.

The project had no commits between 2020-05-30 and its revival. Expect obsolete tooling, and verify anything below against the code before acting on it.

## Current State

Verified on 2026-10-19 against `master`. Update this section when a fact changes.

- **Runtime:** Node.js, CommonJS (`require` / `module.exports`). `engines.node` is `>= 7.9.0`.
- **Public API:** `src/index.js` exports the class `CodeSubmit(sourceCode, language)` with `execute()`, `onOutput()`, `onInputRequest()`, `onSessionEnd()` and the `inputEmitter` getter.
- **Package entry:** `main` is `build/index.js`, the Babel 6 output of `npm run build` (`babel-cli`, `babel-preset-env`). `build/` is gitignored.
- **`npm start`** runs `node src/index.js`, which only defines the class. It starts nothing.
- **Tests:** Mocha 3 (`npm test`, options in `test/mocha.opts`). The suite can't run as it is:
  - `test/sockets.js` requires `socket.io-client`, which isn't declared in `package.json`, so loading fails with `MODULE_NOT_FOUND`.
  - It then loads a Socket.IO server from `src/server.js` (path built from `linguacode-constants`). That server was removed in the 2020-05-27 commit "potraying as npm package + minor fixes".
  - The HTTPS certificates for `https://localhost:3005` live in the gitignored `src/config/keys/`.
  - Only `test/collection/testDB.js`, a single debugging case, is enabled. `successes`, `errors` and `tutorials` are commented out.
- **Language specification:** the cases in `test/collection/` define expected language behaviour. They cover successes, tutorials, and syntax, logic and restriction errors (CHANGELOG 0.4.0: 184 tests).
- **Dependencies from GitHub URLs**, unpublished and unchanged since 2016–2017. The owner controls all of them:
  - `linguacode-constants`: statuses, syntax, commands and paths
  - `linguacode-translator`: converts code to text and text to code
  - `lingua-logger`: the `console.llog` calls in `src/` rely on it
  - `node-cache-wiper`: a dev dependency from `otanim/node-cache-wiper`

  Translation files live in `LinguaCode/linguacode-translations`. Its `main` points to a missing `./src/index.js`, so current Node.js prints a `DEP0128` warning on load.
- **Lockfiles:** `package-lock.json` and `yarn.lock` are both gitignored.
- **Session state** is kept on `global` (`__store`, `__language`, `__translator`, `global[sessionId]`), with `window` shims so the core can also run in a browser (`src/core/globals/index.js`).
- **Coverage script:** `npm run coverage` ends with `start coverage/lcov-report/index.html`, which only works on Windows.
- **Dead services:** CI and badges point to services that are retired or obsolete: Travis CI (`.travis.yml`, travis-ci.org), Coveralls through istanbul 0.4, Code Climate (`.codeclimate.yml`), david-dm, Gratipay and Beerpay.
- **Old repository name:** `package.json` `repository` and `bugs` still point to the old name `LinguaCode/core`. GitHub redirects it.
- **Inconsistent translation platform:** `CONTRIBUTING.md` sends translators to Transifex, while the README badge points to Crowdin.
- **Version and changelog:** the version is `0.4.0-alpha.2`. `CHANGELOG.md` entries use the tags `**[add]**`, `**[optimize]**`, `**[fix]**`, `**[change]**` and `**[status]**`. Entries up to 0.2.1 also use `**[new]**`.
- **Branches:** `master` (default), plus the old `input-output-brackets-delete` and `new-team-member-sona-chitchyan`.

## Source Map

Read the files before relying on these descriptions.

- `src/index.js`: public API and session lifecycle (pre-execute, execute, post-execute)
- `src/core/errorHandler/`: checks run before execution (`checker.js`, `reservedWords.js`)
- `src/core/builder/`: builds the executable structure (`coder/`, `operations/`, `operations/conditions/`)
- `src/core/executer/`: compiler and evaluation, session getters, setters and checkers, the input listener
- `src/core/sender/`: passes output, input requests and session end to the `CodeSubmit` callbacks
- `src/core/globals/`: per-session global stores
- `src/core/formatter/`, `src/core/modifier/` (`modify.js`, `uglify.js`)
- `src/libs/constants.js`: Unicode-aware identifier regexes and syntax constants
- `src/libs/tools.js`: parsing helpers for quotes, arguments, scopes and code depth
- `test/`: Mocha harness (`sockets.js`) and test cases (`collection/`)

## Commands

```bash
npm install
npm run build   # Babel 6 -> build/
npm test        # Mocha; currently fails, see Current State
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

The repository is GPL-3.0 (`LICENSE`), and the README contains the author's statement about ownership of the CMIL standard.

- Don't edit `LICENSE`, ownership or legal statements, `TEAM.md`, or author fields without an explicit instruction from the owner.
- Report apparent conflicts instead of resolving them yourself. Examples: the GPL license versus the README statement, and `"license": "SEE LICENSE IN LICENSE file"` in `package.json`.

## Language Behaviour

- The cases in `test/collection/` are the language specification. Never change an expected output just to make a test pass. A behaviour change needs the owner's approval and a `CHANGELOG.md` entry.
- CMIL is multilingual. Keywords, statuses and messages come from `linguacode-constants`, `linguacode-translator` and `linguacode-translations`, so a change may need to span those repositories. Don't hard-code language-specific text into the core.
- Keep Unicode identifiers working (`src/libs/constants.js`).
- Keep the core able to run in a browser unless the owner decides otherwise.

## No Legacy Support

The project is pre-1.0 (`0.4.0-alpha`).

- Keep internal formats, configuration and APIs on the current version only.
- Don't add fallback readers, dual-write paths, legacy aliases or compatibility branches.
- If a migration is needed, write it as an explicit, separate conversion step.
- CMIL source code written by users is governed by **Language Behaviour**, not by this rule.

## Modernization: Owner Decisions

The revival raises choices that belong to the owner. Present the options with trade-offs and a recommendation, then wait. Until a choice is made, keep changes within the current setup.

1. Target Node.js version and `engines`. Check the current LTS on the web; don't rely on memory.
2. CommonJS or ESM. JavaScript or TypeScript.
3. Whether to keep a build step (Babel 6 is obsolete), and what `main` / `exports` point to.
4. Test harness: run `test/collection/` directly against the `CodeSubmit` API, or restore a server. Upgrade Mocha or move to another runner.
5. Sibling dependencies: keep GitHub URLs, publish them to npm, or bring them into this repository.
6. Lockfile policy (both lockfiles are currently gitignored).
7. CI (for example GitHub Actions), and which badges and services to drop or replace.
8. Linting and formatting tools.
9. Whether cmil stays a library only, or a server or socket layer returns.
10. Translation platform (Transifex or Crowdin).
11. Publishing: npm package name and version scheme.

A safe first step that needs no decision is a baseline report. Install on the current Node.js LTS, run the build and the tests, and record exactly what fails and why, without changing anything.

## Working Style

- **Web search:** use it to check current versions, LTS status, deprecations and migration guides. This codebase's dependencies date from 2016–2020, and your training data may be out of date.
- **Scope:** do what was asked. Finish safe follow-ups that are within that scope, and report other issues you notice instead of silently expanding the change.
- **Lint, test and type errors:** when asked to fix them, fix all of them, including pre-existing errors and warnings.
- **Bug fixes:** after each fix, check the tests. If a test passed without catching the bug, fix its assertions. If nothing covers that code path, add a regression test.
- **Debugging:** keep logs focused and serialize objects with compact `JSON.stringify(value)`. Remove debugging logs once the owner confirms the fix.
- **Checks:** run the narrowest relevant check, with quiet output unless you are debugging a failure.
- **Processes:** track the processes you start and stop them when you finish. Don't stop processes the owner started.
- **Subagents:** don't spawn subagents or parallel agents unless the owner asks for it.
- **Documentation:** put permanent documentation under `docs/`. Keep this file short and link to deeper docs instead of copying them.
