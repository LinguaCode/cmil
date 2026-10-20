/**
 * Help for editors of CMIL programs: the parts of a line to color, the commands of a language, and its quotes.
 */
import {COMMAND, type Command} from './constants/index.ts';
import {OPERATORS} from './core/lexer.ts';
import {DECIMAL_POINTS, DIGIT, IDENTIFIER_PART, QUOTES, scan} from './core/words.ts';
import TRANSLATION, {type Quotes} from './translations/index.ts';

/** A part of a line of source code; a keyword has its command. */
export type LineSegment = {
  type: 'keyword' | 'name' | 'string' | 'number' | 'comment' | 'operator' | 'space' | 'other';
  text: string;
  command?: string;
};

/**
 * What a command does: starts a block, is a statement, is a part of one, combines values, is a value, or is a function.
 */
export type CommandKind = 'block' | 'statement' | 'part' | 'operator' | 'value' | 'function';

const KINDS: Record<Command, CommandKind> = {
  [COMMAND.IF]: 'block',
  [COMMAND.ELSE]: 'block',
  [COMMAND.WHILE]: 'block',
  [COMMAND.DO]: 'block',
  [COMMAND.REPEAT]: 'block',
  [COMMAND.FOR]: 'block',
  [COMMAND.FUNCTION]: 'block',

  [COMMAND.INPUT]: 'statement',
  [COMMAND.PRINT]: 'statement',
  [COMMAND.ADD]: 'statement',
  [COMMAND.REMOVE]: 'statement',
  [COMMAND.BREAK]: 'statement',
  [COMMAND.CONTINUE]: 'statement',
  [COMMAND.RETURN]: 'statement',

  [COMMAND.THEN]: 'part',
  [COMMAND.TIMES]: 'part',
  [COMMAND.FROM]: 'part',
  [COMMAND.TO]: 'part',
  [COMMAND.STEP]: 'part',
  [COMMAND.IN]: 'part',
  [COMMAND.INTO]: 'part',
  [COMMAND.OUT_OF]: 'part',

  [COMMAND.OR]: 'operator',
  [COMMAND.AND]: 'operator',
  [COMMAND.NOT]: 'operator',

  [COMMAND.FALSE]: 'value',
  [COMMAND.TRUE]: 'value',
  [COMMAND.PI]: 'value',
  [COMMAND.E]: 'value',

  [COMMAND.SQR]: 'function',
  [COMMAND.SQRT]: 'function',
  [COMMAND.POW]: 'function',
  [COMMAND.ROUND]: 'function',
  [COMMAND.CEIL]: 'function',
  [COMMAND.FLOOR]: 'function',
  [COMMAND.LG]: 'function',
  [COMMAND.LN]: 'function',
  [COMMAND.LOG]: 'function',
  [COMMAND.ABS]: 'function',
  [COMMAND.SIN]: 'function',
  [COMMAND.COS]: 'function',
  [COMMAND.TAN]: 'function',
  [COMMAND.COT]: 'function',
  [COMMAND.ARCSIN]: 'function',
  [COMMAND.ARCCOS]: 'function',
  [COMMAND.ARCTAN]: 'function',
  [COMMAND.ARCCOT]: 'function',
  [COMMAND.RANDOM]: 'function',
  [COMMAND.LENGTH]: 'function',
  [COMMAND.UPPER]: 'function',
  [COMMAND.LOWER]: 'function',
  [COMMAND.NUMBER]: 'function',
  [COMMAND.TEXT]: 'function',
  [COMMAND.SPLIT]: 'function',
  [COMMAND.JOIN]: 'function'
};

const known = (language: string) => {
  if (!Object.hasOwn(TRANSLATION, language)) throw new Error(`Unknown language: ${language}`);
  return TRANSLATION[language];
};

//the numbers, operators and spaces between the words and texts of a line; a number with letters, like 1x, is other
const splitOther = (text: string): LineSegment[] => {
  const segments: LineSegment[] = [];
  let i = 0;
  while (i < text.length) {
    const start = i;
    if (/[ \t]/.test(text[i])) {
      while (i < text.length && /[ \t]/.test(text[i])) i++;
      segments.push({type: 'space', text: text.slice(start, i)});
    } else if (DIGIT.test(text[i])) {
      while (i < text.length && DIGIT.test(text[i])) i++;
      if (DECIMAL_POINTS.includes(text[i]) && DIGIT.test(text[i + 1] || '')) {
        i++;
        while (i < text.length && DIGIT.test(text[i])) i++;
      }
      const number = i;
      while (i < text.length && IDENTIFIER_PART.test(text[i])) i++;
      segments.push({type: i === number ? 'number' : 'other', text: text.slice(start, i)});
    } else {
      const operator = OPERATORS.find(candidate => text.startsWith(candidate, i));
      i += operator ? operator.length : 1;
      segments.push({type: operator ? 'operator' : 'other', text: text.slice(start, i)});
    }
  }
  return segments;
};

/**
 * Splits a line of source code into the parts an editor colors: the keywords of the language, with their commands,
 * names, texts, numbers, comments, operators, spaces, and other characters, which are syntax errors.
 * The texts of the parts make up the line.
 *
 * @example
 * segmentsOf('print 1 # one', 'en');
 * // returns keyword 'print' (print), space ' ', number '1', space ' ', comment '# one'
 */
export const segmentsOf = (line: string, language: string): LineSegment[] => {
  known(language);
  return scan(line, language).flatMap((segment): LineSegment[] => {
    if (segment.type === 'keyword') return [{type: 'keyword', text: segment.text, command: segment.command}];
    if (segment.type === 'other') return splitOther(segment.text);
    return [{type: segment.type, text: segment.text}];
  });
};

/**
 * The commands of a language, each with its words, the first of which translate() writes, and its kind.
 */
export const commandsOf = (language: string): {command: string; words: string[]; kind: CommandKind}[] =>
  Object.entries(known(language).words).map(([command, words]) => ({
    command,
    words: [...words],
    kind: KINDS[command as Command]
  }));

/**
 * The quotes of texts in a language: its main quotes, which translate() writes, first, then the others it reads.
 */
export const quotesOf = (language: string): Quotes[] => {
  const all = [...known(language).quotes, ...QUOTES];
  return all.filter(([open], index) => all.findIndex(([other]) => other === open) === index).map(([a, b]) => [a, b]);
};
