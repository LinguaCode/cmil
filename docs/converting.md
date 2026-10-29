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

- `convert` is also the package's entry `cmil/convert`, which has only it, so a page can load the converters when it first shows a program in another language, like `const {convert} = await import('cmil/convert')`. `targets` doesn't load them; CMIL declares that its modules have no side effects, but for the parts below, so a bundler leaves out what a page doesn't use.
- `convert` also comes in parts, for a page or an app that shows a few languages and loads each when it needs it: `cmil/convert/core` has `convert()` with no writer, and `cmil/convert/<writer>` gives it the targets of a writer when it is imported. A target of a writer that isn't imported throws an error that names its entry.

  ```js
  import {convert, targets} from 'cmil/convert/core';
  import 'cmil/convert/csharp';

  convert('print(1)', 'en', 'csharp-classic'); // C# in its classic shape
  targets.find(({id}) => id === 'x86-64-nasm').writer; // 'assembly': import 'cmil/convert/assembly'
  ```

  The writers are `cpp`, `python`, `csharp` (both shapes), `java` (both shapes), `c`, `javascript`, `pascal`, `go`, `kotlin`, `swift`, `rust`, `php`, `ruby`, `lua`, `basic`, `visualbasic`, `fortran`, `tcl`, `cobol` and `assembly` (the three syntaxes). `cmil/convert` gives its `convert()` every writer when it first converts.
- `targets` lists the languages, each `{id, name, extension, writer}`: `cpp` (C++), `python` (Python), `c` (C), `javascript` (JavaScript), `pascal` (Pascal), `go` (Go), `kotlin` (Kotlin), `swift` (Swift), `rust` (Rust), `php` (PHP), `ruby` (Ruby), `lua` (Lua), `basic` (BASIC), `visualbasic` (Visual Basic), `fortran` (Fortran), `tcl` (Tcl), `cobol` (COBOL), C# and Java in two shapes each, with their `style`: `csharp` and `java`, `modern`, and `csharp-classic` and `java-classic`, `classic`, and x86-64 Assembly in three syntaxes, with theirs: `x86-64`, `intel`, and `x86-64-att`, `att`, of the GNU assembler, and `x86-64-nasm`, `nasm`.
- `convert(sourceCode, language, target)` gives one of three things:
  - `{code, lines}`;
  - `{problems}`, why a typed language can't write the program;
  - `{error}`, the error the CMIL program has before it runs.

  An unknown target throws an error.
- `problemOf(problem, language)` gives a problem's message in every language, like `messageOf()` for errors.

The converted program is what a teacher would write. Its output is CMIL's for every lesson of LinguaCode and every spec program, except where the language itself differs (below). The comments of the program and its blank lines stay where they are, and names keep the spelling they were first written with. A name that is a word of the target, like `int`, gets a `_`, and so does a variable or a parameter named like a function of the program, which CMIL tells apart and most languages don't. A target whose names have only Latin letters, like Pascal, writes a name of another alphabet in them ([`src/convert/latin.ts`](../src/convert/latin.ts)): Armenian անուն is `anun`, Russian имя `imya`, Korean 이름 `ireum`; a name of no letter it can write, like a Chinese one, is numbered, like `name1`.

A loop reads its bounds once, as CMIL does: a target whose loop would compute one again on each pass, like the last value in the test of C's `for`, keeps it in a variable first when it asks, calls a function or `random()`, or reads a variable or a list the loop changes, and the first value too when it asks before such a bound. A step whose sign shows only as the program runs, like `step s` or `step -n`, has its sign tested as the program runs, as CMIL tests it: `s > 0 ? i <= 10 : i >= 10` in C, `(s > 0 && i <= 10) || (s < 0 && i >= 10)` in Go, and by the loop itself where it counts by a step of either sign, like Lua's `for` or BASIC's `Step`.

C, BASIC, Fortran and COBOL compute some values on lines of their own before the statement they are in, like a text C makes in an array or a list BASIC splits into one. Where CMIL computes such a value more than once, or only sometimes, its lines go where CMIL computes it: the condition of a loop makes its values before the loop and again before each test, an `else if` whose value asks or calls is an `else` with its lines and an `if`, so it asks only when it is reached, and the right side of `and` and `or` that asks or calls comes after the left side in a variable, in an `if`, so it asks only when the left side doesn't decide.

## Types

C++, C#, Java, C, Pascal, Go, Kotlin, Swift, Rust, BASIC, Visual Basic, Fortran and COBOL declare a type for every value, Tcl, whose every value is a text, prints a value by its type, and x86-64 assembly keeps a real number in a register of its own, and CMIL never does, so the conversion works them out from the program ([`src/convert/types.ts`](../src/convert/types.ts)):

- **Numbers:** a number is whole when it is sure to be: whole literals, `+ - * %` of whole numbers, `round(x)`, `floor`, `ceil`, `length_of`, `random`, and the counter of a `for` with a whole start and step. Any other number is real, like the result of `/`.
- **Answers:** an answer is a number where the program uses it as one, in arithmetic, in a comparison with a number or as a count, and where it goes into a variable, a parameter, a function's result or the items of a list that are numbers; two answers added together are numbers too. Otherwise it is a text. Every target reads an answer so, where CMIL reads `21` as a number and `ab` as a text, whatever the program does with them.
- **Lists:** a list has items of one type.
- **Parameters and results:** a function's parameters get the types of its arguments, and its result the type of what it returns.

A variable, a list or a function that gets values of two types, like `x = 1` and later `x = "one"`, or the list `[1, "a"]`, is a problem for C++, C#, Java, C, Pascal, Go, Kotlin, Swift, Rust, BASIC, Visual Basic, Fortran, Tcl, COBOL and x86-64 assembly (`mixedTypes`, `mixedItems`), and so is a list wrapped in itself, like `x = [x]` in a loop, a list of ever more lists (`mixedTypes`). Python, JavaScript, PHP, Ruby and Lua write such a program as it is.

A program that gives an operator, a function, an index, a condition or a statement a value of a type it can't take, like `"abc" * 2`, `add(5, list)`, `uppercase(5)` or a number as a condition, gets from `convert()` the error CMIL stops it with there, `typeError` or `conditionError`, rather than code, at its first such line; so does a list turned into a text (below). Every line is checked as if it ran, also the right side of `and` and `or`, which CMIL computes only when the left side doesn't decide. A value of two types isn't checked.

## Lists and texts

CMIL never prints a list or joins it into a text as it is, and doesn't compare lists, so for a program that does, `convert()` gives the error CMIL stops it with: the `listAsText` or the `typeError` of its first such line, which the types of its values show. No target has code to print or compare lists, and a list's items are put into a text by the program's own `join`. In Python, JavaScript, PHP, Ruby and Lua a variable can have a list and a value of another type; printed while it has the list, it is printed in the language's way, where CMIL stops with `listAsText`.

## Where CMIL stops

Where CMIL stops a program with an error as it runs, like at an index after the end of a list or at a division by 0, the converted program does what its language does there, as a teacher's program would: it stops with an error of its own, or goes on with another value. The table shows each, for a list of two items, a text of two letters, and an `n` of 0 or -1. *Outside* is a read or a write outside the list, which the language leaves undefined; *no build* is for a number written in the program, like `list[0]`, which the compiler finds, where a variable stops or goes on. [`test/convert.ts`](../test/convert.ts) runs these programs in every target and checks the table.

| | `list[0]` | `list[3]` | `list[3] = x` | `text[3]` | `1 / n` | `5 % n` | `square_root(n)` | `remove` of an item it has not | `repeat n times` | `step n` | `to_number("abc")` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CMIL | `indexError` | `indexError` | `indexError` | `indexError` | `divisionByZero` | `divisionByZero` | `mathError` | `itemError` | `typeError` | `typeError` | `typeError` |
| C++ | outside | outside | outside | outside | `inf` | stops | `-nan` | outside | no pass | no pass | stops |
| Python | the last item | stops | stops | stops | stops | stops | stops | stops | no pass | stops | stops |
| C# | stops | stops | stops | stops | `Infinity` | stops | `NaN` | removes none | no pass | no pass | stops |
| Java | stops | stops | stops | stops | stops | stops | stops | removes none | no pass | no pass | stops |
| C | outside | outside | outside | outside | `inf` | stops | `-nan` | removes none | no pass | no pass | `0` |
| JavaScript | `undefined` | `undefined` | adds it | `undefined` | `∞` | `NaN` | `0` | removes the last | no pass | no pass | `0` |
| Pascal | outside | outside | outside | outside | stops | stops | stops | removes none | no pass | no pass | stops |
| Go | no build | stops | stops | stops | `+Inf` | stops | `NaN` | removes none | no pass | no pass | `0` |
| Kotlin | stops | stops | stops | stops | stops | stops | stops | removes none | no pass | no pass | stops |
| Swift | stops | stops | stops | stops | `inf` | stops | `-nan` | removes none | stops | stops | `0` |
| Rust | no build | stops | stops | stops | `inf` | no build | `NaN` | removes none | no pass | no pass | `0` |
| PHP | empty | empty | adds it | empty | stops | stops | `NaN` | removes none | no pass | no pass | `0` |
| Ruby | the last item | empty | adds it | empty | `Inf` | stops | stops | stops | no pass | stops | `0` |
| Lua | `nil` | `nil` | adds it | `nil` | `inf` | stops | `-nan` | removes none | no pass | stops | `nil` |
| BASIC | outside | outside | outside | outside | `inf` | stops | `-nan` | removes none | no pass | forever | `0` |
| Visual Basic | stops | stops | stops | stops | `Infinity` | stops | `NaN` | removes none | no pass | forever | stops |
| Fortran | outside | outside | outside | outside | stops | stops | stops | removes none | no pass | forever | stops |
| Tcl | empty | empty | adds it | empty | `inf` | stops | stops | removes none | no pass | no pass | stops |
| COBOL | no build | outside | outside | outside | `0` | `0` | `0` | removes none | no pass | forever | `0` |
| x86-64 Assembly | outside | outside | outside | outside | `inf` | stops | `-nan` | removes none | no pass | forever | `0` |

