/**
 * The statements of a program in a language: what every language does alike, given how it writes each statement.
 * The comments of the program go where they are, before a line or after its code; a typed language declares a
 * variable before the statement that first has it, where that statement can't; the variables the conversion adds,
 * like the counter of repeat, get names that no name of the program has; and the blocks of a statement are written
 * the language's way: in braces opened at the end of its line, like if (c) {, in braces on lines of their own, or
 * indented, ended by a word or by nothing.
 */
import {
  Names,
  Trivia,
  Writer,
  assignedIn,
  declarationsOf,
  hasEffect,
  linesOf,
  readsOnce,
  type Before,
  type Made
} from './emit.ts';
import type {Type} from './types.ts';
import type {Expression, Statement} from '../core/types.ts';

/** How a language writes the blocks of its statements. */
export type Braces = {
  //the line of a block's head, by its place among the heads of its statement, like if (c) { and } else {
  head: (text: string, index: number) => string;
  //the lines before and after each block, like { and } on lines of their own in C#
  open?: string;
  close?: string;
  //the line after the blocks of a statement, like }
  end?: string;
  //the last line of a statement that ends with a condition, like } while (c);
  tail: (text: string) => string;
  //what a block without statements has, like pass in Python
  empty?: string;
};

/** Blocks in braces opened at the end of their heads, like if (c) {, and closed by }, like } else {. */
export const SAME_LINE: Braces = {
  head: (text, index) => `${index ? '} ' : ''}${text} {`,
  end: '}',
  tail: text => `} ${text}`
};

/** Blocks in braces on lines of their own. */
export const OWN_LINES: Braces = {head: text => text, open: '{', close: '}', tail: text => `} ${text}`};

//the statements whose blocks are a loop's, which continue goes on with
const LOOPS = new Set(['while', 'doWhile', 'repeat', 'for', 'forEach']);

/** A block of a statement, after its head. */
export type Head = {
  text: string;
  //the line of the CMIL program the head comes from, with the comments before it and after its code
  line: number;
  body: Statement[];
  //the comment after the head, when it isn't the comment of its line
  comment?: string;
  //the lines first in the block, like the item of a loop given to the variable the program has after it
  first?: string[];
  //writes what the block has after its statements, like the step of a for written as a while
  last?: () => void;
  //writes what a continue of the loop needs before it, which it would skip, like that step, or the test of a do …
  //while written as a loop that tests its condition at the end of its block
  next?: () => void;
  //the end of the block, when it isn't the language's, like end before else in Pascal
  close?: string;
  //a block without the language's lines around it, like repeat … until in Pascal
  bare?: boolean;
  //the variables of the block and those declared, when it has a scope of its own, like a function
  scope?: Map<string, Type>;
  declared?: Set<string>;
};

/** The heads of an if: those of its branches, by their conditions and places, then that of its else, if it has one. */
export const branchesOf = (
  statement: Statement & {type: 'if'},
  head: (condition: Expression, index: number) => string,
  otherwise = 'else'
): Head[] => [
  ...statement.branches.map(({condition, line, body}, index) => ({text: head(condition, index), line, body})),
  ...(statement.elseLine ? [{text: otherwise, line: statement.elseLine, body: statement.elseBody}] : [])
];

/**
 * The tests of an if, each computed in turn, for a language that makes some values on lines of their own: an else if
 * whose test makes a value with an effect there, like an answer split, ends them, since CMIL computes it only when the
 * tests before it are false. It is written later as an if of its own in an else (branchesApart()), which gets the test
 * computed here, with its lines.
 */
export const testsOf = (
  statement: Statement & {type: 'if'},
  pending: Before,
  test: (condition: Expression, index: number) => string
): string[] => {
  const tests: string[] = [];
  for (const [index, {condition}] of statement.branches.entries()) {
    const computed = pending.later.get(condition);
    pending.later.delete(condition);
    if (computed) pending.put(computed.made);
    const mark = pending.mark;
    const text = computed?.text ?? test(condition, index);
    if (index && pending.mark > mark && hasEffect(condition)) {
      pending.later.set(condition, {text, made: pending.take(mark)});
      break;
    }
    tests.push(text);
  }
  return tests;
};

/**
 * The heads of an if whose first tests are written: their branches, and, when an else if ended them (testsOf()), an
 * else with an if of the rest, as a statement of its own; else every branch and the else.
 */
