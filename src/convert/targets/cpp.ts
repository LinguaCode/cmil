/**
 * C++: what a teacher writes, in C++20, that prints what the CMIL program prints. Numbers are int or double, texts
 * std::string, lists std::vector; the helpers a program needs come first, each with what it is for.
 */
import {COMMAND} from '../../constants/index.ts';
import TRANSLATION from '../../translations/index.ts';
import {counterTest, fromZero, Grammar, mathOf, type Code} from '../code.ts';
import {
  Helpers,
  Names,
  Trivia,
  Writer,
  assignedIn,
  callsIn,
  changedIn,
  sharedListsOf,
  changesItsList,
  isJoined,
  isSimple,
  isText,
  joinedParts,
  neverEqual,
  quoted,
  stepOf,
  type Converted
} from '../emit.ts';
import {SAME_LINE, branchesOf, loopOf, statementsOf} from '../statements.ts';
import {isList, isNumber, type Type, type Types} from '../types.ts';
import type {ProgramTree} from '../../program.ts';
import type {Expression, Statement} from '../../core/types.ts';

//the words of C++, and the names of the standard library and of the helpers, which a program's names can't be
const RESERVED = new Set(
  [
    'alignas alignof and and_eq asm auto bitand bitor bool break case catch char char8_t char16_t char32_t class compl',
    'concept const consteval constexpr constinit const_cast continue co_await co_return co_yield decltype default delete',
    'do double dynamic_cast else enum explicit export extern false float for friend goto if inline int long mutable',
    'namespace new noexcept not not_eq nullptr operator or or_eq private protected public register reinterpret_cast',
    'requires return short signed sizeof static static_assert static_cast struct switch template this thread_local throw',
    'true try typedef typeid typename union unsigned using virtual void volatile wchar_t while xor xor_eq main std',
    'number_text value_text letters uppercase lowercase split_words split join round_to random_number',
    'generator read_text read_number'
  ]
    .join(' ')
    .split(' ')
);

//the precedence of C++'s operators, from the loosest
const PRECEDENCE: Record<string, number> = {
  '||': 1,
  '&&': 2,
  '==': 3,
  '!=': 3,
  '<': 4,
  '>': 4,
  '<=': 4,
  '>=': 4,
  '<<': 5,
  '+': 6,
  '-': 6,
  '*': 7,
  '/': 7,
  '%': 7
};

const OPERATORS: Record<string, string> = {[COMMAND.AND]: '&&', [COMMAND.OR]: '||'};

type Helper = {imports: string[]; uses?: string[]; code: (words: [string, string]) => string[]};