Converted programs have none of CMIL's limits on steps, memory and calls in calls ([`running.md`](running.md)): a loop runs until it ends, and calls go as deep as the language's stack lets them.

## C++

C++20, as g++ compiles it.

| CMIL | C++ |
|---|---|
| a whole number, a real number, a text, a boolean, a list | `int`, `double`, `std::string`, `bool`, `std::vector<…>` |
| `print(a + " " + b)`, `print("{a} {b}")` | `std::cout << a << " " << b << '\n';` |
| `name = input()` | `std::string name;` `std::getline(std::cin >> std::ws, name);`, or `std::cin >> age;` for a number |
| `repeat n times` | `for (int i = 0; i < n; i++)` |
| `for i from 1 to 10 step 2` | `for (int i = 1; i <= 10; i += 2)`, with `>=` and `--` for a negative step |
| `for x in list` | `for (int x : list)` |
| `do … while c` | `do { … } while (c);` |
| `list[i]` | `list[i - 1]`: C++ counts from 0 |
| `add(list, x)`, `remove(list, x)`, `x in list` | `push_back`, `erase(std::find(…))`, `std::find(…) != list.end()`, or `std::ranges::count(…) > 0` for a list that is in no variable, like `[1, 2]` |
| `a / b` of whole numbers | `static_cast<double>(a) / b`: in C++ it would be a whole number |
| `function f(a)` | a function before `main`, with a prototype when one written before it calls it; a list is a reference, `const` when the function only reads it, and a copy of its own when the function changes a list that no caller sees again, like `[]` |

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
- An answer is a number or a text by how the program uses it (see **Types**), not by what is typed.
- It prints the opposite of 0, a negative zero, as `-0`, where CMIL prints `0`.
- The counter of a `for` ends one step after its last value.
- `std::toupper` changes only English letters.
- C++ prints the parts of a line while it computes them, so a function that prints, called inside `print()`, prints first.
- A whole number past about two billion overflows an `int`, and a list copied with `b = a` and then given another list is a copy.

## Python

| CMIL | Python |
|---|---|
| `print(a + " " + b)`, `print("{a} {b}")` | `print(f"{a} {b}")`, a real number as `{x:.12g}` |
| `name = input()` | `name = input()`, or `age = float(input())` for a number |
| `repeat n times` | `for _ in range(n):` |
| `for i from 1 to 10 step 2` | `for i in range(1, 11, 2):`; a real start or step counts with `while` |
| `do … while c` | `while True:` … `if not c: break`, with the condition turned around |
| `list[i]` | `list[i - 1]`: Python counts from 0 |
| `round(x)` | `math.floor(x + 0.5)`: Python's `round()` rounds a half to even |

The helper `show()` prints a value of a variable that has values of two types as CMIL does, a real number with up to 12 digits and a boolean in small letters. The helper `round_to()` does `round(x, digits)`.

**Differences from CMIL:**
- Python prints `True` and `False`.
- It compares real numbers exactly.
- It prints very large and very small numbers with an exponent.
- It doesn't round trigonometry.
- An answer is a number or a text by how the program uses it (see **Types**), not by what is typed.
- It prints the opposite of 0, a negative zero, as `-0`, where CMIL prints `0`.
- `%` of a negative number has the sign of the number it divides by, so `-7 % 3` is `2`, where CMIL gives `-1`.

## C#

C# comes in two shapes:
- **Modern** (`csharp`): C# 12, with top-level statements, as `dotnet new console` makes a program: the usings it needs, then the program, with its functions as local functions where the program has them.
- **Classic** (`csharp-classic`): any C# from 7.3, like the C# of .NET Framework and of many school and online compilers: a `class Program`, with the functions of the program as `static` methods first, then the program in `static void Main(string[] args)`.

The table has the modern shape; the classic one writes lists as `new List<int> { 1, 2 }`, an answer as `Console.ReadLine()`, random numbers with `random.Next(1, 7)` of a `static Random random = new Random();`, and splits a text with `Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries)`, which .NET Framework has.

| CMIL | C# |
|---|---|
| a whole number, a real number, a text, a boolean, a list | `int`, `double`, `string`, `bool`, `List<…>` |
| `print(a + " " + b)`, `print("{a} {b}")` | `Console.WriteLine($"{a} {b}");`, a real number as `{x:G12}` |
| `name = input()` | `string name = Console.ReadLine() ?? "";`, or `double age = Convert.ToDouble(Console.ReadLine());` for a number |
| `repeat n times` | `for (int i = 0; i < n; i++)` |
| `for i from 1 to 10 step 2` | `for (int i = 1; i <= 10; i += 2)`, with `>=` and `--` for a negative step |
| `for x in list` | `foreach (int x in list)` |
| `do … while c` | `do { … } while (c);` |
| `list = [1, 2]`, `list[i]` | `List<int> list = [1, 2];`, `list[i - 1]`: C# counts from 0 |
| `add(list, x)`, `remove(list, x)`, `x in list` | `list.Add(x)`, `list.Remove(x)`, `list.Contains(x)` |
| `a / b` of whole numbers | `(double)a / b`: in C# it would be a whole number |
| `round(x)` | `(int)Math.Floor(x + 0.5)`: `Math.Round()` rounds a half to even |
| `random(6)` | `Random.Shared.Next(1, 7)` |
| `function f(a)` | a local function, where the program has it |

What C# can't say in one line comes as a helper at the end, only when the program needs it, each with a comment (in the classic shape, a `static` method after `Main`): `Show()` prints an item of a list of real numbers or booleans as CMIL does, for `join()`, `Letters()` gives the letters of a text, each a text, and `RoundTo()` does `round(x, digits)`.

A program that prints or reads a real number first sets `CultureInfo.InvariantCulture`, so its numbers have a point, like `2.5`, on every computer. Real numbers are printed with `G12`, as CMIL prints them, and booleans in the words of the program's language. A list is shared by the variables it is in, as in CMIL. A modern program builds without the warnings of values that may be null, which `dotnet new console` checks.

**Differences from CMIL**, in both shapes:
- C# compares real numbers exactly.
- It prints very large and very small numbers with an exponent, like `1E+21`.
- It doesn't round trigonometry.
- An answer is a number or a text by how the program uses it (see **Types**), not by what is typed.
- It prints the opposite of 0, a negative zero, as `-0`, where CMIL prints `0`.
- The counter of a `for` ends one step after its last value.
- A `string` counts an emoji as two letters.
- A whole number past about two billion overflows an `int`.

## Java

Java comes in two shapes:
- **Modern** (`java`): a compact source file of Java 25: the functions of the program as methods, then `void main()`, with `IO.println()` and `IO.readln()`; Java imports what it uses itself.
- **Classic** (`java-classic`): any Java from 8, as courses write it: a `public class Main` with the imports it needs, the functions as `static` methods, then `public static void main(String[] args)`, with `System.out.println()` and the answers of a `Scanner`.

| CMIL | Java |
|---|---|
| a whole number, a real number, a text, a boolean, a list | `int`, `double`, `String`, `boolean`, `List<Integer>`: a list holds objects, like an `Integer` for an `int` |
| `print(a + " " + b)`, `print("{a} {b}")` | `IO.println(a + " " + b);`, a real number as `show(x)` |
| `name = input()` | `String name = IO.readln();`, or `double age = Double.parseDouble(IO.readln());` for a number |
| `repeat n times` | `for (int i = 0; i < n; i++)` |
| `for i from 1 to 10 step 2` | `for (int i = 1; i <= 10; i += 2)`, with `>=` and `--` for a negative step |
| `for x in list` | `for (int x : list)` |
| `do … while c` | `do { … } while (c);` |
| `list = [1, 2]`, `list[i]`, `list[i] = x` | `List<Integer> list = new ArrayList<>(List.of(1, 2));`, `list.get(i - 1)`, `list.set(i - 1, x)`: Java counts from 0 |
| `add(list, x)`, `remove(list, x)`, `x in list` | `list.add(x)`, `list.remove(Integer.valueOf(x))`, since `remove(int)` removes the item at a place, `list.contains(x)` |
| `a == b` of texts or lists | `a.equals(b)`: `==` asks whether they are the same object |
| `a / b` of whole numbers | `(double) a / b`: in Java it would be a whole number |
| `round(x)` | `(int) Math.floor(x + 0.5)` |
| `random(6)` | `random.nextInt(1, 7)` of a `Random random = new Random();` |
| `split(text, ",")` | `text.split(",", -1)`: the separator is a pattern, so a mark like `.` is written `"\\."`, and `-1` keeps the empty parts at the end |
| `function f(a)` | a method before `main` |

