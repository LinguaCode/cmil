## Unreleased

  - **[add]** API: the entry `cmil/codemirror`, which edits programs in CodeMirror 6, as LinguaCode does: `cmil(language)` gives an editor the colors of a language's programs, as a class for each kind of token, like `cmil-block` for `if` and `cmil-string` for a text, which the page colors (`tokenClasses` lists them), their indentation, the closing of the language's quotes as they are typed, also with an input method, the completions of its commands and of the program's names, and the first error of the program as it's written, or its warnings, with their messages in its language. Each part is an export of its own, with `tokensOf()` for code shown without an editor, `markError()` for the error a program ended with, and `linkedLines()` and `showLines()`, which mark the lines of a converted program that go with the line of the cursor. See `docs/codemirror.md`.
  - **[add]** API: the entry `cmil/codemirror/targets`, whose `targetLanguage(target)` colors the programs `convert()` writes with the classes of CMIL, each language's CodeMirror package loaded when it is first shown, so a program and its conversion have the same colors. It adds what CodeMirror's modes miss: the texts and operators of Tcl, which its mode colors as comments outside the brackets of a call, and COBOL in GnuCOBOL's free format, which CMIL writes, with its `*>` comments and the words at the start of a line, which the fixed format of its mode takes for the numbers of the lines.
  - **[add]** package: the CodeMirror packages the entries use are optional peer dependencies, `^6`, and `^1` for `@lezer/highlight`: a page has one copy of each, the one its own editor uses, and npm installs none for `cmil` alone.
  - **[add]** API: `warningsOf(sourceCode, language)`, what a program may not mean though it runs: `numberText`, a text that holds a number and is compared with `==` or `!=`, like `"1234"` in `pin != "1234"`, which an answer never equals, since an answer that is a number is a number. `messageOf()` gives the message of a warning, as of an error, in every language.

## 0.21.0-alpha.0 (2026-10-25)

  - **[fix]** translations: the Japanese messages write the full-width colon of Japanese, like `{line} 行目：…`, where they had `:`, as the messages of every other language use the marks of their language.
  - **[add]** tests: every language's messages, each plural form too, are checked against the punctuation of the language, like ՛, ՞ and ։ in Armenian, ; for a question in Greek, ؟ in Arabic, the full-width marks of Chinese and Japanese, ¡…! and ¿…? in Spanish, and a space before ! ? : and ; in French.

## 0.20.0-alpha.0 (2026-10-25)

  - **[add]** API: the entry `cmil/convert`, which has `convert()` alone, so a page can load the converters when it first shows a program in another language, like `const {convert} = await import('cmil/convert')`; `targets`, from `cmil`, loads none of them.
  - **[optimize]** package: `"sideEffects": false`, since no module of CMIL does anything when it loads, so a bundler leaves out what a page or a worker doesn't use: a worker that runs programs with `Session` no longer carries the converters, about 300 kB of its 428 kB.

