# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex and others) working in this repository.

## Purpose

CMIL (Clarified Multilingual Intermediate Language) is the language core behind [LinguaCode](https://linguacode.me), a platform that teaches children programming in their native language. This file owns agent behaviour for the whole repository.

The project had no commits between 2020-05-30 and its revival. Expect obsolete tooling, and verify anything below against the code before acting on it.

## Current State

Verified on 2026-10-19. Update this section when a fact changes.

- **Runtime:** Node.js, CommonJS (`require` / `module.exports`). `engines.node` is `>= 24`. The source is not transpiled, so browser use goes through the consumer's bundler.
- **Public API:** `src/index.js` exports the class `CodeSubmit(sourceCode, language)` with `execute()`, `onOutput()`, `onInputRequest()`, `onSessionEnd()` and the `inputEmitter` getter.
- **Package entry:** `main` is `src/index.js`, with no build step. `files` limits the package to `src/`.
- **`npm start`** runs `node src/index.js`, which only defines the class. It starts nothing.
- **Tests:** the Node.js test runner (`npm test`, `node --test`). `test/cmil.js` runs every case of `test/collection/` in-process against `CodeSubmit` (`successes` and `errors` in `en`, `tutorials` in `hy-AM`), plus a stack exhaustion regression test that sets `TIMEOUT_IGNORE`. All 180 tests pass on Node.js 24 and 26.
- **Coverage:** `npm run coverage` runs the tests under c8 and writes a text summary and `coverage/` (gitignored).
- **CI:** GitHub Actions (`.github/workflows/test.yml`) runs `npm ci` and `npm test` on Node.js 24 and 26 for every push and pull request.
- **Language specification:** the cases in `test/collection/` define expected language behaviour. They cover successes, tutorials, and syntax, logic and restriction errors (CHANGELOG 0.4.0: 184 tests; 179 are active now, the hack attempt case is commented out).
- **Output format:** `true`, `false`, `NaN`, `null`, `Infinity` and `undefined` are printed as `<true/>`, `<false/>` and so on (LML standard), also inside string output.
- **Timeout:** a session ends with `timeout` after `TIMEOUT_TIME` (666 ms, `linguacode-constants`). The executer recurses on every loop iteration, so a fast engine can exhaust the call stack first; that is reported as `timeout` too.
- **Dependencies from GitHub URLs**, unpublished and unchanged since 2016–2017. The owner controls all of them:
  - `linguacode-constants`: statuses, syntax, commands and paths
  - `linguacode-translator`: converts code to text and text to code
  - `lingua-logger`: the `console.llog` calls in `src/` rely on it

  Translation files live in `LinguaCode/linguacode-translations`. Its `main` points to a missing `./src/index.js`, so current Node.js prints a `DEP0128` warning on load, and its postinstall generates `languageList.js`, without which it can't load.

  npm 12 refuses git dependencies and blocks unapproved install scripts by default. `.npmrc` sets `allow-git=all`, and `allowScripts` in `package.json` approves that postinstall, pinned to the locked commit: after the lockfile moves `linguacode-translations` to another commit, run `npm install-scripts approve linguacode-translations` again. Projects that install cmil need the same steps (see the README).
- **Lockfiles:** `package-lock.json` is committed; `yarn.lock` is gitignored.
- **Session state** is kept on `global` (`__store`, `__language`, `__translator`, `global[sessionId]`), with `window` shims so the core can also run in a browser (`src/core/globals/index.js`). Every `execute()` resets these stores, so concurrent sessions overwrite each other.
- **Badges:** the README shows the GitHub Actions and license badges. Travis CI, Coveralls and Code Climate are retired.
- **Old repository name:** `package.json` `repository` and `bugs` still point to the old name `LinguaCode/core`. GitHub redirects it.
- **Translations:** translators send pull requests to `LinguaCode/linguacode-translations` (see `CONTRIBUTING.md`). Crowdin and Transifex are no longer used.
- **Version and changelog:** the version is `0.4.0-alpha.2`. `CHANGELOG.md` entries use the tags `**[add]**`, `**[optimize]**`, `**[fix]**`, `**[change]**` and `**[status]**`. Entries up to 0.2.1 also use `**[new]**`.
- **Branches:** `master` (default), plus the old `input-output-brackets-delete`.

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
- `test/`: test harness (`cmil.js`) and test cases (`collection/`)

## Commands

```bash
npm install
npm test           # node --test: test/collection against CodeSubmit
npm run coverage   # the same under c8
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

1. Target Node.js version: decided, `>= 24`, tested on 24 and 26. Revisit when an LTS line ends; check the schedule on the web, don't rely on memory.
2. CommonJS or ESM. JavaScript or TypeScript.
3. Build step: decided, none. `main` is `src/index.js`; `exports` is not set.
4. Test runner: decided, the Node.js test runner with c8 for coverage. The harness runs `test/collection/` directly against `CodeSubmit`.
5. Sibling dependencies: keep GitHub URLs, publish them to npm, or bring them into this repository. GitHub URLs need the npm 12 opt-ins described in **Current State**.
6. Lockfile policy: decided, `package-lock.json` is committed.
7. CI: decided, GitHub Actions.
8. Linting and formatting tools.
9. Whether cmil stays a library only, or a server or socket layer returns.
10. Translation platform: decided, translations come as pull requests to `linguacode-translations`. Crowdin and Transifex are retired.
11. Publishing: npm package name and version scheme.

A safe first step that needs no decision is a baseline report. Install on the current Node.js LTS, run the tests, and record exactly what fails and why, without changing anything.

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