//the helpers, by name, in the order they are written: the headers they include, the helpers they use, and their code
const HELPERS: Record<string, Helper> = {
  number_text: {
    imports: ['sstream', 'iomanip', 'string'],
    code: () => [
      '// a number as CMIL prints it: whole numbers whole, others with up to 12 digits',
      'std::string number_text(double number) {',
      '    std::ostringstream text;',
      '    text << std::setprecision(12) << number;',
      '    return text.str();',
      '}'
    ]
  },
  value_text: {
    imports: ['string'],
    uses: ['number_text'],
    code: ([yes, no]) => [
      '// an item of a list as CMIL prints it, for join: a boolean in the words of the program',
      'std::string value_text(int number) { return std::to_string(number); }',
      'std::string value_text(double number) { return number_text(number); }',
      `std::string value_text(bool value) { return value ? ${literal(yes)} : ${literal(no)}; }`,
      'std::string value_text(const std::string& text) { return text; }'
    ]
  },
  letters: {
    imports: ['string', 'vector'],
    code: () => [
      '// the letters of a text: a std::string has bytes, and a letter like ա has more than one',
      'std::vector<std::string> letters(const std::string& text) {',
      '    std::vector<std::string> result;',
      '    for (std::size_t i = 0; i < text.size();) {',
      '        unsigned char byte = text[i];',
      '        std::size_t size = byte >= 0xF0 ? 4 : byte >= 0xE0 ? 3 : byte >= 0xC0 ? 2 : 1;',
      '        result.push_back(text.substr(i, size));',
      '        i += size;',
      '    }',
      '    return result;',
      '}'
    ]
  },
  uppercase: {
    imports: ['string', 'cctype'],
    code: () => [
      '// a text in capital letters; std::toupper changes only English letters',
      'std::string uppercase(std::string text) {',
      '    for (char& letter : text) letter = std::toupper(static_cast<unsigned char>(letter));',
      '    return text;',
      '}'
    ]
  },
  lowercase: {
    imports: ['string', 'cctype'],
    code: () => [
      '// a text in small letters; std::tolower changes only English letters',
      'std::string lowercase(std::string text) {',
      '    for (char& letter : text) letter = std::tolower(static_cast<unsigned char>(letter));',
      '    return text;',
      '}'
    ]
  },
  split_words: {
    imports: ['string', 'vector', 'sstream'],
    code: () => [
      '// the words of a text',
      'std::vector<std::string> split_words(const std::string& text) {',
      '    std::vector<std::string> words;',
      '    std::istringstream stream(text);',
      '    std::string word;',
      '    while (stream >> word) words.push_back(word);',
      '    return words;',
      '}'
    ]
  },
  split: {
    imports: ['string', 'vector'],
    uses: ['letters'],
    code: () => [
      '// the parts of a text between a separator; an empty separator gives its letters',
      'std::vector<std::string> split(const std::string& text, const std::string& separator) {',
      '    if (separator.empty()) return letters(text);',
      '    std::vector<std::string> parts;',
      '    std::size_t start = 0, end;',
      '    while ((end = text.find(separator, start)) != std::string::npos) {',
      '        parts.push_back(text.substr(start, end - start));',
      '        start = end + separator.size();',
      '    }',
      '    parts.push_back(text.substr(start));',
      '    return parts;',
      '}'
    ]
  },
  join: {
    imports: ['string', 'vector'],
    uses: ['value_text'],
    code: () => [
      '// the items of a list as they are printed, with a separator between them',
      'template <typename T>',
      'std::string join(const std::vector<T>& list, const std::string& separator) {',
      '    std::string text;',
      '    for (std::size_t i = 0; i < list.size(); i++) {',
      '        if (i > 0) text += separator;',
      '        text += value_text(list[i]);',
      '    }',
      '    return text;',
      '}'
    ]
  },
  round_to: {
    imports: ['cmath', 'string'],
    uses: ['number_text'],
    code: () => [
      '// a number rounded to a count of decimals, a half up, after rounding it like it is printed, so 1.005 is 1.01',
      'double round_to(double number, int digits) {',
      '    double factor = std::pow(10, digits);',
      '    return std::floor(std::stod(number_text(number * factor)) + 0.5) / factor;',
      '}'
    ]
  },
  random_number: {
    imports: ['random'],
    code: () => [
      '// a random whole number from min to max',
      'std::mt19937 generator(std::random_device{}());',
      'int random_number(int min, int max) {',
      '    return std::uniform_int_distribution<int>(min, max)(generator);',
      '}'
    ]
  },
  read_text: {
    imports: ['iostream', 'string'],
    code: () => [
      '// an answer of the user, as a text',
      'std::string read_text() {',
      '    std::string answer;',
      '    std::getline(std::cin >> std::ws, answer);',
      '    return answer;',
      '}'
    ]
  },
  read_number: {
    imports: ['iostream'],
    code: () => [
      '// an answer of the user, as a number',
      'double read_number() {',
      '    double answer;',
      '    std::cin >> answer;',
      '    return answer;',
      '}'
    ]
  }
};

const INCLUDES = [
  'iostream',
  'string',
  'vector',
  'cmath',
  'numbers',
  'algorithm',
  'cctype',
  'random',
  'iomanip',
  'sstream'
];

/** The C++ type of a value: int, double, std::string, bool or a std::vector; auto when nothing says. */
export const cppType = (type: Type): string => {
  if (isList(type)) return `std::vector<${cppType(type.list === 'unknown' ? 'whole' : type.list)}>`;
  switch (type) {
    case 'whole':
      return 'int';
    case 'real':
      return 'double';
    case 'text':
      return 'std::string';
    case 'boolean':
      return 'bool';
    default:
      return 'auto';
  }
};

//a text as C++ writes it, like "a \"b\""
const literal = (text: string) => quoted(text);

const cpp = new Grammar(PRECEDENCE);
const name = (text: string) => cpp.atom(text);