## 0.19.0-alpha.0 (2026-10-24)

  - **[change]** a list is no text: printing a list, joining it into a text with `+` or `{…}`, `to_text` of it, and `join` of a list whose items are lists are the new error `listAsText`, whose message, in every language, says to join its items with `join`, named in the program's language, or to print them one by one. A printed list like `[«հաց», «կաթ»]` is no output a program wants; `join(list, ", ")` prints `հաց, կաթ`.
  - **[change]** lists aren't compared: `==` and `!=` of a list, and `in` and `remove` with a list as the value, are a `typeError`; their items are compared one by one.
  - **[change]** tests: the spec cases that printed a list to show it print `join(list, ", ")`, and its new error cases cover each way a list would become a text or be compared. Removed, as their subject is gone: "a list prints its items, texts quoted", "texts in a list are printed with their escapes", "a list joined into a text", "a list into a text", "lists are equal when their items are" and "numbers in lists compare like numbers", now error cases where they have one; "a list printed too long" joins its texts instead.
  - **[change]** API: `convert()` gives a program the error CMIL stops it with where the types of its values show it: a list turned into a text or compared, `listAsText` or `typeError`, and a value an operator, a function, an index, a condition or a statement can't take, like `"abc" * 2`, `add(5, list)` or a number as a condition, `typeError` or `conditionError`. So C++ and Python no longer print a list like `[1, "a"]` or compare lists, their helper `show()` printing only numbers and booleans, and no target writes code that doesn't build, or that goes on where CMIL stops; Tcl and COBOL threw on some such programs.
  - **[add]** API: `convert()` writes C# in two shapes, printing what CMIL prints: `csharp`, C# 12 with top-level statements, as `dotnet new console` makes a program, and `csharp-classic`, a `class Program` with `Main` that builds with any C# from 7.3, like the C# of .NET Framework. A target has a `style`, `modern` or `classic`, when its language has two shapes. `docs/converting.md` has their rules and how C# differs.
  - **[add]** API: `convert()` writes Java in two shapes too: `java`, a compact source file of Java 25, and `java-classic`, a `public class Main` that builds with any Java from 8.
  - **[add]** API: `convert()` writes C99 as a first course does, the target `c`: fixed arrays with their counts, `char` arrays and `printf`. What fixed arrays can't hold, like a list of lists, is the new problem `fixedArrays`, with its message in every language.
  - **[add]** API: `convert()` writes JavaScript, the target `javascript`: a script for the browser with `console.log()`, `prompt()` and template literals.
  - **[add]** API: `convert()` writes Free Pascal, the target `pascal`, with a `var` for every variable and named list types; names of other alphabets are written in Latin letters, like անուն as `anun`.
  - **[add]** API: `convert()` writes Go, the target `go`, as `gofmt` lays it out: slices, `fmt.Printf()` with a format, and a pointer to a list a function changes.
  - **[add]** API: `convert()` writes Kotlin, the target `kotlin`: `val` for a value given once, `mutableListOf()`, string templates like `"Hi, $name!"`, `repeat(n) { }` and ranges like `1..10 step 2`.
  - **[add]** API: `convert()` writes Swift, the target `swift`, as a script: `let` for a value given once, interpolation like `"Hi, \(name)!"`, `Double(n)` where a whole number meets a real one, and `inout` for a list a function changes.
  - **[add]** API: `convert()` writes Rust, the target `rust`, which `rustc` builds alone: `println!` with a format, `let mut` for a variable that changes, a list and a text borrowed by a function, `&mut` when it changes the list, and `clone()` where the program keeps a text or a list it gives.
  - **[add]** API: `convert()` writes PHP, the target `php`, a script for the command line as PSR-12 lays it out: `echo` of texts with their variables in them, `===` for values that aren't numbers, the `mb_` functions for letters, and a reference, `&$list`, for a list a function changes.
  - **[add]** API: `convert()` writes Ruby, the target `ruby`: texts with their values in them, like `"Hi, #{name}!"`, `times` and `each` for loops, but `for` for a loop that makes a variable the program has after it, and names that start with a small letter, since `X` would be a constant.
  - **[add]** API: `convert()` writes Lua 5.4, the target `lua`: local variables, tables that count from 1, as CMIL's lists do, texts joined with `..`, and `goto continue` for `continue`; names of other alphabets are written in Latin letters, as in Pascal.
  - **[add]** API: `convert()` writes BASIC, the target `basic`, in FreeBASIC: `Dim` and `Print`, arrays that grow by `ReDim Preserve`, `For … Next` and `Do … Loop`, and the answers of `Open Cons`; what arrays can't hold, like a list of lists, is the problem `fixedArrays`, as in C.
  - **[add]** API: `convert()` writes Visual Basic, the target `visualbasic`, as `dotnet new console -lang VB` makes a program: a `Module Program` under `Option Strict On`, with `Dim`, `List(Of …)`, `For Each … Next` and `Console.WriteLine()`.
  - **[add]** API: `convert()` writes Fortran, the target `fortran`, as gfortran builds it: a `program main` that declares its variables first, allocatable arrays that grow by `[list, x]`, a type `string` for the texts of a list, `do` loops and `print '(a)'`, with the functions of the program after `contains`; a list of lists is the problem `fixedArrays`, as in C.
  - **[add]** API: `convert()` writes Tcl, the target `tcl`, in Tcl 8.6: `set`, `expr` and `incr`, `puts` of texts with values in them, lists by `list`, `lappend` and `lset`, a list a proc changes by `upvar`, and a value printed by its type, since every value of Tcl is a text.
  - **[add]** API: `convert()` writes COBOL, the target `cobol`, in GnuCOBOL's free format: a `main-program` with its `WORKING-STORAGE`, tables with their counts, `COMPUTE`, `DISPLAY` and `PERFORM`, numbers shown through edited fields, and the functions of the program as programs of their own, `IS RECURSIVE` when they call themselves, which `CALL` gives their values; a list of lists is the problem `fixedArrays`, as in C.
  - **[add]** API: `convert()` writes x86-64 assembly on Linux, linked with the C library, in three syntaxes: the targets `x86-64` and `x86-64-att`, the Intel and AT&T syntaxes of the GNU assembler, which `gcc` builds, and `x86-64-nasm`, NASM's. The variables of each function are in its frame, named at its start, like `qword ptr [rbp + total]`, `total(%rbp)` and `qword [rbp + .total]`, whole numbers in `rax` and real numbers in `xmm0`, `printf` with a format, lists that grow by `realloc` and are shared, as CMIL shares them, and the calling convention of Linux.
  - **[fix]** API: `convert()` gives an answer the type of where it goes: one given to a parameter, returned by a function, put in a list or passed by `for … in` is a number where that is a number, as one assigned to a variable already was. Typed targets read it as a text and gave the text to a number, and Python printed it as a number, so `twice(input())` of a `twice(x)` that returns `x * 2` didn't build or stopped; it prints the answer doubled.
  - **[fix]** API: `convert()` writes C++ that finds a value in a list that is in no variable, like `2 in [1, 2]`, by `std::ranges::count`; `std::find` got the `begin()` and `end()` of two copies of the list, which C++ leaves undefined, and found what wasn't there.
  - **[change]** API: `convert()` gives the problem `fixedArrays` at the first line of the program that C, BASIC, Fortran or COBOL can't write, where it gave the line of a function first; what each can't write is declared in one place and listed in `docs/converting.md`.
  - **[change]** API: `convert()` writes a `while` or a `do … while` whose condition C, BASIC or Fortran computes on lines of its own, like `while uppercase(answer) != "YES"` in C or `while length_of(split(line)) > 1` in BASIC, where it gave the problem `fixedArrays`: the loop makes the value before it and again before each test, after its block and before a `continue`, as COBOL did; C writes such an `else if` too.
  - **[fix]** API: `convert()` writes C, BASIC, Fortran and COBOL that compute an `else if`, or the right side of `and` and `or`, that asks or calls only where CMIL computes it: such an `else if` is an `else` with an `if`, and such a right side comes after the left side in a variable, in an `if`. They asked for an answer, or called a function, before the whole `if` or although the left side decided, and Fortran and COBOL called a function `and` and `or` don't need, as `docs/converting.md` said.
  - **[fix]** API: `convert()` reads a loop's bounds once, as CMIL does, also when they ask, call a function or `random()`, or read a list the loop changes: C, C++, C#, Java, JavaScript, PHP, Go and Tcl, and the `while` loops of Python, Kotlin, Rust, Pascal and Fortran, asked for `for i from 1 to input()` or `repeat input() times` again on each pass, and `for i from 1 to length_of(items)` with `add(items, i)` in it never ended; a first value that asks is kept first, so the program asks in CMIL's order.
  - **[fix]** API: `convert()` tests the sign of a step that shows only as the program runs, like `step s` or `step -n`, as CMIL does, like `s > 0 ? i <= 10 : i >= 10` in C; 18 targets counted such a step up, so `s = -1` then `for i from 3 to 1 step s` made no pass, Python's stopped after one, Kotlin's stopped the program and Rust's counted by a huge step. A whole counter reaches a real last value by the sign too, its floor counting up and its ceiling counting down, and Python writes a real number as the last value as the whole number reached, where `range()` got the real number.
  - **[fix]** API: `convert()` declares a bound it keeps with its own type, so C# and Java build `for i from 1 to input()` and Pascal `repeat input() times`, and C and C++ no longer cut a real last value to a whole number.
  - **[fix]** API: `convert()` gives a `for` whose first value a function gives a whole counter when the function gives a whole number, so Pascal builds it; Tcl writes a real counter without a step, which it threw on, and Ruby counts one by `step`, since a range of real numbers has no `each`.
  - **[fix]** API: `convert()` reads the last value and the step of a `for` once, as CMIL does, also when the loop changes them: C++, C#, Java, C, JavaScript, Pascal, Go, PHP, Fortran and Tcl kept only the last value, and Python, Kotlin and Rust neither in their loops of real numbers.
  - **[fix]** API: `convert()` writes `+x` as `x` in Rust and Lua, which have no `+` of one number, so the program builds and runs.
  - **[fix]** API: `convert()` writes a text of one value in braces, like `"{1 + 1}"`, as a text in PHP and Lua, by `strval()` and `tostring()`; it was the number, so `"{1 + 1}" == "2"` was false.
  - **[fix]** API: `convert()` writes `square()` of a whole expression as a whole number in Lua, by `math.tointeger()`, where `^` gave a real one, printed as `9.0`.
  - **[fix]** API: `convert()` gives a function that changes a list no caller sees again, like `f([])`, a copy of its own in C++, Pascal, Swift and PHP, which can't give a list written in place to a reference, so the program builds.
  - **[fix]** API: `convert()` writes COBOL that moves an item of a table into a number, like `MOVE scores-item(1) TO best`, as it moves a variable; GnuCOBOL 3.1 doesn't build a `COMPUTE` of one item in a function.
  - **[change]** tests: CI checks on Node.js 24 and 26 without building the converted programs, and builds and runs them in six jobs on Node.js 24, by groups of targets, each with only its own tools; `CMIL_TARGETS=c,x86-64 npm test` builds and runs them in those targets alone, and each target's suite is named by its shape or syntax too, like `spec programs in x86-64 Assembly (NASM)`.
  - **[add]** docs: `docs/converting.md` says what each target does where CMIL stops a program as it runs, like at an index after the end of a list or a division by 0: it stops, or goes on with another value, as its language does; `test/convert.ts` runs those programs in every target and checks it.
  - **[add]** tests: spec cases for what no program of the spec or the lessons reached in a converter: `in`, `remove` and `join` on lists of numbers, texts and booleans, a split at a separator of several letters, texts made with braces or joined and given on, functions that call one defined after them, change their parameters, have seven of them, give a list or are never called, decimal counters whose loop changes their bounds, and more, so every helper of every target is built and run, which a test checks; `test/types.ts` has the types of the values on their own, and `test/runners.ts` how each target builds and runs a program.
  - **[fix]** API: `convert()` writes Python whose `continue` goes on as CMIL's does: in a `for` with a decimal step, after the step, and in a `do … while`, after the test of its condition; it skipped them, so a loop could run forever.
  - **[fix]** API: `convert()` gives a variable or a parameter named like a function of the program a `_`, as a name that is a word of the target gets, so the program builds and runs; C++, C, C#, Python, JavaScript, Go, Rust, Swift and Lua took the variable for the function.
  - **[fix]** API: `convert()` gives a list that gets an item of another type, like `add(numbers, "a")`, the problem `mixedItems`, a list with items of two kinds, where it gave `mixedTypes`, as if its variable got a value that is no list.
  - **[fix]** API: `convert()` gives a list wrapped in itself, like `x = [x]` in a loop or `add(a, a)`, the problem `mixedTypes`, where it wrote C++ with a type of lists nested a hundred deep, which doesn't build.
  - **[fix]** API: `convert()` writes C++ that joins booleans in the words of the program's language, as CMIL does; `join()` joined them in English.
  - **[fix]** API: `convert()` writes the opposite of an opposite number in brackets in C++ and Python too, like `-(-x)`, where it wrote `--x`, which C++ reads as one less.
  - **[add]** tests: every spec program is converted into both shapes of C# and of Java, into C, JavaScript, Pascal, Go, Kotlin, Swift, Rust, PHP, Ruby, Lua, BASIC, Visual Basic, Fortran, Tcl, COBOL and x86-64 assembly in its three syntaxes, built and run too; the classic ones also build with C# 7.3 against .NET Standard 2.0, and for Java 8.

