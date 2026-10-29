/**
 * C: what a first course writes, in C99, that prints what the CMIL program prints. Numbers are int or double, a text
 * is a char array of 100, a list an array of 100 items with its count beside it, and print is a printf with a format.
 * What fixed arrays can't hold, like a list of lists or a function that gives a list, is a problem. The helpers a
 * program needs come first, each with what it is for.
 */
import {COMMAND} from '../../constants/index.ts';
import TRANSLATION from '../../translations/index.ts';
import {counterTest, fromZero, Grammar, mathOf, POSTFIX, type Code} from '../code.ts';
import {
  Before,
  Helpers,
  Names,
  Trivia,
  Writer,
  assignedIn,
  callsIn,
  changedIn,
  definitionOf,
  isJoined,
  isNumeral,
  isText,
  hasEffect,
  joinedParts,
  linesOf,
  neverEqual,
  quoted,
  readsOnce,
  stepOf,
  type FixedArrays,
  type Converted
} from '../emit.ts';
import {SAME_LINE, branchesApart, loopMade, loopOf, statementsOf, testsOf} from '../statements.ts';
import {isList, isNumber, type Type, type Types} from '../types.ts';
import type {ProgramTree} from '../../program.ts';
import type {Writers} from '../registry.ts';
import type {Expression, Statement} from '../../core/types.ts';

//the words of C, and the names of the library, the conversion and the helpers, which a program's names can't be
const RESERVED = new Set(
  [
    'auto break case char const continue default do double else enum extern float for goto if inline int long',
    'register restrict return short signed sizeof static struct switch typedef union unsigned void volatile while',
    'bool true false main printf fgets stdin strcpy strcmp strcspn strstr strlen snprintf atof rand srand time pow',
    'sqrt floor ceil fabs abs fmod sin cos tan asin acos atan log log10 exp toupper tolower NULL PI E',
    'read_number read_text letter_count letter_of split_letters uppercase lowercase split_words split_at round_to',
    'print_ints print_reals print_texts print_bools join_ints join_reals join_texts join_bools contains_int',
    'contains_real contains_text contains_bool remove_int remove_real remove_text remove_bool'
  ]
    .join(' ')
    .split(' ')
);

//the size of a text and of a list
const SIZE = 100;

//the precedence of C's operators, from the loosest
const PRECEDENCE: Record<string, number> = {
  '||': 1,
  '&&': 2,
  '==': 3,
  '!=': 3,
  '<': 4,
  '>': 4,
  '<=': 4,
  '>=': 4,
  '+': 5,
  '-': 5,
  '*': 6,
  '/': 6,
  '%': 6
};

const OPERATORS: Record<string, string> = {[COMMAND.AND]: '&&', [COMMAND.OR]: '||'};

const INCLUDES = ['stdio.h', 'stdlib.h', 'string.h', 'stdbool.h', 'math.h', 'ctype.h', 'time.h'];

//a text as C writes it, like "a \"b\""
const literal = (text: string) => quoted(text);

const c = new Grammar(PRECEDENCE);
const name = (text: string) => c.atom(text);

//the kinds of the items of a list, by which its helpers are named, like join_ints
type Kind = 'int' | 'real' | 'text' | 'bool';
const KINDS: Record<Kind, {c: string; parameter: string; format: string}> = {
  int: {c: 'int', parameter: 'int list[]', format: '%d'},
  real: {c: 'double', parameter: 'double list[]', format: '%.12g'},
  text: {c: 'char', parameter: `char list[][${SIZE}]`, format: '%s'},
  bool: {c: 'bool', parameter: 'bool list[]', format: '%s'}
};

type Helper = {
  imports: string[];
  uses?: string[];
  code: (words: [string, string]) => string[];
};

//a helper for each kind of item: its name, like join_ints, and its code
const ofKind = (
  name: (kind: Kind) => string,
  imports: (kind: Kind) => string[],
  code: (kind: Kind, words: [string, string]) => string[]
): Record<string, Helper> =>
  Object.fromEntries(
    (Object.keys(KINDS) as Kind[]).map(kind => [name(kind), {imports: imports(kind), code: words => code(kind, words)}])
  );

//the plural of a kind, as the helpers are named, and in words
const plural = (kind: Kind) => ({int: 'ints', real: 'reals', text: 'texts', bool: 'bools'})[kind];
const inPlural = (kind: Kind) => ({int: 'whole numbers', real: 'real numbers', text: 'texts', bool: 'booleans'})[kind];

//an item of a list as a value: a bool in words
const itemValue = (kind: Kind, item: string, [yes, no]: [string, string]) =>
  kind === 'bool' ? `${item} ? ${literal(yes)} : ${literal(no)}` : item;

const equal = (kind: Kind, a: string, b: string) => (kind === 'text' ? `strcmp(${a}, ${b}) == 0` : `${a} == ${b}`);

