/**
 * What every language a program is converted into shares: lines that know the CMIL line they come from, indentation,
 * the comments and blank lines of the program where it has them, and names that the language can write.
 */
import type {Comment, Expression, Statement} from '../core/types.ts';
import type {Types} from './types.ts';

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

  //an empty line, never two in a row, nor at the start of a block
  blank(): void {
    const last = this.#lines[this.#lines.length - 1];
    if (last && last.text && !this.#opened) this.#lines.push({text: '', source: null});
  }

  //adds a text to the last line, like a comment after code
  end(text: string): void {
    this.#lines[this.#lines.length - 1].text += text;
  }

  block(write: () => void): void {
    this.#level++;
    this.#opened = true;
    write();
    this.#opened = false;
    this.#level--;
  }

  append(other: Writer): void {
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

  constructor(spellings: Record<string, string>, reserved: Set<string>) {
    for (const [name, spelling] of Object.entries(spellings)) {
      let written = spelling;
      while (reserved.has(written) || this.#taken.has(written)) written += '_';
      this.#names.set(name, written);
      this.#taken.add(written);
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
    let name = candidates.find(candidate => !this.#taken.has(candidate));
    for (let count = 2; !name; count++)
      name = candidates.map(candidate => candidate + count).find(c => !this.#taken.has(c));
    this.#taken.add(name);
    return name;
  }

  release(name: string): void {
    this.#taken.delete(name);
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

/** Every node of the expressions of a statement and of its blocks. */
export const eachNode = (statement: Statement, visit: (node: Expression) => void): void => {
  expressionsOf(statement).forEach(node => nodesOf(node, visit));
  blocksOf(statement).forEach(block => block.forEach(nested => eachNode(nested, visit)));
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

/** The functions of the program a statement and its blocks call. */
export const callsIn = (statement: Statement): Set<string> => {
  const calls = new Set<string>();
  eachNode(statement, node => node.type === 'userCall' && calls.add(node.name));
  return calls;
};

/** The values joined with + into a text, in order: "a" + 1 + b is "a", 1 and b. */
export const joinedParts = (node: Expression, types: Types): Expression[] =>
  node.type === 'binary' && node.operator === '+' && types.expressions.get(node) === 'text'
    ? [...joinedParts(node.left, types), ...joinedParts(node.right, types)]
    : [node];

/** The index from 0 of an index from 1: a number one less, else the index minus 1. */
export const fromZero = (node: Expression, write: (node: Expression) => string): string =>
  node.type === 'value' && typeof node.value === 'number' ? String(node.value - 1) : `${write(node)} - 1`;