## 0.18.0-alpha.0 (2026-10-24)

  - **[add]** texts: code in braces puts its value into a text, in every quote, like `print("Hi, {name}! Next year you will be {age + 1}.")`, written as `print` writes it; any expression goes in the braces. A brace that stays a brace is written `\{`; `{}` and a `{` that isn't closed are a `syntaxError`. `translate()` translates the code in the braces, and editors color it (`segmentsOf()`).
  - **[change]** the program tree is format 2, with the new expression `template`.
  - **[change]** tests: `print("${1 + 1}")` prints `$2`, since its braces are CMIL code; JavaScript still never runs.

## 0.17.0-alpha.0 (2026-10-23)

  - **[add]** API: `convert(sourceCode, language, target)` writes a program in C++ or Python, as a teacher would, printing what CMIL prints, with the CMIL line of each line, its comments and its blank lines; `targets` lists the languages. A typed language gives the `problems` of a value with two types, whose messages `problemOf(problem, language)` gives in every language. `docs/converting.md` lists how each construct is written and how each language differs.
  - **[add]** API: `programOf(sourceCode, language)` gives the tree of a program for tools, with its comments, the first spelling of each name, its constants and the lines of `else` and `do`, documented in `docs/tree.md`.
  - **[add]** tests: every spec program is converted into C++ and Python, compiled, run and compared with the spec.

