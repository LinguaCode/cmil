# The program tree

`programOf(sourceCode, language)` gives the tree of a program, for tools like converters, or `{error}` with the first error the program has before it runs, like `check()`. This is format 1 (`TREE_FORMAT`). A change of the tree changes the format.

```js
import {programOf} from 'cmil';

programOf('# hello\nTotal = pi\nprint(total)', 'en');
// {format: 1, language: 'en',
//  statements: [{type: 'assign', name: 'total', expression: {type: 'value', value: 3.14159…, constant: 'pi'}, line: 2},
//               {type: 'print', expression: {type: 'variable', name: 'total', column: 7}, line: 3}],
//  comments: [{line: 1, column: 1, text: '# hello', trailing: false}],
//  names: {total: 'Total'}}
```

- **Names:** they are in small letters, as CMIL compares them; `names` has the first spelling of each.
- **Commands:** they are their ids, like `print` or `sqrt`, whatever the program's language (`src/constants/index.ts`).
- **Lines and columns:** they count from 1.
- **Comments:** they are not statements. `trailing` is true for a comment after code on its line.

## Statements

Each has its `line`.

| `type` | Fields |
|---|---|
| `print` | `expression` |
| `assign` | `name`, `expression`; `name = input()` has an `input` expression |
| `setItem` | `target`, `index`, `expression`, for `list[index] = expression` |
| `add`, `remove` | `target`, the list, and `expression`, the value |
| `call` | `call`, a `userCall` whose value isn't used |
| `function` | `name`, `parameters`, `body` |
| `return` | `expression`, unless it returns no value |
| `if` | `branches`: `{condition, body, line}` for the `if` and each `else if`; `elseBody`, and `elseLine` when it has an `else` |
| `while` | `condition`, `body` |
| `doWhile` | `body`, `condition`; `line` is the line of its `while`, `doLine` that of its `do` |
| `repeat` | `count`, `body` |
| `for` | `name`, `from`, `to`, `step` when it has one, `body` |
| `forEach` | `name`, `expression`, `body` |
| `break`, `continue` | |

## Expressions

| `type` | Fields |
|---|---|
| `value` | `value`: a number, a text or a boolean; `constant` is `pi` or `e` for those |
| `list` | `items` |
| `variable` | `name`, `column` |
| `index` | `target`, `index`, `column` of the `[` |
| `input` | `column` |
| `call` | `name`, a function of the language like `sqrt`, `args`, `column` |
| `userCall` | `name`, a function of the program, `args`, `column` |
| `unary` | `operator`: `-`, `+` or `not`; `operand`, `column` |
| `binary` | `operator`: `+ - * / % == != < > <= >=`, `and`, `or` or `in`; `left`, `right`, `column` |
