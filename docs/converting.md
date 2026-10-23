# Converting CMIL programs

CMIL teaches what matters, in the learner's language, with nothing to import. `convert()` shows the same program in a real language, line by line, so a learner who understands the CMIL program learns only the other language's syntax. The conversion goes one way: from CMIL.

```js
import {convert, problemOf, targets} from 'cmil';

const result = convert('name = input()\nprint("Hello, " + name)', 'en', 'cpp');
if ('code' in result) {
  console.log(result.code); // the C++ program
  console.log(result.lines); // for each of its lines, the CMIL line it comes from, or null
} else if ('problems' in result) {
  result.problems.forEach(problem => console.log(problemOf(problem, 'en')));
} else {
  console.log(result.error); // the error of the CMIL program, as check() gives it
}
```

- `targets` lists the languages, each `{id, name, extension}`: `cpp` (C++) and `python` (Python).
- `convert(sourceCode, language, target)` gives one of three things:
  - `{code, lines}`;
  - `{problems}`, why a typed language can't write the program;
  - `{error}`, the error the CMIL program has before it runs.

  An unknown target throws an error.
- `problemOf(problem, language)` gives a problem's message in every language, like `messageOf()` for errors.

The converted program is what a teacher would write. Its output is CMIL's for every lesson of LinguaCode and every spec program, except where the language itself differs (below). The comments of the program and its blank lines stay where they are, and names keep the spelling they were first written with. A name that is a word of the target, like `int`, gets a `_`.

## Types

C++ declares a type for every value, and CMIL never does, so the conversion works them out from the program ([`src/convert/types.ts`](../src/convert/types.ts)):

- **Numbers:** a number is whole when it is sure to be: whole literals, `+ - * %` of whole numbers, `round(x)`, `floor`, `ceil`, `length_of`, `random`, and the counter of a `for` with a whole start and step. Any other number is real, like the result of `/`.
- **Answers:** an answer is a number where the program uses it as one, in arithmetic, in a comparison with a number or as a count; two answers added together are numbers too. Otherwise it is a text.
- **Lists:** a list has items of one type.
- **Parameters and results:** a function's parameters get the types of its arguments, and its result the type of what it returns.

A variable, a list or a function that gets values of two types, like `x = 1` and later `x = "one"`, or the list `[1, "a"]`, is a problem for C++ (`mixedTypes`, `mixedItems`). Python writes such a program as it is.

## C++

C++20, as g++ compiles it.

| CMIL | C++ |
|---|---|
| a whole number, a real number, a text, a boolean, a list | `int`, `double`, `std::string`, `bool`, `std::vector<…>` |
| `print(a + " " + b)` | `std::cout << a << " " << b << '\n';` |
| `name = input()` | `std::string name;` `std::getline(std::cin >> std::ws, name);`, or `std::cin >> age;` for a number |
| `repeat n times` | `for (int i = 0; i < n; i++)` |
| `for i from 1 to 10 step 2` | `for (int i = 1; i <= 10; i += 2)`, with `>=` and `--` for a negative step |
| `for x in list` | `for (int x : list)` |
| `do … while c` | `do { … } while (c);` |
| `list[i]` | `list[i - 1]`: C++ counts from 0 |
| `add(list, x)`, `remove(list, x)`, `x in list` | `push_back`, `erase(std::find(…))`, `std::find(…) != list.end()` |
| `a / b` of whole numbers | `static_cast<double>(a) / b`: in C++ it would be a whole number |
| `function f(a)` | a function before `main`, with a prototype when one written before it calls it; a list is a reference, `const` when the function only reads it |

What C++ can't say in one line comes as a helper at the top, only when the program needs it, each with a comment:
- `number_text()`, `value_text()` and `item_text()`: printing a list, and a real number in a text;
- `letters()`: the letters of a text, since a `std::string` has bytes;
- `split_words()`, `split()`, `join()`, `uppercase()` and `lowercase()`;
- `round_to()`, `random_number()`, and `read_text()` / `read_number()` for an `input()` inside an expression.

Booleans are printed with `std::boolalpha` in English programs, and in the words of the program's language otherwise. Real numbers are printed with `std::setprecision(12)`, as CMIL prints them.

**Differences from CMIL:**
- C++ compares real numbers exactly, so `0.1 + 0.2 == 0.3` is `false`.
- It prints very large and very small numbers with an exponent, like `1e+21`.
- It doesn't round trigonometry, so `sin(pi)` is about `1.2e-16`.
- An answer used only as a text stays a text, also when it is a number, like in a list of answers.
- The counter of a `for` ends one step after its last value.
- `std::toupper` changes only English letters.
- C++ prints the parts of a line while it computes them, so a function that prints, called inside `print()`, prints first.
- A whole number past about two billion overflows an `int`, and a list copied with `b = a` and then given another list is a copy.

## Python

| CMIL | Python |
|---|---|
| `print(a + " " + b)` | `print(f"{a} {b}")`, a real number as `{x:.12g}` |
| `name = input()` | `name = input()`, or `age = float(input())` for a number |
| `repeat n times` | `for _ in range(n):` |
| `for i from 1 to 10 step 2` | `for i in range(1, 11, 2):`; a real start or step counts with `while` |
| `do … while c` | `while True:` … `if not c: break`, with the condition turned around |
| `list[i]` | `list[i - 1]`: Python counts from 0 |
| `round(x)` | `math.floor(x + 0.5)`: Python's `round()` rounds a half to even |

The helper `show()` prints a list of texts, real numbers or booleans as CMIL does, like `["a", "b"]`; a list of whole numbers is printed with `print()`. The helper `round_to()` does `round(x, digits)`.

**Differences from CMIL:**
- Python prints `True` and `False`.
- It compares real numbers exactly.
- It prints very large and very small numbers with an exponent.
- It doesn't round trigonometry.
- An answer used only as a text stays a text.

## Tests

[`test/convert.ts`](../test/convert.ts) converts every spec program into each target whose compiler or interpreter is installed (`g++`, `python3`), runs it with its inputs, and compares what it prints with the spec. Its lists name the cases of the differences above, and the cases C++ can't write. CI has both.