## 0.16.0-alpha.0 (2026-10-23)

  - **[change]** math: `random(max)` gives a whole number from 1 to `max`, like a die and like the items of a list, instead of from 0, so `fruits[random(3)]` is always an item; `random(0)` is a `mathError`.
  - **[fix]** input: an answer is a number only when it is written in decimal, like `25`, `-2.5` or `1e3`; `0x10` and `0b101` are texts, which `input()` and `to_number()` read as `0` before.
  - **[add]** errors: a command where a program gives a name, like `step = 1`, `for e in list`, `function round(x)` or a parameter `times`, is the new `nameError`, with the command as written, found before the program runs, instead of a `syntaxError`.

## 0.15.0-alpha.0 (2026-10-23)

  - **[change]** words: `print` and `input` are verbs in Arabic, `اطبع` and `أدخل` instead of the nouns `الإخراج` and `المدخلات`, and in Italian `scrivi` and `leggi` instead of the electronics terms `uscita` and `ingresso`; in Georgian they are `გამოტანა` and `შეყვანა` instead of `გამოშვება` (release) and `შეყვანის` (of input), and `input` is `lexo` in Albanian instead of `të_dhëna` (data).
  - **[change]** words: `while` says "as long as": `så_længe` in Danish, `så_lenge` in Norwegian and `så_länge` in Swedish instead of `mens` and `medan` (during), `niin_kauan_kuin` in Finnish instead of `kun` (when), and `間` in Japanese instead of `しばらくの間` (for a while).
  - **[change]** words: `then` is `فإن` in Arabic instead of `ثم` (afterwards), `så` in Norwegian instead of `da` and `potem` in Slovenian instead of `nato`; `else` is `სხვა_შემთხვევაში` (in the other case) in Georgian instead of `სხვა` (other).
  - **[change]** words: false is `خطأ` in Arabic instead of `كاذبة` (lying), and the booleans are `ჭეშმარიტი` and `მცდარი` in Georgian instead of `მართალია` (it is true) and `ცრუ` (lying); `not` is `아님` in Korean instead of `지`, a part of -지 않다; `break` is `salir` in Spanish instead of `abortar`; and `random` agrees with number: `aleatório` in Portuguese and `aleator` in Romanian.
  - **[change]** translations: the words of a language no longer carry notes that ask a native speaker to check them, and `docs/translations.md` lists the words of each language without words to check. Anyone may suggest a better word.

