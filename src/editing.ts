/**
 * What any editor of CMIL programs needs, CodeMirror or another one through a language server: the tokens of a
 * program with their places, its problems with the range each marks, the completions at a place, and the language
 * a program is written in. Places count lines and characters from 0, characters in UTF-16 code units, as JavaScript
 * and the Language Server Protocol count them; the entry cmil/codemirror is made of these, so an editor and a
 * language server never show a program differently.
 */
import {WARNING} from './constants/index.ts';
import type {ProgramError} from './core/types.ts';
import {
  commandsOf,
  quotesOf,
  segmentsOf,
  warningsOf,
  type CommandKind,
  type LineSegment,
  type Warning
} from './editor.ts';
import {scan} from './core/words.ts';
import {messageOf} from './messages.ts';
import {check} from './session.ts';
import TRANSLATION from './translations/index.ts';

/** A kind of token: a command by its kind, like block for if, a name, a text, a number, a comment, a symbol, or invalid. */
export type Token =
  | 'block'
  | 'statement'
  | 'part'
  | 'operator'
  | 'value'
  | 'function'
  | 'name'
  | 'string'
  | 'number'
  | 'comment'
  | 'symbol'
  | 'invalid';

/** A place in a program: its line and the character in it, both from 0. */
export type Position = {line: number; character: number};

//the lines of a program, as CMIL reads them, with Unix or Windows line endings
const linesOf = (sourceCode: string) => sourceCode.replace(/\r/g, '').split('\n');

//the kind of each command of a language
export const kindsOf = (language: string): Map<string, CommandKind> =>
  new Map(commandsOf(language).map(({command, kind}) => [command, kind]));

const tokenOf = (segment: LineSegment, kinds: Map<string, CommandKind>): Token | null => {
  switch (segment.type) {
    case 'keyword':
      return kinds.get(segment.command ?? '') ?? 'statement';
    case 'operator':
      return 'symbol';
    case 'space':
      return null;
    case 'other':
      return 'invalid';
    default:
      return segment.type;
  }
};

//the tokens of a line with where each starts and ends in it
export const placedTokensOf = (
  line: string,
  language: string
): {text: string; from: number; to: number; token: Token | null}[] => {
  const kinds = kindsOf(language);
  let from = 0;
  return segmentsOf(line, language).map(segment => {
    const at = from;
    from += segment.text.length;
    return {text: segment.text, from: at, to: from, token: tokenOf(segment, kinds)};
  });
};

/**
 * The tokens of a line, as the editor colors them, for code shown without an editor; spaces have none.
 *
 * @example
 * tokensOf('print(x)', 'en');
 * // returns print (function), ( (symbol), x (name), ) (symbol)
 */
export const tokensOf = (line: string, language: string): {text: string; token: Token | null}[] =>
  placedTokensOf(line, language).map(({text, token}) => ({text, token}));

/**
 * The types of the Language Server Protocol's semantic tokens that the tokens of CMIL have, its legend: a command
 * is a keyword, a function a function, a name a variable, true, false, pi and e enumMember, as the values a language
 * names, and a symbol an operator.
 */
export const SEMANTIC_TOKEN_TYPES = Object.freeze([
  'keyword',
  'function',
  'variable',
  'enumMember',
  'string',
  'number',
  'comment',
  'operator'
] as const);

export type SemanticTokenType = (typeof SEMANTIC_TOKEN_TYPES)[number];

//the type of each token, and none for a character that is a syntax error, which its problem marks
const SEMANTIC_TYPES: Record<Token, SemanticTokenType | null> = {
  block: 'keyword',
  statement: 'keyword',
  part: 'keyword',
  operator: 'keyword',
  value: 'enumMember',
  function: 'function',
  name: 'variable',
  string: 'string',
  number: 'number',
  comment: 'comment',
  symbol: 'operator',
  invalid: null
};

