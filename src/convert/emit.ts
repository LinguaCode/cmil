/**
 * What every language a program is converted into shares: lines that know the CMIL line they come from, indentation,
 * the comments and blank lines of the program where it has them, and names that the language can write.
 */
import {COMMAND, ERROR} from '../constants/index.ts';
import {wordsOf} from '../core/words.ts';
import {latinOf} from './latin.ts';
import {isList, isNumber, type Type, type Types} from './types.ts';
import type {Comment, Expression, ProgramError, Statement} from '../core/types.ts';
import type {ProgramTree} from '../program.ts';

/** A program in another language, and for each of its lines the line of the CMIL program it comes from. */
export type Converted = {code: string; lines: (number | null)[]};

export class Writer {
  #lines: {text: string; source: number | null}[] = [];
  #level = 0;
  #opened = false;
  readonly indent: string;

  constructor(indent: string) {
    this.indent = indent;
  }

  get length(): number {
    return this.#lines.length;
  }

  line(text: string, source: number | null = null): void {
    this.#lines.push({text: this.indent.repeat(this.#level) + text, source});
    this.#opened = false;
  }

  //a line at the start of the line, whatever the block, like a label of assembly
  label(text: string, source: number | null = null): void {
    this.#lines.push({text, source});
    this.#opened = false;
  }

  //an empty line, never two in a row, nor at the start of a block
  blank(): void {
    const last = this.#lines[this.#lines.length - 1];
    if (last && last.text && !this.#opened) this.#lines.push({text: '', source: null});
  }

  block(write: () => void): void {
    this.#level++;
    this.#opened = true;
    write();
    this.#opened = false;
    this.#level--;
  }

  append(other: Writer): void {
    if (!other.length) return;
    this.#lines.push(
      ...other.#lines.map(line => ({...line, text: line.text && this.indent.repeat(this.#level) + line.text}))
    );
    this.#opened = false;
  }

  converted(): Converted {
    while (this.#lines.length && !this.#lines[this.#lines.length - 1].text) this.#lines.pop();
    return {
      code: this.#lines.map(({text}) => text).join('\n') + '\n',
      lines: this.#lines.map(({source}) => source)
    };
  }
}

/**
 * The comments of a program, written in the language's way, and its blank lines, each before the statement after it.
 */
export class Trivia {
  #comments: Comment[];
  #trailing: Map<number, string>;
  #blank: Set<number>;
  #last = 0;
  #prefix: string;
  #gap: string;

  /**
   * @param prefix - what starts a comment in the language, like //, which replaces the #.
   * @param gap - the spaces between code and the comment after it.
   */
  constructor(comments: Comment[], sourceCode: string, prefix: string, gap = ' ') {
    this.#prefix = prefix;
    this.#gap = gap;
    this.#comments = comments.filter(({trailing}) => !trailing);
    this.#trailing = new Map(comments.filter(({trailing}) => trailing).map(({line, text}) => [line, text]));
    this.#blank = new Set(
      sourceCode
        .replace(/\r/g, '')
        .split('\n')
        .flatMap((text, index) => (text.trim() ? [] : [index + 1]))
    );
  }

  #text(comment: string): string {
    return comment.replace(/^#/, this.#prefix);
  }

  #blankBefore(line: number): boolean {
    return [...this.#blank].some(number => number > this.#last && number < line);
  }