/**
 * Writes a program in C++.
 */
export const toCpp = (tree: ProgramTree, types: Types, sourceCode: string): Converted => {
  const names = new Names(tree.names, RESERVED);
  const trivia = new Trivia(tree.comments, sourceCode, '//');
  const includes = new Set<string>();
  const helpers = new Helpers(HELPERS, includes);
  const english = tree.language === 'en';
  const {words} = TRANSLATION[tree.language];
  let printsReal = false;
  let printsBoolean = false;
  //how often each variable of the scope being written gets a value
  let assignments = new Map<string, number>();

  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';
  const code = (node: Expression) => cpp.print(expression(node));

  //the items of a list in braces, with the lists in it in braces too, like {{1, 2}, {3}}
  const braced = (node: Expression & {type: 'list'}, open = '{'): Code =>
    cpp.items(
      open,
      node.items.map(item => (item.type === 'list' ? braced(item) : expression(item))),
      '}'
    );

  //a value as a C++ object, for a call of its method: a text in quotes becomes a std::string first
  const object = (node: Expression): Code =>
    isText(node) ? cpp.call('std::string', [expression(node)]) : expression(node);

  //a boolean in the words of the program's language, as CMIL prints it
  const inWords = (node: Expression) =>
    name(`(${code(node)} ? ${literal(words.true[0])} : ${literal(words.false[0])})`);

  //a value as a text, to join with +, and whether it is a std::string already rather than a text in quotes
  const asText = (node: Expression): [Code, boolean] => {
    const type = typeOf(node);
    if (type === 'text') return [cpp.bracketed(expression(node), PRECEDENCE['+'] + 1), node.type !== 'value'];
    if (type === 'whole') return [cpp.call('std::to_string', [expression(node)]), true];
    if (type === 'real') {
      helpers.use('number_text');
      return [cpp.call('number_text', [expression(node)]), true];
    }
    if (type === 'boolean') return [inWords(node), false];
    helpers.use('value_text');
    return [cpp.call('value_text', [expression(node)]), true];
  };

  const expression = (node: Expression): Code => {
    switch (node.type) {
      case 'value':
        if (node.constant) {
          includes.add('numbers');
          return name(`std::numbers::${node.constant}`);
        }
        if (typeof node.value === 'string') {
          includes.add('string');
          return name(literal(node.value));
        }
        return name(String(node.value));
      case 'list':
        includes.add('vector');
        return braced(node, `${cppType(typeOf(node))}{`);
      case 'template':
        return joinText(node);
      case 'variable':
        return name(names.of(node.name));
      case 'index': {
        const index = fromZero(cpp, node.index, expression);
        if (isList(typeOf(node.target))) return cpp.index(expression(node.target), index);
        helpers.use('letters');
        return cpp.index(cpp.call('letters', [expression(node.target)]), index);
      }
      case 'input': {
        const reader = typeOf(node) === 'real' ? 'read_number' : 'read_text';
        helpers.use(reader);
        return cpp.call(reader, []);
      }
      case 'userCall':
        return cpp.call(names.of(node.name), node.args.map(expression));
      case 'call':
        return builtIn(node);
      case 'unary':
        return cpp.unary(node.operator === COMMAND.NOT ? '!' : node.operator, expression(node.operand));
      case 'binary':
        return binary(node);
    }
  };

  //values joined into one text, with + or in a text with code in braces
  const joinText = (node: Expression): Code => {
    const parts = joinedParts(node, types).map(asText);
    //two texts in quotes can't be added in C++, so the first one becomes a std::string
    if (parts.length > 1 && !parts[0][1] && !parts[1][1]) {
      includes.add('string');
      parts[0][0] = cpp.call('std::string', [parts[0][0]]);
    }
    return parts.map(([text]) => text).reduce((left, right) => cpp.binary('+', left, right));
  };

  const binary = (node: Expression & {type: 'binary'}): Code => {
    const left = typeOf(node.left);
    const right = typeOf(node.right);

    if (node.operator === '+' && typeOf(node) === 'text') return joinText(node);
    if (node.operator === COMMAND.IN) {
      if (isList(right)) {
        includes.add('algorithm');
        const list = expression(node.right);
        //a list made in place, like [1, 2] or a list a function gives, is counted, as its begin() and end() would be
        //of two lists
        if (node.right.type !== 'variable') {
          return cpp.binary('>', cpp.call('std::ranges::count', [list, expression(node.left)]), name('0'));
        }
        const end = cpp.member(list, 'end', []);
        const found = cpp.call('std::find', [cpp.member(list, 'begin', []), end, expression(node.left)]);
        return cpp.binary('!=', found, end);
      }
      return cpp.binary(
        '!=',
        cpp.member(object(node.right), 'find', [expression(node.left)]),
        name('std::string::npos')
      );
    }
    //a whole number divided by a whole number is a whole number in C++, so the first one becomes a double
    if (node.operator === '/' && left === 'whole' && right === 'whole') {
      const dividend =
        node.left.type === 'value'
          ? name(`${node.left.value}.0`)
          : cpp.call('static_cast<double>', [expression(node.left)]);
      return cpp.binary('/', dividend, expression(node.right));
    }
    if (node.operator === '%' && (left === 'real' || right === 'real')) {
      includes.add('cmath');
      return cpp.call('std::fmod', [expression(node.left), expression(node.right)]);
    }
    const operator = OPERATORS[node.operator] ?? node.operator;
    //values of different types are never equal in CMIL; C++ doesn't compare them
    if ((node.operator === '==' || node.operator === '!=') && neverEqual(left, right)) {
      return name(node.operator === '==' ? 'false' : 'true');
    }
    //two texts in quotes are compared as texts, not as where they are
    const first =
      isText(node.left) && isText(node.right)
        ? cpp.call('std::string', [expression(node.left)])
        : expression(node.left);
    return cpp.binary(operator, first, expression(node.right));
  };

  const builtIn = (node: Expression & {type: 'call'}): Code => {
    const args = node.args.map(expression);
    const math = (method: string, values = args) => {
      includes.add('cmath');
      return cpp.call(`std::${method}`, values);
    };
    switch (node.name) {
      case COMMAND.SQR:
        if (!isSimple(node.args[0])) return math('pow', [args[0], name('2')]);
        return cpp.binary('*', args[0], args[0]);
      case COMMAND.ROUND:
        if (args.length === 1) return math('round');
        helpers.use('round_to');
        return cpp.call('round_to', args);
      case COMMAND.FLOOR:
        return math('floor');
      case COMMAND.CEIL:
        return math('ceil');
      case COMMAND.ABS:
        return math('abs');
      case COMMAND.RANDOM:
        helpers.use('random_number');
        return cpp.call('random_number', args.length === 1 ? [name('1'), args[0]] : args);
      case COMMAND.LENGTH:
        if (isList(typeOf(node.args[0]))) return cpp.member(args[0], 'size', []);
        helpers.use('letters');
        return cpp.member(cpp.call('letters', [args[0]]), 'size', []);
      case COMMAND.UPPER:
      case COMMAND.LOWER: {
        const helper = node.name === COMMAND.UPPER ? 'uppercase' : 'lowercase';
        helpers.use(helper);
        return cpp.call(helper, args);
      }
      case COMMAND.NUMBER:
        if (isNumber(typeOf(node.args[0]))) return args[0];
        includes.add('string');
        return cpp.call('std::stod', args);
      case COMMAND.TEXT:
        return asText(node.args[0])[0];
      case COMMAND.SPLIT: {
        const helper = args.length === 1 ? 'split_words' : 'split';
        helpers.use(helper);
        return cpp.call(helper, args);
      }
      case COMMAND.JOIN:
        helpers.use('join');
        return cpp.call('join', args.length === 1 ? [args[0], name('""')] : args);
    }
    const formula = mathOf(cpp, node.name, args, math, () => {
      includes.add('numbers');
      return name('std::numbers::pi');
    });
    if (formula) return formula;
    throw new Error(`No C++ for ${node.name}`);
  };

  //the values print prints, each after <<
  const printed = (node: Expression): string[] =>
    (isJoined(node, types) ? joinedParts(node, types) : [node]).map(part => {
      const type = typeOf(part);
      if (type === 'real') printsReal = true;
      if (type === 'boolean' && !english) return cpp.print(inWords(part));
      if (type === 'boolean') printsBoolean = true;
      return cpp.print(cpp.bracketed(expression(part), PRECEDENCE['<<'] + 1));
    });

  const block = statementsOf({
    trivia,
    names,
    braces: SAME_LINE,
    declare: (variable, type) => [`${cppType(type)} ${names.of(variable)};`],
    write: (statement, context) => {
      const {comment, declares, scope} = context;
      //CMIL reads the bounds of a loop once; when the loop changes them, C++ keeps them in a variable first
      const once = (bound: Expression, candidates: string[]): Code => {
        const kept = context.keep(
          bound,
          candidates,
          variable => `const ${cppType(typeOf(bound))} ${variable} = ${code(bound)};`
        );
        return kept ? name(kept) : expression(bound);
      };
      switch (statement.type) {
        case 'print':
          includes.add('iostream');
          context.line(`std::cout << ${printed(statement.expression).join(' << ')} << '\\n';${comment}`);
          return;
        case 'assign': {
          const variable = names.of(statement.name);
          const type = cppType(scope.get(statement.name)!);
          const {expression: value} = statement;
          if (value.type === 'input') {
            includes.add('iostream');
            if (declares) context.line(`${type} ${variable};`);
            if (typeOf(value) === 'real') {
              context.line(`std::cin >> ${variable};${comment}`);
            } else {
              includes.add('string');
              context.line(`std::getline(std::cin >> std::ws, ${variable});${comment}`);
            }
            return;
          }
          if (declares && value.type === 'list') {
            includes.add('vector');
            const items = value.items.length ? ` = ${cpp.print(braced(value))}` : '';
            context.line(`${type} ${variable}${items};${comment}`);
            return;
          }
          //a list is shared by the variables it is in, so a variable that only ever has another's list refers to it
          if (
            declares &&
            value.type === 'variable' &&
            type.startsWith('std::vector') &&
            assignments.get(statement.name) === 1
          ) {
            context.line(`${type}& ${variable} = ${code(value)};${comment}`);
            return;
          }
          context.line(`${declares ? `${type} ` : ''}${variable} = ${code(value)};${comment}`);
          return;
        }
        case 'setItem': {
          const item = cpp.index(expression(statement.target), fromZero(cpp, statement.index, expression));
          context.line(`${cpp.print(item)} = ${code(statement.expression)};${comment}`);
          return;
        }
        case 'add':
          context.line(
            `${cpp.print(cpp.member(expression(statement.target), 'push_back', [expression(statement.expression)]))};${comment}`
          );
          return;
        case 'remove': {
          includes.add('algorithm');
          const list = expression(statement.target);
          const found = cpp.call('std::find', [
            cpp.member(list, 'begin', []),
            cpp.member(list, 'end', []),
            expression(statement.expression)
          ]);
          context.line(`${cpp.print(cpp.member(list, 'erase', [found]))};${comment}`);
          return;
        }
        case 'call':
          context.line(`${code(statement.call)};${comment}`);
          return;
        case 'return':
          context.line(`return${statement.expression ? ` ${code(statement.expression)}` : ''};${comment}`);
          return;
        case 'if':
          context.blocks(branchesOf(statement, (condition, index) => `${index ? 'else ' : ''}if (${code(condition)})`));
          return;
        case 'while':
          context.blocks([loopOf(statement, `while (${code(statement.condition)})`)]);
          return;
        case 'doWhile':
          context.blocks([{text: 'do', line: statement.doLine, body: statement.body}], {
            text: `while (${code(statement.condition)});`,
            line: statement.line
          });
          return;
        case 'repeat': {
          const count = once(statement.count, ['times', 'count']);
          const counter = context.fresh(['i', 'j', 'k']);
          const test = cpp.print(cpp.binary('<', name(counter), count));
          context.blocks([loopOf(statement, `for (int ${counter} = 0; ${test}; ${counter}++)`)]);
          return;
        }
        case 'for': {
          const counter = names.of(statement.name);
          const type = cppType(scope.get(statement.name)!);
          const {down, size, signed} = stepOf(statement);
          //the first value too, when it asks and a later bound is kept, so the program asks in CMIL's order
          const first = once(statement.from, ['first', 'start']);
          const last = once(statement.to, ['last', 'end']);
          const by = size && once(size, ['step', 'by']);
          const test = counterTest(cpp, operator => cpp.binary(operator, name(counter), last), {down, signed}, by);
          const next = !by
            ? `${counter}${down ? '--' : '++'}`
            : `${counter} ${down ? '-=' : '+='} ${cpp.print(cpp.bracketed(by, PRECEDENCE['+'] + 1))}`;
          const start = `${declares ? `${type} ` : ''}${counter} = ${cpp.print(first)}`;
          context.blocks([loopOf(statement, `for (${start}; ${test}; ${next})`)]);
          return;
        }
        case 'forEach': {
          const type = typeOf(statement.expression);
          let items = code(statement.expression);
          if (!isList(type)) {
            helpers.use('letters');
            items = `letters(${items})`;
          } else if (changesItsList(statement)) {
            //the loop changes the list, so it passes a copy: the items the list had when the loop started
            items = `${cppType(type)}(${items})`;
          }
          const item = cppType(scope.get(statement.name)!);
          if (declares) {
            context.blocks([loopOf(statement, `for (${item} ${names.of(statement.name)} : ${items})`)]);
          } else {
            //the variable is used after the loop too, so it gets each item
            const each = context.fresh(['item', 'each']);
            context.blocks([
              loopOf(statement, `for (${item} ${each} : ${items})`, {first: [`${names.of(statement.name)} = ${each};`]})
            ]);
          }
          return;
        }
        case 'break':
        case 'continue':
          context.line(`${statement.type};${comment}`);
          return;
      }
    }
  });

  const definitions = tree.statements.filter(statement => statement.type === 'function');
  const signature = (definition: Statement & {type: 'function'}) => {
    const scope = types.variables.get(definition.name)!;
    const result = types.results.get(definition.name)!;
    const changed = changedIn(definition.body);
    const shared = sharedListsOf(tree.statements, definition);
    const assigned = assignedIn(definition.body);
    const parameters = definition.parameters.map(parameter => {
      const type = scope.get(parameter)!;
      const written = `${cppType(type)} ${names.of(parameter)}`;
      if (!isList(type) || assigned.has(parameter)) return written;
      //a list is shared with the function, as in CMIL, when the caller sees its changes; one it changes that no caller
      //sees is its own copy, and one it only reads is const
      if (shared.has(parameter)) return written.replace(' ', '& ');
      return changed.has(parameter) ? written : `const ${written.replace(' ', '& ')}`;
    });
    return `${result === 'unknown' ? 'void' : cppType(result)} ${names.of(definition.name)}(${parameters.join(', ')})`;
  };

  //the functions first, then main with the program, each with the comments before its lines
  const functions = new Writer('    ');
  const main = new Writer('    ');
  for (const definition of definitions) {
    assignments = assignedIn(definition.body);
    trivia.before(functions, definition.line);
    functions.line(`${signature(definition)} {${trivia.after(definition.line)}`, definition.line);
    functions.block(() =>
      block(functions, definition.body, types.variables.get(definition.name)!, new Set(definition.parameters))
    );
    functions.line('}');
    functions.blank();
  }
  assignments = assignedIn(tree.statements.filter(statement => statement.type !== 'function'));
  main.block(() => {
    block(main, tree.statements, types.variables.get('')!, new Set());
    trivia.rest(main);
  });

  //a function called by one written before it needs its prototype first
  const prototypes = definitions.filter((definition, index) =>
    definitions.slice(0, index).some(earlier => callsIn(earlier).has(definition.name))
  );
  if (printsReal) includes.add('iomanip');

  const out = new Writer('    ');
  for (const include of INCLUDES.filter(include => includes.has(include))) out.line(`#include <${include}>`);
  helpers.write(out, helper => helper.code([words.true[0], words.false[0]]));
  if (prototypes.length) {
    out.blank();
    prototypes.forEach(definition => out.line(`${signature(definition)};`));
  }
  out.blank();
  out.append(functions);
  out.blank();
  out.line('int main() {');
  out.block(() => {
    if (printsBoolean) out.line('std::cout << std::boolalpha; // print true and false as words');
    if (printsReal) out.line('std::cout << std::setprecision(12); // print numbers with up to 12 digits, like CMIL');
  });
  out.append(main);
  out.line('}');
  return out.converted();
};
