# The CMIL language

CMIL programs are written with the commands of the learner's language. The examples here use English; the words of every language are in [`src/translations/languages`](../src/translations/languages), for example:

| Command | English | Armenian (`hy-AM`) | Russian (`ru`) |
|---|---|---|---|
| output | `output` | `տպել` | `вывести` |
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

```
# say hello
output "Hello"
```

## Values

- **Numbers:** `617`, `2.5`. On Armenian keyboards `․` is also a decimal point.
- **Texts** in `«…»`, `"…"` or `'…'`. A backslash takes the next character as it is (`«a \» b»`), `\n` is a new line and `\t` a tab.
- **Booleans:** `true` and `false`.
- **Constants:** `pi` and `e`.

## Variables

`name = expression` stores a value. Names use letters of any alphabet, digits and `_`, and start with a letter or `_`. Reading a variable before it is stored is an `undefinedVariable` error.

```
դրամ = 300
դրամ = դրամ + 200
output դրամ
```
prints `500`.

## Output and input

`output expression` prints a value. `input name` waits for the user and stores the answer: a number when it is numeric, else a text. An empty answer is requested again.

```
input name
output "Hello, " + name
```

## Operators

From the lowest to the highest precedence:

| Operators | Meaning |
|---|---|
| `or` | either is true |
| `and` | both are true |
| `not` | the opposite |
| `==`, `!=` | equal, not equal |
| `<`, `>`, `<=`, `>=` | comparisons |
| `+`, `-` | add, subtract; `+` also joins texts |
| `*`, `/`, `%` | multiply, divide, remainder |
| `-`, `+` before a value | negative, positive |

Parentheses group: `(1 + 2) * (3 - 4)` is `-3`. A value joined into a text becomes its text: `"x: " + (5 > 3)` is `x: <true/>`.

## Conditions

```
input age
if age < 18
    output "Only for adults"
else if age > 18 then
    output "Welcome"
else
    output "Limited access"
```

`then` is optional. A condition fails only when it is `false`.

## Loops

```
a = 0
while a < 3
    output a
    a = a + 1

do
    input password
while password != "secret"

repeat 3 times
    output "a"
```

- `while` checks its condition before every pass, `do … while` after every pass.
- `repeat N times` checks `N` before every pass and counts from 0, so `repeat 2.5 times` runs 3 times.
- `break` leaves the innermost loop and `continue` starts its next pass; outside a loop they are a `syntaxError`.

## Math functions

| Function | Result |
|---|---|
| `power(x, y)` | `x` to the power of `y` |
| `square(x)`, `square_root(x)` | `x²`, `√x` |
| `round(x)`, `floor(x)`, `ceil(x)` | nearest, lower, higher whole number |
| `absolute_value(x)` | `x` without its sign |
| `sin(x)`, `cos(x)`, `tan(x)`, `ctg(x)` | trigonometry in radians; `sin`, `cos` and `tan` are rounded to 10 decimals |
| `arcsin(x)`, `arccos(x)`, `arctan(x)`, `arcctg(x)` | inverse trigonometry |
| `log(base, x)`, `ln(x)`, `lg(x)` | logarithms: any base, `e`, 10 |
| `random(max)`, `random(min, max)` | a whole number from 0 or `min` to `max`, both included |

Another count of arguments, or a missing `)`, is a `functionArgumentSyntaxError`.

## Output format

`true`, `false`, `NaN` and `Infinity` are printed as `<true/>`, `<false/>`, `<NaN/>` and `<Infinity/>`, which the LinguaCode interface shows in the learner's language. Words in texts are printed as written.

## Errors

`onSessionEnd` receives `{errorId, param}`. Syntax and indentation errors are found before the program runs; output printed before any other error is sent first.

| `errorId` | When | `param` |
|---|---|---|
| `indentError` | indentation is not a multiple of 4 spaces, or deeper than its block | `line` |
| `syntaxError` | a line is not valid CMIL, including JavaScript syntax such as `.`, `!`, `&&` or `;` | `line` |
| `functionArgumentSyntaxError` | a math function with a missing `)` or another count of arguments | `line` |
| `undefinedVariable` | a variable is read before it is stored | `variable`, `line` |
| `memoryLimit` | a text grows too long | `line` |
| `timeout` | the program runs too long between two inputs | none |

The limits are in [running.md](running.md).

## Reserved

`function` has a word in every language but is not supported yet; using it is a `syntaxError`.