The classic shape writes lists as `new ArrayList<>(Arrays.asList(1, 2))`, an answer as `input.nextLine()` of a `static Scanner input = new Scanner(System.in);`, and random numbers as `random.nextInt(6) + 1`.

What Java can't say in one line comes as a helper after `main`, only when the program needs it, each with a comment: `show()` prints a real number and a boolean as CMIL does, `words()` and `letters()` give the words and the letters of a text, `join()` joins a list of numbers, and `roundTo()` does `round(x, digits)`. Real numbers are printed with `BigDecimal` to 12 digits and with all their digits, as CMIL prints them, so `1e21` is `1000000000000000000000`. Booleans are printed in the words of the program's language. A list is shared by the variables it is in, as in CMIL.

**Differences from CMIL**, in both shapes:
- Java compares real numbers exactly.
- It doesn't round trigonometry.
- An answer is a number or a text by how the program uses it (see **Types**), not by what is typed.
- The counter of a `for` ends one step after its last value.
- A `String` counts an emoji as two letters.
- A whole number past about two billion overflows an `int`.

## C

C99, as a first course writes it, built with `gcc -std=c99 -pedantic`: a text is an array of 100 `char`, a list an array of 100 items with its count beside it, and `print` is one `printf` with a format.

| CMIL | C |
|---|---|
| a whole number, a real number, a boolean | `int`, `double`, `bool` of `<stdbool.h>` |
| a text | `char name[100]`, given a value by `strcpy()` or `snprintf()`, compared by `strcmp()` |
| a list | `int scores[100] = {7, 9};` and `int scores_count = 2;`: a list of texts is `char words[100][100]` |
| `print("Hi, {name}: " + age)` | `printf("Hi, %s: %d\n", name, age);`, a real number as `%.12g` |
| `name = input()` | `fgets(name, sizeof name, stdin);` and `name[strcspn(name, "\n")] = '\0';`, or `double age = read_number();` |
| `repeat n times` | `for (int i = 0; i < n; i++)` |
| `for x in list` | `for (int i = 0; i < list_count; i++)`, with `int x = list[i];` |
| `add(list, x)`, `list[i]` | `list[list_count++] = x;`, `list[i - 1]` |
| `remove(list, x)`, `x in list` | helpers, like `remove_int()` and `contains_int()` |
| `a / b` of whole numbers | `(double) a / b` |
| `round(x)`, `random(6)` | `(int) floor(x + 0.5)`, `rand() % 6 + 1`, after `srand(time(NULL));` |
| `function f(list)` | `f(int list[], int list_count)`, or `int *list_count` when the function adds to the list or removes from it; a list of numbers given to it, like `f([1, 2])`, is `(int[]){1, 2}` |

What C can't say in one line comes as a helper first, only when the program needs it, each with a comment: printing, joining, finding and removing the items of a list, splitting a text, the letters of a text (a `char` is a byte, and a letter like ա has more than one), `uppercase()` and `lowercase()`, `round_to()`, `read_number()`, and `read_text()` for an answer in a condition. A function that gives a text it makes, like one with values in it, gives it in a `static` array.

What fixed arrays can't hold is a problem for C (`fixedArrays`), at the first line of the program that has it: a list of lists, a function that gives a list, a list given another list (CMIL shares a list, an array would be a copy), a function that gives a list or a text parameter another value, a loop that changes the list it goes over, and a list in no variable, like `[1, 2]`, that `remove` or a function changes.

**Differences from CMIL:**
- A text has up to 99 bytes, and a list up to 100 items.
- C compares real numbers exactly.
- It prints very large and very small numbers with an exponent, like `1e+21`.
- It doesn't round trigonometry.
- An answer is a number or a text by how the program uses it (see **Types**), not by what is typed.
- It prints the opposite of 0, a negative zero, as `-0`, where CMIL prints `0`.
- The counter of a `for` ends one step after its last value.
- `toupper()` changes only English letters.
- C computes the values of a `printf` in any order, and a text a function makes is in one `static` array, which its next call replaces.
- A whole number past about two billion overflows an `int`.

## JavaScript

A script for the browser, as JavaScript courses start: `console.log()` prints and `prompt()` asks, and the functions of the program are where the program has them.

| CMIL | JavaScript |
|---|---|
| `print(a + " " + b)`, `print("{a} {b}")` | `` console.log(`${a} ${b}`); `` a template literal, with a real number as `${show(x)}` |
| `name = input()` | `const name = prompt();`, or `const age = Number(prompt());` for a number |
| a variable | `const` when the program gives it one value, `let` when more |
| `repeat n times` | `for (let i = 0; i < n; i++)` |
| `for x in list` | `for (const x of list)`, of `[...list]` when the loop changes the list |
| `list[i]`, `add(list, x)`, `remove(list, x)`, `x in list` | `list[i - 1]`, `list.push(x)`, `list.splice(list.indexOf(x), 1)`, `list.includes(x)` |
| `a == b`, `a != b` | `a === b`, `a !== b`, which, like CMIL, never find values of two types equal |
| `random(6)` | `Math.floor(Math.random() * 6) + 1` |
| `split(text)`, `split(text, "")` | `text.split(/\s+/).filter(Boolean)`, `[...text]` |

CMIL's numbers are JavaScript's, so `round()` is `Math.round()`, and the helper `show()` prints a real number as CMIL does: with up to 12 digits and all of them, like `0.3` and `1000000000000000000000`. `roundTo()` does `round(x, digits)`. Booleans are printed in the words of the program's language. A list is shared by the variables it is in, as in CMIL.

**Differences from CMIL:**
- JavaScript compares real numbers exactly.
- It doesn't round trigonometry.
- An answer is a number or a text by how the program uses it (see **Types**), not by what is typed.
- The counter of a `for` ends one step after its last value.
- A string counts an emoji as two letters.

## Pascal

Free Pascal, `{$mode objfpc}{$H+}` as Lazarus writes it: `program Main;`, the units it uses, the types of its lists, its functions, then the `var` of the program and its `begin … end.`. Every variable is in the `var` of its program or function, with its type.

| CMIL | Pascal |
|---|---|
| a whole number, a real number, a text, a boolean | `Integer`, `Double`, `string`, `Boolean` |
| a list | a dynamic array of a type of its own, like `TIntegerArray = array of Integer;`, given items with `[7, 9]`; a list of texts is the `TStringArray` of `SysUtils` |
| `print("Hi, {name}: " + age)` | `writeln('Hi, ', name, ': ', age);`, a real number as `show(x)` |
| `name = input()` | `readln(name);` |
| `x = 1`, `x == 1`, `x != 1` | `x := 1;`, `x = 1`, `x <> 1` |
| `repeat n times` | `for i := 1 to n do` |
| `for i from 1 to 10`, with `step -1` | `for i := 1 to 10 do`, `downto`; another step, or a real number, counts with `while` |
| `do … while c` | `repeat … until`, with the condition turned around |
| `for x in list` | `for x in list do`, of `Copy(list)` when the loop changes the list |
| `add(list, x)`, `list[i]` | `SetLength(list, Length(list) + 1);` and `list[High(list)] := x;`, `list[i - 1]` |
| `a % b`, `round(x)` | `a mod b`, `Floor(x + 0.5)`: `Round()` rounds a half to even |
| `random(6)` | `Random(6) + 1`, after `Randomize;` |
| `function f(list)` | `function f(const list: TIntegerArray): Integer;`, a `var` list when it adds to the list or removes from it and a caller sees the change, a list of its own when no caller does, like for `f([])`, a `procedure` when it gives no value, which `Exit(value)` gives |

What Pascal can't say in one line comes as a helper first, each with a comment: `show()` for a real number and a boolean as CMIL prints them, the letters of a text (a `Char` is a byte, and a letter like ա has more than one), `join()`, `contains()`, `removeItem()`, `roundTo()`, and `readText` and `readNumber` for an answer inside an expression. A program that writes a real number has `{$minfpconstprec 64}`, without which Free Pascal keeps a number like `0.5` as a `Single`. Booleans are printed in the words of the program's language.

**Differences from CMIL:**
- Pascal prints very large and very small numbers with an exponent, like `1E21`.
- It doesn't round trigonometry.
- An answer is a number or a text by how the program uses it (see **Types**), not by what is typed.
- `UpperCase()` changes only English letters.
- `writeln` prints each of its values as soon as it computes it, so a function that prints, called in it, prints in the middle of the line.
- `SetLength()` copies an array that two variables share, so a list given to another variable and then added to is a copy.
- A whole number past about two billion overflows an `Integer`.