export const branchesApart = (
  statement: Statement & {type: 'if'},
  tests: string[],
  head: (test: string, index: number) => string,
  otherwise = 'else'
): Head[] => {
  if (tests.length === statement.branches.length)
    return branchesOf(statement, (_condition, index) => head(tests[index], index), otherwise);
  const {line} = statement.branches[tests.length];
  const rest = {...statement, branches: statement.branches.slice(tests.length), line};
  return [
    ...statement.branches
      .slice(0, tests.length)
      .map(({line, body}, index) => ({text: head(tests[index], index), line, body})),
    {text: otherwise, line, body: [rest]}
  ];
};

/**
 * Writes the values a loop's condition made on lines of their own before the loop, and gives what the loop does before
 * each test after the first. A value that reads nothing the loop changes and has no effect, like [1, 2, 3], is made
 * once, before the loop; any other is made again after the block and before a continue, and also before the first
 * test of a while, but only declared before a do … while, which tests after its block.
 */
export const loopMade = (
  context: Context,
  loop: Statement & {type: 'while' | 'doWhile'},
  made: Made[]
): Partial<Head> => {
  const again = made.filter(each => !each.node || readsOnce(each.node, loop));
  linesOf(made.filter(each => !again.includes(each))).forEach(text => context.line(text));
  linesOf(again, 'declare').forEach(text => context.line(text));
  if (loop.type === 'while') linesOf(again, 'compute').forEach(text => context.line(text));
  if (!again.length) return {};
  const write = () => linesOf(again, 'compute').forEach(text => context.line(text));
  return {last: write, next: write};
};

/** The head of a loop, on the line of its statement. */
export const loopOf = (statement: Statement & {body: Statement[]}, text: string, more: Partial<Head> = {}): Head => ({
  text,
  line: statement.line,
  body: statement.body,
  ...more
});

/**
 * The head of a do … while of a language that has none: a loop that ends when its condition is false at the end of
 * its block, like while True: of Python with if not c: break; a continue tests the condition first, which it would
 * skip. test is the head of the if and exit what leaves the loop, on a line of its own, or after the test on one line,
 * like if (c) exit in Fortran.
 */
export const doWhileOf = (
  context: Context,
  statement: Statement & {type: 'doWhile'},
  head: string,
  test: string,
  exit: string,
  {oneLine = false}: {oneLine?: boolean} = {}
): Head => {
  const ends = (comment?: string) =>
    oneLine
      ? context.line(`${test} ${exit}${comment ?? context.comment}`, statement.line)
      : context.blocks([{text: test, line: statement.line, body: [], first: [exit], comment}]);
  return {
    text: head,
    line: statement.doLine,
    body: statement.body,
    last: () => {
      context.comments(statement.line);
      ends();
    },
    next: () => ends('')
  };
};

/**
 * The head of a for or a for … in of a language whose loop has a variable of its own, which it gives each value and
 * the program can't change, like for (x in list) of Kotlin: the program's variable, when the loop doesn't give it
 * another value and the program doesn't read it after the loop; else a variable of the loop, which gives each value
 * to the program's, as assign writes it.
 */
export const loopOverValues = (
  context: Context,
  loop: Statement & {type: 'for' | 'forEach'},
  variable: string,
  head: (variable: string) => string,
  assign: (value: string) => string,
  more: Partial<Head> = {}
): Head => {
  if (context.declares && !assignedIn(loop.body).has(loop.name)) return loopOf(loop, head(variable), more);
  const value = context.fresh(['value', 'item']);
  return loopOf(loop, head(value), {...more, first: [assign(value)]});
};

/** What the language's writer of a statement has. */
export type Context = {
  //whether the statement declares its variable, being the first of its block to have it
  declares: boolean;
  //the variables of the scope, with their types, and those it has declared or given a value before the statement
  scope: Map<string, Type>;
  declared: ReadonlySet<string>;
  //the comment after the code of the statement's line, written as the language writes it
  comment: string;
  //writes a line of the statement, from its line of the CMIL program, or another
  line: (text: string, source?: number) => void;
  //writes the comments before a line of the program
  comments: (line: number) => void;
  //writes a blank line, unless the line before is one
  blank: () => void;
  //writes the blocks of the statement after their heads, then its end, or its tail; end is the line that ends them,
  //when it isn't the language's, like End If and Next in BASIC
  blocks: (heads: Head[], tail?: {text: string; line: number}, end?: string) => void;
  //writes what a continue of the loop around the statement needs before it, like the step of a for written as a while
  next: () => void;
  //a name for a variable of the conversion, free again after the statement
  fresh: (candidates: string[]) => string;
  //a bound of a loop kept in a variable first, since CMIL reads it once, as readsOnce() tells: the variable's name,
  //after the line that declares it, which declare writes; null for a bound the loop may compute again
  keep: (bound: Expression, candidates: string[], declare: (name: string) => string) => string | null;
};

