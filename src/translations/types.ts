import type {Command, ErrorId} from '../constants/index.ts';

/** The words of each command in one language; the first is the main one, which translate() writes. */
export type Words = Record<Command, string[]>;

/** Notes that ask native speakers to check the words of some commands. */
export type Notes = Partial<Record<Command, string>>;

/** A message with a form for each plural category of its {count} in the language, like one and other in English. */
export type Plural = {other: string} & Partial<Record<Exclude<Intl.LDMLPluralRule, 'other'>, string>>;

/** The message of each error, with placeholders like {line}. */
export type Messages = Record<ErrorId, string | Plural>;

/** A pair of quotes around texts, like « and ». */
export type Quotes = [open: string, close: string];

/** The commands, the quotes and the error messages of one language. */
export type Translation = {
  words: Words;
  notes?: Notes;
  /** The quotes of texts in the language, besides "…", '…' and «…», which every language has; translate() writes the first. */
  quotes: Quotes[];
  messages: Messages;
};