## Go

Go from 1.22, as `gofmt` lays it out: `package main`, the packages it imports, the functions of the program, `func main()`, then the helpers it needs.

| CMIL | Go |
|---|---|
| a whole number, a real number, a text, a boolean, a list | `int`, `float64`, `string`, `bool`, a slice like `[]int` |
| `x = 1` | `x := 1`; `var x float64 = 1` for a real number given a whole one, which `:=` would make an `int` |
| `print(a + " " + b)`, `print("{a} {b}")` | `fmt.Println(a + " " + b)` of texts, else `fmt.Printf("%s %d\n", a, b)` with a format, a real number as `%.12g` |
| `name = input()` | `name := readText()`, or `age := readNumber()` for a number |
| `while c`, `repeat n times` | `for c`, `for range n` |
| `for i from 1 to 10 step 2` | `for i := 1; i <= 10; i += 2`, with `>=` and `--` for a negative step |
| `for x in list` | `for _, x := range list`, of `slices.Clone(list)` when the loop changes the list |
| `do … while c` | `for { … }`, ending with `if !c { break }`, the condition turned around |
| `list[i]`, `add(list, x)`, `remove(list, x)`, `x in list` | `list[i-1]`, `list = append(list, x)`, `slices.Index()` and `slices.Delete()`, `slices.Contains(list, x)` |
| a whole number with a real one, like `a / b` | `float64(a) / float64(b)`: Go computes with two numbers of one type, and `7 / 2` would be a whole number |
| `round(x)`, `random(6)` | `int(math.Floor(x + 0.5))`, `rand.Intn(6) + 1` |
| `function f(list)` | `func f(list []int) int`, with a pointer, `*[]int`, when the function changes the list, so that `append()` changes the caller's |

What Go can't say in one line comes as a helper after `main`, only when the program needs it, each with a comment: `readText()` and `readNumber()` for the answers, `toNumber()`, `show()` prints an item of a list as CMIL does, for `join()`, `inWords()` a boolean in the words of the program's language, `join()` joins a list of numbers, and `roundTo()` does `round(x, digits)`. A letter of a text is an item of its `[]rune`, since a `string` has bytes. Go doesn't build a program with a variable it never reads, so such a variable gets `_ = x`.

**Differences from CMIL:**
- Go compares real numbers exactly, so `a + b == 0.3` is `false` when `a` is 0.1 and `b` is 0.2; the numbers written in the program it computes exactly first, so `0.1 + 0.2 == 0.3` is `true`.
- It prints very large and very small numbers with an exponent, like `1e+21`.
- It doesn't round trigonometry.
- An answer is a number or a text by how the program uses it (see **Types**), not by what is typed.
- It prints the opposite of 0, a negative zero, as `-0`, where CMIL prints `0`.
- The counter of a `for` ends one step after its last value.
- `append()` may give a slice a new array, so a list given to another variable and then added to may be a copy.
- Go may read an item of a list after it calls a function in the same expression, so `list[1] + change(list)` may see what the function changed.

## Kotlin

Kotlin for the JVM: the imports it needs, the functions of the program, `fun main()`, then the helpers it needs.

| CMIL | Kotlin |
|---|---|
| a whole number, a real number, a text, a boolean, a list | `Int`, `Double`, `String`, `Boolean`, `MutableList<…>` |
| `x = 1` | `val x = 1`, or `var x = 1` when the program gives it another value; `1.0` for a real number given a whole one |
| `print(a + " " + b)`, `print("{a} {b}")` | `println("$a $b")`, a string template, with `${…}` for a value that isn't a variable, and a real number as `${show(x)}` |
| `name = input()` | `val name = readln()`, or `readln().toDouble()` for a number |
| `repeat n times` | `repeat(n) { … }`, or `for (i in 1..n)` for a block with a `break` or a `continue`, which the block of `repeat()` can't have |
| `for i from 1 to 10 step 2` | `for (i in 1..10 step 2)`, with `downTo` for a negative step; a real number, or a step whose sign shows only as the program runs, counts with `while` |
| `for x in list`, `for letter in text` | `for (x in list)`, of `list.toList()` when the loop changes the list; `for (letter in text.chunked(1))` |
| `do … while c` | `do { … } while (c)` |
| `list[i]`, `add(list, x)`, `remove(list, x)`, `x in list` | `list[i - 1]`, `list.add(x)`, `list.remove(x)`, `x in list` |
| `a / b` of whole numbers, `a == b` of a whole and a real number | `a.toDouble() / b`, `a.toDouble() == b`: Kotlin divides two whole numbers as whole numbers, and compares two numbers of one type |
| `round(x)`, `random(6)` | `x.roundToInt()`, `(1..6).random()` |
| `split(text)`, `join(list, ", ")` | `text.split(Regex("\\s+")).filter { it.isNotEmpty() }.toMutableList()`, `list.joinToString(", ")` |
| `function f(a)` | `fun f(a: Int): Int` before `main`; a parameter the function gives another value is a `var a = a` of its own |

Kotlin's math, like `sqrt()` and `PI`, is imported from `kotlin.math`. The helper `show()` prints a real number and a boolean as CMIL does, with up to 12 digits by `BigDecimal` and with all of them, so `1e21` is `1000000000000000000000`, and `roundTo()` does `round(x, digits)`. Booleans are printed in the words of the program's language. A list is shared by the variables it is in, and a `for` leaves its counter at its last value, as in CMIL.

**Differences from CMIL:**
- Kotlin compares real numbers exactly.
- It doesn't round trigonometry.
- An answer is a number or a text by how the program uses it (see **Types**), not by what is typed.
- A `String` counts an emoji as two letters.
- A whole number past about two billion overflows an `Int`.

## Swift

Swift as a script, a `main.swift` that `swiftc` builds: `import Foundation` when the program needs it, the functions of the program, then the program, and the helpers it needs.

| CMIL | Swift |
|---|---|
| a whole number, a real number, a text, a boolean, a list | `Int`, `Double`, `String`, `Bool`, an array like `[Int]` |
| `x = 1` | `let x = 1`, or `var x = 1` when the program gives it another value, or changes the list; `1.0` for a real number given a whole one |
| `print(a + " " + b)`, `print("{a} {b}")` | `print("\(a) \(b)")`, with a real number as `\(show(x))` |
| `name = input()` | `let name = readLine() ?? ""`, or `Double(readLine() ?? "") ?? 0` for a number |
| `repeat n times` | `for _ in 1...3` for a count written in the program, else `for _ in 0..<n` |
| `for i from 1 to 10 step 2` | `for i in stride(from: 1, through: 10, by: 2)`; `for i in 1...10` for numbers written in the program that count up by 1, since a range like `1...0` would stop the program |
| `for x in list`, `for letter in text` | `for x in list`, `for letter in text.map(String.init)`, with `_` for a variable the program has nowhere else |
| `do … while c` | `repeat { … } while c` |
| `list[i]`, `add(list, x)`, `remove(list, x)`, `x in list` | `list[i - 1]`, `list.append(x)`, `list.remove(at: index)` of `list.firstIndex(of: x)`, `list.contains(x)` |
| a whole number with a real one, like `a / b` | `Double(a) / Double(b)`: Swift computes with two numbers of one type, and `7 / 2` would be a whole number |
| `a % b` of real numbers | `a.truncatingRemainder(dividingBy: b)` |
| `round(x)`, `random(6)` | `Int(floor(x + 0.5))`, since `rounded()` rounds a half away from zero; `Int.random(in: 1...6)` |
| `function f(list)` | `func f(_ list: inout [Int])` when the function changes the list, called as `f(&scores)`, since an array is a value; a parameter the function gives another value, or a list it changes that no caller sees again, like for `f([])`, is a `var n = n` of its own |

What Swift can't say in one line comes as a helper after the program, each with a comment: `show()` prints a real number with up to 12 digits as CMIL does, and `toNumber()` and `roundTo()`. Swift prints whole numbers and texts as CMIL does, and booleans in English; in another language they are printed in its words. A `String` counts letters as CMIL does, an emoji as one.

**Differences from CMIL:**
- Swift compares real numbers exactly.
- It prints very large and very small numbers with an exponent, like `1e+21`.
- It doesn't round trigonometry.
- An answer is a number or a text by how the program uses it (see **Types**), not by what is typed.
- It prints the opposite of 0, a negative zero, as `-0`, where CMIL prints `0`.
- An array is a value, so `b = a` copies a list.

## Rust

Rust of the edition 2021, which `rustc` builds alone, without a project of Cargo: the `use` lines it needs, the functions of the program, `fn main()`, then the helpers it needs.