//the helpers, by name, in the order they are written: the headers they include, the helpers they use, and their code
const HELPERS: Record<string, Helper> = {
  read_number: {
    imports: ['stdio.h', 'stdlib.h'],
    code: () => [
      '// an answer of the user, as a number',
      'double read_number(void) {',
      `    char answer[${SIZE}];`,
      '    fgets(answer, sizeof answer, stdin);',
      '    return atof(answer);',
      '}'
    ]
  },
  read_text: {
    imports: ['stdio.h', 'string.h'],
    code: () => [
      '// an answer of the user, as a text without the end of its line, which the next answer replaces',
      'const char *read_text(void) {',
      `    static char answer[${SIZE}];`,
      '    fgets(answer, sizeof answer, stdin);',
      '    answer[strcspn(answer, "\\n")] = \'\\0\';',
      '    return answer;',
      '}'
    ]
  },
  letter_count: {
    imports: [],
    code: () => [
      '// the letters of a text: a char is a byte, and a letter like ա has more than one',
      'int letter_count(const char *text) {',
      '    int count = 0;',
      "    for (int i = 0; text[i] != '\\0'; i++) {",
      '        if ((text[i] & 0xC0) != 0x80) count++;',
      '    }',
      '    return count;',
      '}'
    ]
  },
  letter_of: {
    imports: [],
    code: () => [
      '// the letter of a text at a place, from 1, with all the bytes of a letter like ա',
      'void letter_of(char result[], const char *text, int place) {',
      '    int length = 0;',
      "    for (int i = 0, count = 0; text[i] != '\\0'; i++) {",
      '        if ((text[i] & 0xC0) != 0x80) count++;',
      '        if (count == place) result[length++] = text[i];',
      '        if (count > place) break;',
      '    }',
      "    result[length] = '\\0';",
      '}'
    ]
  },
  split_letters: {
    imports: [],
    code: () => [
      '// the letters of a text, each a text of its own, and how many there are',
      `int split_letters(char parts[][${SIZE}], const char *text) {`,
      '    int count = 0, length = 0;',
      "    for (int i = 0; text[i] != '\\0'; i++) {",
      '        if ((text[i] & 0xC0) != 0x80 && i > 0) {',
      "            parts[count++][length] = '\\0';",
      '            length = 0;',
      '        }',
      '        parts[count][length++] = text[i];',
      '    }',
      '    if (length > 0) {',
      "        parts[count++][length] = '\\0';",
      '    }',
      '    return count;',
      '}'
    ]
  },
  uppercase: {
    imports: ['ctype.h'],
    code: () => [
      '// a text in capital letters; toupper changes only English letters',
      'void uppercase(char result[], const char *text) {',
      '    int i = 0;',
      "    for (; text[i] != '\\0'; i++) result[i] = toupper((unsigned char) text[i]);",
      "    result[i] = '\\0';",
      '}'
    ]
  },
  lowercase: {
    imports: ['ctype.h'],
    code: () => [
      '// a text in small letters; tolower changes only English letters',
      'void lowercase(char result[], const char *text) {',
      '    int i = 0;',
      "    for (; text[i] != '\\0'; i++) result[i] = tolower((unsigned char) text[i]);",
      "    result[i] = '\\0';",
      '}'
    ]
  },
  split_words: {
    imports: ['string.h'],
    code: () => [
      '// the words of a text, between its spaces, and how many there are',
      `int split_words(char parts[][${SIZE}], const char *text) {`,
      `    char copy[${SIZE}];`,
      '    strcpy(copy, text);',
      '    int count = 0;',
      '    for (char *word = strtok(copy, " \\t\\n"); word != NULL; word = strtok(NULL, " \\t\\n")) {',
      '        strcpy(parts[count++], word);',
      '    }',
      '    return count;',
      '}'
    ]
  },
  split_at: {
    imports: ['string.h'],
    code: () => [
      '// the parts of a text between a separator, and how many there are',
      `int split_at(char parts[][${SIZE}], const char *text, const char *separator) {`,
      '    int count = 0;',
      '    const char *start = text;',
      '    for (const char *end; (end = strstr(start, separator)) != NULL; start = end + strlen(separator)) {',
      '        int length = (int) (end - start);',
      '        strncpy(parts[count], start, length);',
      "        parts[count++][length] = '\\0';",
      '    }',
      '    strcpy(parts[count++], start);',
      '    return count;',
      '}'
    ]
  },
  round_to: {
    imports: ['stdio.h', 'stdlib.h', 'math.h'],
    code: () => [
      '// a number rounded to a count of decimals, a half up, after rounding it like it is printed, so 1.005 is 1.01',
      'double round_to(double number, int digits) {',
      `    char text[${SIZE}];`,
      '    double factor = pow(10, digits);',
      '    snprintf(text, sizeof text, "%.12g", number * factor);',
      '    return floor(atof(text) + 0.5) / factor;',
      '}'
    ]
  },
  ...ofKind(
    kind => `join_${plural(kind)}`,
    () => ['stdio.h', 'string.h'],
    (kind, words) => [
      `// the ${inPlural(kind)} of a list as one text, with a separator between them`,
      `void join_${plural(kind)}(char result[], ${KINDS[kind].parameter}, int count, const char *separator) {`,
      `    int length = 0;`,
      "    result[0] = '\\0';",
      '    for (int i = 0; i < count; i++) {',
      `        length += snprintf(result + length, ${SIZE} - length, "%s${KINDS[kind].format}", i > 0 ? separator : "", ${itemValue(kind, 'list[i]', words)});`,
      '    }',
      '}'
    ]
  ),
  ...ofKind(
    kind => `contains_${kind}`,
    kind => (kind === 'text' ? ['stdbool.h', 'string.h'] : ['stdbool.h']),
    kind => [
      `// whether a list of ${inPlural(kind)} has an item`,
      `bool contains_${kind}(${KINDS[kind].parameter}, int count, ${kind === 'text' ? 'const char *item' : `${KINDS[kind].c} item`}) {`,
      '    for (int i = 0; i < count; i++) {',
      `        if (${equal(kind, 'list[i]', 'item')}) return true;`,
      '    }',
      '    return false;',
      '}'
    ]
  ),
  ...ofKind(
    kind => `remove_${kind}`,
    kind => (kind === 'text' ? ['string.h'] : kind === 'bool' ? ['stdbool.h'] : []),
    kind => [
      `// removes the first item of a list of ${inPlural(kind)} that equals a value, and moves the items after it back`,
      `void remove_${kind}(${KINDS[kind].parameter}, int *count, ${kind === 'text' ? 'const char *item' : `${KINDS[kind].c} item`}) {`,
      '    for (int i = 0; i < *count; i++) {',
      `        if (${equal(kind, 'list[i]', 'item')}) {`,
      `            for (int j = i; j < *count - 1; j++) ${kind === 'text' ? 'strcpy(list[j], list[j + 1])' : 'list[j] = list[j + 1]'};`,
      '            (*count)--;',
      '            return;',
      '        }',
      '    }',
      '}'
    ]
  )
};

