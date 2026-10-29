/**
 * PHP: what a teacher writes, a script for the command line that prints what the CMIL program prints, laid out as
 * PSR-12 lays it out. Its variables are $name, its texts with values in them have the variables in them, like
 * "Hi, $name!", and other values joined with ., and its arrays are values, so a function that changes a list gets it
 * by reference, &$list. The functions of the program come first, and the helpers a program needs after the program,
 * each with what it is for.
 */
import {COMMAND} from '../../constants/index.ts';
import TRANSLATION from '../../translations/index.ts';
import {counterTest, fromZero, Grammar, mathOf, POSTFIX, UNARY, type Code} from '../code.ts';
import {
  Helpers,
  Names,
  Trivia,
  Writer,
  sharedListsOf,
  isJoined,
  isText,
  joinedParts,
  quoted,
  stepOf,
  type Converted
} from '../emit.ts';
import {SAME_LINE, branchesOf, loopOf, statementsOf} from '../statements.ts';
import {isList, isNumber, type Type, type Types} from '../types.ts';
import type {ProgramTree} from '../../program.ts';
import type {Writers} from '../registry.ts';
import type {Expression} from '../../core/types.ts';

//the variables of PHP that a program's variables can't be
const VARIABLES = new Set(
  'this GLOBALS _SERVER _GET _POST _FILES _COOKIE _SESSION _REQUEST _ENV argv argc http_response_header'.split(' ')
);

//the words of PHP, the helpers, and the functions of PHP named by one word, which a program's functions can't be,
//whatever their case
const FUNCTIONS = new Set(
  [
    'abstract and array as break callable case catch class clone const continue declare default do echo else elseif',
    'empty enddeclare endfor endforeach endif endswitch endwhile enum eval exit extends final finally fn for foreach',
    'function global goto if implements include include_once instanceof insteadof interface isset list match',
    'namespace new or print private protected public readonly require require_once return static switch throw trait',
    'try unset use var while xor yield die self parent true false null show roundto',
    'abs acos acosh addcslashes addslashes arsort asin asinh asort assert atan atanh basename bindec bindtextdomain',
    'boolval ceil chdir checkdate checkdnsrr chgrp chmod chop chown chr chroot clearstatcache closedir closelog',
    'compact constant copy cos cosh count crypt current date dcgettext dcngettext decbin dechex decoct define',
    'defined dgettext dir dirname diskfreespace dl dngettext doubleval end escapeshellarg escapeshellcmd exec exp',
    'explode extract fclose fdatasync fdiv feof fflush fgetc fgetcsv fgets file fileatime filectime filegroup',
    'fileinode filemtime fileowner fileperms filesize filetype floatval flock floor flush fmod fnmatch fopen',
    'fpassthru fprintf fputcsv fputs fread frenchtojd fscanf fseek fsockopen fstat fsync ftell ftok ftruncate fwrite',
    'getcwd getdate getenv gethostbyaddr gethostbyname gethostbynamel gethostname getimagesize',
    'getimagesizefromstring getlastmod getmxrr getmygid getmyinode getmypid getmyuid getopt getprotobyname',
    'getprotobynumber getrandmax getrusage getservbyname getservbyport gettext gettimeofday gettype glob gmdate',
    'gmmktime gmstrftime gregoriantojd gzclose gzcompress gzdecode gzdeflate gzencode gzeof gzfile gzgetc gzgets',
    'gzinflate gzopen gzpassthru gzputs gzread gzrewind gzseek gztell gzuncompress gzwrite hash header hebrev hexdec',
    'hrtime htmlentities htmlspecialchars hypot iconv idate implode intdiv intval iptcembed iptcparse jddayofweek',
    'jdmonthname jdtofrench jdtogregorian jdtojewish jdtojulian jdtounix jewishtojd join juliantojd key krsort ksort',
    'lcfirst lchgrp lchown levenshtein link linkinfo localeconv localtime log lstat ltrim mail max metaphone mhash',
    'microtime min mkdir mktime natcasesort natsort next ngettext octdec opendir openlog ord pack passthru pathinfo',
    'pclose pfsockopen phpcredits phpinfo phpversion pi popen pos pow prev printf putenv quotemeta rand range',
    'rawurldecode rawurlencode readdir readfile readgzfile readline readlink realpath rename reset rewind rewinddir',
    'rmdir round rsort rtrim scandir serialize setcookie setlocale setrawcookie settype shuffle sin sinh sizeof',
    'sleep sort soundex sprintf sqrt srand sscanf stat strcasecmp strchr strcmp strcoll strcspn strftime',
    'stripcslashes stripos stripslashes stristr strlen strnatcasecmp strnatcmp strncasecmp strncmp strpbrk strpos',
    'strptime strrchr strrev strripos strrpos strspn strstr strtok strtolower strtotime strtoupper strtr strval',
    'substr symlink syslog system tan tanh tempnam textdomain time tmpfile touch trim uasort ucfirst ucwords uksort',
    'umask uniqid unixtojd unlink unpack unserialize urldecode urlencode usleep usort vfprintf vprintf vsprintf',
    'wordwrap'
  ]
    .join(' ')
    .split(' ')
);

