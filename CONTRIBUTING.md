# Contributing to LinguaCode

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

The following is a set of guidelines for contributing to LinguaCode and its modules, which are hosted in the [LinguaCode Organization](https://github.com/LinguaCode) on GitHub. These are just guidelines, not rules, use your best judgment and feel free to propose changes to this document in a pull request.

#### Table Of Contents

[How you can contribute](#how-you-can-contribute)

[How to translate](#how-to-translate)

[License](#license)

## How you can contribute
Whether you are a programmer or not, you can contribute to LinguaCode. Below are some ideas we've modified from [this great blog post](http://blog.smartbear.com/programming/14-ways-to-contribute-to-open-source-without-being-a-programming-genius-or-a-rock-star/) (more details at the link). You can check out a similar list [here](http://24pullrequests.com/contributing). If you see anything below that doesn't make sense, _relax_--find something you understand and start from there.

1. Try CMIL at [LinguaCode](https://linguacode.otanim.com).
2. Follow along on GitHub. Looks like you're in the right place already!
   See all project repositories at https://github.com/LinguaCode.
3. Diagnose a bug by creating an issue.
4. Suggest an improvement by creating an issue.
5. Close resolved issues ([here's the list](https://github.com/LinguaCode/cmil/issues))
6. [Test the code](https://github.com/LinguaCode/cmil/blob/master/README.md).
7. Fix a bug/resolve an issue.
8. Write a test.
9. Add a comment to the code.
10. Create an example.
11. Answer a question.
12. Write a blog post.
13. Improve the core of CMIL.

## How to translate
The commands of LinguaCode are translated in this repository, one file per language in [`src/translations/languages`](src/translations/languages). [`docs/translations.md`](docs/translations.md) lists the words of every language with their meaning.

To suggest a better word without changing any code, [open a translation issue](https://github.com/LinguaCode/cmil/issues/new?template=translation.yml).

To change the words yourself:

1. Fork this repository.
2. To add a language, copy `src/translations/languages/en.ts` to a file named after the language code, for example `it.ts`, or `pt-PT.ts` for a regional variant, add it to `src/translations/index.ts`, and add its name to `scripts/translations-table.ts`. To improve a language, edit its existing file.
3. Translate the words of every command. Join the words of a phrase with `_`, for example `tant_que`, and list alternative spellings, for example `and: ['և', 'եւ', 'ու']`; the first is the main one. In `quotes`, list the quotes of texts in the language, its main pair first, like `[['„', '“']]` in German; `«…»`, `"…"` and `'…'` work in every language.
4. Run `npm run translations-table`, which updates `docs/translations.md`, then `npm test`, which checks that every language defines every command, gives every word only one command, runs programs and writes its messages in its own punctuation, like ՛ and ։ in Armenian or the full-width ： in Japanese, and open a pull request.
5. Take this :pizza: piece of pizza from us in return for help :blush:.

## License
LinguaCode is [licensed under GPLv3](https://github.com/LinguaCode/cmil/blob/master/LICENSE).