/**
 * The tokens of a program that have a type of SEMANTIC_TOKEN_TYPES, line by line, each on its line, in order and
 * apart: where it starts, its length, its type and its token.
 *
 * @example
 * tokensOfProgram('x = 1\nprint(x)', 'en');
 * // returns {line: 0, character: 0, length: 1, type: 'variable', token: 'name'}, … {line: 1, character: 0,
 * // length: 5, type: 'function', token: 'function'}, …
 */
export const tokensOfProgram = (
  sourceCode: string,
  language: string
): {line: number; character: number; length: number; type: SemanticTokenType; token: Token}[] =>
  linesOf(sourceCode).flatMap((text, line) =>
    placedTokensOf(text, language).flatMap(({from, to, token}) => {
      const type = token && SEMANTIC_TYPES[token];
      return type ? [{line, character: from, length: to - from, type, token: token!}] : [];
    })
  );

/** A problem of a program: an error, or a warning about what it may not mean, with its range and its message. */
export type Problem = {from: Position; to: Position; severity: 'error' | 'warning'; message: string};

//where the mark of an error at a character of a line ends: at the bracket that closes one opened before it, like
//the ) of print(x), or at the end of the line
const endOf = (text: string, from: number, language: string): number => {
  let depth = 0;
  for (const {text: part, from: at, token} of placedTokensOf(text, language)) {
    if (at < from || token !== 'symbol') continue;
    if (part === '(' || part === '[') depth++;
    if (part === ')' || part === ']') {
      if (!depth && at > from) return at;
      depth = Math.max(depth - 1, 0);
    }
  }
  return text.length;
};

/**
 * The problem of an error or a warning of a program, with its message in a language, by default the program's: an
 * error marks from its column to the end of its value or its line, or the whole line, without its indentation, when
 * it has no column, and a warning its text. An error without a line, like a timeout, has none.
 */
export const problemOfError = (
  sourceCode: string,
  error: ProgramError | Warning,
  language: string,
  messageLanguage = language
): Problem | null => {
  const lines = linesOf(sourceCode);
  if (!('line' in error) || error.line < 1 || error.line > lines.length) return null;
  const line = error.line - 1;
  const text = lines[line];
  const message = messageOf(error, messageLanguage);
  if (error.id === WARNING.NUMBER_TEXT) {
    const from = error.column - 1;
    return {
      from: {line, character: from},
      to: {line, character: from + error.text.length},
      severity: 'warning',
      message
    };
  }
  const column = 'column' in error && error.column ? error.column - 1 : null;
  const at = column !== null && column < text.length;
  return {
    from: {line, character: at ? column : text.length - text.trimStart().length},
    to: {line, character: at ? endOf(text, column, language) : text.length},
    severity: 'error',
    message
  };
};

/**
 * The problems of a program as it's written: its first error, check(), or, when it has none, its warnings,
 * warningsOf(), with their messages in a language, by default the program's.
 *
 * @example
 * problemsOf('print(x', 'en');
 * // returns [{from: {line: 0, character: 0}, to: {line: 0, character: 7}, severity: 'error', message: '…'}]
 */
export const problemsOf = (sourceCode: string, language: string, messageLanguage = language): Problem[] => {
  const error = check(sourceCode, language);
  return (error ? [error] : warningsOf(sourceCode, language)).flatMap(
    mark => problemOfError(sourceCode, mark, language, messageLanguage) ?? []
  );
};

//whether a text ends with its closing quote, which isn't escaped
const closed = (text: string, close: string | undefined) => {
  for (let i = 1; i < text.length; i++) {
    if (text[i] === '\\') i++;
    else if (text[i] === close) return true;
  }
  return false;
};

/**
 * Whether the text of a line before a place ends inside a text or a comment, where quotes are typed as they are and
 * nothing is completed.
 */
export const insideText = (before: string, language: string): boolean => {
  const last = segmentsOf(before, language).at(-1);
  if (last?.type === 'comment') return true;
  if (last?.type !== 'string') return false;

  const quotes = new Map(quotesOf(language));
  return !closed(last.text, quotes.get(last.text[0]));
};