//the precedence of PHP's operators, from the loosest: . binds more loosely than + and -, and ** more tightly than -
//before a number, so -2 ** 2 is -(2 ** 2)
const PRECEDENCE: Record<string, number> = {
  '||': 1,
  '&&': 2,
  '==': 3,
  '!=': 3,
  '===': 3,
  '!==': 3,
  '<': 4,
  '>': 4,
  '<=': 4,
  '>=': 4,
  '.': 5,
  '+': 6,
  '-': 6,
  '*': 7,
  '/': 7,
  '%': 7,
  '**': UNARY + 1
};

const OPERATORS: Record<string, string> = {[COMMAND.AND]: '&&', [COMMAND.OR]: '||'};

const php = new Grammar(PRECEDENCE);
const name = (text: string) => php.atom(text);

//a comparison, which PHP doesn't chain, so a comparison in it is in brackets
const compare = (operator: string, left: Code, right: Code) => {
  const precedence = PRECEDENCE[operator];
  return php.binary(operator, left, right, [precedence + 1, precedence + 1]);
};

//a power: a value with a sign is in brackets before **, like (-2) ** 2, and needn't be after it, like 2 ** -1
const power = (base: Code, exponent: Code) => php.binary('**', base, exponent, [PRECEDENCE['**'] + 1, UNARY]);

//a text as PHP writes it, in double quotes, with \$ for a $, which would start a variable
const literal = (text: string) => quoted(text, {$: '\\$'});

type Helper = {code: (words: [string, string]) => string[]; uses?: string[]};

//the helpers, by name, in the order they are written: the helpers they use, and their code
const HELPERS: Record<string, Helper> = {
  show: {
    code: ([yes, no]) => [
      '// a value as CMIL prints it: a real number with up to 12 digits, and a boolean in words',
      'function show($value): string',
      '{',
      '    if (is_float($value)) {',
      "        return sprintf('%.12g', $value);",
      '    }',
      '    if (is_bool($value)) {',
      `        return $value ? ${literal(yes)} : ${literal(no)};`,
      '    }',
      '    return (string) $value;',
      '}'
    ]
  },
  roundTo: {
    uses: ['show'],
    code: () => [
      '// a number rounded to a count of decimals, a half up, after rounding it like it is printed, so 1.005 is 1.01',
      'function roundTo(float $number, int $digits): float',
      '{',
      '    $factor = 10 ** $digits;',
      '    return floor((float) show($number * $factor) + 0.5) / $factor;',
      '}'
    ]
  }
};

/** The type of a value as PHP declares it: int, float, string, bool or array; none when the program doesn't say. */
export const phpType = (type: Type): string | undefined => {
  if (isList(type)) return 'array';
  return {whole: 'int', real: 'float', text: 'string', boolean: 'bool'}[type as string];
};

/**
 * Writes a program in PHP.
 */