  /** Writes the comments before a line of the program, and a blank line where the program has one. */
  before(writer: Writer, line: number): void {
    while (this.#comments.length && this.#comments[0].line < line) {
      const comment = this.#comments.shift()!;
      if (this.#last && this.#blankBefore(comment.line)) writer.blank();
      writer.line(this.#text(comment.text), comment.line);
      this.#last = comment.line;
    }
    if (this.#last && this.#blankBefore(line)) writer.blank();
    this.#last = Math.max(this.#last, line);
  }

  /** The comment after the code of a line, written as the language writes it, after a space. */
  after(line: number): string {
    const comment = this.#trailing.get(line);
    return comment ? this.#gap + this.#text(comment) : '';
  }

  /** Writes the comments after the last statement. */
  rest(writer: Writer): void {
    this.before(writer, Infinity);
  }
}

/**
 * The names of a program as the language writes them: the first spelling of each, with a _ when it is a word of the
 * language or one of the names the conversion uses itself.
 */
export class Names {
  #names = new Map<string, string>();
  #taken = new Set<string>();
  #key: (name: string) => string;

  /**
   * @param options - caseless for a language that doesn't tell small letters from capitals, whose reserved names are in
   *   small letters; latin for one whose names have only Latin letters, which gives a name of no Latin letter, like
   *   a Chinese one, a number: name1; rewrite for one whose names have a form of their own, like Ruby's, whose names
   *   start with a small letter; apart for one whose names can't end with _, like COBOL's, which sets a reserved or
   *   taken name apart its own way, like the-count.
   */
  constructor(
    spellings: Record<string, string>,
    reserved: Set<string>,
    {
      caseless = false,
      latin = false,
      rewrite = name => name,
      apart = name => `${name}_`
    }: {
      caseless?: boolean;
      latin?: boolean;
      rewrite?: (name: string) => string;
      apart?: (name: string) => string;
    } = {}
  ) {
    this.#key = caseless ? name => name.toLowerCase() : name => name;
    let unnamed = 0;
    for (const [name, spelling] of Object.entries(spellings)) {
      let written = rewrite(latin ? latinOf(spelling) : spelling);
      if (latin && !/^[A-Za-z_]/.test(written)) written = `name${++unnamed}`;
      while (reserved.has(this.#key(written)) || this.#taken.has(this.#key(written))) written = apart(written);
      this.#names.set(name, written);
      this.#taken.add(this.#key(written));
    }
  }

  of(name: string): string {
    return this.#names.get(name) ?? name;
  }

  /**
   * A name for a variable of the conversion, like the counter of repeat, that no name of the program has; it is free
   * again once released, for the next loop.
   */
  fresh(candidates: string[]): string {
    const free = (candidate: string) => !this.#taken.has(this.#key(candidate));
    let name = candidates.find(free);
    for (let count = 2; !name; count++) name = candidates.map(candidate => candidate + count).find(free);
    this.#taken.add(this.#key(name));
    return name;
  }

  release(name: string): void {
    this.#taken.delete(this.#key(name));
  }
}

//the expressions of a statement, without those of its blocks
const expressionsOf = (statement: Statement): (Expression | undefined)[] => {
  switch (statement.type) {
    case 'print':
    case 'assign':
    case 'return':
    case 'forEach':
      return [statement.expression];
    case 'setItem':
      return [statement.target, statement.index, statement.expression];
    case 'add':
    case 'remove':
      return [statement.target, statement.expression];
    case 'call':
      return [statement.call];
    case 'if':
      return statement.branches.map(({condition}) => condition);
    case 'while':
    case 'doWhile':
      return [statement.condition];
    case 'repeat':
      return [statement.count];
    case 'for':
      return [statement.from, statement.to, statement.step];
    default:
      return [];
  }
};

/** The blocks of a statement. */
export const blocksOf = (statement: Statement): Statement[][] => {
  switch (statement.type) {
    case 'if':
      return [...statement.branches.map(({body}) => body), statement.elseBody];
    case 'while':
    case 'doWhile':
    case 'repeat':
    case 'for':
    case 'forEach':
    case 'function':
      return [statement.body];
    default:
      return [];
  }
};

//every node of an expression
const nodesOf = (node: Expression | undefined, visit: (node: Expression) => void): void => {
  if (!node) return;
  visit(node);
  switch (node.type) {
    case 'list':
      node.items.forEach(item => nodesOf(item, visit));
      break;
    case 'template':
      node.parts.forEach(part => typeof part !== 'string' && nodesOf(part, visit));
      break;
    case 'index':
      nodesOf(node.target, visit);
      nodesOf(node.index, visit);
      break;
    case 'call':
    case 'userCall':
      node.args.forEach(arg => nodesOf(arg, visit));
      break;
    case 'unary':
      nodesOf(node.operand, visit);
      break;
    case 'binary':
      nodesOf(node.left, visit);
      nodesOf(node.right, visit);
      break;
  }
};

//what a value is, as its type says, when it says: a number, a text, a boolean or a list
type Kind = 'number' | 'text' | 'boolean' | 'list';
const kindOfType = (type: Type): Kind | null =>
  isNumber(type) ? 'number' : isList(type) ? 'list' : type === 'text' || type === 'boolean' ? type : null;

/**
 * The error CMIL stops a program with at the first line whose values, as their types show, an operator, a function,
 * an index, a condition or a statement can't take: a typeError, a conditionError, or a listAsText where a list would
 * become a text. No language writes what CMIL never runs, so such a program has its error rather than code. The
 * expressions of a statement are checked in the order CMIL computes them, each after the values it takes, and a value
 * whose type isn't known, like that of a variable with values of two types, is taken.
 */
export const valueErrorOf = (tree: ProgramTree, types: Types): ProgramError | null => {
  const {first: words} = wordsOf(tree.language);
  const word = (command: string) => words.get(command) ?? command;
  const kindOf = (node: Expression): Kind | null => kindOfType(types.expressions.get(node) ?? 'unknown');
  //whether a value is of one of the kinds an operator takes, or of a kind not known
  const takes = (node: Expression, ...kinds: Kind[]) => {
    const kind = kindOf(node);
    return kind === null || kinds.includes(kind);
  };
  let line = 0;
  const typeError = (operator: string, column?: number): ProgramError => ({
    id: ERROR.TYPE_ERROR,
    line,
    ...(column ? {column} : {}),
    operator: word(operator)
  });
  const asText = (): ProgramError => ({id: ERROR.LIST_AS_TEXT, line, join: word(COMMAND.JOIN)});
  //the first error of values, from the first
  const first = <T>(items: T[], check: (item: T) => ProgramError | null) =>
    items.reduce<ProgramError | null>((error, each) => error ?? check(each), null);

  //what the functions of the language take
  const callError = (node: Expression & {type: 'call'}): ProgramError | null => {
    const [value, other] = node.args;
    const error = typeError(node.name, node.column);
    switch (node.name) {
      case COMMAND.LENGTH:
        return takes(value, 'list', 'text') ? null : error;
      case COMMAND.UPPER:
      case COMMAND.LOWER:
      case COMMAND.SPLIT:
        return node.args.every(arg => takes(arg, 'text')) ? null : error;
      case COMMAND.NUMBER:
        return takes(value, 'number', 'text') ? null : error;
      case COMMAND.TEXT:
        return kindOf(value) === 'list' ? asText() : null;
      case COMMAND.JOIN: {
        //a list, whose items become texts, then the text between them
        if (!takes(value, 'list')) return error;
        const list = types.expressions.get(value);
        if (list && isList(list) && isList(list.list)) return asText();
        return !other || takes(other, 'text') ? null : error;
      }
      default:
        return node.args.every(arg => takes(arg, 'number')) ? null : error;
    }
  };

  //what the operators take
  const binaryError = (node: Expression & {type: 'binary'}): ProgramError | null => {
    const {operator, column} = node;
    const [left, right] = [kindOf(node.left), kindOf(node.right)];
    switch (operator) {
      case '+':
        //a text joined with a value that is no list, or numbers added; a side not known may be either
        if (left === 'text' || right === 'text') return left === 'list' || right === 'list' ? asText() : null;
        if (left === null || right === null) return null;
        return left === 'number' && right === 'number' ? null : typeError(operator, column);
      case '-':
      case '*':
      case '/':
      case '%':
        return takes(node.left, 'number') && takes(node.right, 'number') ? null : typeError(operator, column);
      case '==':
      case '!=':
        return left === 'list' || right === 'list' ? typeError(operator, column) : null;
      case COMMAND.IN:
        //a value in a list, which is no list, or a text in a text
        if (left === 'list') return typeError(operator, column);
        if (right === null || right === 'list') return null;
        return right === 'text' && takes(node.left, 'text') ? null : typeError(operator, column);
      default:
        //numbers with numbers, texts with texts
        if (!takes(node.left, 'number', 'text') || !takes(node.right, 'number', 'text')) {
          return typeError(operator, column);
        }
        return left && right && left !== right ? typeError(operator, column) : null;
    }
  };

  const expressionError = (node: Expression | undefined): ProgramError | null => {
    if (!node) return null;
    switch (node.type) {
      case 'list':
        return first(node.items, expressionError);
      case 'template':
        return first(node.parts, part =>
          typeof part === 'string' ? null : (expressionError(part) ?? (kindOf(part) === 'list' ? asText() : null))
        );
      case 'index':
        return (
          expressionError(node.target) ??
          expressionError(node.index) ??
          (takes(node.target, 'list', 'text') && takes(node.index, 'number') ? null : typeError('[]', node.column))
        );
      case 'call':
        return first(node.args, expressionError) ?? callError(node);
      case 'userCall':
        return first(node.args, expressionError);
      case 'unary': {
        const kind = node.operator === COMMAND.NOT ? 'boolean' : 'number';
        return (
          expressionError(node.operand) ?? (takes(node.operand, kind) ? null : typeError(node.operator, node.column))
        );
      }
      case 'binary': {
        const left = expressionError(node.left);
        if (left) return left;
        //and and or take true or false, on each side
        if (node.operator === COMMAND.AND || node.operator === COMMAND.OR) {
          if (!takes(node.left, 'boolean')) return typeError(node.operator, node.column);
          return (
            expressionError(node.right) ?? (takes(node.right, 'boolean') ? null : typeError(node.operator, node.column))
          );
        }
        return expressionError(node.right) ?? binaryError(node);
      }
      default:
        return null;
    }
  };

  //a condition is true or false
  const conditionError = (condition: Expression, at: number): ProgramError | null => {
    line = at;
    return expressionError(condition) ?? (takes(condition, 'boolean') ? null : {id: ERROR.CONDITION_ERROR, line});
  };

  const statementError = (statement: Statement): ProgramError | null => {
    line = statement.line;
    switch (statement.type) {
      case 'print':
        return expressionError(statement.expression) ?? (kindOf(statement.expression) === 'list' ? asText() : null);
      case 'assign':
      case 'return':
        return expressionError(statement.expression);
      case 'call':
        return expressionError(statement.call);
      case 'setItem':
        //an item of a list, which a text has none of to replace, at a number
        return (
          expressionError(statement.target) ??
          expressionError(statement.index) ??
          expressionError(statement.expression) ??
          (takes(statement.target, 'list') && takes(statement.index, 'number')
            ? null
            : typeError('[]', statement.column))
        );
      case 'add':
      case 'remove': {
        //the value, then the list, which a list can't be the value of to remove
        const command = statement.type === 'add' ? COMMAND.ADD : COMMAND.REMOVE;
        const error = expressionError(statement.expression) ?? expressionError(statement.target);
        if (error) return error;
        if (!takes(statement.target, 'list')) return typeError(command);
        return command === COMMAND.REMOVE && kindOf(statement.expression) === 'list' ? typeError(command) : null;
      }
      case 'if':
        return (
          first(statement.branches, ({condition, line: at, body}) => conditionError(condition, at) ?? block(body)) ??
          block(statement.elseBody)
        );
      case 'while':
        return conditionError(statement.condition, statement.line) ?? block(statement.body);
      case 'doWhile':
        return block(statement.body) ?? conditionError(statement.condition, statement.line);
      case 'repeat':
        //a count, which CMIL also stops at when it isn't whole or is below 0, as it does at a step of 0
        return (
          expressionError(statement.count) ??
          (takes(statement.count, 'number') ? null : typeError(COMMAND.REPEAT)) ??
          block(statement.body)
        );
      case 'for': {
        const bounds = [statement.from, statement.to, statement.step];
        const error = first(bounds, expressionError);
        if (error) return error;
        if (!bounds.every(bound => !bound || takes(bound, 'number'))) return typeError(COMMAND.FOR);
        return block(statement.body);
      }
      case 'forEach':
        //the items of a list, or the letters of a text
        return (
          expressionError(statement.expression) ??
          (takes(statement.expression, 'list', 'text') ? null : typeError(COMMAND.IN)) ??
          block(statement.body)
        );
      case 'function':
        return block(statement.body);
      default:
        return null;
    }
  };
  const block = (statements: Statement[]): ProgramError | null => first(statements, statementError);
  return block(tree.statements);
};

/** Every node of the expressions of a statement and of its blocks. */
export const eachNode = (statement: Statement, visit: (node: Expression) => void): void => {
  expressionsOf(statement).forEach(node => nodesOf(node, visit));
  blocksOf(statement).forEach(block => block.forEach(nested => eachNode(nested, visit)));
};

/**
 * Gives the variables of a program named like one of its functions keys of their own, since CMIL tells a variable
 * from a function of the same name, as most languages don't: the name stays the function's, and its variables,
 * parameters and loop variables get the key of the name and a space, which no name has, with the same spelling, so
 * Names writes them with a _. Changes the tree, before its types are found.
 */
export const namesApart = (tree: ProgramTree): void => {
  const functions = new Set(tree.statements.flatMap(each => (each.type === 'function' ? [each.name] : [])));
  const split = new Set<string>();
  const apart = (name: string) => {
    if (!functions.has(name)) return name;
    split.add(name);
    return `${name} `;
  };
  const visit = (statement: Statement) => {
    if (statement.type === 'assign' || statement.type === 'for' || statement.type === 'forEach')
      statement.name = apart(statement.name);
    if (statement.type === 'function') statement.parameters = statement.parameters.map(apart);
    expressionsOf(statement).forEach(node =>
      nodesOf(node, nested => nested.type === 'variable' && (nested.name = apart(nested.name)))
    );
    blocksOf(statement).forEach(block => block.forEach(visit));
  };
  tree.statements.forEach(visit);
  for (const name of split) tree.names[`${name} `] = tree.names[name];
};

/** The variables a statement and its blocks read or store, and the variables of its loops. */
export const namesIn = (statement: Statement, names: Set<string> = new Set()): Set<string> => {
  if (statement.type === 'assign' || statement.type === 'for' || statement.type === 'forEach')
    names.add(statement.name);
  expressionsOf(statement).forEach(node =>
    nodesOf(node, nested => nested.type === 'variable' && names.add(nested.name))
  );
  blocksOf(statement).forEach(block => block.forEach(nested => namesIn(nested, names)));
  return names;
};

/** The variables a statement itself has, without those of its blocks: in its expressions, or as its loop's variable. */
export const ownNames = (statement: Statement): Set<string> => {
  const names = new Set<string>();
  if (statement.type === 'assign' || statement.type === 'for' || statement.type === 'forEach')
    names.add(statement.name);
  expressionsOf(statement).forEach(node =>
    nodesOf(node, nested => nested.type === 'variable' && names.add(nested.name))
  );
  return names;
};

/** The variables that statements and their blocks read, and the counters of their for loops, which the loops read. */
export const readIn = (statements: Statement[], read: Set<string> = new Set()): Set<string> => {
  for (const statement of statements) {
    expressionsOf(statement).forEach(node =>
      nodesOf(node, nested => nested.type === 'variable' && read.add(nested.name))
    );
    if (statement.type === 'for') read.add(statement.name);
    blocksOf(statement).forEach(block => readIn(block, read));
  }
  return read;
};

/** Whether the block of a loop has a break or a continue of its own, rather than of a loop inside it. */
export const breaksOut = (statements: Statement[]): boolean =>
  statements.some(
    statement =>
      statement.type === 'break' ||
      statement.type === 'continue' ||
      (statement.type === 'if' && [...statement.branches.map(({body}) => body), statement.elseBody].some(breaksOut))
  );

/** The variables an expression reads. */
export const variablesIn = (node: Expression | undefined): Set<string> => {
  const names = new Set<string>();
  nodesOf(node, nested => nested.type === 'variable' && names.add(nested.name));
  return names;
};

//the variable a list is in, for a list or an item of a list in a variable
const rootOf = (node: Expression): string | null =>
  node.type === 'variable' ? node.name : node.type === 'index' ? rootOf(node.target) : null;

/** How often each variable gets a value in statements and their blocks: stored with =, or as a loop's variable. */
export const assignedIn = (statements: Statement[], counts: Map<string, number> = new Map()): Map<string, number> => {
  for (const statement of statements) {
    if (statement.type === 'assign' || statement.type === 'for' || statement.type === 'forEach') {
      counts.set(statement.name, (counts.get(statement.name) ?? 0) + 1);
    }
    blocksOf(statement).forEach(block => assignedIn(block, counts));
  }
  return counts;
};

/**
 * The lists that statements and their blocks may change: those they add to, remove from or replace an item of, and
 * those they give a function of the program, which may change them.
 */
export const changedIn = (statements: Statement[]): Set<string> => {
  const changed = new Set<string>();
  const visit = (statement: Statement) => {
    if (statement.type === 'add' || statement.type === 'remove' || statement.type === 'setItem') {
      const root = rootOf(statement.target);
      if (root) changed.add(root);
    }
    eachNode(statement, node => {
      if (node.type !== 'userCall') return;
      for (const arg of node.args) {
        const root = rootOf(arg);
        if (root) changed.add(root);
      }
    });
    blocksOf(statement).forEach(block => block.forEach(visit));
  };
  statements.forEach(visit);
  return changed;
};

/**
 * The parameters whose lists a function changes for its callers: those it changes that a call gives a list in a
 * variable, or in an item of one. A list made in place, like [], no caller sees again, so the function may change a
 * copy of its own.
 */
export const sharedListsOf = (statements: Statement[], definition: Statement & {type: 'function'}): Set<string> => {
  const changed = changedIn(definition.body);
  const shared = new Set<string>();
  const visit = (node: Expression) => {
    if (node.type !== 'userCall' || node.name !== definition.name) return;
    node.args.forEach((arg, index) => {
      if (changed.has(definition.parameters[index]) && rootOf(arg)) shared.add(definition.parameters[index]);
    });
  };
  statements.forEach(statement => eachNode(statement, visit));
  return shared;
};

//whether a block has a name
const has = (name: string) => (statements: Statement[]) => statements.some(statement => namesIn(statement).has(name));

/**
 * Where a block declares its variables, for the languages that declare them: in the statement that gives a variable
 * its first value, or before the statement that first has it; a variable that only one block of a statement has is
 * declared there. The functions in a block have their own variables.
 */
export const declarationsOf = (
  statements: Statement[],
  scope: Map<string, Type>,
  declared: Set<string>
): {before: Map<number, string[]>; inline: Set<Statement>} => {
  const before = new Map<number, string[]>();
  const inline = new Set<Statement>();
  const used = statements.map(statement => (statement.type === 'function' ? new Set<string>() : namesIn(statement)));
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

/** The functions of the program a statement and its blocks call. */
export const callsIn = (statement: Statement): Set<string> => {
  const calls = new Set<string>();
  eachNode(statement, node => node.type === 'userCall' && calls.add(node.name));
  return calls;
};

/**
 * The values joined into a text, in order: "a" + 1 + b is "a", 1 and b, and so is "a{1}{b}", whose texts are values
 * of the text type.
 */
export const joinedParts = (node: Expression, types: Types): Expression[] => {
  if (node.type === 'template') {
    return node.parts
      .filter(part => part !== '')
      .flatMap(part => {
        if (typeof part !== 'string') return joinedParts(part, types);
        const value: Expression = {type: 'value', value: part};
        types.expressions.set(value, 'text');
        return [value];
      });
  }
  return node.type === 'binary' && node.operator === '+' && types.expressions.get(node) === 'text'
    ? [...joinedParts(node.left, types), ...joinedParts(node.right, types)]
    : [node];
};

/** Whether an expression is values joined into a text, with + or in a text with code in braces. */
export const isJoined = (node: Expression, types: Types): boolean =>
  node.type === 'template' ||
  (node.type === 'binary' && node.operator === '+' && types.expressions.get(node) === 'text');

/** Whether an expression is a text written in the program, like "a". */
export const isText = (node: Expression): node is Expression & {type: 'value'; value: string} =>
  node.type === 'value' && typeof node.value === 'string';

/** Whether an expression is a number written in the program, like 2, or a constant, like pi. */
export const isNumeral = (node: Expression): node is Expression & {type: 'value'; value: number} =>
  node.type === 'value' && typeof node.value === 'number';

/** Whether an expression is a variable or a value, which a language can write twice, like x * x. */
export const isSimple = (node: Expression): boolean => node.type === 'variable' || node.type === 'value';

/**
 * A text in double quotes, as most languages write it: with \ before a \ and a ", \n for a new line and \t for a
 * tab, and the escapes of the other marks a language has, like \$ in Kotlin.
 */
export const quoted = (text: string, others: Record<string, string> = {}): string => {
  const escapes: Record<string, string> = {'\\': '\\\\', '"': '\\"', '\n': '\\n', '\t': '\\t', ...others};
  return `"${[...text].map(letter => escapes[letter] ?? letter).join('')}"`;
};

/** Values that CMIL never finds equal, like a number and a text, which a typed language doesn't compare. */
export const neverEqual = (left: Type, right: Type): boolean => {
  const kind = (type: Type) => (isNumber(type) ? 'number' : type);
  return kind(left) !== kind(right) && left !== 'unknown' && right !== 'unknown';
};

//a comparison turned around
const OPPOSITE: Record<string, string> = {'==': '!=', '!=': '==', '<': '>=', '>=': '<', '>': '<=', '<=': '>'};

/**
 * The opposite of a condition, like a loop's that ends when it is false: a comparison turned around, like >= for <,
 * the condition in a not, else the condition in a not.
 */
export const negation = (node: Expression, types: Types): Expression => {
  if (node.type === 'unary' && node.operator === COMMAND.NOT) return node.operand;
  const opposite: Expression =
    node.type === 'binary' && Object.hasOwn(OPPOSITE, node.operator)
      ? {...node, operator: OPPOSITE[node.operator]}
      : {type: 'unary', operator: COMMAND.NOT, operand: node, column: 0};
  types.expressions.set(opposite, 'boolean');
  return opposite;
};

/**
 * The step of a for: whether it counts down, a number written with a -, like -2, its size when it isn't 1, and whether
 * its sign shows only as the program runs, like that of s or -n, which the loop tests as CMIL does.
 */
export const stepOf = (statement: Statement & {type: 'for'}): {down: boolean; size?: Expression; signed: boolean} => {
  const {step} = statement;
  const negative = step?.type === 'unary' && step.operator === '-' && isNumeral(step.operand);
  if (step && !isNumeral(step) && !negative) return {down: false, size: step, signed: true};
  const size = negative ? (step as Expression & {type: 'unary'}).operand : step;
  return {down: negative, size: size && !(size.type === 'value' && size.value === 1) ? size : undefined, signed: false};
};

/** Whether a value has an effect: an input(), a call of a function of the program, or random(). */
export const hasEffect = (node: Expression | undefined): boolean => {
  let found = false;
  nodesOf(node, each => {
    found ||=
      each.type === 'input' || each.type === 'userCall' || (each.type === 'call' && each.name === COMMAND.RANDOM);
  });
  return found;
};

/**
 * Whether a loop that computes a bound of its own again each pass, like the last value in the test of C's for, keeps
 * it in a variable first, since CMIL reads it once: a bound that has an effect, or reads a variable the loop gives
 * another value or a list it changes. The first value of a for is kept too when it has an effect and a later bound is
 * kept, so the program asks for its values in CMIL's order.
 */
export const readsOnce = (bound: Expression, loop: Statement & {body: Statement[]}): boolean => {
  if (loop.type === 'for' && bound === loop.from) {
    return hasEffect(bound) && [loop.to, loop.step].some(later => later && readsOnce(later, loop));
  }
  if (hasEffect(bound)) return true;
  const [assigned, changed] = [assignedIn(loop.body), changedIn(loop.body)];
  return [...variablesIn(bound)].some(name => assigned.has(name) || changed.has(name));
};

/**
 * Whether a for … in changes the list it goes over, so it goes over a copy: CMIL goes over the items the list has
 * when the loop starts.
 */
export const changesItsList = (statement: Statement & {type: 'forEach'}): boolean =>
  [...variablesIn(statement.expression)].some(
    name => changedIn(statement.body).has(name) || assignedIn(statement.body).has(name)
  );

/** A function of the program, by its name. */
export const definitionOf = (statements: Statement[], name: string): Statement & {type: 'function'} =>
  statements.find(
    (statement): statement is Statement & {type: 'function'} => statement.type === 'function' && statement.name === name
  )!;

/**
 * The helpers of a language that a program uses, each once and after the helpers it uses, and what they import,
 * like the headers of C++.
 */
export class Helpers<Helper extends {code: unknown; uses?: string[]; imports?: string[]}> {
  readonly #all: Record<string, Helper>;
  readonly #used = new Set<string>();
  readonly imports: Set<string>;

  /** @param all - the helpers by their names, in the order the language writes them. */
  constructor(all: Record<string, Helper>, imports: Set<string> = new Set()) {
    this.#all = all;
    this.imports = imports;
  }

  /** The names of all the helpers, used or not. */
  get names(): string[] {
    return Object.keys(this.#all);
  }

  use(name: string): void {
    if (this.#used.has(name)) return;
    for (const used of this.#all[name].uses ?? []) this.use(used);
    this.#used.add(name);
    this.#all[name].imports?.forEach(item => this.imports.add(item));
  }

  has(name: string): boolean {
    return this.#used.has(name);
  }

  /** Writes the helpers used, each after a blank line, as the language writes them. */
  write(out: Writer, code: (helper: Helper, name: string) => string[]): void {
    for (const name of Object.keys(this.#all).filter(helper => this.#used.has(helper))) {
      out.blank();
      code(this.#all[name], name).forEach(text => out.line(text));
    }
  }
}

/**
 * The lines of a value a statement needs before it: all of them, and its declarations apart from what computes it,
 * with the value, which a loop makes again before each test only when it changes.
 */
export type Made = {lines: string[]; declare: string[]; compute: string[]; node?: Expression};

/**
 * The lines the values of a statement need before it, for a language that computes some values, like a text it makes,
 * on lines of their own. A loop whose condition needs them writes them before it and again before each test, its
 * declarations only once; a part CMIL computes only sometimes, like an else if, takes its own to where it is computed.
 */
export class Before {
  #made: Made[] = [];
  /** The test of an else if that is written later, as an if of its own in an else, and the values it made. */
  readonly later = new Map<Expression, {text: string; made: Made[]}>();

  /** A value's lines: the declarations among them, first, and what computes it, the rest unless given. */
  add(
    lines: string[],
    {
      declare = [],
      compute = lines.slice(declare.length),
      node
    }: {declare?: string[]; compute?: string[]; node?: Expression} = {}
  ): void {
    this.#made.push({lines, declare, compute, node});
  }

  /** Where the values made from now on start, which take() takes from. */
  get mark(): number {
    return this.#made.length;
  }

  /** Takes the values made since a mark, or all of them. */
  take(mark = 0): Made[] {
    return this.#made.splice(mark);
  }

  /** Puts values back, like those of a condition written after the line they were made for. */
  put(made: Made[]): void {
    this.#made.push(...made);
  }
}

/** The lines of values made, or their declarations, or what computes them. */
export const linesOf = (made: Made[], part: 'lines' | 'declare' | 'compute' = 'lines'): string[] =>
  made.flatMap(each => each[part]);

/**
 * What a language whose lists are the arrays of a first course, like C, can't write, besides what none of them can: a
 * list of lists, a list given another list in a variable or in an item, which would be a copy CMIL never makes, and a
 * function giving a list parameter another list.
 */
export type FixedArrays = {
  //a function that gives a list
  listResults?: boolean;
  //a for … in over a list its loop changes, which goes over a copy of it
  changedLoops?: boolean;
  //a function giving a text parameter another value, which would be its caller's text
  textParameters?: boolean;
  //what can't change a list in no variable, like [1, 2]: these statements, and a function it is given to
  changedInPlace?: ('add' | 'remove' | 'setItem' | 'call')[];
};

/**
 * The first line of a program that a language of fixed arrays can't write, by what it can't, or null; convert() gives
 * it as the problem fixedArrays.
 */
export const fixedArraysLineOf = (tree: ProgramTree, types: Types, arrays: FixedArrays): number | null => {
  const lines: number[] = [];
  const typeOf = (node: Expression): Type => types.expressions.get(node) ?? 'unknown';
  const nested = (type: Type | undefined) => !!type && isList(type) && isList(type.list);
  const some = (node: Expression | undefined, test: (node: Expression) => boolean) => {
    let found = false;
    nodesOf(node, each => (found ||= test(each)));
    return found;
  };
  const definitions = new Map(
    tree.statements.flatMap(statement => (statement.type === 'function' ? [[statement.name, statement]] : []))
  );
  //a list in no variable that a function it is given to changes
  const changedByCall = (node: Expression) =>
    node.type === 'userCall' &&
    node.args.some(
      (arg, index) =>
        isList(typeOf(arg)) &&
        !rootOf(arg) &&
        changedIn(definitions.get(node.name)!.body).has(definitions.get(node.name)!.parameters[index])
    );

  const visit = (statement: Statement, scope: Map<string, Type>) => {
    const at = (line: number) => lines.push(line);
    const conditions =
      statement.type === 'if' ? statement.branches.map(({condition, line}) => ({condition, line})) : null;
    //a list of lists, in a value or in a variable the statement gives one
    expressionsOf(statement).forEach((node, index) => {
      const line = conditions?.[index].line ?? statement.line;
      if (some(node, each => nested(typeOf(each)))) at(line);
      if (arrays.changedInPlace?.includes('call') && some(node, changedByCall)) at(line);
    });
    if ('name' in statement && statement.type !== 'function' && nested(scope.get(statement.name))) at(statement.line);
    switch (statement.type) {
      case 'assign':
        if (isList(scope.get(statement.name) ?? 'unknown') && rootOf(statement.expression)) at(statement.line);
        break;
      case 'function': {
        const own = types.variables.get(statement.name)!;
        const result = types.results.get(statement.name)!;
        const assigned = assignedIn(statement.body);
        const given = statement.parameters.filter(parameter => assigned.has(parameter));
        if (statement.parameters.some(parameter => nested(own.get(parameter)))) at(statement.line);
        if (arrays.listResults && isList(result)) at(statement.line);
        if (given.some(parameter => isList(own.get(parameter)!))) at(statement.line);
        if (arrays.textParameters && given.some(parameter => own.get(parameter) === 'text')) at(statement.line);
        statement.body.forEach(each => visit(each, own));
        return;
      }
      case 'forEach':
        if (arrays.changedLoops && isList(typeOf(statement.expression)) && changesItsList(statement)) {
          at(statement.line);
        }
        break;
      case 'add':
      case 'remove':
      case 'setItem':
        if (arrays.changedInPlace?.includes(statement.type) && !rootOf(statement.target)) at(statement.line);
        break;
    }
    blocksOf(statement).forEach(block => block.forEach(each => visit(each, scope)));
  };
  tree.statements.forEach(statement => visit(statement, types.variables.get('')!));
  return lines.length ? Math.min(...lines) : null;
};
