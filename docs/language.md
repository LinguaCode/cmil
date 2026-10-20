# The CMIL language

CMIL programs are written with the commands of the learner's language. The examples here use English; the words of every language are in [`src/translations/languages`](../src/translations/languages), for example:

| Command | English | Armenian (`hy-AM`) | Russian (`ru`) |
|---|---|---|---|
| print | `print` | `տպել` | `вывести` |
| input | `input` | `մուտքագրել` | `ввести` |
| if, else, then | `if`, `else`, `then` | `եթե`, `այլապես`, `ապա` | `если`, `иначе`, `тогда` |
| while, do | `while`, `do` | `մինչ`, `անել` | `пока`, `сделать` |
| repeat … times | `repeat`, `times` | `կրկնել`, `անգամ` | `повторять`, `раз` |
| break, continue | `break`, `continue` | `դադարեցնել`, `շարունակել` | `прервать`, `продолжать` |
| and, or, not | `and`, `or`, `not` | `և` (`եւ`, `ու`), `կամ`, `ոչ` | `и`, `или`, `не` |
| true, false | `true`, `false` | `ճիշտ`, `սխալ` | `правда`, `ложь` |

The test cases in [`test/collection`](../test/collection) are the specification of the language.

## Programs

- One statement per line. A block is the lines indented under its command, 4 spaces per level.
- `#` starts a comment until the end of the line. Blank lines are ignored.
- Commands and variable names are case-insensitive: `X` and `x` are the same variable.
- A command is a whole word: `print_x` is a variable name. The words of a two-word command, like Albanian `e vërtetë` (true), may be separated by any spaces.

```
# say hello
print "Hello"
```

## Values

- **Numbers:** `617`, `2.5`. On Armenian keyboards `․` is also a decimal point. Whole numbers are printed whole, others with 12 significant digits, and numbers are compared as they are printed: `0.1 + 0.2` prints `0.3` and equals `0.3`. Numbers are always printed with all their digits, like `0.0000001`, never as `1e-7`.
- **Texts** in `«…»`, `"…"` or `'…'`. A backslash takes the next character as it is (`«a \» b»`), `\n` is a new line and `\t` a tab.
- **Booleans:** `true` and `false`, printed in the words of the program's language, for example `ճիշտ` in Armenian.
- **Constants:** `pi` and `e`.

Values are never converted into another type: `"5" == 5` is `false`, and an operator or function with a value it doesn't take is a `typeError`.

## Variables

`name = expression` stores a value. Names use letters of any alphabet, digits and `_`, and start with a letter or `_`. Reading a variable before it is stored is an `undefinedVariable` error.

```
դրամ = 300
դրամ = դրամ + 200
print դրամ
```
prints `500`.

## Output and input

`print expression` prints a value on a line, and `print a, b, c` several values separated by spaces. `input name` waits for the user and stores the answer: a number when it is numeric, else a text. An empty answer is asked for again. A prompt before the name, `input "Your name?" name`, is shown to the user while the program waits; it can be any value, like `"Your " + item + "?"`.

```
input name
print "Hello, " + name
```

## Operators

From the lowest to the highest precedence:

| Operators | Meaning | Values |
|---|---|---|
| `or` | either is true | booleans; the right side is skipped when the left one is `true` |
| `and` | both are true | booleans; the right side is skipped when the left one is `false` |
| `not` | the opposite | a boolean |
| `==`, `!=` | equal, not equal | any; values of different types are never equal |
| `<`, `>`, `<=`, `>=` | comparisons | two numbers, or two texts in alphabetical order |
| `+`, `-` | add, subtract | numbers; `+` also joins a text with any value |
| `*`, `/`, `%` | multiply, divide, remainder | numbers; dividing by `0` is a `divisionByZero` |
| `-`, `+` before a value | negative, positive | a number |

Parentheses group: `(1 + 2) * (3 - 4)` is `-3`. A value joined into a text becomes its text: `"x: " + (5 > 3)` is `x: true`.

## Conditions

```
input age
if age < 18
    print "Only for adults"
else if age > 18 then
    print "Welcome"
else
    print "Limited access"
```

`then` is optional. A condition must be `true` or `false`; any other value is a `conditionError`.

## Loops

```
a = 0
while a < 3
    print a
    a = a + 1

do
    input password
while password != "secret"

repeat 3 times
    print "a"
```

- `while` checks its condition before every pass, `do … while` after every pass.
- `repeat N times` reads `N` once, before the first pass, so changing `N` in the loop doesn't change the passes. `N` must be a whole number, not below 0.
- `break` leaves the innermost loop and `continue` starts its next pass; outside a loop they are a `syntaxError`.

## Math functions

| Function | Result |
|---|---|
| `power(x, y)` | `x` to the power of `y` |
| `square(x)`, `square_root(x)` | `x²`, `√x` |
| `round(x)`, `round(x, digits)` | nearest whole number, or nearest number with that many decimals: `round(3.14159, 2)` is `3.14` |
| `floor(x)`, `ceil(x)` | lower, higher whole number |
| `absolute_value(x)` | `x` without its sign |
| `sin(x)`, `cos(x)`, `tan(x)`, `cot(x)` | trigonometry in radians, rounded to 12 decimals, so `sin(pi)` is `0` |
| `arcsin(x)`, `arccos(x)`, `arctan(x)`, `arccot(x)` | inverse trigonometry |
| `log(base, x)`, `ln(x)`, `lg(x)` | logarithms: any base, `e`, 10 |
| `random(max)`, `random(min, max)` | a whole number from 0 or `min` to `max`, both included; `min`, `max` must be whole |

Math functions take numbers. Another count of arguments, or a missing `)`, is an `argumentError`; an argument that isn't a number is a `typeError`; and a result that doesn't exist, like `square_root(-1)`, `ln(0)` or `tan(pi / 2)`, is a `mathError`.

## Output format

Every `print` prints one line. Booleans are printed in the words of the program's language, numbers as described under **Values**, and texts as written.

## Errors

A session that ends with an error returns it as `{id, …}`, with the line and, where it points at a token, the column, both counted from 1. Syntax, indentation and argument errors are found before the program runs, also by `check()`; output printed before any other error comes with it. `messageOf(error, language)` gives its message in every language.

| `id` | When | Also |
|---|---|---|
| `indentError` | indentation is not a multiple of 4 spaces, or deeper than its block | `line` |
| `syntaxError` | a line is not valid CMIL, including JavaScript syntax such as `.`, `!`, `&&` or `;` | `line`, `column` unless the line ends too early |
| `argumentError` | a math function with a missing `)` or another count of arguments | `line`, `column` of the function |
| `equalsError` | `=` inside an expression, like `if x = 5`, where `==` compares | `line`, `column` of the `=` |
| `undefinedVariable` | a variable is read before it is stored | `line`, `column`, `variable` |
| `typeError` | an operator, function or `repeat` gets a value it doesn't take, like `"abc" * 2` | `line`, `column`, `operator`, the word of the program's language |
| `conditionError` | a condition is not `true` or `false`, like `if 0` | `line` |
| `divisionByZero` | `/` or `%` by `0` | `line`, `column` |
| `mathError` | a math function or operator has no result, like `square_root(-1)` | `line`, `column`, `operator` |
| `memoryLimit` | a text, or the output of one step, grows too long | `line` |
| `timeout` | the program runs more steps than its limit between two inputs | none |
| `unknownLanguage` | the session's language isn't one of the languages | `language` |

The limits are in [running.md](running.md).

## Reserved

`function` has a word in every language but is not supported yet; using it is a `syntaxError`.