## 0.14.0-alpha.0 (2026-10-23)

  - **[change]** print: `print(value)` is called like a function and prints one value, like `print("Fruits: " + (3 + 5))`. Another count of values, like `print("Fruits:", 8)`, or `print "Fruits"` without the parentheses, is an `argumentError` that says print takes 1 value, instead of a `syntaxError`; anything after the `)`, like `print("a") + "b"`, is a `syntaxError`.
  - **[change]** print: an empty text prints an empty line, like `print("")`, instead of nothing.
  - **[change]** input: `input()` gives the answer, so it is stored with `=`, like `name = input()`, or used like any other value, like `if input() == "yes"`; several `input()` in one line are asked from left to right. `input name` and `input()` on a line of its own are a `syntaxError`, and a value in the parentheses, like `input("Your name?")`, is an `argumentError`.
  - **[change]** lists: `add(list, value)` and `remove(list, value)`, with the list first, replace `add value into list` and `remove value out of list`. The words of `into` and `out of` are removed from every language, so they read the same in every word order.
  - **[change]** errors: `print`, `add` and `remove` give no value, so using one in an expression, like `x = print(1)`, is a `noValue`, found before the program runs.
  - **[change]** API: `commandsOf()` gives `print`, `input`, `add` and `remove` the kind `function`, so editors complete them with parentheses; the command ids `into` and `outOf` are removed.

## 0.13.0-alpha.0 (2026-10-23)

  - **[change]** print: `print` prints one value, and values are joined into one text with `+`, like `print "Fruits: " + (3 + 5)`. A comma between values, like `print "Fruits:", 3 + 5`, is a `syntaxError` at the comma, and so is a decimal comma, like `print 2,5`, which printed `2 5`.

## 0.12.0-alpha.0 (2026-10-20)

  - **[change]** words: `print` is `արտածել` in Armenian instead of `տպել`, which says more exactly what it does: it outputs.

## 0.11.0-alpha.0 (2026-10-20)

  - **[change]** input: `input` only reads, so `input name` is its only form; the question is printed before it, like `print "Your name?"`. Anything between `input` and the name, like the prompt of `input "Your name?" name`, is a `syntaxError`, and the input step has no `prompt`.
  - **[add]** API: `new Session(code, language, {random})` gives the numbers `random()` is made from, from 0 up to 1 like `Math.random()`, the default; sessions given the same numbers make the same random numbers.
  - **[change]** words: `into` and `out of` no longer agree with the name of the list or say "this": `out of` is `de_la_liste` in French instead of `du`, `dalla_lista` in Italian instead of `dalla`, `da_lista` in Portuguese instead of `da`, `de_la_llista` in Catalan instead of `del` and `από_τη_λίστα` in Greek instead of `έξω_από`; in Hungarian `into` is `listához` instead of `ehhez` and `out of` `listából` instead of `ebből`, and in Georgian `into` is `სიაში` instead of `შიგ`. They still need a native review.

## 0.10.0-alpha.0 (2026-10-20)

  - **[add]** texts: each language has its own quotes besides `«…»`, `"…"` and `'…'`, like `“…”` in English, `„…“` in German or `「…」` in Japanese; `docs/translations.md` lists them.
  - **[change]** `translate()`: texts are written in the main quotes of the language a program is translated into, like `«…»` in Armenian, with their escapes.
  - **[change]** output: a list prints its texts in the main quotes of the program's language, like `[«ա»]` in Armenian.
  - **[add]** lists: `x in list` is `true` when a list has a value, and `text in text` when a text has another; `remove x out of list` takes out the first item `==` to x, and a value the list doesn't have is the new `itemError`.
  - **[add]** texts: `split(text)` gives the words of a text, `split(text, separator)` its parts, and `join(list, separator)` joins the items of a list into a text.
  - **[change]** words: `in` reads in conditions too, so in Armenian it is `մեջ` instead of `ից`, and `into` is `վերջում` instead of `մեջ`; in Russian `in` is `среди`, in Japanese `の中`, in Czech `mezi`, Slovak `medzi`, Slovenian `med`, Serbian `међу` and Hungarian `között`. The words of `remove`, `out of`, `split` and `join` are in every language; those of 28 languages need a native review.
  - **[add]** API: `segmentsOf(line, language)` splits a line into the parts an editor colors, `commandsOf(language)` lists the commands of a language with their words and kinds, and `quotesOf(language)` its quotes.
  - **[change]** errors: an `argumentError` has the `function` as written and the counts `min` and `max` of values it takes, and its message says so, like "Line 3: power takes 2 values."; a call of a function of the program without its `)` is a `syntaxError`. Messages may have plural forms, chosen with `Intl.PluralRules`.

