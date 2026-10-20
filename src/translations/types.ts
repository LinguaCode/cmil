import type {Command, ErrorId} from '../constants/index.ts';

/** The words of each command in one language; the first is the main one, which translate() writes. */
export type Words = Record<Command, string[]>;

/** Notes that ask native speakers to check the words of some commands. */
export type Notes = Partial<Record<Command, string>>;

/** The message of each error, with placeholders like {line}. */
export type Messages = Record<ErrorId, string>;

/** The commands and the error messages of one language. */
export type Translation = {
  words: Words;
  notes?: Notes;
  messages: Messages;
};
