/**
 * C++: what a teacher writes, in C++20, that prints what the CMIL program prints. Numbers are int or double, texts
 * std::string, lists std::vector; the helpers a program needs come first, each with what it is for.
 */
import {COMMAND} from '../../constants/index.ts';
import TRANSLATION from '../../translations/index.ts';
import {
  Names,
  Trivia,
  Writer,
  assignedIn,
  blocksOf,
  callsIn,
  changedIn,
  fromZero,
  joinedParts,
  namesIn,
  ownNames,
  variablesIn,
  type Converted
} from '../emit.ts';
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
    'number_text value_text item_text letters uppercase lowercase split_words split join round_to random_number',
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
const UNARY = 8;
const POSTFIX = 9;
const ATOM = 10;

const OPERATORS: Record<string, string> = {[COMMAND.AND]: '&&', [COMMAND.OR]: '||'};

type Helper = {includes: string[]; uses?: string[]; code: (quotes: [string, string]) => string[]};

//the helpers, by name, in the order they are written: the includes they need, the helpers they use, and their code
const HELPERS: Record<string, Helper> = {
  number_text: {
    includes: ['sstream', 'iomanip', 'string'],
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
    includes: ['string', 'vector'],
    uses: ['number_text'],
    code: ([open, close]) => [
      '// a value as CMIL prints it; in a list, a text is in quotes, like [1, 2, "a"]',
      'std::string value_text(int number) { return std::to_string(number); }',
      'std::string value_text(double number) { return number_text(number); }',
      'std::string value_text(bool value) { return value ? "true" : "false"; }',
      'std::string value_text(const std::string& text) { return text; }',
      'template <typename T>',
      'std::string value_text(const std::vector<T>& list);',
      'template <typename T>',
      'std::string item_text(const T& item) { return value_text(item); }',
      '// a text in a list is in quotes, with \\ before a quote or a \\ in it, and \\n and \\t for a new line and a tab',
      'std::string item_text(const std::string& text) {',
      `    std::string quoted = ${literal(open)};`,
      '    for (char letter : text) {',
      `        if (letter == '\\n') quoted += "\\\\n";`,
      `        else if (letter == '\\t') quoted += "\\\\t";`,
      `        else if (letter == '\\\\'${close.length === 1 ? ` || letter == '${close === "'" ? "\\'" : close}'` : ''}) quoted += std::string("\\\\") + letter;`,
      '        else quoted += letter;',
      '    }',
      `    return quoted + ${literal(close)};`,
      '}',
      'template <typename T>',
      'std::string value_text(const std::vector<T>& list) {',
      '    std::string text = "[";',
      '    for (std::size_t i = 0; i < list.size(); i++) {',
      '        if (i > 0) text += ", ";',
      '        text += item_text(list[i]);',
      '    }',
      '    return text + "]";',
      '}'
    ]
  },
  letters: {
    includes: ['string', 'vector'],
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
    includes: ['string', 'cctype'],
    code: () => [
      '// a text in capital letters; std::toupper changes only English letters',
      'std::string uppercase(std::string text) {',
      '    for (char& letter : text) letter = std::toupper(static_cast<unsigned char>(letter));',
      '    return text;',
      '}'
    ]
  },
  lowercase: {
    includes: ['string', 'cctype'],
    code: () => [
      '// a text in small letters; std::tolower changes only English letters',
      'std::string lowercase(std::string text) {',
      '    for (char& letter : text) letter = std::tolower(static_cast<unsigned char>(letter));',
      '    return text;',
      '}'
    ]
  },
  split_words: {
    includes: ['string', 'vector', 'sstream'],
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
    includes: ['string', 'vector'],
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
    includes: ['string', 'vector'],
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
    includes: ['cmath', 'string'],
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
    includes: ['random'],
    code: () => [
      '// a random whole number from min to max',
      'std::mt19937 generator(std::random_device{}());',
      'int random_number(int min, int max) {',
      '    return std::uniform_int_distribution<int>(min, max)(generator);',
      '}'
    ]
  },
  read_text: {
    includes: ['iostream', 'string'],
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
    includes: ['iostream'],
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
const literal = (text: string) =>
  `"${text.replace(/[\\"\n\t]/g, symbol => ({'\\': '\\\\', '"': '\\"', '\n': '\\n', '\t': '\\t'})[symbol]!)}"`;

const isSimple = (node: Expression) => node.type === 'variable' || node.type === 'value';

//whether a block has a name
const has = (name: string) => (statements: Statement[]) => statements.some(statement => namesIn(statement).has(name));

/**
 * Writes a program in C++.
 */
export const toCpp = (tree: ProgramTree, types: Types, sourceCode: string): Converted => {
  const names = new Names(tree.names, RESERVED);
  const trivia = new Trivia(tree.comments, sourceCode, '//');
  const helpers = new Set<string>();
  const includes = new Set<string>();
  const english = tree.language === 'en';
  const {words, quotes} = TRANSLATION[tree.language];
  let printsReal = false;
  let printsBoolean = false;
  //how often each variable of the scope being written gets a value
  let assignments = new Map<string, number>();

  const use = (helper: string) => {
    if (helpers.has(helper)) return;
    for (const used of HELPERS[helper].uses ?? []) use(used);
    helpers.add(helper);
    HELPERS[helper].includes.forEach(include => includes.add(include));
  };

  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';

  //an expression, in brackets when its operator binds more loosely than its place needs
  const expression = (node: Expression, need = 0): string => {
    const [text, precedence] = write(node);
    return precedence < need ? `(${text})` : text;
  };

  const call = (name: string, args: string[]): [string, number] => [`${name}(${args.join(', ')})`, POSTFIX];

  //the items of a list in braces, with the lists in it in braces too, like {{1, 2}, {3}}
  const braced = (node: Expression & {type: 'list'}): string =>
    `{${node.items.map(item => (item.type === 'list' ? braced(item) : expression(item))).join(', ')}}`;

  //a value as a C++ object, for a call of its method: a text in quotes becomes a std::string first
  const object = (node: Expression) =>
    node.type === 'value' && typeof node.value === 'string'
      ? `std::string(${expression(node)})`
      : expression(node, POSTFIX);

  //a boolean in the words of the program's language, as CMIL prints it
  const inWords = (node: Expression) =>
    `(${expression(node, 1)} ? ${literal(words.true[0])} : ${literal(words.false[0])})`;

  //a value as a text, to join with +, and whether it is a std::string already rather than a text in quotes
  const asText = (node: Expression): [string, boolean] => {
    const type = typeOf(node);
    if (type === 'text') return [expression(node, PRECEDENCE['+'] + 1), node.type !== 'value'];
    if (type === 'whole') return [`std::to_string(${expression(node)})`, true];
    if (type === 'real') {
      use('number_text');
      return [`number_text(${expression(node)})`, true];
    }
    if (type === 'boolean') return [inWords(node), false];
    use('value_text');
    return [`value_text(${expression(node)})`, true];
  };

  const write = (node: Expression): [string, number] => {
    switch (node.type) {
      case 'value':
        if (node.constant) {
          includes.add('numbers');
          return [`std::numbers::${node.constant}`, ATOM];
        }
        if (typeof node.value === 'string') {
          includes.add('string');
          return [literal(node.value), ATOM];
        }
        return [String(node.value), ATOM];
      case 'list':
        includes.add('vector');
        return [`${cppType(typeOf(node))}${braced(node)}`, ATOM];
      case 'variable':
        return [names.of(node.name), ATOM];
      case 'index': {
        const index = fromZero(node.index, position => expression(position, PRECEDENCE['-']));
        if (isList(typeOf(node.target))) return [`${expression(node.target, POSTFIX)}[${index}]`, POSTFIX];
        use('letters');
        return [`letters(${expression(node.target)})[${index}]`, POSTFIX];
      }
      case 'input':
        use(typeOf(node) === 'real' ? 'read_number' : 'read_text');
        return call(typeOf(node) === 'real' ? 'read_number' : 'read_text', []);
      case 'userCall':
        return call(
          names.of(node.name),
          node.args.map(arg => expression(arg))
        );
      case 'call':
        return builtIn(node);
      case 'unary':
        return [`${node.operator === COMMAND.NOT ? '!' : node.operator}${expression(node.operand, UNARY)}`, UNARY];
      case 'binary':
        return binary(node);
    }
  };

  const binary = (node: Expression & {type: 'binary'}): [string, number] => {
    const left = typeOf(node.left);
    const right = typeOf(node.right);

    if (node.operator === '+' && typeOf(node) === 'text') {
      const parts = joinedParts(node, types).map(asText);
      //two texts in quotes can't be added in C++, so the first one becomes a std::string
      if (!parts[0][1] && !parts[1][1]) {
        includes.add('string');
        parts[0][0] = `std::string(${parts[0][0]})`;
      }
      return [parts.map(([text]) => text).join(' + '), PRECEDENCE['+']];
    }
    if (node.operator === COMMAND.IN) {
      if (isList(right)) {
        includes.add('algorithm');
        const list = expression(node.right, POSTFIX);
        return [
          `std::find(${list}.begin(), ${list}.end(), ${expression(node.left)}) != ${list}.end()`,
          PRECEDENCE['!=']
        ];
      }
      return [`${object(node.right)}.find(${expression(node.left)}) != std::string::npos`, PRECEDENCE['!=']];
    }
    //a whole number divided by a whole number is a whole number in C++, so the first one becomes a double
    if (node.operator === '/' && left === 'whole' && right === 'whole') {
      const dividend =
        node.left.type === 'value' ? `${node.left.value}.0` : `static_cast<double>(${expression(node.left)})`;
      return [`${dividend} / ${expression(node.right, PRECEDENCE['/'] + 1)}`, PRECEDENCE['/']];
    }
    if (node.operator === '%' && (left === 'real' || right === 'real')) {
      includes.add('cmath');
      return call('std::fmod', [expression(node.left), expression(node.right)]);
    }
    const operator = OPERATORS[node.operator] ?? node.operator;
    const precedence = PRECEDENCE[operator];
    if (node.operator === '==' || node.operator === '!=') {
      //values of different types are never equal in CMIL; C++ doesn't compare them
      const kind = (type: Type) => (isNumber(type) ? 'number' : isList(type) ? 'list' : type);
      if (kind(left) !== kind(right) && left !== 'unknown' && right !== 'unknown') {
        return [node.operator === '==' ? 'false' : 'true', ATOM];
      }
    }
    //two texts in quotes are compared as texts, not as where they are
    const quoted = (side: Expression) => side.type === 'value' && typeof side.value === 'string';
    const first =
      quoted(node.left) && quoted(node.right)
        ? `std::string(${expression(node.left)})`
        : expression(node.left, precedence);
    return [`${first} ${operator} ${expression(node.right, precedence + 1)}`, precedence];
  };

  const builtIn = (node: Expression & {type: 'call'}): [string, number] => {
    const args = node.args.map(arg => expression(arg));
    const math = (name: string) => {
      includes.add('cmath');
      return call(`std::${name}`, args);
    };
    switch (node.name) {
      case COMMAND.POW:
        return math('pow');
      case COMMAND.SQRT:
        return math('sqrt');
      case COMMAND.SQR: {
        if (!isSimple(node.args[0])) {
          includes.add('cmath');
          return call('std::pow', [args[0], '2']);
        }
        const factor = expression(node.args[0], PRECEDENCE['*'] + 1);
        return [`${factor} * ${factor}`, PRECEDENCE['*']];
      }
      case COMMAND.ROUND:
        if (args.length === 1) return math('round');
        use('round_to');
        return call('round_to', args);
      case COMMAND.FLOOR:
        return math('floor');
      case COMMAND.CEIL:
        return math('ceil');
      case COMMAND.ABS:
        return math('abs');
      case COMMAND.SIN:
      case COMMAND.COS:
      case COMMAND.TAN:
        return math(node.name);
      case COMMAND.ARCSIN:
      case COMMAND.ARCCOS:
      case COMMAND.ARCTAN:
        return math(`a${node.name.slice(3)}`);
      case COMMAND.COT:
        includes.add('cmath');
        return [`1 / std::tan(${args[0]})`, PRECEDENCE['/']];
      case COMMAND.ARCCOT:
        includes.add('cmath');
        includes.add('numbers');
        return [`std::numbers::pi / 2 - std::atan(${args[0]})`, PRECEDENCE['-']];
      case COMMAND.LN:
        return math('log');
      case COMMAND.LG:
        return math('log10');
      case COMMAND.LOG:
        includes.add('cmath');
        return [`std::log(${args[1]}) / std::log(${args[0]})`, PRECEDENCE['/']];
      case COMMAND.RANDOM:
        use('random_number');
        return call('random_number', args.length === 1 ? ['1', args[0]] : args);
      case COMMAND.LENGTH:
        if (isList(typeOf(node.args[0]))) return [`${expression(node.args[0], POSTFIX)}.size()`, POSTFIX];
        use('letters');
        return [`letters(${args[0]}).size()`, POSTFIX];
      case COMMAND.UPPER:
      case COMMAND.LOWER: {
        const helper = node.name === COMMAND.UPPER ? 'uppercase' : 'lowercase';
        use(helper);
        return call(helper, args);
      }
      case COMMAND.NUMBER:
        if (isNumber(typeOf(node.args[0]))) return write(node.args[0]);
        includes.add('string');
        return call('std::stod', args);
      case COMMAND.TEXT:
        return [asText(node.args[0])[0], PRECEDENCE['+']];
      case COMMAND.SPLIT:
        use(args.length === 1 ? 'split_words' : 'split');
        return call(args.length === 1 ? 'split_words' : 'split', args);
      case COMMAND.JOIN:
        use('join');
        return call('join', args.length === 1 ? [args[0], '""'] : args);
    }
    throw new Error(`No C++ for ${node.name}`);
  };

  //the values print prints, each after <<
  const printed = (node: Expression): string[] =>
    (node.type === 'binary' && typeOf(node) === 'text' ? joinedParts(node, types) : [node]).map(part => {
      const type = typeOf(part);
      if (type === 'real') printsReal = true;
      if (type === 'boolean' && !english) return inWords(part);
      if (type === 'boolean') printsBoolean = true;
      if (isList(type)) {
        use('value_text');
        return `value_text(${expression(part)})`;
      }
      return expression(part, PRECEDENCE['<<'] + 1);
    });

  //the variables a block declares: where they get their first value, or before the statement that first has them
  const declarations = (statements: Statement[], scope: Map<string, Type>, declared: Set<string>) => {
    const before = new Map<number, string[]>();
    const inline = new Set<Statement>();
    const used = statements.map(statement => namesIn(statement));
    for (const name of scope.keys()) {
      if (declared.has(name)) continue;
      const first = used.findIndex(found => found.has(name));
      if (first < 0) continue;
      const statement = statements[first];
      const elsewhere = used.some((found, index) => index !== first && found.has(name));
      if (statement.type === 'assign' && statement.name === name) inline.add(statement);
      else if ((statement.type === 'for' || statement.type === 'forEach') && statement.name === name && !elsewhere) {
        inline.add(statement);
      } else if (elsewhere || ownNames(statement).has(name) || blocksOf(statement).filter(has(name)).length !== 1) {
        before.set(first, [...(before.get(first) ?? []), name]);
      }
      //else the one block that has it declares it
    }
    return {before, inline};
  };

  const block = (out: Writer, statements: Statement[], scope: Map<string, Type>, declared: Set<string>) => {
    const {before, inline} = declarations(statements, scope, declared);
    statements.forEach((statement, index) => {
      trivia.before(out, statement.type === 'doWhile' ? statement.doLine : statement.line);
      for (const name of before.get(index) ?? []) {
        out.line(`${cppType(scope.get(name)!)} ${names.of(name)};`, statement.line);
        declared.add(name);
      }
      emit(out, statement, scope, declared, inline.has(statement));
    });
  };

  const emit = (
    out: Writer,
    statement: Statement,
    scope: Map<string, Type>,
    declared: Set<string>,
    declares: boolean
  ) => {
    const {line} = statement;
    const after = trivia.after(line);
    const body = (statements: Statement[]) => out.block(() => block(out, statements, scope, declared));
    //CMIL reads the bounds of a loop once; when the loop changes them, C++ keeps them in a variable first
    const once = (bound: Expression, type: string, candidates: string[]) => {
      const changed = assignedIn('body' in statement ? statement.body : []);
      if (![...variablesIn(bound)].some(name => changed.has(name))) return expression(bound, PRECEDENCE['<'] + 1);
      const name = names.fresh(candidates);
      out.line(`const ${type} ${name} = ${expression(bound)};`, line);
      return name;
    };
    if (declares && 'name' in statement) declared.add(statement.name);

    switch (statement.type) {
      case 'print':
        includes.add('iostream');
        out.line(`std::cout << ${printed(statement.expression).join(' << ')} << '\\n';${after}`, line);
        return;
      case 'assign': {
        const name = names.of(statement.name);
        const type = cppType(scope.get(statement.name)!);
        if (statement.expression.type === 'input') {
          includes.add('iostream');
          if (declares) out.line(`${type} ${name};`, line);
          if (types.expressions.get(statement.expression) === 'real') {
            out.line(`std::cin >> ${name};${after}`, line);
          } else {
            includes.add('string');
            out.line(`std::getline(std::cin >> std::ws, ${name});${after}`, line);
          }
          return;
        }
        if (declares && statement.expression.type === 'list') {
          includes.add('vector');
          const items = statement.expression.items.length ? ` = ${braced(statement.expression)}` : '';
          out.line(`${type} ${name}${items};${after}`, line);
          return;
        }
        //a list is shared by the variables it is in, so a variable that only ever has another's list refers to it
        if (
          declares &&
          statement.expression.type === 'variable' &&
          type.startsWith('std::vector') &&
          assignments.get(statement.name) === 1
        ) {
          out.line(`${type}& ${name} = ${expression(statement.expression)};${after}`, line);
          return;
        }
        out.line(`${declares ? `${type} ` : ''}${name} = ${expression(statement.expression)};${after}`, line);
        return;
      }
      case 'setItem': {
        const index = fromZero(statement.index, position => expression(position, PRECEDENCE['-']));
        out.line(
          `${expression(statement.target, POSTFIX)}[${index}] = ${expression(statement.expression)};${after}`,
          line
        );
        return;
      }
      case 'add':
        out.line(
          `${expression(statement.target, POSTFIX)}.push_back(${expression(statement.expression)});${after}`,
          line
        );
        return;
      case 'remove': {
        includes.add('algorithm');
        const list = expression(statement.target, POSTFIX);
        const item = expression(statement.expression);
        out.line(`${list}.erase(std::find(${list}.begin(), ${list}.end(), ${item}));${after}`, line);
        return;
      }
      case 'call':
        out.line(`${expression(statement.call)};${after}`, line);
        return;
      case 'return':
        out.line(`return${statement.expression ? ` ${expression(statement.expression)}` : ''};${after}`, line);
        return;
      case 'if':
        statement.branches.forEach((branch, index) => {
          if (index) trivia.before(out, branch.line);
          out.line(
            `${index ? '} else ' : ''}if (${expression(branch.condition)}) {${trivia.after(branch.line)}`,
            branch.line
          );
          body(branch.body);
        });
        if (statement.elseLine) {
          trivia.before(out, statement.elseLine);
          out.line(`} else {${trivia.after(statement.elseLine)}`, statement.elseLine);
          body(statement.elseBody);
        }
        out.line('}');
        return;
      case 'while':
        out.line(`while (${expression(statement.condition)}) {${after}`, line);
        body(statement.body);
        out.line('}');
        return;
      case 'doWhile':
        out.line(`do {${trivia.after(statement.doLine)}`, statement.doLine);
        body(statement.body);
        trivia.before(out, line);
        out.line(`} while (${expression(statement.condition)});${after}`, line);
        return;
      case 'repeat': {
        const count = once(statement.count, 'int', ['times', 'count']);
        const counter = names.fresh(['i', 'j', 'k']);
        out.line(`for (int ${counter} = 0; ${counter} < ${count}; ${counter}++) {${after}`, line);
        body(statement.body);
        out.line('}');
        names.release(counter);
        return;
      }
      case 'for': {
        const name = names.of(statement.name);
        const {step} = statement;
        //a step in the program like -2, or a step of a value that has no sign in the program
        const negative = step?.type === 'unary' && step.operator === '-';
        const size = step && (step.type === 'unary' && negative ? step.operand : step);
        const next =
          !size || (size.type === 'value' && size.value === 1)
            ? `${name}${negative ? '--' : '++'}`
            : `${name} ${negative ? '-=' : '+='} ${expression(size, PRECEDENCE['+'] + 1)}`;
        const test = `${name} ${negative ? '>=' : '<='} ${once(statement.to, cppType(scope.get(statement.name)!), ['last', 'end'])}`;
        const start = `${declares ? `${cppType(scope.get(statement.name)!)} ` : ''}${name} = ${expression(statement.from)}`;
        out.line(`for (${start}; ${test}; ${next}) {${after}`, line);
        body(statement.body);
        out.line('}');
        return;
      }
      case 'forEach': {
        const type = typeOf(statement.expression);
        let items = expression(statement.expression);
        if (!isList(type)) {
          use('letters');
          items = `letters(${items})`;
        } else if (
          [...variablesIn(statement.expression)].some(
            name => changedIn(statement.body).has(name) || assignedIn(statement.body).has(name)
          )
        ) {
          //the loop changes the list, so it passes a copy: the items the list had when the loop started
          items = `${cppType(type)}(${items})`;
        }
        const item = cppType(scope.get(statement.name)!);
        if (declares) {
          out.line(`for (${item} ${names.of(statement.name)} : ${items}) {${after}`, line);
          body(statement.body);
        } else {
          //the variable is used after the loop too, so it gets each item
          const each = names.fresh(['item', 'each']);
          out.line(`for (${item} ${each} : ${items}) {${after}`, line);
          out.block(() => out.line(`${names.of(statement.name)} = ${each};`, line));
          body(statement.body);
          names.release(each);
        }
        out.line('}');
        return;
      }
      case 'break':
      case 'continue':
        out.line(`${statement.type};${after}`, line);
        return;
    }
  };

  const definitions = tree.statements.filter(statement => statement.type === 'function');
  const signature = (definition: Statement & {type: 'function'}) => {
    const scope = types.variables.get(definition.name)!;
    const result = types.results.get(definition.name)!;
    const changed = changedIn(definition.body);
    const assigned = assignedIn(definition.body);
    const parameters = definition.parameters.map(parameter => {
      const type = scope.get(parameter)!;
      const written = `${cppType(type)} ${names.of(parameter)}`;
      if (!isList(type) || assigned.has(parameter)) return written;
      //a list is shared with the function, as in CMIL; one the function only reads is const
      return changed.has(parameter) ? written.replace(' ', '& ') : `const ${written.replace(' ', '& ')}`;
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
    block(
      main,
      tree.statements.filter(statement => statement.type !== 'function'),
      types.variables.get('')!,
      new Set()
    );
    trivia.rest(main);
  });

  //a function called by one written before it needs its prototype first
  const prototypes = definitions.filter((definition, index) =>
    definitions.slice(0, index).some(earlier => callsIn(earlier).has(definition.name))
  );
  if (printsReal) includes.add('iomanip');

  const out = new Writer('    ');
  for (const include of INCLUDES.filter(include => includes.has(include))) out.line(`#include <${include}>`);
  for (const helper of Object.keys(HELPERS).filter(helper => helpers.has(helper))) {
    out.blank();
    HELPERS[helper].code(quotes[0]).forEach(text => out.line(text));
  }
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
