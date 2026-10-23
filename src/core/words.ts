/**
 * The words of the commands in each language, and the scanner that finds them in a line of source code.
 * The lexer turns the segments into tokens, and translate() replaces the words of one language with another's.
 */
import TRANSLATION, {type Quotes} from '../translations/index.ts';

/**
 * A part of a text: a text as written, with its value, or code in braces, which puts its value into the text; text
 * is the part as written, with the braces of code.
 */
export type TextPart =
  {type: 'text'; text: string; value: string} | {type: 'code'; text: string; segments: Segment[]; closed: boolean};

/** A part of a line; a text with code in braces, like "Hi, {name}", has its parts. */
export type Segment =
  | {type: 'keyword'; command: string; text: string}
  | {type: 'name'; text: string}
  | {type: 'string'; text: string; value: string; closed: boolean; parts?: TextPart[]}
  | {type: 'comment'; text: string}
  | {type: 'other'; text: string};

type Lexicon = {
  //a lower-cased word and its command
  single: Map<string, string>;
  //a lower-cased first word, and the second words that complete a command with it
  double: Map<string, Map<string, string>>;
  //the first word of each command, used when translating into this language
  first: Map<string, string>;
  //the opening quotes of texts and their closing ones
  quotes: Map<string, string>;
  //the quotes translate() writes
  main: Quotes;
};

//the quotes of texts in every language, besides the language's own
export const QUOTES: Quotes[] = [
  ['"', '"'],
  ["'", "'"],
  ['«', '»']
];

const ESCAPES: Record<string, string> = {
  n: '\n',
  t: '\t'
};

//the letters of the escapes of the characters that have one
const ESCAPED = new Map(Object.entries(ESCAPES).map(([letter, symbol]) => [symbol, letter]));

/**
 * Writes a value as a text in quotes, with the escapes readString() reads: a backslash before \ and before the closing
 * quote, \n for a new line and \t for a tab.
 *
 * @example
 * quote('a » b', ['«', '»']);
 * // returns '«a \\» b»'
 */
export const quote = (value: string, [open, close]: Quotes): string => {
  let text = open;
  for (const symbol of value) {
    const escape = ESCAPED.get(symbol);
    if (escape) text += `\\${escape}`;
    else if (symbol === '\\' || symbol === close) text += `\\${symbol}`;
    else text += symbol;
  }
  return text + close;
};

/**
 * Writes a value as a text in a program, like quote(), with \\{ before a brace, which would start code.
 */
export const quoteCode = (value: string, quotes: Quotes): string => quote(value, quotes).replaceAll('{', '\\{');

//the Armenian one dot leader is the decimal point on Armenian keyboards
export const DECIMAL_POINTS = ['.', '․'];

export const IDENTIFIER_START = /[\p{L}\p{M}_]/u;
export const IDENTIFIER_PART = /[\p{L}\p{M}\p{N}_]/u;
export const DIGIT = /[0-9]/;
const SPACE = /[ \t]/;

const cache = new Map<string, Lexicon>();

/**
 * The words of a language; the language must be one of the translations.
 */
export const wordsOf = (language: string): Lexicon => {
  const cached = cache.get(language);
  if (cached) return cached;

  const {words: commands, quotes} = TRANSLATION[language];
  const words: Lexicon = {
    single: new Map(),
    double: new Map(),
    first: new Map(),
    //the language's own quotes win over the quotes of every language
    quotes: new Map([...QUOTES, ...quotes]),
    main: quotes[0]
  };
  for (const [command, alternatives] of Object.entries(commands)) {
    words.first.set(command, alternatives[0]);

    for (const alternative of alternatives) {
      const parts = alternative.trim().toLowerCase().split(/\s+/);
      if (parts.length === 1) {
        words.single.set(parts[0], command);
      } else {
        if (!words.double.has(parts[0])) words.double.set(parts[0], new Map());
        words.double.get(parts[0])?.set(parts[1], command);
      }
    }
  }

  cache.set(language, words);
  return words;
};

const readWord = (line: string, start: number) => {
  let end = start;
  while (end < line.length && IDENTIFIER_PART.test(line[end])) end++;
  return line.slice(start, end);
};

//a text from its opening quote: its value, and its parts when it has code in braces, which is read like a line
const readString = (line: string, start: number, closingQuote: string, language: string) => {
  const parts: TextPart[] = [];
  let value = '';
  let from = start + 1;
  const text = (end: number) => (end > from ? [{type: 'text' as const, text: line.slice(from, end), value}] : []);
  const result = (end: number, closed: boolean) => {
    const all = [...parts, ...text(closed ? end - 1 : end)];
    const whole = all.map(part => (part.type === 'text' ? part.value : '')).join('');
    return {text: line.slice(start, end), value: whole, closed, ...(parts.length ? {parts: all} : {})};
  };

  for (let i = start + 1; i < line.length; i++) {
    const symbol = line[i];
    if (symbol === '\\' && i + 1 < line.length) {
      const escaped = line[++i];
      value += Object.hasOwn(ESCAPES, escaped) ? ESCAPES[escaped] : escaped;
    } else if (symbol === '{') {
      parts.push(...text(i));
      const code = scanCode(line, i + 1, language);
      parts.push({type: 'code', text: line.slice(i, code.end), segments: code.segments, closed: code.closed});
      from = code.end;
      value = '';
      if (!code.closed) return result(line.length, false);
      i = code.end - 1;
    } else if (symbol === closingQuote) {
      return result(i + 1, true);
    } else {
      value += symbol;
    }
  }

  return result(line.length, false);
};