/**
 * A completion: a word of a command by its kind, or a name of the program, a variable; an editor completes a function
 * with its brackets.
 */
export type Completion = {label: string; kind: 'keyword' | 'constant' | 'function' | 'variable'};

const COMPLETION_KINDS: Record<CommandKind, Completion['kind']> = {
  block: 'keyword',
  statement: 'keyword',
  part: 'keyword',
  operator: 'keyword',
  value: 'constant',
  function: 'function'
};

//the characters of the word before a place, which a completion replaces as it's typed
export const WORD = /[\p{L}\p{M}\p{N}_]+$/u;

/**
 * The names of a program, without one, like the name being typed.
 */
export const namesOf = (lines: Iterable<string>, language: string, typed = ''): string[] => {
  const names = new Set<string>();
  for (const line of lines) {
    segmentsOf(line, language).forEach(({type, text}) => type === 'name' && names.add(text));
  }
  names.delete(typed);
  return [...names];
};

/**
 * The completions of the commands of a language: every word of each, by its kind.
 */
export const commandCompletionsOf = (language: string): Completion[] =>
  commandsOf(language).flatMap(({words, kind}) => words.map(label => ({label, kind: COMPLETION_KINDS[kind]})));

/**
 * The completions at a place of a program: the words of the language's commands and the names of the program,
 * without the word being typed there; none inside a text or a comment.
 *
 * @example
 * completionsAt('name = 1\npr', 'en', {line: 1, character: 2});
 * // returns {label: 'print', kind: 'function'}, … {label: 'name', kind: 'variable'}
 */
export const completionsAt = (sourceCode: string, language: string, {line, character}: Position): Completion[] => {
  const lines = linesOf(sourceCode);
  const before = (lines[line] ?? '').slice(0, character);
  const typed = WORD.exec(before)?.[0] ?? '';
  if (insideText(before.slice(0, before.length - typed.length), language)) return [];
  const names = namesOf(lines, language, typed).map(label => ({label, kind: 'variable' as const}));
  return [...commandCompletionsOf(language), ...names];
};

//how a program reads in a language: a point for each command, outside texts and comments, and one less for each
//part it can't read, like the „ and “ of a Czech text in English, which then reads the words of the text as code,
//its commands too; and how many of its texts are in the main quotes of the language, which tell apart languages of
//the same commands, like «» in Norwegian and ”” in Swedish
const readingOf = (lines: string[], language: string): {score: number; quoted: number} => {
  const [[open]] = quotesOf(language);
  let score = 0;
  let quoted = 0;
  for (const line of lines) {
    segmentsOf(line, language).forEach(({type}) => (score += type === 'keyword' ? 1 : type === 'other' ? -1 : 0));
    quoted += scan(line, language).filter(({type, text}) => type === 'string' && text[0] === open).length;
  }
  return {score, quoted};
};

/**
 * The language a program is written in, of the candidates, by default every language of CMIL: of the languages that
 * read a command in it, one in which it has no error, check(), before the others, since a name it gives a value, like
 * a, may be a command of another language, there; then the one it reads as best, with the most commands outside its
 * texts and comments, less the parts it can't read; then the one in whose main quotes it has the most texts. null
 * when no language reads any command, or two read it as well.
 *
 * @example
 * languageOf('արտածել(«Բարև»)', ['en', 'hy-AM']);
 * // returns 'hy-AM'
 */
export const languageOf = (
  sourceCode: string,
  candidates: readonly string[] = Object.keys(TRANSLATION)
): string | null => {
  const lines = linesOf(sourceCode);
  const ranked = [...new Set(candidates)]
    .map(language => ({language, ...readingOf(lines, language)}))
    .filter(({score}) => score > 0)
    .map(read => ({...read, runs: Number(!check(sourceCode, read.language))}));
  const order = (a: (typeof ranked)[number], b: (typeof ranked)[number]) =>
    b.runs - a.runs || b.score - a.score || b.quoted - a.quoted;
  const [first, second] = ranked.sort(order);
  if (!first || (second && !order(first, second))) return null;
  return first.language;
};