| CMIL | Rust |
|---|---|
| a whole number, a real number, a text, a boolean, a list | `i64`, `f64`, `String`, `bool`, `Vec<…>` |
| `x = 1` | `let x = 1;`, or `let mut x = 1;` when the program gives it another value or changes the list; `let x: i64 = 1;` for numbers written in the program, which Rust would make an `i32` |
| `print(a + " " + b)`, `print("{a} {b}")` | `println!("{a} {b}");`, with any other value after the format, like `println!("Total: {}", total(&scores));`, a list as `{scores:?}` and a real number as `{}` of `x.show()` |
| `name = input()` | `let name = read_text();`, or `read_number()` for a number |
| `repeat n times` | `for _ in 0..n` |
| `for i from 1 to 10 step 2` | `for i in (1..=10).step_by(2)`, and `(1..=10).rev()` for a negative step; a real number, or a step whose sign shows only as the program runs, counts with `while` |
| `for x in list`, `for letter in text` | `for &x in &list` for numbers and booleans, `for x in list.clone()` for others, and when the loop changes the list; `for letter in text.chars().map(String::from)` |
| `do … while c` | `loop { … if !c { break; } }`, with the condition turned around |
| `list[i]`, `add(list, x)`, `remove(list, x)`, `x in list` | `list[(i - 1) as usize]`: an index is a `usize`; `list.push(x)`, `list.remove(index)` of `list.iter().position(…)`, `list.contains(&x)` |
| a text or a list kept by the program, like `b = a` or `add(list, word)` | `let b = a.clone();`, `list.push(word.clone());`: Rust moves a `String` or a `Vec` it gives, and a text in quotes is a `String` by `"a".to_string()` |
| a whole number with a real one, like `a / b` | `a as f64 / b as f64`, and a number written in the program as `2.0`: Rust computes with two numbers of one type |
| `round(x)`, `square_root(x)` | `f64::floor(x + 0.5) as i64`, since `round()` rounds a half away from zero; `f64::sqrt(x)`, the functions of `f64`, which a number written in the program needs |
| `function f(list, name)` | `fn f(list: &Vec<i64>, name: &str)`: a function borrows a list and a text, `&mut Vec<i64>` when it changes the list, called as `f(&mut scores, &name)` |

What Rust can't say in one line comes as a helper after `main`, each with a comment: `read_text()` and `read_number()` for the answers; `random()`, since Rust's library has no random numbers (a project would use the crate `rand`); `round_to()`; and the trait `Show`, whose `show()` prints a real number with up to 12 digits and with all of them, and a boolean in the words of the program's language. Rust prints a whole number, a text and a boolean in English as CMIL does. The helpers are laid out as `rustfmt` lays them out. Rust warns of a name with capital letters, like `X`, which the conversion keeps as the program writes it.

**Differences from CMIL:**
- Rust compares real numbers exactly.
- It doesn't round trigonometry.
- An answer is a number or a text by how the program uses it (see **Types**), not by what is typed.
- A `Vec` has one owner, so `b = a.clone()` copies a list.

## PHP

PHP from 8.1, a script for the command line, as PSR-12 lays it out: `<?php`, the functions of the program, then the program, and the helpers it needs. Its functions declare the types of PHP the program has, like `int` and `array`. Its texts with values in them need the extension `mbstring` of PHP, which counts and changes their letters.

| CMIL | PHP |
|---|---|
| `x = 1` | `$x = 1;` |
| `print(a + " " + b)`, `print("{a} {b}")` | `echo "$a $b\n";`: a variable is in the text, in braces when a letter follows it, like `"{$name}s"`, and any other value is joined with `.`, like `echo "Total: " . total($scores) . "\n";` |
| `name = input()` | `$name = rtrim(fgets(STDIN), "\r\n");`, or `(float) fgets(STDIN)` for a number |
| `repeat n times`, `for i from 1 to 10 step 2` | `for ($i = 0; $i < $n; $i++)`, `for ($i = 1; $i <= 10; $i += 2)` |
| `for x in list`, `for letter in text` | `foreach ($list as $x)`, which goes over the items the list had when the loop started, as in CMIL; `foreach (mb_str_split($text) as $letter)` |
| `if … else if … else`, `do … while c` | `if (…) { } elseif (…) { } else { }`, `do { } while (c);` |
| `list[i]`, `add(list, x)`, `remove(list, x)`, `x in list` | `$list[$i - 1]`, `$list[] = $x;`, `array_splice()` of `array_search()`, `in_array($x, $list, true)` |
| `a == b` | `$a == $b` of numbers, and `$a === $b` of others, since `==` finds `"1e3"` equal to `"1000"`; texts are put in order by `strcmp()` |
| `length_of(text)`, `uppercase(text)` | `mb_strlen($text)`, `mb_strtoupper($text)`, which count and change letters, where `strlen()` counts bytes |
| `a % b` of real numbers, `round(x)`, `random(6)` | `fmod($a, $b)`; `(int) floor($x + 0.5)`, since `round()` rounds a half away from zero; `rand(1, 6)` |
| `function f(list)` | `function f(array &$list): void` when the function changes the list and a caller sees it, since an array is a value |

The helper `show()` prints a real number with up to 12 digits and a boolean in the words of the program's language; `echo` would print `true` as `1`. `roundTo()` does `round(x, digits)`. A function of the program named like one of PHP's, like `count`, gets a `_`, since PHP has one name for a function, whatever its case.

**Differences from CMIL:**
- PHP compares real numbers exactly.
- It prints very large and very small numbers with an exponent, like `1.0e+21`.
- It doesn't round trigonometry.
- An answer is a number or a text by how the program uses it (see **Types**), not by what is typed.
- It prints the opposite of 0, a negative zero, as `-0`, where CMIL prints `0`.
- The counter of a `for` ends one step after its last value.
- An array is a value, so `$b = $a` copies a list, and a list added to itself is a copy.

## Ruby

Ruby from 3.0, as RuboCop lays it out, with two spaces: the helpers a program needs first, since Ruby runs a program from its top, then the functions of the program, then the program.

| CMIL | Ruby |
|---|---|
| `x = 1`, `X = 1` | `x = 1`: a name starts with a small letter, since a name with a capital first, like `X`, is a constant |
| `print(a + " " + b)`, `print("{a} {b}")` | `puts "#{a} #{b}"`, with a real number as `#{show(x)}`; a list of whole numbers as `p scores` |
| `name = input()` | `name = gets.chomp`, or `gets.to_f` for a number |
| `repeat n times` | `n.times do … end` |
| `for i from 1 to 10`, `step 2`, `step -1` | `(1..10).each do \|i\|`, `1.step(10, 2) do \|i\|`, `10.downto(1) do \|i\|` |
| `for x in list`, `for letter in text` | `list.each do \|x\|`, of `list.dup` when the loop changes the list; `text.chars.each do \|letter\|` |
| a loop that makes a variable the program has after it, or whose variable the program has after it | `for _ in 1..n`, `for i in 1..10`, `for x in list`: the block of `times` or `each` keeps a variable it makes to itself, and a `for` doesn't |
| `if … else if … else`, `do … while c` | `if … elsif … else … end`, `begin … end while c` |
| `list[i]`, `add(list, x)`, `remove(list, x)`, `x in list` | `list[i - 1]`, `list << x`, `list.delete_at(list.index(x))`, `list.include?(x)` |
| `a / b` of whole numbers, `power(2, -1)` | `a.fdiv(b)`, `2.0**-1`: Ruby divides whole numbers as whole numbers, and makes `2**-1` the fraction `1/2` |
| `round(x)`, `random(6)` | `(x + 0.5).floor`, since `round` rounds a half away from zero; `rand(1..6)` |
| `split(text, ",")` | `text.split(",", -1)`, which keeps the empty parts at the end, which `split(",")` drops |
| `continue` | `next` |

The helper `show()` prints a real number with up to 12 digits and a boolean in the words of the program's language; `round_to()` does `round(x, digits)`. A list is shared by the variables it is in, and a `for` leaves its counter at its last value, as in CMIL.

**Differences from CMIL:**
- Ruby compares real numbers exactly.
- It prints very large and very small numbers with an exponent, like `1e+21`.
- It doesn't round trigonometry.
- An answer is a number or a text by how the program uses it (see **Types**), not by what is typed.
- It prints the opposite of 0, a negative zero, as `-0`, where CMIL prints `0`.
- `%` of a negative number has the sign of the number it divides by, so `-7 % 3` is `2`, where CMIL gives `-1`.

## Lua

Lua 5.4, with two spaces: the helpers a program needs first, then the functions of the program, then the program. Its names have only Latin letters, as Pascal's do, so a name of another alphabet is written in them, like անուն as `anun`.

