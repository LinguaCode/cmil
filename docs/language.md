# The CMIL language

CMIL programs are written with the commands of the learner's language. The examples here use English; the words of every language are in [`src/translations/languages`](../src/translations/languages), for example:

| Command | English | Armenian (`hy-AM`) | Russian (`ru`) |
|---|---|---|---|
| print | `print` | `արտածել` | `вывести` |
| input | `input` | `մուտքագրել` | `ввести` |
| if, else, then | `if`, `else`, `then` | `եթե`, `այլապես`, `ապա` | `если`, `иначе`, `тогда` |
| while, do | `while`, `do` | `մինչ`, `անել` | `пока`, `сделать` |
| repeat … times | `repeat`, `times` | `կրկնել`, `անգամ` | `повторять`, `раз` |
| for … from … to … step | `for`, `from`, `to`, `step` | `յուրաքանչյուր`, `սկսած`, `մինչև`, `քայլ` | `для`, `от`, `до`, `шаг` |
| for … in, in | `for`, `in` | `յուրաքանչյուր`, `մեջ` | `для`, `среди` |
| add, remove | `add`, `remove` | `ավելացնել`, `հեռացնել` | `добавить`, `удалить` |
| function, return | `function`, `return` | `ֆունկցիա`, `վերադարձնել` | `функция`, `вернуть` |
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
print("Hello")
```

## Values

- **Numbers:** `617`, `2.5`. On Armenian keyboards `․` is also a decimal point. Whole numbers are printed whole, others with 12 significant digits, and numbers are compared as they are printed: `0.1 + 0.2` prints `0.3` and equals `0.3`. Numbers are always printed with all their digits, like `0.0000001`, never as `1e-7`.
- **Texts** in `«…»`, `"…"` or `'…'` in every language, and in the quotes of the program's language, like `“…”` in English, `„…“` in German or `「…」` in Japanese; [translations.md](translations.md) lists them. A backslash takes the next character as it is (`«a \» b»`), `\n` is a new line and `\t` a tab. `translate()` writes texts in the main quotes of the language it translates into, like `«…»` in Armenian.
- **Booleans:** `true` and `false`, printed in the words of the program's language, for example `ճիշտ` in Armenian.
- **Lists:** `[1, 2, "a"]`, or `[]` for an empty list. A list holds any values, also lists. See **Lists** below.
- **Constants:** `pi` and `e`.

Values are never converted into another type: `"5" == 5` is `false`, and an operator or function with a value it doesn't take is a `typeError`.

## Variables

`name = expression` stores a value. Names use letters of any alphabet, digits and `_`, and start with a letter or `_`. Reading a variable before it is stored is an `undefinedVariable` error.

```
դրամ = 300
դրամ = դրամ + 200
print(դրամ)
```
prints `500`.

## Output and input

`print(value)` prints a value on a line; an empty text prints an empty line. Values are joined into one text with `+`: `print("Fruits: " + (3 + 5))` prints `Fruits: 8`, and without the inner parentheses `print("Fruits: " + 3 + 5)` joins from left to right and prints `Fruits: 35`. `print` takes one value, so `print("Fruits:", 8)` is an `argumentError`, and so is `print "Fruits"` without its parentheses.

`input()` waits for the user and gives the answer: a number when it is numeric, else a text. An empty answer is asked for again. The answer is stored with `=`, like `name = input()`, or used like any other value, like `if input() == "yes"`; several `input()` in one line are asked from left to right. `input` only reads: what the user should type is printed before it, like `print("Your name?")`, and a value in its parentheses is an `argumentError`.

```
print("What is your name?")
name = input()
print("Hello, " + name)
```

`print`, `add` and `remove` are lines of their own: they give no value, so `x = print(1)` is a `noValue` error, found before the program runs.

## Operators

From the lowest to the highest precedence:

| Operators | Meaning | Values |
|---|---|---|
| `or` | either is true | booleans; the right side is skipped when the left one is `true` |
| `and` | both are true | booleans; the right side is skipped when the left one is `false` |
| `not` | the opposite | a boolean |
| `==`, `!=` | equal, not equal | any; values of different types are never equal |
| `<`, `>`, `<=`, `>=` | comparisons | two numbers, or two texts in alphabetical order |
| `in` | a value in a list, or a text in a text | `"🍎" in basket` is `true` when an item of `basket` is `==` to it; `"ell" in "hello"` is `true` |
| `+`, `-` | add, subtract | numbers; `+` also joins a text with any value |
| `*`, `/`, `%` | multiply, divide, remainder | numbers; dividing by `0` is a `divisionByZero` |
| `-`, `+` before a value | negative, positive | a number |
| `x[i]` | the item `i` of a list, or the letter `i` of a text | see **Lists** |

Parentheses group: `(1 + 2) * (3 - 4)` is `-3`. A value joined into a text becomes its text: `"x: " + (5 > 3)` is `x: true`. Two lists are equal when their items are equal, in the same order.

## Conditions

```
age = input()
if age < 18
    print("Only for adults")
