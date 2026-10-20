/**
 * Builds the syntax tree of a CMIL program from the lines of the lexer.
 */
import CmilError from './error.ts';
import {COMMAND, ERROR, MAX_NESTING} from '../constants/index.ts';
import {FUNCTIONS, CONSTANTS} from './values.ts';
import type {Branch, Expression, Line, Statement, Token} from './types.ts';

//an error at a token, or at the end of the line without one
const syntaxError = (line: number, token?: Token) =>
  new CmilError({id: ERROR.SYNTAX_ERROR, line, ...(token && {column: token.column})});
const argumentError = (line: number, token?: Token) =>
  new CmilError({id: ERROR.ARGUMENT_ERROR, line, ...(token && {column: token.column})});

const isCommand = (token: Token | undefined, command: string) =>
  !!token && token.type === 'command' && token.value === command;
const isOperator = (token: Token | undefined, operator: string) =>
  !!token && token.type === 'operator' && token.value === operator;

/**
 * Parses one expression of a line, from the lowest to the highest precedence:
 * or, and, not, == !=, < > <= >=, + -, * / %, unary - +, values.
 */
const parseExpression = (tokens: Token[], line: number): Expression => {
  //= only stores a value, at the start of a statement; in an expression it is meant as ==
  const equals = tokens.find(token => isOperator(token, '='));
  if (equals) throw new CmilError({id: ERROR.EQUALS_ERROR, line, column: equals.column});

  let index = 0;
  let depth = 0;

  const peek = (): Token | undefined => tokens[index];

  const nest = (parse: () => Expression): Expression => {
    if (++depth > MAX_NESTING) throw syntaxError(line, tokens[index - 1]);
    const node = parse();
    depth--;
    return node;
  };

  const binary = (parseOperand: () => Expression, matches: (token: Token) => boolean) => (): Expression => {
    let node = parseOperand();
    let token;
    while ((token = peek()) && matches(token)) {
      index++;
      node = {type: 'binary', operator: String(token.value), left: node, right: parseOperand(), column: token.column};
    }
    return node;
  };

  const operators = (list: string[]) => (token: Token) => token.type === 'operator' && list.includes(token.value);

  const parsePrimary = (): Expression => {
    const token = tokens[index++];
    if (!token) throw syntaxError(line);

    switch (token.type) {
      case 'number':
      case 'string':
        return {type: 'value', value: token.value};
      case 'identifier':
        //only the math functions can be called
        if (isOperator(peek(), '(')) throw syntaxError(line, peek());
        return {type: 'variable', name: token.value, column: token.column};
      case 'operator':
        if (token.value !== '(') throw syntaxError(line, token);
        return nest(() => {
          const node = parseOr();
          const close = tokens[index++];
          if (!isOperator(close, ')')) throw syntaxError(line, close);
          return node;
        });
    }

    //commands
    if (token.value === COMMAND.TRUE || token.value === COMMAND.FALSE) {
      return {type: 'value', value: token.value === COMMAND.TRUE};
    }
    if (Object.hasOwn(CONSTANTS, token.value)) {
      return {type: 'value', value: CONSTANTS[token.value]};
    }
    if (Object.hasOwn(FUNCTIONS, token.value)) {
      return nest(() => parseCall(token));
    }

    throw syntaxError(line, token);
  };

  //the errors of a call are at the name of its function
  const parseCall = (name: Token): Expression => {
    if (!isOperator(tokens[index++], '(')) throw argumentError(line, name);

    const args: Expression[] = [];
    if (isOperator(peek(), ')')) {
      index++;
    } else {
      for (;;) {
        args.push(parseOr());
        const token = tokens[index++];
        if (isOperator(token, ')')) break;
        if (!isOperator(token, ',')) throw argumentError(line, name);
      }
    }

    const {min, max} = FUNCTIONS[String(name.value)];
    if (args.length < min || args.length > max) throw argumentError(line, name);

    return {type: 'call', name: String(name.value), args, column: name.column};
  };

  const parseUnary = (): Expression => {
    const token = peek();
    if (token && (isOperator(token, '-') || isOperator(token, '+'))) {
      index++;
      return nest(() => ({type: 'unary', operator: String(token.value), operand: parseUnary(), column: token.column}));
    }
    return parsePrimary();
  };

  const parseMultiplicative = binary(parseUnary, operators(['*', '/', '%']));
  const parseAdditive = binary(parseMultiplicative, operators(['+', '-']));
  const parseRelational = binary(parseAdditive, operators(['<', '>', '<=', '>=']));
  const parseEquality = binary(parseRelational, operators(['==', '!=']));

  const parseNot = (): Expression => {
    const token = peek();
    if (token && isCommand(token, COMMAND.NOT)) {
      index++;
      return nest(() => ({type: 'unary', operator: COMMAND.NOT, operand: parseNot(), column: token.column}));
    }
    return parseEquality();
  };

  const parseAnd = binary(parseNot, token => isCommand(token, COMMAND.AND));
  const parseOr = binary(parseAnd, token => isCommand(token, COMMAND.OR));

  const node = parseOr();
  if (index !== tokens.length) throw syntaxError(line, tokens[index]);

  return node;
};

//the parts of a line between the commas outside parentheses
const splitAtCommas = (tokens: Token[]): Token[][] => {
  const parts: Token[][] = [[]];
  let depth = 0;
  for (const token of tokens) {
    if (isOperator(token, '(')) depth++;
    if (isOperator(token, ')')) depth--;
    if (!depth && isOperator(token, ',')) parts.push([]);
    else parts[parts.length - 1].push(token);
  }
  return parts;
};

