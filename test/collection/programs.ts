/**
 * The programs of the specification, each with its path, like "lists > a list of lists", and the language it is
 * written in: the successes and the errors in English, the tutorials in Armenian.
 */
import errors from './errors/index.ts';
import successes from './successes/index.ts';
import tutorials from './tutorials.ts';
import type {Case, Source} from './types.ts';

export type Spec = Case & {path: string; language: string};

/** The cases of sources in a language, each with the path of its groups and its title. */
export const specOf = (sources: Source[], language: string, group: string[] = []): Spec[] =>
  sources.flatMap(source =>
    'sources' in source
      ? specOf(source.sources, language, [...group, source.group])
      : [{...source, language, path: [...group, source.title].join(' > ')}]
  );

/** The programs that run to their end, with what they print. */
export const SUCCESSES: Spec[] = [...specOf(successes, 'en'), ...specOf(tutorials, 'hy-AM')].filter(
  ({code, output, errorId}) => code && output !== undefined && !errorId
);

/** The programs that stop with an error. */
export const ERRORS: Spec[] = specOf(errors, 'en').filter(({code, errorId}) => code && errorId);