/** A language, as the statements of a program are written in it. */
export type Language = {
  trivia: Trivia;
  names: Names;
  braces: Braces;
  //the lines that declare a variable before the statement that first has it, at its line, in a language that declares
  //them
  declare?: (name: string, type: Type, line: number) => string[];
  //whether the functions of the program are where they are in it, after a blank line, rather than before the program
  functionsInPlace?: boolean;
  write: (statement: Statement, context: Context) => void;
};

/**
 * The writer of blocks of statements in a language: it writes statements, and the variables of their scope that
 * they declare, which are those not declared yet.
 */
export const statementsOf = (language: Language) => {
  const {trivia, names, braces} = language;
  //what a continue needs before it, of each loop around the statement being written, the innermost last
  const nexts: Head['next'][] = [];

  const block = (out: Writer, statements: Statement[], scope: Map<string, Type>, declared: Set<string>): void => {
    const {before, inline} = declarationsOf(statements, scope, declared);
    statements.forEach((statement, index) => {
      if (statement.type === 'function') {
        if (!language.functionsInPlace) return;
        out.blank();
      }
      trivia.before(out, statement.type === 'doWhile' ? statement.doLine : statement.line);
      //a language that declares its variables declares them first; one that doesn't has them where they get a value
      if (language.declare) {
        for (const name of before.get(index) ?? []) {
          language.declare(name, scope.get(name)!, statement.line).forEach(text => out.line(text, statement.line));
          declared.add(name);
        }
      }
      write(out, statement, scope, declared, inline.has(statement));
    });
  };

  const write = (
    out: Writer,
    statement: Statement,
    scope: Map<string, Type>,
    declared: Set<string>,
    declares: boolean
  ) => {
    const {line} = statement;
    if (declares && 'name' in statement) declared.add(statement.name);
    const fresh: string[] = [];

    const blocks = (heads: Head[], tail?: {text: string; line: number}, end = braces.end) => {
      const loop = LOOPS.has(statement.type);
      heads.forEach((head, index) => {
        if (index) trivia.before(out, head.line);
        out.line(braces.head(head.text, index) + (head.comment ?? trivia.after(head.line)), head.line);
        if (!head.bare && braces.open) out.line(braces.open);
        out.block(() => {
          if (!head.body.length && !head.first?.length && !head.last && braces.empty) out.line(braces.empty);
          head.first?.forEach(text => out.line(text, line));
          if (loop) nexts.push(head.next);
          block(out, head.body, head.scope ?? scope, head.declared ?? declared);
          if (loop) nexts.pop();
          head.last?.();
        });
        const closed = tail && index === heads.length - 1;
        if (!head.bare && braces.close && !closed) out.line(head.close ?? braces.close);
      });
      if (tail) {
        trivia.before(out, tail.line);
        const text = heads[heads.length - 1].bare ? tail.text : braces.tail(tail.text);
        out.line(text + trivia.after(tail.line), tail.line);
      } else if (end) {
        out.line(end);
      }
    };

    language.write(statement, {
      declares,
      scope,
      declared,
      comment: trivia.after(line),
      line: (text, source = line) => out.line(text, source),
      comments: number => trivia.before(out, number),
      blank: () => out.blank(),
      blocks,
      next: () => nexts[nexts.length - 1]?.(),
      fresh: candidates => {
        const name = names.fresh(candidates);
        fresh.push(name);
        return name;
      },
      keep: (bound, candidates, declare) => {
        if (!('body' in statement) || !readsOnce(bound, statement)) return null;
        const name = names.fresh(candidates);
        out.line(declare(name), line);
        return name;
      }
    });
    fresh.forEach(name => names.release(name));
  };

  return block;
};