/**
 * What C's fixed arrays can't hold, besides what no language of them can: a function that gives a list, a loop that
 * changes the list it goes over, a text parameter the function changes, which would be its caller's, and a list in no
 * variable that remove or a function changes, which has no count to change.
 */
export const C_ARRAYS: FixedArrays = {
  listResults: true,
  changedLoops: true,
  textParameters: true,
  changedInPlace: ['remove', 'call']
};

/**
 * Writes a program in C, which C_ARRAYS can hold.
 */
export const toC = (tree: ProgramTree, types: Types, sourceCode: string): Converted => {
  const names = new Names(tree.names, RESERVED);
  const trivia = new Trivia(tree.comments, sourceCode, '//');
  const includes = new Set<string>(['stdio.h']);
  const helpers = new Helpers(HELPERS, includes);
  const defines = new Set<string>();
  const {words: commands} = TRANSLATION[tree.language];
  const words: [string, string] = [commands.true[0], commands.false[0]];
  //the lines a statement needs first, like the text of a temporary value
  const pending = new Before();
  //whether a condition is being written, which C computes again each time, so it can't have lines of its own first
  let inCondition = false;
  //the lists of the function being written whose count is a pointer, since the function adds to them or removes from
  //them, and whether it returns a text
  let pointers = new Set<string>();
  //static before the arrays of a function that gives a text, which must outlive it
  let keep = '';
  let random = false;
  const definitions = tree.statements.filter(
    (statement): statement is Statement & {type: 'function'} => statement.type === 'function'
  );

  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';
  const code = (node: Expression) => c.print(expression(node));

  //the kind of the items of a list, which C has only of numbers, texts and booleans
  const kindOf = (list: Type): Kind => {
    const item = isList(list) ? list.list : 'unknown';
    if (item === 'boolean') includes.add('stdbool.h');
    return item === 'real' ? 'real' : item === 'text' ? 'text' : item === 'boolean' ? 'bool' : 'int';
  };

  //the C type of a number or a boolean
  const scalar = (type: Type): string => {
    if (type === 'boolean') {
      includes.add('stdbool.h');
      return 'bool';
    }
    return type === 'real' ? 'double' : 'int';
  };

  //a fresh name for a temporary value, which stays taken in the function
  const temporary = (candidates: string[]) => names.fresh(candidates);

  //the count of a list in a variable, like scores_count, through its pointer in a function that changes it
  const countName = (variable: string) => `${names.of(variable)}_count`;
  const countOf = (variable: string) => (pointers.has(variable) ? `*${countName(variable)}` : countName(variable));

  const math = (method: string, args: Code[]): Code => {
    includes.add('math.h');
    return c.call(method, args);
  };

  //a boolean in the words of the program's language, as CMIL prints it
  const inWords = (node: Expression) => `${code(node)} ? ${literal(words[0])} : ${literal(words[1])}`;

  //a value that is a text C must make, like a text with values in it or a letter of a text
  const isMade = (node: Expression): boolean =>
    isJoined(node, types) ||
    node.type === 'input' ||
    (node.type === 'index' && !isList(typeOf(node.target))) ||
    (node.type === 'call' && [COMMAND.UPPER, COMMAND.LOWER, COMMAND.JOIN, COMMAND.TEXT].includes(node.name as never));

  //the format of printf and its values, for values joined into a text
  const format = (parts: Expression[]): {format: string; args: string[]} => {
    let text = '';
    const args: string[] = [];
    for (const part of parts) {
      const type = typeOf(part);
      if (isText(part)) {
        text += literal(part.value).slice(1, -1).replaceAll('%', '%%');
      } else if (part.type === 'call' && part.name === COMMAND.TEXT) {
        const inner = format(isJoined(part.args[0], types) ? joinedParts(part.args[0], types) : [part.args[0]]);
        text += inner.format;
        args.push(...inner.args);
      } else if (type === 'text') {
        text += '%s';
        args.push(textValue(part));
      } else if (type === 'boolean') {
        text += '%s';
        args.push(inWords(part));
      } else if (isNumeral(part) && Math.abs(part.value) > 2147483647) {
        //a whole number past an int is a long long
        text += '%lld';
        args.push(`${part.value}LL`);
      } else {
        text += type === 'real' ? '%.12g' : '%d';
        args.push(code(part));
      }
    }
    return {format: text, args};
  };

  //the lines that put a text into an array, like strcpy(name, "Ani") or a snprintf of values joined
  const textInto = (target: string, node: Expression): string[] => {
    if (node.type === 'input') {
      //an item of a list, like basket[basket_count++], is read by a helper, so it counts once
      if (!/^\w+$/.test(target)) {
        helpers.use('read_text');
        includes.add('string.h');
        return [`strcpy(${target}, read_text());`];
      }
      includes.add('string.h');
      return [`fgets(${target}, sizeof ${target}, stdin);`, `${target}[strcspn(${target}, "\\n")] = '\\0';`];
    }
    if (isJoined(node, types) || (node.type === 'call' && node.name === COMMAND.TEXT)) {
      const parts = isJoined(node, types) ? joinedParts(node, types) : [node];
      //a text that grows by texts, like line = line + "⭐", is strcat
      const [first, ...rest] = parts;
      if (first.type === 'variable' && names.of(first.name) === target && rest.every(part => typeOf(part) === 'text')) {
        includes.add('string.h');
        return rest.map(part => `strcat(${target}, ${textValue(part)});`);
      }
      const {format: text, args} = format(parts);
      const into = (array: string) => `snprintf(${array}, ${SIZE}, ${['"' + text + '"', ...args].join(', ')});`;
      if (!args.includes(target)) return [into(target)];
      //snprintf can't read the text it writes, so it writes another one first
      const copy = temporary(['text']);
      includes.add('string.h');
      return [`char ${copy}[${SIZE}];`, into(copy), `strcpy(${target}, ${copy});`];
    }
    if (node.type === 'call' && (node.name === COMMAND.UPPER || node.name === COMMAND.LOWER)) {
      const helper = node.name === COMMAND.UPPER ? 'uppercase' : 'lowercase';
      helpers.use(helper);
      return [`${helper}(${target}, ${textValue(node.args[0])});`];
    }
    if (node.type === 'call' && node.name === COMMAND.JOIN) {
      const list = listOf(node.args[0]);
      const helper = `join_${plural(list.kind)}`;
      helpers.use(helper);
      const separator = node.args[1] ? textValue(node.args[1]) : '""';
      return [`${helper}(${target}, ${list.items}, ${list.count}, ${separator});`];
    }
    if (node.type === 'index' && !isList(typeOf(node.target))) {
      helpers.use('letter_of');
      const place = node.index.type === 'value' ? String(node.index.value) : code(node.index);
      return [`letter_of(${target}, ${textValue(node.target)}, ${place});`];
    }
    return [`strcpy(${target}, ${textValue(node)});`];
  };

  //a text as a value C can read, like a variable or a text in quotes; a text C must make is made first, in an array
  const textValue = (node: Expression): string => {
    if (node.type === 'input') {
      if (inCondition) {
        helpers.use('read_text');
        return 'read_text()';
      }
      const answer = temporary(['answer']);
      includes.add('string.h');
      const declared = `char ${answer}[${SIZE}];`;
      pending.add(
        [declared, `fgets(${answer}, sizeof ${answer}, stdin);`, `${answer}[strcspn(${answer}, "\\n")] = '\\0';`],
        {declare: [declared], node}
      );
      return answer;
    }
    if (!isMade(node)) return code(node);
    const text = temporary(
      node.type === 'index'
        ? ['letter']
        : node.type === 'call' && node.name === COMMAND.UPPER
          ? ['upper']
          : node.type === 'call' && node.name === COMMAND.LOWER
            ? ['lower']
            : node.type === 'call' && node.name === COMMAND.JOIN
              ? ['joined']
              : ['text']
    );
    const lines = textInto(text, node);
    pending.add([`char ${text}[${SIZE}];`, ...lines], {declare: [`char ${text}[${SIZE}];`], node});
    return text;
  };

  //a list as C passes it: its items and its count, and where its count is, for a helper that changes it
  const listOf = (node: Expression): {items: string; count: string; pointer: string; kind: Kind} => {
    const kind = kindOf(typeOf(node));
    if (node.type === 'variable') {
      const pointer = pointers.has(node.name) ? countName(node.name) : `&${countName(node.name)}`;
      return {items: names.of(node.name), count: countOf(node.name), pointer, kind};
    }
    if (node.type === 'list') {
      //a list in no variable, like an argument, is a compound literal of C99
      const items = node.items.map(item => (kind === 'text' ? textValue(item) : code(item)));
      const array = kind === 'text' ? `char[][${SIZE}]` : `${KINDS[kind].c}[]`;
      return {
        items: `(${array}){${items.length ? items.join(', ') : '0'}}`,
        count: String(items.length),
        pointer: '',
        kind
      };
    }
    //a list C must make, like the parts of split(), is made first, in an array
    const parts = temporary(['parts', 'items']);
    const {declared, assigned, declarations} = listForms(parts, node);
    pending.add(declared, {declare: declarations, compute: assigned, node});
    return {items: parts, count: `${parts}_count`, pointer: `&${parts}_count`, kind};
  };

  //the lines that give a list in an array its items: a list of items, split() or another list
  //the lines that give an array the items of a list, of a list of items or of split(): declaring it, giving it them
  //again, and its declarations alone, for a loop that gives them again before each test of its condition
  const listForms = (
    list: string,
    node: Expression
  ): {declared: string[]; assigned: string[]; declarations: string[]} => {
    const kind = kindOf(typeOf(node));
    const array = `${keep}${kind === 'text' ? `char ${list}[${SIZE}][${SIZE}]` : `${KINDS[kind].c} ${list}[${SIZE}]`}`;
    const declarations = [`${array};`, `int ${list}_count;`];
    if (node.type === 'list') {
      const items = node.items.map(item => (kind === 'text' ? textValue(item) : code(item)));
      const filled = items.map((item, index) =>
        kind === 'text' ? `strcpy(${list}[${index}], ${item});` : `${list}[${index}] = ${item};`
      );
      const count = String(items.length);
      //braces copy a text only when it is in quotes, and a static array takes only values written in the program
      const initialized = node.items.every(item => item.type === 'value') || (kind !== 'text' && !keep);
      const declared = initialized
        ? [items.length ? `${array} = {${items.join(', ')}};` : `${array};`, `int ${list}_count = ${count};`]
        : [`${array};`, ...filled, `int ${list}_count = ${count};`];
      return {declared, assigned: [...filled, `${list}_count = ${count};`], declarations};
    }
    if (node.type === 'call' && node.name === COMMAND.SPLIT) {
      const [text, separator] = node.args;
      const value = textValue(text);
      let call: string;
      if (!separator) {
        helpers.use('split_words');
        call = `split_words(${list}, ${value})`;
      } else if (separator.type === 'value' && separator.value === '') {
        helpers.use('split_letters');
        call = `split_letters(${list}, ${value})`;
      } else {
        helpers.use('split_at');
        call = `split_at(${list}, ${value}, ${textValue(separator)})`;
      }
      return {
        declared: [`${array};`, `int ${list}_count = ${call};`],
        assigned: [`${list}_count = ${call};`],
        declarations
      };
    }
    throw new Error('No C array for a list from another list or a function');
  };
  const listInto = (list: string, node: Expression, declares: boolean): string[] =>
    listForms(list, node)[declares ? 'declared' : 'assigned'];

  const expression = (node: Expression): Code => {
    switch (node.type) {
      case 'value':
        if (node.constant) {
          defines.add(node.constant);
          return name(node.constant.toUpperCase());
        }
        if (typeof node.value === 'string') return name(literal(node.value));
        if (typeof node.value === 'boolean') includes.add('stdbool.h');
        return name(String(node.value));
      case 'variable':
        return name(names.of(node.name));
      case 'index': {
        if (!isList(typeOf(node.target))) return name(textValue(node));
        const list = listOf(node.target);
        return c.index(name(list.items), fromZero(c, node.index, expression));
      }
      case 'input':
        if (typeOf(node) === 'real') {
          helpers.use('read_number');
          return c.call('read_number', []);
        }
        return name(textValue(node));
      case 'userCall': {
        const definition = definitionOf(definitions, node.name);
        const changed = changedIn(definition.body);
        const args = node.args.flatMap((arg, index) => {
          const type = typeOf(arg);
          if (!isList(type)) return [type === 'text' ? name(textValue(arg)) : expression(arg)];
          const list = listOf(arg);
          return [list.items, changed.has(definition.parameters[index]) ? list.pointer : list.count].map(name);
        });
        return c.call(names.of(node.name), args);
      }
      case 'call':
        return builtIn(node);
      case 'unary':
        return c.unary(node.operator === COMMAND.NOT ? '!' : node.operator, expression(node.operand));
      case 'template':
        return name(textValue(node));
      case 'list':
        throw new Error('No C for a list here');
      case 'binary':
        return binary(node);
    }
  };

  const binary = (node: Expression & {type: 'binary'}): Code => {
    const left = typeOf(node.left);
    const right = typeOf(node.right);

    if (node.operator === '+' && typeOf(node) === 'text') return name(textValue(node));
    if (node.operator === COMMAND.IN) {
      if (isList(right)) {
        const list = listOf(node.right);
        const helper = `contains_${list.kind}`;
        helpers.use(helper);
        const item = list.kind === 'text' ? name(textValue(node.left)) : expression(node.left);
        return c.call(helper, [name(list.items), name(list.count), item]);
      }
      includes.add('string.h');
      const found = c.call('strstr', [name(textValue(node.right)), name(textValue(node.left))]);
      return c.binary('!=', found, name('NULL'));
    }
    //a whole number divided by a whole number is a whole number in C, so the first one becomes a double
    if (node.operator === '/' && left === 'whole' && right === 'whole') {
      const dividend =
        node.left.type === 'value' ? name(`${node.left.value}.0`) : c.unary('(double) ', expression(node.left));
      return c.binary('/', dividend, expression(node.right));
    }
    if (node.operator === '%' && (left === 'real' || right === 'real')) {
      return math('fmod', [expression(node.left), expression(node.right)]);
    }
    const operator = OPERATORS[node.operator] ?? node.operator;
    if (node.operator === COMMAND.AND || node.operator === COMMAND.OR) {
      const first = expression(node.left);
      const mark = pending.mark;
      const second = expression(node.right);
      if (pending.mark === mark || !hasEffect(node.right)) return c.binary(operator, first, second);
      //the right side makes a value with an effect on lines of its own, which CMIL computes only when the left side
      //doesn't decide: the left side in a variable first, then those lines and the right side, in an if
      const made = pending.take(mark);
      const test = temporary(['test', 'either']);
      includes.add('stdbool.h');
      const unless = [
        `if (${node.operator === COMMAND.AND ? test : `!${test}`}) {`,
        ...linesOf(made).map(text => `    ${text}`),
        `    ${test} = ${c.print(second)};`,
        '}'
      ];
      pending.add([`bool ${test} = ${c.print(first)};`, ...unless], {
        declare: [`bool ${test};`],
        compute: [`${test} = ${c.print(first)};`, ...unless],
        node
      });
      return name(test);
    }
    if (node.operator === '==' || node.operator === '!=') {
      //values of different types are never equal in CMIL; C doesn't compare them
      if (neverEqual(left, right)) {
        includes.add('stdbool.h');
        return name(node.operator === '==' ? 'false' : 'true');
      }
    }
    //texts are compared letter by letter, by strcmp
    if (left === 'text' && right === 'text') {
      includes.add('string.h');
      const order = c.call('strcmp', [name(textValue(node.left)), name(textValue(node.right))]);
      return c.binary(operator, order, name('0'));
    }
    return c.binary(operator, expression(node.left), expression(node.right));
  };

  const builtIn = (node: Expression & {type: 'call'}): Code => {
    const [first] = node.args;
    const args = () => node.args.map(expression);
    switch (node.name) {
      case COMMAND.SQR: {
        if (first.type === 'variable' || first.type === 'value') {
          const factor = expression(first);
          return c.binary('*', factor, factor);
        }
        const square = math('pow', [expression(first), name('2')]);
        return typeOf(node) === 'whole' ? c.unary('(int) ', square) : square;
      }
      case COMMAND.ROUND:
        if (node.args.length === 2) {
          helpers.use('round_to');
          return c.call('round_to', args());
        }
        if (typeOf(first) === 'whole') return expression(first);
        return c.unary('(int) ', math('floor', [c.binary('+', expression(first), name('0.5'))]));
      case COMMAND.FLOOR:
      case COMMAND.CEIL:
        if (typeOf(first) === 'whole') return expression(first);
        return c.unary('(int) ', math(node.name, args()));
      case COMMAND.ABS:
        if (typeOf(first) === 'whole') {
          includes.add('stdlib.h');
          return c.call('abs', args());
        }
        return math('fabs', args());
      case COMMAND.RANDOM: {
        random = true;
        includes.add('stdlib.h');
        const [min, max] = node.args.length === 1 ? [null, first] : node.args;
        if (!min) return c.binary('+', c.binary('%', c.call('rand', []), expression(max)), name('1'));
        const span = c.binary('+', c.binary('-', expression(max), expression(min)), name('1'));
        return c.binary('+', c.binary('%', c.call('rand', []), {kind: 'paren', inner: span}), expression(min));
      }
      case COMMAND.LENGTH:
        if (isList(typeOf(first))) return c.atom(listOf(first).count, POSTFIX);
        helpers.use('letter_count');
        return c.call('letter_count', [name(textValue(first))]);
      case COMMAND.NUMBER:
        //a number is a real number, which printf prints as a double
        if (typeOf(first) === 'whole') return c.unary('(double) ', expression(first));
        if (isNumber(typeOf(first))) return expression(first);
        includes.add('stdlib.h');
        return c.call('atof', [name(textValue(first))]);
      case COMMAND.UPPER:
      case COMMAND.LOWER:
      case COMMAND.TEXT:
      case COMMAND.JOIN:
        return name(textValue(node));
      case COMMAND.SPLIT:
        throw new Error('No C for split here');
    }
    const formula = mathOf(c, node.name, args(), math, () => {
      defines.add('pi');
      return name('PI');
    });
    if (formula) return formula;
    throw new Error(`No C for ${node.name}`);
  };

  //the statement of print: one printf of its values
  const printed = (node: Expression): string => {
    if (node.type === 'value' && node.value === '') return 'printf("\\n");';
    const {format: text, args} = format(isJoined(node, types) ? joinedParts(node, types) : [node]);
    return `printf(${['"' + text + '\\n"', ...args].join(', ')});`;
  };

  //the lines a statement needs first, then the statement
  const flushed = (lines: string[]) => [...linesOf(pending.take()), ...lines];
  //a condition that C computes again each time, which has no lines of its own first
  const condition = (node: Expression) => {
    inCondition = true;
    const text = code(node);
    inCondition = false;
    return text;
  };

  const declareScalar = (type: Type, variable: string, value: string) =>
    type === 'text' ? `${keep}char ${variable}[${SIZE}] = ${value};` : `${scalar(type)} ${variable} = ${value};`;

  const block = statementsOf({
    trivia,
    names,
    braces: SAME_LINE,
    declare: (variable, type) => {
      if (!isList(type)) {
        return [declareScalar(type, names.of(variable), type === 'text' ? '""' : type === 'boolean' ? 'false' : '0')];
      }
      const empty: Expression = {type: 'list', items: []};
      types.expressions.set(empty, type);
      return flushed(listInto(names.of(variable), empty, true));
    },
    write: (statement, context) => {
      const {comment, declares, scope} = context;
      //writes the lines a statement needs first, then the statement, with the comment after its last line
      const lines = (texts: string[]) => {
        if (texts.length) texts[texts.length - 1] += comment;
        flushed(texts).forEach(text => context.line(text));
      };
      //writes the lines the head of a block needs first
      const before = () => flushed([]).forEach(text => context.line(text));
      //CMIL reads the bounds of a loop once; C keeps one in a variable first when readsOnce() tells
      const once = (bound: Expression, candidates: string[]): Code => {
        const written = expression(bound);
        if (!('body' in statement) || !readsOnce(bound, statement)) return written;
        const kept = names.fresh(candidates);
        pending.add([`${scalar(typeOf(bound))} ${kept} = ${code(bound)};`]);
        return name(kept);
      };
      switch (statement.type) {
        case 'print':
          lines([printed(statement.expression)]);
          return;
        case 'assign': {
          const type = scope.get(statement.name)!;
          const variable = names.of(statement.name);
          const value = statement.expression;
          if (isList(type)) {
            //an empty list again is a count of 0
            if (!declares && value.type === 'list' && !value.items.length) {
              lines([`${countOf(statement.name)} = 0;`]);
              return;
            }
            types.expressions.set(value, type);
            lines(listInto(variable, value, declares));
            return;
          }
          if (type === 'text') {
            if (declares && isText(value)) {
              lines([declareScalar(type, variable, literal(value.value))]);
              return;
            }
            const into = textInto(variable, value);
            lines([...(declares ? [`${keep}char ${variable}[${SIZE}];`] : []), ...into]);
            return;
          }
          const text = code(value);
          lines([declares ? declareScalar(type, variable, text) : `${variable} = ${text};`]);
          return;
        }
        case 'setItem': {
          const list = listOf(statement.target);
          const item = c.print(c.index(name(list.items), fromZero(c, statement.index, expression)));
          lines(
            list.kind === 'text' ? textInto(item, statement.expression) : [`${item} = ${code(statement.expression)};`]
          );
          return;
        }
        case 'add': {
          const list = listOf(statement.target);
          const count = list.count.startsWith('*') ? `(${list.count})` : list.count;
          const item = `${list.items}[${count}++]`;
          lines(
            list.kind === 'text' ? textInto(item, statement.expression) : [`${item} = ${code(statement.expression)};`]
          );
          return;
        }
        case 'remove': {
          const list = listOf(statement.target);
          const helper = `remove_${list.kind}`;
          helpers.use(helper);
          const item = list.kind === 'text' ? textValue(statement.expression) : code(statement.expression);
          lines([`${helper}(${list.items}, ${list.pointer}, ${item});`]);
          return;
        }
        case 'call':
          lines([`${code(statement.call)};`]);
          return;
        case 'return': {
          if (!statement.expression) {
            lines(['return;']);
            return;
          }
          const value = statement.expression;
          const type = typeOf(value);
          if (type === 'text' && isMade(value)) {
            //a text the function makes outlives it in a static array
            const text = temporary(['result']);
            flushed([`static char ${text}[${SIZE}];`, ...textInto(text, value), `return ${text};${comment}`]).forEach(
              each => context.line(each)
            );
            return;
          }
          lines([`return ${type === 'text' ? textValue(value) : code(value)};`]);
          return;
        }
        case 'if': {
          const tests = testsOf(statement, pending, (test, index) => (index ? condition(test) : code(test)));
          before();
          context.blocks(branchesApart(statement, tests, (test, index) => `${index ? 'else ' : ''}if (${test})`));
          return;
        }
        case 'while': {
          const test = condition(statement.condition);
          const again = loopMade(context, statement, pending.take());
          context.blocks([loopOf(statement, `while (${test})`, again)]);
          return;
        }
        case 'doWhile': {
          const test = condition(statement.condition);
          const again = loopMade(context, statement, pending.take());
          context.blocks([{text: 'do', line: statement.doLine, body: statement.body, ...again}], {
            text: `while (${test});`,
            line: statement.line
          });
          return;
        }
        case 'repeat': {
          const count = once(statement.count, ['times', 'count']);
          const counter = context.fresh(['i', 'j', 'k']);
          const test = c.print(c.binary('<', name(counter), count));
          before();
          context.blocks([loopOf(statement, `for (int ${counter} = 0; ${test}; ${counter}++)`)]);
          return;
        }
        case 'for': {
          const counter = names.of(statement.name);
          const type = scalar(scope.get(statement.name)!);
          const {down, size, signed} = stepOf(statement);
          //the first value too, when it asks and a later bound is kept, so the program asks in CMIL's order
          const first = once(statement.from, ['first', 'start']);
          const last = once(statement.to, ['last', 'end']);
          const by = size && once(size, ['step', 'by']);
          const test = counterTest(c, operator => c.binary(operator, name(counter), last), {down, signed}, by);
          const next = !by
            ? `${counter}${down ? '--' : '++'}`
            : `${counter} ${down ? '-=' : '+='} ${c.print(c.bracketed(by, PRECEDENCE['+'] + 1))}`;
          const start = `${declares ? `${type} ` : ''}${counter} = ${c.print(first)}`;
          before();
          context.blocks([loopOf(statement, `for (${start}; ${test}; ${next})`)]);
          return;
        }
        case 'forEach': {
          const type = typeOf(statement.expression);
          //the letters of a text are a list of texts first
          let list: ReturnType<typeof listOf>;
          if (isList(type)) {
            //CMIL goes over the items the list had when the loop started, which an array would need copied
            if (statement.expression.type === 'list') {
              const items = temporary(['items']);
              pending.add(listInto(items, statement.expression, true));
              list = {items, count: `${items}_count`, pointer: `&${items}_count`, kind: kindOf(type)};
            } else {
              list = listOf(statement.expression);
            }
          } else {
            helpers.use('split_letters');
            const parts = temporary(['letters']);
            pending.add([
              `char ${parts}[${SIZE}][${SIZE}];`,
              `int ${parts}_count = split_letters(${parts}, ${textValue(statement.expression)});`
            ]);
            list = {items: parts, count: `${parts}_count`, pointer: `&${parts}_count`, kind: 'text'};
          }
          const counter = context.fresh(['i', 'j', 'k']);
          const variable = names.of(statement.name);
          const item = `${list.items}[${counter}]`;
          const first =
            list.kind !== 'text'
              ? [declares ? `${KINDS[list.kind].c} ${variable} = ${item};` : `${variable} = ${item};`]
              : !declares
                ? [`strcpy(${variable}, ${item});`]
                : assignedIn(statement.body).has(statement.name)
                  ? [`char ${variable}[${SIZE}];`, `strcpy(${variable}, ${item});`]
                  : [`char *${variable} = ${item};`];
          if (list.kind === 'text') includes.add('string.h');
          before();
          context.blocks([
            loopOf(statement, `for (int ${counter} = 0; ${counter} < ${list.count}; ${counter}++)`, {first})
          ]);
          return;
        }
        case 'break':
        case 'continue':
          context.line(`${statement.type};${comment}`);
          return;
      }
    }
  });

  //a function of the program: a list is its items and its count, a pointer to it when the function changes it
  const signature = (definition: Statement & {type: 'function'}) => {
    const scope = types.variables.get(definition.name)!;
    const result = types.results.get(definition.name)!;
    const changed = changedIn(definition.body);
    const parameters = definition.parameters.map(parameter => {
      const type = scope.get(parameter)!;
      const written = names.of(parameter);
      if (isList(type)) {
        const kind = kindOf(type);
        const items = kind === 'text' ? `char ${written}[][${SIZE}]` : `${KINDS[kind].c} ${written}[]`;
        return `${items}, int ${changed.has(parameter) ? '*' : ''}${written}_count`;
      }
      if (type === 'text') return `const char *${written}`;
      return `${scalar(type)} ${written}`;
    });
    const returns = result === 'unknown' ? 'void ' : result === 'text' ? 'const char *' : `${scalar(result)} `;
    return `${returns}${names.of(definition.name)}(${parameters.length ? parameters.join(', ') : 'void'})`;
  };

  //the functions first, then main with the program, each with the comments before its lines
  const functions = new Writer('    ');
  const main = new Writer('    ');
  for (const definition of definitions) {
    const scope = types.variables.get(definition.name)!;
    pointers = new Set(
      definition.parameters.filter(
        parameter => isList(scope.get(parameter)!) && changedIn(definition.body).has(parameter)
      )
    );
    keep = types.results.get(definition.name) === 'text' ? 'static ' : '';
    trivia.before(functions, definition.line);
    functions.line(`${signature(definition)} {${trivia.after(definition.line)}`, definition.line);
    functions.block(() => block(functions, definition.body, scope, new Set(definition.parameters)));
    functions.line('}');
    functions.blank();
  }
  pointers = new Set();
  keep = '';
  main.block(() => {
    block(main, tree.statements, types.variables.get('')!, new Set());
    trivia.rest(main);
  });

  //a function called by one written before it needs its prototype first
  const prototypes = definitions.filter((definition, index) =>
    definitions.slice(0, index).some(earlier => callsIn(earlier).has(definition.name))
  );

  const out = new Writer('    ');
  for (const include of INCLUDES.filter(include => includes.has(include) || (include === 'time.h' && random))) {
    out.line(`#include <${include}>`);
  }
  if (defines.size) {
    out.blank();
    if (defines.has('pi')) out.line('#define PI 3.14159265358979323846');
    if (defines.has('e')) out.line('#define E 2.71828182845904523536');
  }
  helpers.write(out, helper => helper.code(words));
  if (prototypes.length) {
    out.blank();
    prototypes.forEach(definition => out.line(`${signature(definition)};`));
  }
  out.blank();
  out.append(functions);
  out.blank();
  out.line('int main(void) {');
  out.block(() => {
    if (random) out.line('srand(time(NULL)); // other random numbers each time');
  });
  out.append(main);
  out.block(() => out.line('return 0;'));
  out.line('}');
  return out.converted();
};

/** The writer of C: its targets, which cmil/convert/c gives convert(). */
export const WRITERS: Writers = {c: {typed: true, fixedArrays: C_ARRAYS, write: toC}};
