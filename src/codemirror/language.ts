/**
 * The colors of CMIL programs in CodeMirror, in each of CMIL's languages: commands by their kind, names, texts,
 * numbers and comments, read by CMIL itself. The highlighter gives each kind of token a class, like cmil-block for if
 * and while, and the page gives each class its color.
 */
import {StreamLanguage} from '@codemirror/language';
import {Tag, tagHighlighter, tags} from '@lezer/highlight';

import {commandsOf} from '../editor.ts';
import {placedTokensOf, type Token} from '../editing.ts';

//a tag for each kind of token, so each has its own class
const TAGS: Record<Token, Tag> = {
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

type State = {tokens: ReturnType<typeof placedTokensOf>; index: number};

//the words of a command as a pattern that matches the whole text before the cursor
const linePattern = (words: string[]) =>
  new RegExp(`^\\s*(?:${words.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`, 'u');

/**
 * CMIL in one of its languages: each line is split into the tokens of tokensOf(), as a language server splits it.
 */
export const cmilLanguage = (language: string): StreamLanguage<State> => {
  const elseWords = commandsOf(language).find(({command}) => command === 'else')?.words;

  return StreamLanguage.define<State>({
    name: 'cmil',
    startState: () => ({tokens: [], index: 0}),
    copyState: ({tokens, index}) => ({tokens, index}),
    token(stream, state) {
      if (stream.sol()) {
        state.tokens = placedTokensOf(stream.string, language);
        state.index = 0;
      }

      const token = state.tokens[state.index++];
      if (!token) {
        stream.skipToEnd();
        return null;
      }
      stream.pos = token.to;
      return token.token;
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