else if age > 18 then
    print("Welcome")
else
    print("Limited access")
```

`then` is optional. A condition must be `true` or `false`; any other value is a `conditionError`.

## Loops

```
a = 0
while a < 3
    print(a)
    a = a + 1

do
    password = input()
while password != "secret"

repeat 3 times
    print("a")

for i from 1 to 10 step 2
    print(i)

for fruit in ["apple", "pear"]
    print(fruit)
```

- `while` checks its condition before every pass, `do … while` after every pass.
- `repeat N times` reads `N` once, before the first pass, so changing `N` in the loop doesn't change the passes. `N` must be a whole number, not below 0.
- `for i from a to b` gives `i` the values from `a` to `b`, both included, one pass each; `step c` adds `c` instead of 1, and a negative step counts down. `a`, `b` and `c` are read once, before the first pass, and are numbers; a step of 0 is a `typeError`. Each value is counted from `a`, so `step 0.1` doesn't add up errors, and `i` keeps its last value after the loop.
- `for x in list` gives `x` each item of the list, in order, one pass each; `for x in text` gives it each letter. The items are taken once, before the first pass, so adding to the list in the loop doesn't add passes. Any other value is a `typeError`, and `x` keeps its last value after the loop.
- `break` leaves the innermost loop and `continue` starts its next pass; outside a loop they are a `syntaxError`.

## Lists

```
fruits = ["apple", "pear"]
add(fruits, "plum")
fruits[1] = "cherry"
print(fruits)
print(length_of(fruits))
print(fruits[3])
```
prints `["cherry", "pear", "plum"]`, `3` and `plum`.

- `list[i]` is the item at `i`, counted from 1, and `list[i] = value` replaces it. An `i` that isn't a whole number from 1 to the length of the list is an `indexError`. Lists in lists have items of items: `table[2][1]`.
- `add(list, value)` puts the value at the end of the list, and `remove(list, value)` takes out its first item `==` to the value; a value the list doesn't have is an `itemError`. The list comes first: `add("plum", fruits)` is a `typeError`.
- `value in list` is `true` when the list has the value.
- `text[i]` is a letter of a text; letters can be read but not replaced. An emoji is one letter.
- A list is shared, not copied, when it is assigned: after `b = a`, `add(b, 1)` adds to `a` too.
- A list is printed with its items in brackets, texts in the main quotes of the program's language: `[1, "a", true]` in English, `[1, «ա», ճիշտ]` in Armenian. A list inside itself is printed as `[...]`.

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

Math functions take numbers. Another count of arguments, or a missing `(` or `)`, is an `argumentError`, whose message names the function and the count of values it takes; an argument that isn't a number is a `typeError`; and a result that doesn't exist, like `square_root(-1)`, `ln(0)` or `tan(pi / 2)`, is a `mathError`.

## Text and list functions

| Function | Result |
|---|---|
| `length_of(x)` | the count of items of a list, or of letters of a text |
| `uppercase(t)`, `lowercase(t)` | a text in capital or small letters |
| `to_number(t)` | the number a text holds, read like an input: `to_number("2.5")` is `2.5`; a text that isn't a number is a `typeError` |
| `to_text(x)` | a value as it is printed: `to_text(5) + to_text(5)` is `55` |
| `split(t)`, `split(t, separator)` | a list of the words of a text, or of its parts between a separator: `split("a,b", ",")` is `["a", "b"]`; an empty separator gives the letters |
| `join(list)`, `join(list, separator)` | the items of a list as they are printed, joined into a text: `join(["a", "b"], ", ")` is `a, b` |

Another value than these functions take is a `typeError`.

## Functions

```
function area(width, height)
    return width * height

