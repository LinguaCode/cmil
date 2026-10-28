/**
 * The colors of CMIL programs in CodeMirror, in each of CMIL's languages: commands by their kind, names, texts,
 * numbers and comments, read by CMIL itself. The highlighter gives each kind of token a class, like cmil-block for if
 * and while, and the page gives each class its color.
 */
import {StreamLanguage} from '@codemirror/language';
import {Tag, tagHighlighter, tags} from '@lezer/highlight';

import {commandsOf, segmentsOf, type CommandKind, type LineSegment} from '../editor.ts';

//a tag for each kind of token, so each has its own class
const TAGS = {
  block: Tag.define(tags.controlKeyword),
  statement: Tag.define(tags.keyword),
  part: Tag.define(tags.keyword),
  operator: Tag.define(tags.operatorKeyword),
  value: Tag.define(tags.atom),
  function: Tag.define(tags.name),
  name: tags.variableName,
  string: tags.string,
  number: tags.number,
  comment: tags.lineComment,
  symbol: tags.operator,
  invalid: tags.invalid
};

/** A kind of token: a command by its kind, like block for if, a name, a text, a number, a comment, a symbol, or invalid. */
export type Token = keyof typeof TAGS;

/** The class of each kind of token, like cmil-block, which a page gives its color. */
export const tokenClasses: Readonly<Record<Token, string>> = Object.freeze(
  Object.fromEntries(Object.keys(TAGS).map(token => [token, `cmil-${token}`])) as Record<Token, string>
);

/**
 * How an editor colors programs: with the classes of tokenClasses, the default, or, with classes false, without
 * them, so that a highlighter of the page colors their tokens by their tags, which come from CodeMirror's own, like
 * keyword and string. A highlighter that isn't a fallback, like that of the classes, turns off the fallback ones,
 * like syntaxHighlighting(defaultHighlightStyle, {fallback: true}).
 */
export type ColorOptions = {classes?: boolean};

/** Gives the tokens of CMIL, and those of the converted programs of cmil/codemirror/targets, their classes. */
export const highlighter = tagHighlighter(
  Object.entries(TAGS).map(([token, tag]) => ({tag, class: tokenClasses[token as Token]}))
);

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

/**
 * The tokens of a line, as the editor colors them, for code shown without an editor; spaces have none.
 *
 * @example
 * tokensOf('print(x)', 'en');
 * // returns print (function), ( (symbol), x (name), ) (symbol)
 */
export const tokensOf = (line: string, language: string): {text: string; token: Token | null}[] => {
  const kinds = kindsOf(language);
  return segmentsOf(line, language).map(segment => ({text: segment.text, token: tokenOf(segment, kinds)}));
};

type State = {segments: LineSegment[]; index: number};

//the words of a command as a pattern that matches the whole text before the cursor
const linePattern = (words: string[]) =>
  new RegExp(`^\\s*(?:${words.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`, 'u');

/**
 * CMIL in one of its languages: each line is split by segmentsOf(), and each part becomes a token.
 */
export const cmilLanguage = (language: string): StreamLanguage<State> => {
  const kinds = kindsOf(language);
  const elseWords = commandsOf(language).find(({command}) => command === 'else')?.words;

  return StreamLanguage.define<State>({
    name: 'cmil',
    startState: () => ({segments: [], index: 0}),
    copyState: ({segments, index}) => ({segments, index}),
    token(stream, state) {
      if (stream.sol()) {
        state.segments = segmentsOf(stream.string, language);
        state.index = 0;
      }

      const segment = state.segments[state.index++];
      if (!segment) {
        stream.skipToEnd();
        return null;
      }
      stream.pos += segment.text.length;
      return tokenOf(segment, kinds);
    },
    tokenTable: TAGS,
    languageData: {
      commentTokens: {line: '#'},
      //the quotes of the language are closed by closeQuotes()
      closeBrackets: {brackets: ['(', '[']},
      //else goes back to the indentation of its if
      indentOnInput: elseWords && linePattern(elseWords)
    }
  });
};
