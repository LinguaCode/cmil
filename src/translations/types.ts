import type {Command, ErrorId, WarningId} from '../constants/index.ts';

/** The words of each command in one language; the first is the main one, which translate() writes. */
export type Words = Record<Command, string[]>;

/** A message with a form for each plural category of its {count} in the language, like one and other in English. */
export type Plural = {other: string} & Partial<Record<Exclude<Intl.LDMLPluralRule, 'other'>, string>>;

/** The message of each error, with placeholders like {line}. */
export type Messages = Record<ErrorId, string | Plural>;

/** The message of each warning about a program, with placeholders like {text}. */
export type Warnings = Record<WarningId, string>;

/** Why a program can't be converted into a language whose values have one type each, with {line} and {target}. */
export type Conversion = {mixedTypes: string; mixedItems: string; fixedArrays: string};

/** A pair of quotes around texts, like « and ». */
export type Quotes = [open: string, close: string];

/** The commands, the quotes, and the messages of the errors and the warnings of one language. */
export type Translation = {
  words: Words;
  /** The quotes of texts in the language, besides "…", '…' and «…», which every language has; translate() writes the first. */
  quotes: Quotes[];
  messages: Messages;
  warnings: Warnings;
  conversion: Conversion;
};