| CMIL | Lua |
|---|---|
| `x = 1` | `local x = 1`, where the program first gives it a value; `local x` before the block that does, when the program has it after the block, since a local belongs to its block |
| `print(a + " " + b)`, `print("{a} {b}")` | `print(a .. " " .. b)`, with a real number as `show(x)`, which Lua would print like `3.0` |
| `name = input()` | `local name = io.read()`, or `tonumber(io.read())` for a number |
| `repeat n times`, `for i from 1 to 10 step 2` | `for _ = 1, n do`, `for i = 1, 10, 2 do` |
| `for x in list`, `for letter in text` | `for _, x in ipairs(list) do`, of a copy, `{table.unpack(list)}`, when the loop changes the list; `for letter in string.gmatch(text, utf8.charpattern) do` |
| `if … else if … else`, `do … while c` | `if … then … elseif … then … else … end`, `repeat … until`, with the condition turned around |
| `list[i]`, `add(list, x)`, `remove(list, x)`, `x in list` | `list[i]`: a table counts from 1, as CMIL does; `table.insert(list, x)`, and the helpers `remove_item()` and `contains()` |
| `a != b`, `a and not b` | `a ~= b`, `a and not b`, with a comparison after not in brackets, `not (a == b)`, since not binds more tightly |
| `length_of(text)` | `utf8.len(text)`, which counts letters, where `#text` counts bytes |
| `continue` | `goto continue`, to a label at the end of the block of the loop, `::continue::` |
| `round(x)`, `random(6)` | `math.floor(x + 0.5)`, `math.random(1, 6)` |

What Lua can't say in one line comes as a helper, each with a comment: `show()` prints a real number with up to 12 digits and a boolean in the words of the program's language; `letters()`, `split()`, `join()`, `contains()`, `remove_item()` and `round_to()`. A list is shared by the variables it is in, as in CMIL.

**Differences from CMIL:**
- Lua compares real numbers exactly.
- It prints very large and very small numbers with an exponent, like `1e+21`.
- It doesn't round trigonometry.
- An answer is a number or a text by how the program uses it (see **Types**), not by what is typed.
- It prints the opposite of 0, a negative zero, as `-0`, where CMIL prints `0`.
- `string.upper()` and `string.lower()` change only English letters.
- `%` of a negative number has the sign of the number it divides by, so `-7 % 3` is `2`, where CMIL gives `-1`.

## BASIC

The BASIC of QBasic's heritage, in FreeBASIC, which builds it on Linux: the helpers a program needs first, the functions of the program, then the program. Its names have only Latin letters, as Pascal's do, whatever their case, and a name that is a word of FreeBASIC, like `name`, gets a `_`.

| CMIL | BASIC |
|---|---|
| a whole number, a real number, a text, a boolean, a list | `Integer`, `Double`, `String`, `Boolean`, an array, like `scores()` |
| `x = 1` | `Dim As Integer x = 1`, and `x = 2` after it |
| `print(a + " " + b)`, `print("{a} {b}")` | `Print a & " " & b`, a whole number by itself as `Str(x)`, since `Print x` writes a space before it, a real number as `Show(x)` and a boolean as `IIf(b, "true", "false")` |
| `name = input()` | `Line Input #1, name_`, or `Input #1, age` for a number, of `Open Cons For Input As #1`, the console of the program, which a pipe gives answers to too |
| `repeat n times`, `for i from 1 to 10 step 2` | `For i As Integer = 1 To n … Next`, `For i As Integer = 1 To 10 Step 2 … Next` |
| `for x in list`, `for letter in text` | `For i As Integer = 0 To UBound(list)`, with `Dim As Integer x = list(i)`; `LetterOf(text, i)` of the letters of a text |
| `while c`, `do … while c` | `Do While c … Loop`, `Do … Loop While c` |
| `if … else if … else` | `If … Then … ElseIf … Then … Else … End If` |
| `a == b`, `a != b`, `and`, `or`, `a % b` | `a = b`, `a <> b`, `AndAlso`, `OrElse`, `a Mod b` |
| `list = [7, 9]`, `list[i]`, `add(list, x)` | `Dim As Integer list(1) = {7, 9}`, or `ReDim As Integer list(1)` and an item a line for a list that grows; `list(i - 1)`: an array counts from 0; `ReDim Preserve list(UBound(list) + 1)` and `list(UBound(list)) = x` |
| `break`, `continue` | `Exit For`, `Continue For`, or `Exit Do` and `Continue Do`, as the loop around them is |
| `round(x)`, `ceil(x)`, `random(6)` | `Int(x + 0.5)`, `-Int(-x)`, `Int(Rnd * 6) + 1`, after `Randomize` |
| `function f(list, name)` | `Function f(list() As Integer, ByVal name_ As String) As Integer`, or a `Sub` when it gives no value; a function called by one before it is declared first, `Declare Function` |

What BASIC can't say in one line comes as a helper first, each with a comment: `Show()`, which prints a real number with up to 12 digits by `sprintf()` of C; `LetterCount()` and `LetterOf()`, since a text has bytes and a letter like ա more than one; `SplitWords()` and `SplitAt()`, which put the parts of a text into an array; `Join()`, `Contains()`, `RemoveItem()`, `RoundTo()` and `ReadText()` for an answer inside an expression. The helpers of lists are overloaded for each type of list the program has.

What arrays can't hold is a problem for BASIC, as for C (`fixedArrays`): a list of lists, a function that gives a list, a list given another list, which would be a copy, a function that gives a list parameter another list, a loop that changes the list it goes over, and `add` or an item set in a list in no variable.

**Differences from CMIL:**
- FreeBASIC compares real numbers exactly.
- It prints very large and very small numbers with an exponent, like `1e+21`.
- It doesn't round trigonometry.
- An answer is a number or a text by how the program uses it (see **Types**), not by what is typed.
- It prints the opposite of 0, a negative zero, as `-0`, where CMIL prints `0`.
- The counter of a `For` ends one step after its last value.
- `UCase()` and `LCase()` change only English letters.
- FreeBASIC computes the values joined with `&` and the operands of an operator from right to left, so two answers in one line are asked from the last one, and a function that changes a list, called in an expression, changes an item read before it.

## Visual Basic

Visual Basic .NET, as `dotnet new console -lang VB` makes a program: `Option Strict On`, which checks types as C# does, the `Imports` it needs, then a `Module Program` with the functions of the program and `Sub Main()`, and the helpers it needs last. It runs on .NET as C# does, so it writes what C# writes in its own words: numbers are `Integer` or `Double`, texts `String`, lists `List(Of …)`, which are shared by the variables they are in, as in CMIL. A name of Visual Basic is whatever its case, so a name that is one of its words or would hide a name the conversion uses, like `math`, which would hide `Math`, gets a `_`; `list` doesn't, since a name of the program never hides a type where Visual Basic expects one.

| CMIL | Visual Basic |
|---|---|
| a whole number, a real number, a text, a boolean, a list | `Integer`, `Double`, `String`, `Boolean`, `List(Of …)` |
| `x = 1` | `Dim x As Integer = 1`, and `x = 2` after it |
| `print(a + " " + b)`, `print("{a} {b}")` | `Console.WriteLine($"{a} {b}")`, a real number as `{x:G12}` |
| `name = input()` | `Dim name As String = Console.ReadLine()`, or `Dim age As Double = Convert.ToDouble(Console.ReadLine())` for a number |
| `repeat n times`, `for i from 1 to 10 step 2` | `For i As Integer = 1 To n … Next`, `For i As Integer = 1 To 10 Step 2 … Next` |
| `for x in list` | `For Each x As Integer In list … Next` |
| `while c`, `do … while c` | `Do While c … Loop`, `Do … Loop While c` |
| `if … else if … else` | `If … Then … ElseIf … Then … Else … End If` |
| `a == b`, `a != b`, `and`, `or`, `not`, `a % b` | `a = b`, `a <> b`, `AndAlso`, `OrElse`, `Not`, `a Mod b` |
| `list = [1, 2]`, `list[i]` | `Dim list As New List(Of Integer) From {1, 2}`, `list(i - 1)`: a list counts from 0 |
| `add(list, x)`, `remove(list, x)`, `x in list` | `list.Add(x)`, `list.Remove(x)`, `list.Contains(x)` |
| `break`, `continue` | `Exit For`, `Continue For`, or `Exit Do` and `Continue Do`, as the loop around them is |
| `round(x)`, `random(6)` | `CInt(Math.Floor(x + 0.5))`, `Random.Shared.Next(1, 7)` |
| `function f(list, name)` | `Function f(list As List(Of Integer), name As String) As Integer`, or a `Sub` when it gives no value |

`Not` binds more loosely than a comparison and `Mod` more loosely than `*` and `/`, so `(a Mod b) * c` has brackets that `a % b * c` doesn't. A text with a new line or a tab is an interpolated string, like `$"one{vbLf}two"`, since a text of Visual Basic has no escapes. As in C#, a program that prints or reads a real number first sets `CultureInfo.InvariantCulture`, real numbers are printed with `G12`, booleans in the words of the program's language, and the helpers `Show()`, `Letters()` and `RoundTo()` come when the program needs them.

**Differences from CMIL**, those of C#:
- Visual Basic compares real numbers exactly.
- It prints very large and very small numbers with an exponent, like `1E+21`.
- It doesn't round trigonometry.
- An answer is a number or a text by how the program uses it (see **Types**), not by what is typed.
- It prints the opposite of 0, a negative zero, as `-0`, where CMIL prints `0`.
- The counter of a `For` ends one step after its last value.
- A `String` counts an emoji as two letters.
- A whole number past about two billion stops the program with an `OverflowException`.

## Fortran

