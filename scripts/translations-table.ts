/**
 * Writes docs/translations.md, the words of every language, from src/translations.
 * Run it with npm run translations-table after changing a language file; a test checks that the file is current.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {COMMAND} from '../src/constants/index.ts';
import translations from '../src/translations/index.ts';

export const DOCS_PATH = path.join(import.meta.dirname, '../docs/translations.md');

const ISSUE_FORM = 'https://github.com/LinguaCode/cmil/issues/new?template=translation.yml';

//the English name and the name in the language itself
const NAMES: Record<string, [string, string]> = {
  ar: ['Arabic', 'العربية'],
  ca: ['Catalan', 'Català'],
  cs: ['Czech', 'Čeština'],
  da: ['Danish', 'Dansk'],
  de: ['German', 'Deutsch'],
  el: ['Greek', 'Ελληνικά'],
  en: ['English', 'English'],
  'es-ES': ['Spanish', 'Español'],
  fi: ['Finnish', 'Suomi'],
  fr: ['French', 'Français'],
  he: ['Hebrew', 'עברית'],
  hu: ['Hungarian', 'Magyar'],
  'hy-AM': ['Armenian', 'Հայերեն'],
  it: ['Italian', 'Italiano'],
  ja: ['Japanese', '日本語'],
  ka: ['Georgian', 'ქართული'],
  ko: ['Korean', '한국어'],
  nl: ['Dutch', 'Nederlands'],
  no: ['Norwegian', 'Norsk'],
  pl: ['Polish', 'Polski'],
  'pt-PT': ['Portuguese', 'Português'],
  ro: ['Romanian', 'Română'],
  ru: ['Russian', 'Русский'],
  sk: ['Slovak', 'Slovenčina'],
  sl: ['Slovenian', 'Slovenščina'],
  sq: ['Albanian', 'Shqip'],
  sr: ['Serbian', 'Српски'],
  'sv-SE': ['Swedish', 'Svenska'],
  th: ['Thai', 'ไทย'],
  uk: ['Ukrainian', 'Українська'],
  vi: ['Vietnamese', 'Tiếng Việt'],
  'zh-CN': ['Chinese', '中文']
};

const MEANINGS: Record<string, string> = {
  [COMMAND.INPUT]: 'waits for the user and stores the answer in a variable',
  [COMMAND.OUTPUT]: 'prints a value',
  [COMMAND.IF]: 'runs the block below when its condition is true',
  [COMMAND.ELSE]: 'runs the block below when the conditions before it are false',
  [COMMAND.THEN]: 'may end the condition of if',
  [COMMAND.OR]: 'true when either side is true',
  [COMMAND.AND]: 'true when both sides are true',
  [COMMAND.NOT]: 'the opposite of a boolean',
  [COMMAND.FALSE]: 'the boolean false',
  [COMMAND.TRUE]: 'the boolean true',
  [COMMAND.DO]: 'starts a loop whose condition comes after it, in do … while',
  [COMMAND.WHILE]: 'repeats the block below while its condition is true; also ends do … while',
  [COMMAND.REPEAT]: 'repeats the block below, in repeat … times',
  [COMMAND.TIMES]: 'ends repeat … times',
  [COMMAND.BREAK]: 'leaves the innermost loop',
  [COMMAND.CONTINUE]: 'starts the next pass of the innermost loop',
  [COMMAND.FUNCTION]: 'reserved, not supported yet',
  [COMMAND.RANDOM]: 'a random whole number',
  [COMMAND.POW]: 'x to the power of y',
  [COMMAND.SQR]: 'x squared',
  [COMMAND.SQRT]: 'the square root of x',
  [COMMAND.ROUND]: 'the nearest whole number',
  [COMMAND.FLOOR]: 'the lower whole number',
  [COMMAND.CEIL]: 'the higher whole number',
  [COMMAND.ABS]: 'x without its sign',
  [COMMAND.SIN]: 'sine',
  [COMMAND.COS]: 'cosine',
  [COMMAND.TAN]: 'tangent',
  [COMMAND.CTG]: 'cotangent',
  [COMMAND.ARCSIN]: 'inverse sine',
  [COMMAND.ARCCOS]: 'inverse cosine',
  [COMMAND.ARCTAN]: 'inverse tangent',
  [COMMAND.ARCCTG]: 'inverse cotangent',
  [COMMAND.LOG]: 'logarithm in any base',
  [COMMAND.LN]: 'natural logarithm',
  [COMMAND.LG]: 'logarithm in base 10',
  [COMMAND.PI]: 'the constant π, 3.14159…',
  [COMMAND.E]: 'the constant e, 2.71828…'
};

const words = (definition: string) =>
  definition
    .split('|')
    .map(word => `\`${word}\``)
    .join(', ');

//the anchor GitHub gives a heading
const anchor = (heading: string) =>
  heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');

/**
 * Returns the contents of docs/translations.md.
 */
export const translationsTable = (): string => {
  const commands = translations.en.map(({command}) => command);
  const languages = Object.keys(translations).sort((a, b) => NAMES[a][0].localeCompare(NAMES[b][0], 'en'));

  const sections = languages.map(language => {
    const [name, native] = NAMES[language];
    const byCommand = new Map(translations[language].map(translation => [translation.command, translation]));
    const notes = translations[language].filter(({note}) => note);

    const rows = commands.map(command => {
      const {definition} = byCommand.get(command) ?? {definition: ''};
      return `| ${translations.en.find(translation => translation.command === command)?.definition} | ${MEANINGS[command]} | ${words(definition)} |`;
    });

    return [
      `## ${name} (${language})`,
      '',
      `${native}${notes.length ? ` · ${notes.length} to check` : ''}`,
      '',
      `| English | Meaning | ${name} |`,
      '|---|---|---|',
      ...rows,
      ...(notes.length
        ? [
            '',
            'To check:',
            '',
            ...notes.map(
              ({command, definition, note}) =>
                `- ${words(definition)} (${translations.en.find(translation => translation.command === command)?.definition}): ${note}`
            )
          ]
        : [])
    ].join('\n');
  });

  const index = languages.map(language => {
    const [name] = NAMES[language];
    const count = translations[language].filter(({note}) => note).length;
    return `- [${name} (${language})](#${anchor(`${name} (${language})`)})${count ? `, ${count} to check` : ''}`;
  });

  return [
    '# Translations',
    '',
    'The words of the CMIL commands in each language, from [`src/translations/languages`](../src/translations/languages). A command may have more than one word; any of them works, and `translate()` writes the first.',
    '',
    `Do you speak one of these languages? If a word is wrong, unusual or hard for children, [suggest a better one](${ISSUE_FORM}), or change the language file yourself (see [CONTRIBUTING.md](../CONTRIBUTING.md#how-to-translate)). The words *to check* need a native speaker most.`,
    '',
    'This file is generated by `npm run translations-table`; edit the language files instead.',
    '',
    ...index,
    '',
    sections.join('\n\n'),
    ''
  ].join('\n');
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  fs.writeFileSync(DOCS_PATH, translationsTable());
}