## 0.9.0-alpha.0 (2026-10-20)

  - **[add]** loops: `for i from 1 to 10`, with an optional `step 2` or a negative step to count down; the bounds are read once and both ends are included. The words `for`, `from`, `to` and `step` are in every language; those of 28 languages need a native review.
  - **[add]** lists: `[1, 2, "a"]` and `[]`, items read with `list[1]`, counted from 1, and replaced with `list[1] = x`, `add x into list`, and `for x in list`, which also passes the letters of a text. A list is shared when it is assigned, printed like `[1, 2, "a"]`, and equal to another list with equal items. An index outside a list or a text is the new error `indexError`, with its `index`. A list may have 1,000,000 items (`memoryLimit`).
  - **[add]** texts: `text[1]` reads a letter, and the functions `length_of(x)`, `uppercase(t)`, `lowercase(t)`, `to_number(t)` and `to_text(x)`. The words of the new commands are in every language; those of 28 languages need a native review.
  - **[change]** messages: `argumentError` says "a function" instead of "a math function", and `memoryLimit` names lists too.
  - **[add]** functions: `function name(a, b)` with a body under it, `return value` or `return`, and calls like `name(1, 2)` in expressions or on their own line. Functions are defined at the top of the program and can be called before their definition; a function knows only its parameters and its own variables, and can wait for input. The new errors are `undefinedFunction` and an argument count that doesn't fit, found before the program runs, `noValue` for the value of a call that has none, and `recursionLimit` for more than 1000 calls inside each other. The word `return` is in every language; those of 28 languages need a native review.
  - **[change]** errors: a call of a name that isn't a function, like `eval("1")`, is an `undefinedFunction` instead of a `syntaxError`.

## 0.8.0-alpha.0 (2026-10-20)

  - **[change]** translations: each language file is a typed record of the words of each command, like `and: ['և', 'եւ', 'ու']`, instead of a list of definitions separated with `|`; TypeScript checks that every command has words. Notes for native speakers are in its `notes`.
  - **[change]** source: the constants are one file, `src/constants/index.ts`, and the command ids lose the `@` of the removed `@output` form. The debug logger is removed.
  - **[change]** API: `Session` replaces `CodeSubmit`. `run()` starts a program and `input(value)` continues it; both return a step, `{state: 'input', output}` or `{state: 'end', output, error}`, with the lines printed since the last step, one per `output`. There are no callbacks, and no default export: CommonJS code uses `const {Session} = require('cmil')`.
  - **[add]** API: `check(sourceCode, language)` returns the first error of a program before it runs, and `messageOf(error, language)` its message in every language; the messages are in `src/translations`.
  - **[change]** errors: an error is `{id, …}` instead of `{errorId, param}`, with the column of its token, counted from 1, for syntax, argument and undefined variable errors. `functionArgumentSyntaxError` is renamed `argumentError`.
  - **[change]** limits: a program may run 1,000,000 steps between two inputs, instead of 100,000 steps and 666 ms, so for example finding the primes below 3000 no longer times out; `new Session(sourceCode, language, {maxSteps})` sets another limit. The core has no clock any more and reads no environment variable; a host stops a hung worker itself.
  - **[change]** values: values are never converted into another type. Arithmetic takes numbers, `+` also joins a text with any value, `==` never converts (`"5" == 5` is false), and `<`, `>` compare two numbers or two texts. Conditions, `and`, `or` and `not` take booleans. Anything else is one of the new errors `typeError`, `conditionError`, `divisionByZero` or `mathError`, with the line, the column and, for `typeError` and `mathError`, the operator in the words of the program's language. NaN and Infinity no longer exist.
  - **[change]** output: booleans are printed in the words of the program's language, like `ճիշտ` in Armenian, instead of `<true/>` and `<false/>`.
  - **[change]** numbers: printed and compared with 12 significant digits, so `0.1 + 0.2` prints `0.3` and equals `0.3`, and always with all their digits, like `0.0000001` instead of `1e-7`. Trigonometry is rounded to 12 decimals instead of 10, so `sin(pi)` is still `0`.
  - **[fix]** loops: `repeat N times` reads N once, so changing N in the loop no longer makes it endless. N must be a whole number, not below 0.
  - **[add]** math: `round(x, digits)` rounds to a count of decimals.
  - **[change]** commands: English `output` is `print`, and `ctg` and `arcctg` are `cot` and `arccot`, as in English mathematics; the command ids follow. The words of the other languages don't change.
  - **[add]** commands: `print a, b` prints several values on one line, separated by spaces, and `input "Your name?" name` asks with a prompt, which the input step returns as `prompt`.
  - **[add]** errors: `=` inside an expression, like `if x = 5`, is an `equalsError`, whose message says to compare with `==`.