Modern Fortran, from Fortran 2008, as gfortran builds it: a `program main` under `implicit none` that declares every variable first, as Fortran does, then its statements, and after its `contains` the functions of the program and the helpers it needs, each with a comment. Names have only Latin letters, as Pascal's do, whatever their case, and start with a letter, so `_x` is `v_x`. Fortran reserves none of its words, so a name gets a `_` when it would hide a function of its library the conversion uses, like `size`, or a helper, or when it is a word of its statements, like `do`.

| CMIL | Fortran |
|---|---|
| a whole number, a real number, a text, a boolean | `integer`, `real(dp)` of `iso_fortran_env`, `character(len=:), allocatable`, `logical` |
| a list | an allocatable array, like `integer, allocatable :: scores(:)`; a list of texts is an array of the type `string`, whose texts each have their own length |
| `print(a + " " + b)`, `print(n)` | `print '(a)', a // " " // b`, with `str()` for a value that isn't a text, or `print '(i0)', n` for a whole number |
| `name = input()` | `name = read_text()`, or `read (*, *) age` for a number |
| `repeat n times`, `for i from 1 to 10 step 2` | `do i = 1, n`, `do i = 1, 10, 2`; a real counter goes in a `do while`, after which its step comes |
| `for x in list` | `do i = 1, size(list)` with `x = list(i)` |
| `while c`, `do … while c` | `do while (c)`, `do … if (.not. c) exit … end do`, which a `continue` tests first |
| `a == b`, `a != b`, `and`, `or`, `not`, `a % b` | `a == b`, `a /= b`, `.and.`, `.or.`, `.not.`, `mod(a, b)`; booleans are equal by `.eqv.`; a right side of `.and.` or `.or.` that asks or calls, which Fortran may compute anyway, comes after the left side in a variable, in an `if` |
| `list = [7, 9]`, `list[i]`, `add(list, x)` | `list = [7, 9]`, `list(i)`: an array counts from 1, as CMIL does, `list = [list, x]` |
| `a / b` of whole numbers | `real(a, dp) / b`: in Fortran it would be a whole number |
| `break`, `continue` | `exit`, `cycle` |
| `function f(list, name)` | `function f(list, name) result(answer)`, or a `subroutine` when it gives no value, called by `call`; a list it changes is `allocatable, intent(inout)`, so it grows as CMIL's does |

A real number has the kind `dp`, so `0.5` is `0.5_dp`, and a whole number divided by a whole number is made real first. `str()` prints a real number as CMIL does, with all its digits and up to 12 that count, never with an exponent, and a boolean in the words of the program's language; the other helpers are `read_text()`, which reads an answer of any length, `letter_count()`, `letter_of()` and `letters()`, since a text has bytes and a letter like ա more than one, `split_words()`, `split_at()`, `join()`, `remove_item()`, `has()` for a list of texts, `upper()`, `lower()`, `to_number()`, `round_to()` and `random_between()`.

Fortran stops a program that prints or reads while it prints, so a value that does, like `ask("Name?")`, is computed in a variable first and printed after. A line of Fortran has at most 132 bytes, so a longer one goes on in the next after an `&`, cut at a space, also in a text.

What arrays can't hold is a problem for Fortran, as for C (`fixedArrays`): a list of lists, a list given another list, which would be a copy, and a function that gives a list parameter another list; a function that gives a list is one Fortran writes.

**Differences from CMIL:**
- Fortran compares real numbers exactly.
- It doesn't round trigonometry.
- An answer is a number or a text by how the program uses it (see **Types**), not by what is typed.
- The counter of a `do` ends one step after its last value.
- `upper()` and `lower()` change only English letters.
- A whole number past about two billion isn't an `integer`.
- A text with spaces at its end is equal to one without them, as Fortran compares texts.

## Tcl

Tcl 8.6, as `tclsh` runs it: the helpers a program needs first, then its procs, which Tcl needs before it runs them, then the program. Every value of Tcl is a text, so the conversion prints a value by the type the program gives it, as a typed language would: a whole number and a text as they are, and a real number and a boolean by the helper `show`, with the type it is, like `show $x number`. A variable that has values of two types is a problem for Tcl, as for the typed languages (`mixedTypes`). Names have only Latin letters, which `$name` reads, as Pascal's do; a function can't have the name of a command of Tcl, like `list`, which it would replace, but a variable can.

| CMIL | Tcl |
|---|---|
| `x = 1`, `x = x + 1` | `set x 1`, `incr x`; arithmetic is in `expr`, like `set y [expr {$x * 2}]` |
| `print("Hi, {name}! {total(scores)}")` | `puts "Hi, $name! [total $scores]"`, a real number as `[show $x number]` |
| `name = input()` | `set name [gets stdin]`, a number too, since a text of a number is that number |
| `repeat n times`, `for i from 1 to 10 step 2` | `for {set i 0} {$i < $n} {incr i}`, `for {set i 1} {$i <= 10} {incr i 2}` |
| `for x in list`, `for letter in text` | `foreach x $list`, `foreach letter [split $text ""]` |
| `while c`, `do … while c` | `while {c}`, `while 1 { … if {!c} break }`, which a `continue` tests first |
| `if … else if … else` | `if {c} { … } elseif {c} { … } else { … }` |
| `a == b`, `a != b`, `and`, `or`, `not` | `==` and `!=` of numbers, `eq` and `ne` of texts and lists, `&&`, `\|\|`, `!` |
| `list = [7, 9]`, `list[i]`, `add(list, x)` | `set list [list 7 9]`, `[lindex $list $i-1]`: a list counts from 0, `lappend list x` |
| `t[1][2] = x`, `add(t[1], x)` | `lset t 0 1 x`, `lset t 0 end+1 x` |
| `a / b` of whole numbers | `double($a) / $b`: in Tcl it would be a whole number |
| `function f(list)`, when it changes the list | `proc f {listVar} { upvar 1 $listVar list … }`, called with the list's name, `f numbers`, since a list of Tcl is a value |

What Tcl can't say in a command comes as a helper first, each with a comment: `show`, which prints a real number with up to 12 digits by `format %.12g` and a boolean in the words of the program's language; `remove_item`, `split_at`, for a separator of more than one letter, since `split` cuts at each letter of its separator, and `round_to`; and `pi()`, a function of `expr`, which has no constant of it. A text is split into its words by `regexp -all -inline {\S+}`, and the items of a list of real numbers are joined by `join [lmap item $list {show $item number}]`. A comment after code is `;#`, since a `#` after a command would be its word.

**Differences from CMIL:**
- Tcl compares real numbers exactly.
- It prints very large and very small numbers with an exponent, like `1e+21`.
- It doesn't round trigonometry.
- An answer is a number or a text by how the program uses it (see **Types**), not by what is typed.
- It prints the opposite of 0, a negative zero, as `-0`, where CMIL prints `0`.
- The counter of a `for` ends one step after its last value.
- Tcl 8.6 counts an emoji as two letters.
- A list is a value, so a variable a list is assigned to has a copy of it.
- `%` of a negative number has the sign of the number it divides by, so `-7 % 3` is `2`, where CMIL gives `-1`.

## COBOL

COBOL in GnuCOBOL's free format, which `>>SOURCE FORMAT FREE` says in the 8th column of the first line, as a compiler reads it in fixed format first. The program is `main-program`, which declares its variables in its `WORKING-STORAGE SECTION`, then has its statements in its `PROCEDURE DIVISION`, ending with `STOP RUN`. A name of COBOL has `-` for `_`, and a name that is one of COBOL's many words, like `count`, `number` or `text`, is `the-count`, `the-number` and `the-text`, and so is a name of C, like `long`, since GnuCOBOL makes a program a function of C.

| CMIL | COBOL |
|---|---|
| a whole number, a real number, a text, a boolean | `PIC S9(18)`, `COMP-2`, `PIC X(1000)`, `PIC 9`, 1 or 0 |
| a list | a table of up to 1000 items with its count, like `05 scores-count PIC 9(9)` and `05 scores-item PIC S9(18) OCCURS 0 TO 1000 TIMES DEPENDING ON scores-count` |
| `x = a + b`, `x = x + 1` | `COMPUTE x = a + b`, `ADD 1 TO x` |
| `print("Hi, " + name)` | `DISPLAY "Hi, " FUNCTION TRIM(name TRAILING)`; a whole number is moved into an edited field first, like `MOVE n TO shown-number`, and shown as `FUNCTION TRIM(shown-number)` |
| `name = input()` | `ACCEPT name`, or for a number `ACCEPT text-value` and `COMPUTE x = FUNCTION NUMVAL(text-value)` |
| `if … else if … else` | `IF … ELSE … END-IF`, or `EVALUATE TRUE` with a `WHEN` for each test and `WHEN OTHER` |
| `while c`, `do … while c` | `PERFORM UNTIL` the opposite of `c` … `END-PERFORM`, `PERFORM WITH TEST AFTER UNTIL` … |
| `repeat n times`, `for i from 1 to 10 step 2` | `PERFORM n TIMES`, `PERFORM VARYING i FROM 1 BY 2 UNTIL i > 10` |
| `for x in list` | `PERFORM VARYING i FROM 1 BY 1 UNTIL i > list-count`, with `MOVE list-item(i) TO x`: a table counts from 1, as CMIL does |
| `break`, `continue` | `EXIT PERFORM`, `EXIT PERFORM CYCLE` |
| `add(list, x)`, `list[i] = x` | `ADD 1 TO list-count` and `MOVE x TO list-item(list-count)`, `MOVE x TO list-item(i)` |
| `a == b`, `a != b`, `and`, `or`, `not`, `a % b` | `a = b`, `a NOT = b`, `AND`, `OR`, `NOT`, `FUNCTION REM(a, b)` |
| `function f(list, n)` | a program of its own, `PROGRAM-ID. f`, after the program, `IS RECURSIVE` when it calls itself, with its variables in its `LOCAL-STORAGE SECTION`; `CALL "f" USING BY REFERENCE list BY CONTENT n BY REFERENCE answer` gives it a list as it is, its own copy of a number or a text, and the variable of its result |