export const toPhp = (tree: ProgramTree, types: Types, sourceCode: string): Converted => {
  const definitions = tree.statements.flatMap(statement => (statement.type === 'function' ? [statement] : []));
  const functionNames = new Set(definitions.map(({name}) => name));
  //the names of variables, and of functions, which are PHP's whatever their case
  const names = new Names(
    Object.fromEntries(Object.entries(tree.names).filter(([key]) => !functionNames.has(key))),
    VARIABLES
  );
  const functions = new Names(
    Object.fromEntries(Object.entries(tree.names).filter(([key]) => functionNames.has(key))),
    FUNCTIONS,
    {caseless: true}
  );
  const trivia = new Trivia(tree.comments, sourceCode, '//');
  const helpers = new Helpers(HELPERS);
  const {words: commands} = TRANSLATION[tree.language];
  const words: [string, string] = [commands.true[0], commands.false[0]];

  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';
  const code = (node: Expression) => php.print(expression(node));
  const variable = (key: string) => `$${names.of(key)}`;

  //a boolean in the words of the program's language, as CMIL prints it, which echo prints as 1 or nothing
  const inWords = (node: Expression) =>
    php.atom(
      `${php.print(php.bracketed(expression(node), PRECEDENCE['||'] + 1))} ? ${literal(words[0])} : ${literal(words[1])}`,
      0
    );

  //a value as a text: a whole number and a text as PHP prints them, a boolean in words, and any other, like a real
  //number, as CMIL prints it
  const asText = (node: Expression): Code => {
    const type = typeOf(node);
    if (type === 'whole' || type === 'text') return expression(node);
    if (type === 'boolean') return inWords(node);
    helpers.use('show');
    return php.call('show', [expression(node)]);
  };

  //values joined into a text, in double quotes: a variable in them, like "Hi, $name!", in braces when what follows it
  //could be of its name, which PHP's names have, like a letter or any mark past ASCII, like ⭐, and any other value
  //joined to them with .
  const joinText = (parts: Expression[], end = ''): Code => {
    //a whole number alone, like "{1 + 1}", is no text without a . to join it, but a variable is one in quotes
    if (!end && parts.length === 1 && parts[0].type !== 'variable' && typeOf(parts[0]) === 'whole') {
      return php.call('strval', [expression(parts[0])]);
    }
    const pieces: Code[] = [];
    let text = '';
    parts.forEach((part, index) => {
      if (isText(part)) {
        text += literal(part.value).slice(1, -1);
        return;
      }
      const type = typeOf(part);
      if (part.type === 'variable' && (type === 'text' || type === 'whole')) {
        const next = parts[index + 1];
        const joins = next && isText(next) && /^([\w[\u0080-\u{10FFFF}]|->)/u.test(next.value);
        text += joins ? `{${variable(part.name)}}` : variable(part.name);
        return;
      }
      if (text) pieces.push(name(`"${text}"`));
      text = '';
      pieces.push(asText(part));
    });
    if (text || end || !pieces.length) pieces.push(name(`"${text}${end}"`));
    return pieces.reduce((left, right) => php.binary('.', left, right));
  };

  const expression = (node: Expression): Code => {
    switch (node.type) {
      case 'value':
        if (node.constant) return name(node.constant === 'pi' ? 'M_PI' : 'M_E');
        if (typeof node.value === 'string') return name(literal(node.value));
        if (typeof node.value === 'number' && node.value < 0) return php.unary('-', name(String(-node.value)));
        return name(String(node.value));
      case 'list':
        return php.items('[', node.items.map(expression), ']');
      case 'template':
        return joinText(joinedParts(node, types));
      case 'variable':
        return name(variable(node.name));
      case 'index':
        if (isList(typeOf(node.target)))
          return php.index(expression(node.target), fromZero(php, node.index, expression));
        //a letter of a text, which mb_substr counts by its letters, and substr by bytes
        return php.call('mb_substr', [expression(node.target), fromZero(php, node.index, expression), name('1')]);
      case 'input': {
        const answer = php.call('fgets', [name('STDIN')]);
        return typeOf(node) === 'real' ? php.unary('(float) ', answer) : php.call('rtrim', [answer, name('"\\r\\n"')]);
      }
      case 'userCall':
        return php.call(functions.of(node.name), node.args.map(expression));
      case 'call':
        return builtIn(node);
      case 'unary':
        return php.unary(node.operator === COMMAND.NOT ? '!' : node.operator, expression(node.operand));
      case 'binary':
        return binary(node);
    }
  };

  const binary = (node: Expression & {type: 'binary'}): Code => {
    const left = typeOf(node.left);
    const right = typeOf(node.right);

    if (node.operator === '+' && typeOf(node) === 'text') return joinText(joinedParts(node, types));
    if (node.operator === COMMAND.IN) {
      if (!isList(right)) return php.call('str_contains', [expression(node.right), expression(node.left)]);
      //texts are found as they are, numbers like numbers, 1 like 1.0
      const strict = isList(right) && !isNumber(right.list) ? [name('true')] : [];
      return php.call('in_array', [expression(node.left), expression(node.right), ...strict]);
    }
    //the remainder of real numbers, which % gives only of whole numbers
    if (node.operator === '%' && (left === 'real' || right === 'real')) {
      return php.call('fmod', [expression(node.left), expression(node.right)]);
    }
    const operator = OPERATORS[node.operator] ?? node.operator;
    //numbers are equal like numbers, other values when they are the same, which === says, since == finds "1e3" equal to
    //"1000"
    if (node.operator === '==' || node.operator === '!=') {
      const loose = isNumber(left) && isNumber(right);
      const same = loose ? node.operator : node.operator === '==' ? '===' : '!==';
      return compare(same, expression(node.left), expression(node.right));
    }
    //texts are put in order letter by letter, by strcmp(), since < compares texts of numbers as numbers
    if (left === 'text' && right === 'text' && PRECEDENCE[operator] === PRECEDENCE['<']) {
      return compare(operator, php.call('strcmp', [expression(node.left), expression(node.right)]), name('0'));
    }
    if (PRECEDENCE[operator] === PRECEDENCE['<'])
      return compare(operator, expression(node.left), expression(node.right));
    return php.binary(operator, expression(node.left), expression(node.right));
  };

  const builtIn = (node: Expression & {type: 'call'}): Code => {
    const args = node.args.map(expression);
    const [first] = node.args;
    //a whole number is its own floor, ceiling and rounding, and floor() and ceil() give a real one
    const rounded = (method: string): Code =>
      typeOf(first) === 'whole' ? args[0] : php.unary('(int) ', php.call(method, [args[0]]));
    switch (node.name) {
      case COMMAND.POW:
        return power(args[0], args[1]);
      case COMMAND.SQR:
        return power(args[0], name('2'));
      case COMMAND.ROUND:
        if (args.length === 2) {
          helpers.use('roundTo');
          return php.call('roundTo', args);
        }
        if (typeOf(first) === 'whole') return args[0];
        //round() rounds a half away from zero
        return php.unary('(int) ', php.call('floor', [php.binary('+', args[0], name('0.5'))]));
      case COMMAND.FLOOR:
        return rounded('floor');
      case COMMAND.CEIL:
        return rounded('ceil');
      case COMMAND.ABS:
        return php.call('abs', args);
      case COMMAND.LOG:
        return php.call('log', [args[1], args[0]]);
      case COMMAND.RANDOM:
        return php.call('rand', args.length === 1 ? [name('1'), args[0]] : args);
      case COMMAND.LENGTH:
        return php.call(isList(typeOf(first)) ? 'count' : 'mb_strlen', args);
      case COMMAND.UPPER:
        return php.call('mb_strtoupper', args);
      case COMMAND.LOWER:
        return php.call('mb_strtolower', args);
      case COMMAND.NUMBER:
        return typeOf(first) === 'real' ? args[0] : php.unary('(float) ', args[0]);
      case COMMAND.TEXT: {
        const type = typeOf(first);
        if (type === 'text') return args[0];
        if (type === 'whole') return php.unary('(string) ', args[0]);
        return asText(first);
      }
      case COMMAND.SPLIT: {
        const separator = node.args[1];
        //the words of a text, between its spaces, and its letters, each a text of its own
        if (!separator) {
          return php.call('preg_split', [
            name("'/\\s+/'"),
            php.call('trim', [args[0]]),
            name('-1'),
            name('PREG_SPLIT_NO_EMPTY')
          ]);
        }
        if (isText(separator) && separator.value === '') return php.call('mb_str_split', [args[0]]);
        return php.call('explode', [args[1], args[0]]);
      }
      case COMMAND.JOIN: {
        const separator = args[1] ?? name('""');
        const list = typeOf(first);
        const item = isList(list) ? list.list : 'unknown';
        if (item === 'text' || item === 'whole') return php.call('implode', [separator, args[0]]);
        helpers.use('show');
        return php.call('implode', [separator, php.call('array_map', [name("'show'"), args[0]])]);
      }
    }
    const formula = mathOf(
      php,
      node.name,
      args,
      (method, values) => php.call(method, values),
      () => name('M_PI')
    );
    if (formula) return formula;
    throw new Error(`No PHP for ${node.name}`);
  };

  //what echo prints: the value of print and a new line
  const printed = (node: Expression): string =>
    php.print(
      joinText(
        isJoined(node, types) ? joinedParts(node, types) : isText(node) && node.value === '' ? [] : [node],
        '\\n'
      )
    );

  const block = statementsOf({
    trivia,
    names,
    braces: SAME_LINE,
    write: (statement, context) => {
      const {comment} = context;
      //CMIL reads the bounds of a loop once; when the loop changes them, PHP keeps them in a variable first
      const once = (bound: Expression, candidates: string[]): Code => {
        const kept = context.keep(bound, candidates, kept => `$${kept} = ${code(bound)};`);
        return kept ? name(`$${kept}`) : expression(bound);
      };
      switch (statement.type) {
        case 'print':
          context.line(`echo ${printed(statement.expression)};${comment}`);
          return;
        case 'assign':
          context.line(`${variable(statement.name)} = ${code(statement.expression)};${comment}`);
          return;
        case 'setItem': {
          const item = php.index(expression(statement.target), fromZero(php, statement.index, expression));
          context.line(`${php.print(item)} = ${code(statement.expression)};${comment}`);
          return;
        }
        case 'add':
          context.line(
            `${php.print(php.bracketed(expression(statement.target), POSTFIX))}[] = ${code(statement.expression)};${comment}`
          );
          return;
        case 'remove': {
          //array_search() gives false for an item the list doesn't have
          const list = expression(statement.target);
          const at = `$${context.fresh(['index', 'place'])}`;
          const type = typeOf(statement.target);
          const strict = isList(type) && !isNumber(type.list) ? [name('true')] : [];
          const found = php.call('array_search', [expression(statement.expression), list, ...strict]);
          context.line(`${at} = ${php.print(found)};${comment}`);
          context.blocks([
            {
              text: `if (${at} !== false)`,
              line: statement.line,
              comment: '',
              body: [],
              first: [`${php.print(php.call('array_splice', [list, name(at), name('1')]))};`]
            }
          ]);
          return;
        }
        case 'call':
          context.line(`${code(statement.call)};${comment}`);
          return;
        case 'return':
          context.line(`return${statement.expression ? ` ${code(statement.expression)}` : ''};${comment}`);
          return;
        case 'if':
          context.blocks(
            branchesOf(statement, (condition, index) => `${index ? 'elseif' : 'if'} (${code(condition)})`)
          );
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
          const counter = `$${context.fresh(['i', 'j', 'k'])}`;
          const test = php.print(compare('<', name(counter), count));
          context.blocks([loopOf(statement, `for (${counter} = 0; ${test}; ${counter}++)`)]);
          return;
        }
        case 'for': {
          const counter = variable(statement.name);
          const {down, size, signed} = stepOf(statement);
          //the first value too, when it asks and a later bound is kept, so the program asks in CMIL's order
          const first = once(statement.from, ['first', 'start']);
          const last = once(statement.to, ['last', 'end']);
          const by = size && once(size, ['step', 'by']);
          const test = counterTest(php, operator => compare(operator, name(counter), last), {down, signed}, by);
          const next = !by
            ? `${counter}${down ? '--' : '++'}`
            : `${counter} ${down ? '-=' : '+='} ${php.print(php.bracketed(by, PRECEDENCE['+'] + 1))}`;
          context.blocks([loopOf(statement, `for (${counter} = ${php.print(first)}; ${test}; ${next})`)]);
          return;
        }
        case 'forEach': {
          //foreach goes over the items the list had when the loop started, as CMIL does
          const type = typeOf(statement.expression);
          const items = isList(type)
            ? code(statement.expression)
            : php.print(php.call('mb_str_split', [expression(statement.expression)]));
          context.blocks([loopOf(statement, `foreach (${items} as ${variable(statement.name)})`)]);
          return;
        }
        case 'break':
        case 'continue':
          context.line(`${statement.type};${comment}`);
          return;
      }
    }
  });

  //the functions of the program, first, with the types of PHP the program has; a list a function changes is a
  //reference, &$list
  const program = new Writer('    ');
  for (const definition of definitions) {
    const scope = types.variables.get(definition.name)!;
    const result = types.results.get(definition.name)!;
    const shared = sharedListsOf(tree.statements, definition);
    const parameters = definition.parameters.map(parameter => {
      const type = scope.get(parameter)!;
      const declared = phpType(type);
      //a list the caller sees changed is a reference
      const reference = isList(type) && shared.has(parameter) ? '&' : '';
      return `${declared ? `${declared} ` : ''}${reference}${variable(parameter)}`;
    });
    const returns = result === 'unknown' ? ': void' : phpType(result) ? `: ${phpType(result)}` : '';
    trivia.before(program, definition.line);
    program.line(
      `function ${functions.of(definition.name)}(${parameters.join(', ')})${returns}${trivia.after(definition.line)}`,
      definition.line
    );
    program.line('{');
    program.block(() => block(program, definition.body, scope, new Set(definition.parameters)));
    program.line('}');
    program.blank();
  }
  block(program, tree.statements, types.variables.get('')!, new Set());
  trivia.rest(program);

  const out = new Writer('    ');
  out.line('<?php');
  out.blank();
  out.append(program);
  helpers.write(out, helper => helper.code(words));
  return out.converted();
};

/** The writer of PHP: its targets, which cmil/convert/php gives convert(). */
export const WRITERS: Writers = {php: {typed: false, write: toPhp}};
