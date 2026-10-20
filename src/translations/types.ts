import type {Command} from '../constants/index.ts';

/** The words of each command in one language; the first is the main one, which translate() writes. */
export type Words = Record<Command, string[]>;

/** Notes that ask native speakers to check the words of some commands. */
export type Notes = Partial<Record<Command, string>>;

/** The commands of one language. */
export type Translation = {
  words: Words;
  notes?: Notes;
};