COBOL computes numbers in `COMPUTE`, puts texts together in `CONCATENATE` and `DISPLAY`, and tests conditions in `IF` and `PERFORM UNTIL`, so a value the one needs of the other, like a number in a text, a call of a function or an answer, is kept in a variable first, on the lines before the statement: `whole-value`, `real-value`, `text-value`, `flag` and `shown-number`, an edited field. What COBOL can't say in a statement comes as a program after the functions of the program, each with a comment: `show-real`, which prints a real number as CMIL does, with all its digits and up to 12 that count, `join-wholes` and the others of each kind of list, `contains-wholes` and the others, `remove-wholes` and the others, `letter-count`, `letter-of` and `letters`, since a text has bytes and a letter like ա more than one, `split-words`, `split-at`, `contains-text` and `round-to`. A text of a separator or of a part a helper looks for is given with its length in bytes, which a text of COBOL doesn't keep. GnuCOBOL 3.1 builds a `COMPUTE` of numbers only, like `COMPUTE answer = -1`, in the first program alone, so a function moves the value of such numbers, `MOVE -1 TO answer`.

What tables can't hold is a problem for COBOL, as for C (`fixedArrays`): a list of lists, a function that gives a list, a list given another list, which would be a copy, a function that gives a list parameter another list, and a loop that changes the list it goes over.

**Differences from CMIL:**
- COBOL computes whole numbers of up to 18 digits.
- It doesn't round trigonometry.
- An answer is a number or a text by how the program uses it (see **Types**), not by what is typed.
- The counter of a `PERFORM VARYING` ends one step after its last value.
- `UPPER-CASE` and `LOWER-CASE` change only English letters.
- A text has at most 1000 bytes, and a list 1000 items; a text keeps no spaces at its end, which COBOL pads it with.
- A function called in a statement or a condition is called before it, so a value it changes, read before it in the statement, has its new value.

## x86-64 Assembly

x86-64 assembly on Linux, linked by `gcc` with the C library, which prints, reads and keeps texts, as most courses do, in three syntaxes, one program written by each from the same instructions:

- **`x86-64`**: the GNU assembler in Intel syntax, the destination first, as `gcc -masm=intel` writes it, after `.intel_syntax noprefix`.
- **`x86-64-att`**: the GNU assembler in its own AT&T syntax, the source first, `%` before a register, `$` before a number and the size of a value in the instruction, like `movq`, as `gcc -S` writes it.
- **`x86-64-nasm`**: NASM, in Intel syntax with its own directives, which `nasm -f elf64` assembles before `gcc` links it: the functions and symbols of the C library declared by `extern`, a variable a local label of its function, like `.total`, the data like `data.text1`, read by `rel`, and a function of the C library called `wrt ..plt`.

| CMIL | Intel | AT&T | NASM |
|---|---|---|---|
| `x = 5` | `mov qword ptr [rbp + x], 5` | `movq $5, x(%rbp)` | `mov qword [rbp + .x], 5` |

A program has its texts and real numbers first, in `.section .rodata`, its functions, `main`, then the helpers it needs. Every variable of a function has 8 bytes of its frame, below `rbp`, named at the start of the function, like `.set total, -8` and `qword ptr [rbp + total]`, or `.total equ -8` in NASM. A name that is a register, like `rax` or `Al`, whatever its case, a word of the Intel syntax or of NASM, like `ptr` or `section`, or a function of the C library the program calls, gets a `_`, in every syntax, so a program has the same names in each; the labels of the conversion start with `.L`, like `.Lwhile1`, or with a `.` in NASM, which no name does. The table below is in Intel syntax.

| CMIL | x86-64 assembly |
|---|---|
| a whole number, a boolean, a text, a list | 8 bytes in `rax`: the number, `1` or `0`, the address of the letters of a text, ended by a 0, or of a list: its count, then the address of its items, which grow by `realloc` |
| a real number | 8 bytes in `xmm0`, computed by `addsd`, `mulsd`, … and compared by `ucomisd` |
| `x = a + b` | `mov rax, qword ptr [rbp + a]`, `add rax, qword ptr [rbp + b]`, `mov qword ptr [rbp + x], rax`; a value kept while another one is computed is in a variable of the conversion, like `temp` |
| `print("Hi, {name}: " + age)` | `printf` with a format, like `"Hi, %s: %lld\n"`, a real number as `%.12g` and a boolean in words; a text alone by `puts` |
| values joined into a text | `asprintf` with a format |
| `name = input()` | the helper `read_text`, by `getline`, or `read_number` for a number |
| `if … else if … else` | a comparison, like `cmp rax, 5`, and a jump past each block when its condition is false, like `jle .Lif1_else` |
| `while c`, `do … while c` | a label, a jump past the loop when `c` is false and a `jmp` back; the block, then a jump back when `c` is true |
| `repeat n times`, `for i from 1 to 10 step 2` | a counter and a jump back; each value of `i` is counted from the start, a real one as start + passes × step, and `i` gets a value only for a pass, so it keeps its last one, as in CMIL |
| `for x in list` | the place of an item, from 0, like `qword ptr [rax + rcx*8]` |
| `break`, `continue` | `jmp` to the end of the loop, or to its next step |
| `and`, `or`, `not` | jumps, so the right side of `and` and `or` is computed only when it is needed, as in CMIL |
| `a % b` | `idiv`, whose remainder, in `rdx`, has the sign of `a`, as in CMIL |
| `function f(list, n)` | a label and its frame, `push rbp`, `mov rbp, rsp` and `sub rsp`, its parameters from `rdi`, `rsi`, … and `xmm0`, … or above its frame, as the calling convention of Linux passes them, and its result in `rax` or `xmm0`, by `leave` and `ret` |

What one instruction can't say comes as a helper after the program, each with a comment: `read_text` and `read_number` for the answers, `in_words` for a boolean in the words of the program's language, `list_new`, `list_add` and `list_copy`, `contains_`, `remove_` and `join_` of each kind of item, like `join_wholes`, `split_words`, `split_at` and `split_letters`, `letter_count` and `letter_of`, since a text has bytes and a letter like ա has more than one, `uppercase`, `lowercase` and `round_to`. A list is shared by the variables it is in, as in CMIL, and lists of lists are lists of addresses; a `for … in` that changes its list goes over a copy. The texts and lists a program makes keep their memory until it ends, which a short program can.

**Differences from CMIL:**
- `ucomisd` compares real numbers exactly.
- `printf` prints very large and very small numbers with an exponent, like `1e+21`.
- The C library doesn't round trigonometry.
- An answer is a number or a text by how the program uses it (see **Types**), not by what is typed.
- `toupper` and `tolower` change only English letters.

## Tests

[`test/convert.ts`](../test/convert.ts) converts every spec program into each target whose compiler or interpreter is installed (`g++`, `python3`, `dotnet`, `javac` of Java 25, in `JAVA_HOME` or on the path, `gcc`, Node.js, which runs JavaScript with a `prompt()` that reads the answers, `fpc`, `go`, whose `gofmt` checks the layout too, `kotlinc`, in `KOTLIN_HOME` or on the path, `swiftc`, `rustc`, `php`, with its `mbstring`, `ruby`, `lua5.4`, `fbc` of FreeBASIC, `gfortran`, `tclsh`, `cobc` of GnuCOBOL and `nasm`), runs it with its inputs, and compares what it prints with the spec. The C# programs build in one project, as the Visual Basic ones do, each in a class or a namespace of its own, since a build takes seconds; the classic ones also build with C# 7.3 against .NET Standard 2.0, which .NET Framework 4.6.1 and later run. The Java programs of a shape build with one `javac`, the classic ones for Java 8, and the Kotlin programs with one `kotlinc`, each in a package of its own. Its lists name the cases of the differences above, the cases C++, C#, Java, C, Pascal, Go, Kotlin, Swift, Rust, BASIC, Visual Basic, Fortran, Tcl, COBOL and x86-64 assembly can't write, and what each target does where CMIL stops (above). `CMIL_TARGETS=c,x86-64 npm test` builds and runs the programs in those targets alone. CI builds and runs them in six jobs, each with the tools of a group of targets, and fails if one is missing.