/**
 * Builds the statements of a program; a block is the lines indented deeper than its header.
 *
 * @param lines - lines from the lexer.
 */
export const parse = (lines: Line[]): Statement[] => {
  let index = 0;
  let loopDepth = 0;

  const condition = (tokens: Token[], line: number, tail?: string): Expression => {
    const last = tokens[tokens.length - 1];
    if (tail && isCommand(last, tail)) tokens = tokens.slice(0, -1);
    return parseExpression(tokens, line);
  };

  const parseBody = (level: number, isLoop = false): Statement[] => {
    const next = lines[index];
    if (!next || next.level <= level) return [];
    if (next.level > MAX_NESTING) throw syntaxError(next.number, next.tokens[0]);

    if (isLoop) loopDepth++;
    const body = parseBlock(next.level);
    if (isLoop) loopDepth--;

    return body;
  };

  const parseIf = (tokens: Token[], line: number, level: number): Statement => {
    const branches: Branch[] = [{condition: condition(tokens, line, COMMAND.THEN), body: parseBody(level), line}];
    let elseBody: Statement[] = [];

    while (lines[index] && lines[index].level === level && isCommand(lines[index].tokens[0], COMMAND.ELSE)) {
      const {number, tokens: elseTokens} = lines[index++];
      const rest = elseTokens.slice(1);

      if (isCommand(rest[0], COMMAND.IF)) {
        branches.push({
          condition: condition(rest.slice(1), number, COMMAND.THEN),
          body: parseBody(level),
          line: number
        });
      } else if (!rest.length) {
        elseBody = parseBody(level);
        break;
      } else {
        throw syntaxError(number, rest[0]);
      }
    }

    return {type: 'if', branches, elseBody, line};
  };

  const parseStatement = (level: number): Statement => {
    const {number: line, tokens} = lines[index++];
    const [first, ...rest] = tokens;

    if (first.type === 'identifier' && isOperator(rest[0], '=')) {
      return {type: 'assign', name: first.value, expression: parseExpression(rest.slice(1), line), line};
    }

    if (first.type !== 'command') throw syntaxError(line, first);

    switch (first.value) {
      case COMMAND.PRINT:
        return {type: 'print', expressions: splitAtCommas(rest).map(part => parseExpression(part, line)), line};
      case COMMAND.INPUT: {
        //input name, or input with a prompt before the name: input "Your name?" name
        const name = rest[rest.length - 1];
        if (!name || name.type !== 'identifier') throw syntaxError(line, name ?? first);
        const statement: Statement = {type: 'input', name: name.value, line};
        if (rest.length > 1) statement.prompt = parseExpression(rest.slice(0, -1), line);
        return statement;
      }
      case COMMAND.IF:
        return parseIf(rest, line, level);
      case COMMAND.WHILE:
        return {type: 'while', condition: condition(rest, line), body: parseBody(level, true), line};
      case COMMAND.REPEAT: {
        if (!isCommand(rest[rest.length - 1], COMMAND.TIMES)) throw syntaxError(line, rest[rest.length - 1] ?? first);
        return {type: 'repeat', count: condition(rest, line, COMMAND.TIMES), body: parseBody(level, true), line};
      }
      case COMMAND.FOR: {
        //for name from a to b, or for name from a to b step c
        const [name, from] = rest;
        if (!name || name.type !== 'identifier') throw syntaxError(line, name ?? first);
        if (!isCommand(from, COMMAND.FROM)) throw syntaxError(line, from ?? name);
        const to = rest.findIndex(token => isCommand(token, COMMAND.TO));
        if (to < 0) throw syntaxError(line, rest[rest.length - 1]);
        const step = rest.findIndex(token => isCommand(token, COMMAND.STEP));

        const statement: Statement = {
          type: 'for',
          name: name.value,
          from: parseExpression(rest.slice(2, to), line),
          to: parseExpression(rest.slice(to + 1, step < 0 ? undefined : step), line),
          body: [],
          line
        };
        if (step > to) statement.step = parseExpression(rest.slice(step + 1), line);
        else if (step >= 0) throw syntaxError(line, rest[step]);
        statement.body = parseBody(level, true);
        return statement;
      }
      case COMMAND.DO: {
        if (rest.length) throw syntaxError(line, rest[0]);
        const body = parseBody(level, true);

        //the condition of do is the next line at the same level
        const next = lines[index];
        if (!next || next.level !== level || !isCommand(next.tokens[0], COMMAND.WHILE)) throw syntaxError(line, first);
        index++;

        return {type: 'doWhile', body, condition: condition(next.tokens.slice(1), next.number), line: next.number};
      }
      case COMMAND.BREAK:
      case COMMAND.CONTINUE:
        if (rest.length) throw syntaxError(line, rest[0]);
        if (!loopDepth) throw syntaxError(line, first);
        return {type: first.value === COMMAND.BREAK ? 'break' : 'continue', line};
    }

    throw syntaxError(line, first);
  };

  const parseBlock = (level: number): Statement[] => {
    const statements: Statement[] = [];
    while (lines[index] && lines[index].level === level) {
      statements.push(parseStatement(level));
    }

    //deeper than the block, without a header
    if (lines[index] && lines[index].level > level) {
      throw new CmilError({id: ERROR.INDENT_ERROR, line: lines[index].number});
    }

    return statements;
  };

  return parseBlock(0);
};