function greet(name)
    print("Hello, " + name)

print(area(3, 4))
greet("Ani")
```
prints `12` and `Hello, Ani`.

- `function name(a, b)` defines a function with its parameters, and the block under it is its body. Functions are defined at the top of the program, not inside a block, and can be called before their definition.
- `name(1, 2)` calls it, in an expression or as a line of its own. A call gives every parameter a value: another count of arguments is an `argumentError`, and a name without a function is an `undefinedFunction`, both found before the program runs.
- `return value` ends the function and gives the value of its call; `return` alone, or the end of the body, ends it without a value. Using the value of a call that has none, like `x = greet("Ani")`, is a `noValue` error.
- A function knows only its parameters and its own variables: the variables of the program and of other calls are not visible in it, and its variables are gone when it returns. A list given to a function is shared, so the function can change it.
- A function can call other functions and itself, up to 1000 calls inside each other; deeper is a `recursionLimit`. A function can wait for input like the program.

## Output format

Every `print` prints one line, also an empty one. Booleans are printed in the words of the program's language, numbers as described under **Values**, texts as written, and lists as described under **Lists**.

## Errors

A session that ends with an error returns it as `{id, …}`, with the line and, where it points at a token, the column, both counted from 1. Syntax, indentation, argument and `undefinedFunction` errors, and the `noValue` of `print`, `add` and `remove`, are found before the program runs, also by `check()`; output printed before any other error comes with it. `messageOf(error, language)` gives its message in every language.

| `id` | When | Also |
|---|---|---|
| `indentError` | indentation is not a multiple of 4 spaces, or deeper than its block | `line` |
| `syntaxError` | a line is not valid CMIL, including JavaScript syntax such as `.`, `!`, `&&` or `;` | `line`, `column` unless the line ends too early |
| `argumentError` | a call with another count of arguments, or a function of the language, like `print` or `input`, without its `(` or `)` | `line`, `column` and `function`, the name as written, and `min` and `max`, the counts of values it takes |
| `equalsError` | `=` inside an expression, like `if x = 5`, where `==` compares | `line`, `column` of the `=` |
| `undefinedVariable` | a variable is read before it is stored | `line`, `column`, `variable` |
| `undefinedFunction` | a call of a function the program doesn't define | `line`, `column`, `function` |
| `noValue` | the value of a call of a function that returned without one, or of `print`, `add` or `remove`, which give none | `line`, `column`, `function` |
| `typeError` | an operator, function, index, `repeat`, `for … in`, `add` or `remove` gets a value it doesn't take, like `"abc" * 2` | `line`, `column`, `operator`: the word of the program's language, or `[]` for an index |
| `conditionError` | a condition is not `true` or `false`, like `if 0` | `line` |
| `divisionByZero` | `/` or `%` by `0` | `line`, `column` |
| `mathError` | a math function or operator has no result, like `square_root(-1)` | `line`, `column`, `operator` |
| `indexError` | an index outside a list or a text, like `[1, 2][3]` | `line`, `column` of the `[`, `index` |
| `itemError` | `remove` of a value the list doesn't have | `line`, `item`: the value as a list prints it |
| `memoryLimit` | a text, a list, or the output of one step, grows too long | `line` |
| `recursionLimit` | more than 1000 calls of functions inside each other | `line` |
| `timeout` | the program runs more steps than its limit between two inputs | none |
| `unknownLanguage` | the session's language isn't one of the languages | `language` |

The limits are in [running.md](running.md).