## 0.7.0-alpha.0 (2026-10-20)

  - **[fix]** commands: a command next to an operator is recognized, like `pi` and `e` in `if 1<pi` and `output 2>e`, which failed with `undefinedVariable`.
  - **[change]** commands: the lexer finds the words of each language itself, replacing the regex translator of `linguacode-translator` and its license file. A command is a whole word in any case, and the words of a two-word command, like Albanian `e vërtetë` (true), may be separated by any spaces.
  - **[change]** commands: the `@output` form of the commands is removed; `@` is a `syntaxError`.
  - **[change]** API: `translate()` keeps spacing, texts and comments, and renames a name that is a command in the other language with a trailing `_`, the same everywhere in the program, like `i` in Catalan, where it means and.
  - **[add]** tests: every word of every language is found as its command, and every spec program translated into every language runs the same.
  - **[fix]** translations: words in another sense are replaced in 29 languages, like town square for square, storey for floor, other for else and pause for break; if, then, else and while follow the school pseudocode of a language where it has one. Greek then is one word, `τότε`; Albanian false is `e rreme`, like `e vërtetë`; the constant e is also the Latin `e` in Ukrainian and Serbian.
  - **[add]** documentation: `docs/translations.md` lists the words of every language with their meaning, generated by `npm run translations-table` and checked by a test. A word's `note` asks native speakers to check it; 24 words have one.
  - **[add]** GitHub: a translation issue form, for native speakers to suggest a better word.

## 0.6.0-alpha.0 (2026-10-19)

  - **[change]** API: `codeSubmit.input(value)` replaces the `inputEmitter` getter.
  - **[change]** API: the state of `CodeSubmit` is private; only its methods are public.
  - **[change]** API: an unknown language ends the session with `unknownLanguage` and `param.language` instead of throwing an error.
  - **[add]** API: `stop()` ends a session, for example one waiting for input; `onSessionEnd` isn't called.
  - **[add]** API: `languages` lists the language codes, and `translate(sourceCode, from, to)` translates a program into another language.
  - **[fix]** translations: a word means one command in every language, which the tests check. pt-PT: the constant e is `euler`, since `e` means and; sl: do is `naredi`, since `ne` means not; th: and is `และ`, since `แล้ว` means then.
  - **[fix]** translations: words left in English are translated: false in el (`ψευδές`), nl (`onwaar`), ro (`fals`), sk (`nepravda`) and sl (`ni_res`); true in ca (`cert`); input in da (`indtast`) and fi (`syötä`); absolute value in ca (`valor_absolut`); square in vi (`bình_phương`); ceil in 20 languages, matching each language's floor.

## 0.5.0-alpha.0 (2026-10-19)

  - **[add]** releases: pushing a version tag, or running the release workflow on `master`, creates the GitHub Release, with its CHANGELOG section as notes, and publishes it to npm as `cmil` with npm trusted publishing from the first release candidate on; until then cmil installs from GitHub.
  - **[change]** package: `license` is `GPL-3.0-only`.
  - **[fix]** package: includes the license files of `src/constants`, `src/translations` and `src/translator`.
  - **[change]** README: names the author of CMIL and states the licenses, instead of restricting copies of the standard; links to the old website are removed.
  - **[change]** source: TypeScript with `strict`, checked in CI (`npm run typecheck`); the package ships type declarations.
  - **[change]** package: an ES module (`import CodeSubmit from 'cmil'`); CommonJS code can still `require('cmil')`. `npm install`, also from GitHub, builds `dist/` through `prepare`; `npm start` is removed.
  - **[fix]** languages: a language name like `constructor` is rejected with "Language was not specified." instead of failing with a `TypeError`.
  - **[add]** lint: ESLint and Prettier (`npm run lint`, `npm run format`), checked in CI.
  - **[add]** documentation: the language reference in `docs/language.md`, replacing the placeholder `DOCUMENTATION.md`.
  - **[change]** output: `true`, `false`, `NaN` and `Infinity` are printed as `<true/>`, `<false/>`, `<NaN/>` and `<Infinity/>` (LML standard, since 2019-09-04); tests updated from `${true}` / `${false}`.
  - **[fix]** tests: tutorials use the current Armenian commands `տպել` (output) and `մուտքագրել` (input) instead of `ելք` and `մուտք`, renamed in linguacode-translations on 2017-05-28.
  - **[fix]** tests: run in-process against `CodeSubmit`, the Socket.IO server they relied on was removed in 0.4.0-alpha.
  - **[fix]** errors: `undefinedVariable` is detected again.
  - **[change]** runtime: requires Node.js 24 or newer.
  - **[change]** package: the Babel build is removed.
  - **[change]** tests: the Node.js test runner replaces Mocha, c8 replaces istanbul (`npm run coverage`).
  - **[add]** CI: GitHub Actions on Node.js 24 and 26, replacing Travis CI, Coveralls and Code Climate.
  - **[add]** `package-lock.json` is committed.
  - **[optimize]** dependencies: moment removed; a development install has 140 packages instead of about 400, with no known vulnerabilities instead of 58.
  - **[change]** packages: linguacode-constants, linguacode-translator and linguacode-translations are part of cmil (`src/constants`, `src/translator`, `src/translations`), and `src/libs/logger.ts` replaces lingua-logger, with no git dependencies or install scripts.
  - **[add]** tests: every language defines every command; the translator converts code to text and back.
  - **[change]** core: programs run in cmil's own interpreter (lexer, parser, compiler and interpreter in `src/core`) instead of being converted to JavaScript and evaluated, so neither a program nor an input value can run JavaScript.
  - **[change]** errors: syntax and indentation errors are found before a program runs; every error except `timeout` reports its line, counted from the top of the program; output printed before an error is sent.
  - **[change]** output: words in texts stay as written; only boolean values, `NaN` and `Infinity` become markers, also when joined into text.
  - **[add]** errors: `memoryLimit`, when a text is longer than 1,000,000 characters or unsent output than 10,000,000.
  - **[change]** limits: between two inputs a program may run 100,000 steps besides 666 ms (`timeout`); blocks and expressions nest at most 100 levels.
  - **[change]** math functions with a wrong number of arguments end with `functionArgumentSyntaxError` instead of returning `<NaN/>`.
  - **[add]** commands: `break` and `continue` work in loops.
  - **[fix]** sessions: several programs can run at the same time; one waiting for input keeps its state.
  - **[optimize]** dependencies: none at runtime, lodash is no longer needed, so installing cmil adds only cmil; the tests run about five times faster.

