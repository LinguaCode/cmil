# CMIL in CodeMirror

CMIL has two entries for [CodeMirror 6](https://codemirror.net), the editor LinguaCode writes programs in: `cmil/codemirror`, which edits CMIL programs in any of CMIL's languages, and `cmil/codemirror/targets`, which colors the programs `convert()` writes. Both are built on the editor functions of `cmil` (`segmentsOf()`, `commandsOf()`, `quotesOf()`, `check()`, `warningsOf()` and `messageOf()`), so an editor colors, completes and checks a program as CMIL reads it.

## The CodeMirror packages

The entries use the CodeMirror packages of the page, which are peer dependencies of CMIL, so a page has one copy of each, the one its own editor uses. They are optional: `cmil` alone needs none of them, and npm installs none for it.

- `cmil/codemirror`: `@codemirror/state`, `@codemirror/view`, `@codemirror/language`, `@codemirror/autocomplete` and `@codemirror/lint` (6), and `@lezer/highlight` (1).
- `cmil/codemirror/targets`: those of `cmil/codemirror`, `@codemirror/lang-cpp`, `-go`, `-java`, `-javascript`, `-php`, `-python` and `-rust`, and `@codemirror/legacy-modes`, each loaded when its language is first shown.

```
npm install @codemirror/state @codemirror/view @codemirror/language @codemirror/autocomplete @codemirror/lint @lezer/highlight
```

## Editing a program

`cmil(language)` is all that CMIL gives an editor of a program in one language:

```js
import {EditorView} from '@codemirror/view';
import {cmil} from 'cmil/codemirror';

const view = new EditorView({doc: 'արտածել(«Բարև»)', extensions: cmil('hy-AM'), parent: document.body});
```

It has the parts below, each of which is an export of its own, for an editor that takes some of them:

- `cmilLanguage(language)`: the language, which splits each line with `segmentsOf()`, and `highlighter`, which gives each token its class. `#` starts a comment, and `else` goes back to the indentation of its `if` as it's typed.
- `cmilIndent(language)`: 4 spaces, `INDENT`, one level more after a line that starts a block, like `if` or `repeat`, except after the `while` that ends a `do … while`; `else` under the nearest `if`. `indentationOf(before, line, language)` gives the indentation of a line after the lines before it.
- `closeQuotes(language)`: an opening quote of the language, like „ in German or 「 in Japanese, adds its closing quote, also after an input method, or wraps the selected text; a closing quote steps over the one after the cursor, and Backspace between a pair deletes both. `typeQuote()`, `closeComposed()` and `insideText()` are its rules.
- `cmilCompletion(language)`: every word of every command of the language, a function with its brackets, and the names of the program, outside texts and comments. Tab takes the chosen completion, and Enter always starts a new line.
- `cmilLint(language)`: the first error of the program, `check()`, once typing stops for 300 ms, from its column to the end of its value or the whole line, or, for a program without errors, its warnings, `warningsOf()`, like a text that holds a number and is compared. Their messages are in the program's language. `markError(view, error, language)` marks the error a program ended with when it ran, and `diagnosticOf()` gives the mark of an error or a warning.

`cmil()` has no line numbers, history, keymaps or theme, which the page chooses, like `lineNumbers()`, `history()`, `lintGutter()` and `keymap.of(defaultKeymap)`.

## Colors

The highlighter gives each kind of token a class, and the page gives each class its color. `tokenClasses` lists them:

| Token | Class | What |
| --- | --- | --- |
| `block` | `cmil-block` | a command that starts a block, like `if`, `while` and `function` |
| `statement` | `cmil-statement` | `break`, `continue` and `return` |
| `part` | `cmil-part` | a part of a statement, like `times`, `from`, `to` and `in` |
| `operator` | `cmil-operator` | `and`, `or` and `not` |
| `value` | `cmil-value` | `true`, `false`, `pi` and `e` |
| `function` | `cmil-function` | a function, like `print` and `sin` |
| `name` | `cmil-name` | a name of the program |
| `string` | `cmil-string` | a text, with its quotes |
| `number` | `cmil-number` | a number |
| `comment` | `cmil-comment` | a comment |
| `symbol` | `cmil-symbol` | an operator or a bracket, like `+` and `(` |
| `invalid` | `cmil-invalid` | a character that is a syntax error |

```js
import {tokenClasses} from 'cmil/codemirror';

const css = Object.entries(tokenClasses).map(([token, name]) => `.${name} {color: var(--code-${token})}`);
```

`tokensOf(line, language)` gives the tokens of a line, for code shown without an editor, like a solution in a dialog.

An editor that has colors of its own, like a theme's `HighlightStyle`, takes `cmil(language, {classes: false})` and `targetLanguage(target, {classes: false})`, which leave out the highlighter of the classes and keep the rest. The tags of CMIL's tokens come from CodeMirror's own, like `controlKeyword` for `block`, `keyword` for `statement` and `part`, `string` and `lineComment`, so any highlighter colors them. The classes are needed off there: a highlighter that isn't a fallback turns the fallback ones off, like `syntaxHighlighting(defaultHighlightStyle, {fallback: true})`, and the program would show only classes the page doesn't color.

```js
import {defaultHighlightStyle, syntaxHighlighting} from '@codemirror/language';

const extensions = [cmil('en', {classes: false}), syntaxHighlighting(defaultHighlightStyle, {fallback: true})];
```

## Converted programs

`targetLanguage(target)`, from `cmil/codemirror/targets`, gives the colors of a target of `convert()` once its package is loaded, with the classes of CMIL: a keyword of C++ that starts a block is `cmil-block`, a text `cmil-string`, a type `cmil-part`, and so on, so a program and its conversion have the same colors. An unknown target is an error.

```js
import {EditorState} from '@codemirror/state';
import {EditorView} from '@codemirror/view';
import {convert} from 'cmil/convert';
import {targetLanguage} from 'cmil/codemirror/targets';

const {code} = convert('print("Hi")', 'en', 'cpp');
const extensions = [EditorState.readOnly.of(true), await targetLanguage('cpp')];
new EditorView({doc: code, extensions, parent: document.body});
```

C# and Kotlin, which CodeMirror has no packages of, are colored by its modes, like Pascal, Swift, Ruby, Lua, Visual Basic, Fortran, Tcl, COBOL and the GNU assembler, with what those modes miss: the instructions, directives, labels, registers and sizes of x86-64 assembly, NASM by a mode of its own, BASIC by Visual Basic's with the words of FreeBASIC, Tcl's texts and operators, and COBOL in GnuCOBOL's free format, which CMIL writes, with its `*>` comments.

## Linked lines

`convert()` gives the CMIL line of each line it writes, so two editors can show which lines go together. `linkedLines(onCursor)` calls `onCursor` with the line of the cursor, from 1, as it moves, or `null` when the editor isn't focused, and `showLines(view, lines)` marks lines of the other editor with the class `cmil-linked-line` and scrolls the first of them into view. `markLines` is the effect that marks them.