//a number with the letters right after it, like 1x, which the lexer reports as a syntax error
const readNumber = (line: string, start: number) => {
  let end = start;
  while (end < line.length && DIGIT.test(line[end])) end++;
  if (DECIMAL_POINTS.includes(line[end]) && DIGIT.test(line[end + 1] || '')) {
    end++;
    while (end < line.length && DIGIT.test(line[end])) end++;
  }
  while (end < line.length && IDENTIFIER_PART.test(line[end])) end++;

  return line.slice(start, end);
};

/**
 * Splits one line into keywords of the language, names, texts, a comment and the rest.
 * A keyword is a whole word, or two words of a two-word command; case doesn't matter.
 *
 * @example
 * scan('print(1<pi)', 'en');
 * // returns keyword 'print', other '(1<', keyword 'pi', other ')'
 */
export const scan = (line: string, language: string): Segment[] => read(line, 0, language, false).segments;

//the code in the braces of a text, up to its }, and where it ends, after the }
const scanCode = (line: string, start: number, language: string) => read(line, start, language, true);

//the segments of a line from start; in braces, up to the } that ends them, where # is no comment
const read = (line: string, start: number, language: string, braces: boolean) => {
  const {single, double, quotes} = wordsOf(language);
  const segments: Segment[] = [];

  const pushOther = (text: string) => {
    const last = segments[segments.length - 1];
    if (last && last.type === 'other') last.text += text;
    else segments.push({type: 'other', text});
  };

  let i = start;
  while (i < line.length) {
    const symbol = line[i];

    if (braces && symbol === '}') {
      return {segments, end: i + 1, closed: true};
    } else if (symbol === '#' && !braces) {
      segments.push({type: 'comment', text: line.slice(i)});
      break;
    } else if (quotes.has(symbol)) {
      const string = readString(line, i, quotes.get(symbol) as string, language);
      segments.push({type: 'string', ...string});
      i += string.text.length;
    } else if (DIGIT.test(symbol)) {
      const number = readNumber(line, i);
      pushOther(number);
      i += number.length;
    } else if (IDENTIFIER_START.test(symbol)) {
      const word = readWord(line, i);
      const lower = word.toLowerCase();

      //a two-word command, like e vërtetë
      const end = i + word.length;
      let next = end;
      while (next < line.length && SPACE.test(line[next])) next++;
      const second = readWord(line, next);
      const pair = next > end ? double.get(lower)?.get(second.toLowerCase()) : undefined;

      if (pair) {
        segments.push({type: 'keyword', command: pair, text: line.slice(i, next + second.length)});
        i = next + second.length;
      } else {
        const command = single.get(lower);
        segments.push(command ? {type: 'keyword', command, text: word} : {type: 'name', text: word});
        i += word.length;
      }
    } else {
      pushOther(symbol);
      i++;
    }
  }

  return {segments, end: line.length, closed: false};
};

/**
 * Replaces the commands of one language with the first words of another, and the quotes of texts with its main quotes;
 * the values of texts, comments and spacing stay.
 * A name that is a command in the other language gets a trailing _, the same everywhere in the program.
 *
 * @param from - a language of the translations.
 * @param to - a language of the translations.
 */
export const translateSource = (sourceCode: string, from: string, to: string): string => {
  const target = wordsOf(to);
  const lines = sourceCode.split('\n').map(line => scan(line, from));

  //the names of the program, also those in the braces of texts
  const namesIn = (segments: Segment[]): string[] =>
    segments.flatMap(segment => {
      if (segment.type === 'name') return [segment.text.toLowerCase()];
      if (segment.type !== 'string' || !segment.parts) return [];
      return segment.parts.flatMap(part => (part.type === 'code' ? namesIn(part.segments) : []));
    });
  const names = new Set(lines.flatMap(namesIn));
  const taken = new Set(names);
  const renames = new Map<string, string>();
  for (const name of names) {
    if (!target.single.has(name)) continue;

    let suffix = '_';
    while (taken.has(name + suffix) || target.single.has(name + suffix)) suffix += '_';
    taken.add(name + suffix);
    renames.set(name, suffix);
  }

  const [open, close] = target.main;
  const write = (segments: Segment[]): string =>
    segments
      .map(segment => {
        if (segment.type === 'keyword') return target.first.get(segment.command) ?? segment.text;
        if (segment.type === 'name') return segment.text + (renames.get(segment.text.toLowerCase()) ?? '');
        if (segment.type !== 'string' || !segment.closed) return segment.text;
        if (!segment.parts) return quoteCode(segment.value, target.main);
        //a text with code in braces: its texts in the new quotes, and its code translated
        const parts = segment.parts.map(part =>
          part.type === 'text'
            ? quoteCode(part.value, target.main).slice(open.length, -close.length)
            : `{${write(part.segments)}${part.closed ? '}' : ''}`
        );
        return open + parts.join('') + close;
      })
      .join('');

  return lines.map(write).join('\n');
};