## 0.4.0 (2016-11-12)

  - **[add]** tests: 32 (total 184).
  - **[add]** functions: math.
  - **[optimize]** syntax of input and output.
  - **[optimize]** huge amount of minor fixes and refactorings.

## 0.3.1 (2016-08-19)

  - **[optimize]** convert: ES5 to ES6;
  - **[optimize]** constants: separation;
  - **[status]** coverage: development: 100%, production: 98.436%.
  - **[status]** code climate: 3.86.

## 0.3.0 (2016-07-17)

  - **[add]** tests: 28 (total 152).
  - **[optimize]** compiler algorithm.
  - **[add]** output data collector.
  - **[change]** rename: "linguacode-api" to "core".
  - **[status]** coverage: development: 100%, production: 98.339%.
  - **[status]** code climate: 3.9.

## 0.2.5 (2016-07-11)

  - **[add]** tests: 2 (total 124).
  - **[optimize]** compiler algorithm.
  - **[fix]** builder;
  - **[fix]** input; repeat;
  - **[status]** coverage: development: 99.26%, production: 97.794%.
  - **[status]** code climate: 3.97.

## 0.2.4 (2016-07-07)

  - **[add]** tests: 26 (total 122).
  - **[optimize]** readme: include paths of CONTRIBUTING.md, CHANGELOG.md.
  - **[fix]** inner quote symbol detect fix: ", «, ».
  - **[status]** coverage: development: 99.26%, production: 97.782%.
  - **[status]** code climate: 3.64.

## 0.2.3 (2016-07-06)

  - **[add]** tests: 2 (total 96).
  - **[add]** module: moment.
  - **[add]** code compile timeout.
  - **[status]** coverage: development: 99.26%, production: 97.76%.
  - **[status]** code climate: 3.67.

## 0.2.2 (2016-07-05)

  - **[add]** tests: 39 (total 94).
  - **[add]** documentation:CONTRIBUTING.md
  - **[add]** module: linguacode-logger.
  - **[add]** tool: snyk.
  - **[add]** tool: travis.
  - **[add]** tool: coveralls.
  - **[add]** tool: code climate.
  - **[add]** tool: david: dependencies checker.
  - **[add]** tool: david: devDependencies checker.
  - **[add]** badge: Gratipay.
  - **[add]** badge: Beerpay.
  - **[add]** badge: license GPLv3.
  - **[optimize]** useless module remove from package.json file.
  - **[optimize]** ES6: 'var' to 'let' and 'const' convert.
  - **[optimize]** refactorings.
  - **[fix]** looping loop error initialize.
  - **[fix]** minor fixes.
  - **[status]** coverage: development: 99.24%, production: 97.72%.
  - **[status]** code climate: 3.7.

## 0.2.1 (2016-06-18)

  - **[new]** mocha test count: 55.
  - **[new]** include test coverage: istanbul.
  - **[fix]** empty code compile.
  - **[fix]** minor fixes.

## 0.2.0 (2016-06-11)

  - **[optimize]** Optimizations.
  - **[optimize]** public files deleted.
  - **[optimize]** repository files minimised from 6.7mb to 0.8mb.

## 0.0.2 (2015-09-13)

  - **[new]** gulp implementation.
  - **[optimize]** css files are now scss.
  - **[optimize]** html files are now jade.
  - **[optimize]** scripts are now minimised.
  - **[optimize]** public files minimised from 11.5mb to 6.7mb.

## 0.0.1 (2015-08-23)

  - **[new]** commands: variables.
  - **[new]** commands: output
  - **[new]** commands: if-else statements.
  - **[new]** commands: loops: repeats N times.
  - **[new]** translations: languages: Armenian, Russian, Georgian, Japanese.
  - **[new]** translations: multilingual syntax.
  - **[new]** translations: text translation via Yandex.
  - **[new]** IDE: toolbar: compile.
  - **[new]** IDE: toolbar: change translation.
  - **[new]** Terminal.
  - **[new]** syntax highlight.
  - **[new]** programming code is not case sensitive.
  - **[new]** unicode scope support..
