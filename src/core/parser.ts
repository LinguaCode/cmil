/**
 * Builds the syntax tree of a CMIL program from the lines of the lexer.
 */
import CmilError from './error.ts';
import {COMMAND, ERROR, MAX_NESTING} from '../constants/index.ts';
import {FUNCTIONS, CONSTANTS} from './values.ts';
import {callsOf} from './tree.ts';
import type {Branch, Expression, Line, Statement, Token} from './types.ts';

//an error at a token, or at the end of the line without one
const syntaxError = (line: number, token?: Token) =>
  new CmilError({id: ERROR.SYNTAX_ERROR, line, ...(token && {column: token.column})});
//a call of a function with another count of arguments than it takes, or without its parentheses
const argumentError = (line: number, column: number, name: string, {min, max}: {min: number; max: number}) =>
  new CmilError({id: ERROR.ARGUMENT_ERROR, line, column, function: name, min, max});

const isCommand = (token: Token | undefined, command: string) =>
  !!token && token.type === 'command' && token.value === command;
const isOperator = (token: Token | undefined, operator: string) =>
  !!token && token.type === 'operator' && token.value === operator;

/**
 * Parses one expression of a line, from the lowest to the highest precedence:
 * or, and, not, == !=, < > <= >=, + -, * / %, unary - +, indexes like list[1], values.
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

  //the items of a list, up to its ]
  const parseList = (): Expression => {
    const items: Expression[] = [];
    if (isOperator(peek(), ']')) {
      index++;
      return {type: 'list', items};
    }

    for (;;) {
      items.push(parseOr());
      const token = tokens[index++];
      if (isOperator(token, ']')) return {type: 'list', items};
      if (!isOperator(token, ',')) throw syntaxError(line, token);
    }
  };

  const parseValue = (): Expression => {
    const token = tokens[index++];
    if (!token) throw syntaxError(line);

    switch (token.type) {
      case 'number':
      case 'string':
        return {type: 'value', value: token.value};
      case 'identifier':
        if (!isOperator(peek(), '(')) return {type: 'variable', name: token.value, column: token.column};
        return nest(() => ({type: 'userCall', name: token.value, ...parseArguments(token)}));
      case 'operator':
        if (token.value === '[') return nest(parseList);
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

  //a value with its indexes, like list[1] or table[2][3]
  const parsePrimary = (): Expression => {
    let node = parseValue();
    let open;
    while ((open = peek()) && isOperator(open, '[')) {
      index++;
      const target = node;
      const column = open.column;
      node = nest(() => {
        const position = parseOr();
        const close = tokens[index++];
        if (!isOperator(close, ']')) throw syntaxError(line, close);
        return {type: 'index', target, index: position, column};
      });
    }
    return node;
  };

  //the arguments of a call in parentheses; a call without them is a syntax error at the name of its function
  const parseArguments = (name: Token, fail = () => syntaxError(line, name)) => {
    if (!isOperator(tokens[index++], '(')) throw fail();

    const args: Expression[] = [];
    if (isOperator(peek(), ')')) {
      index++;
    } else {
      for (;;) {
        args.push(parseOr());
        const token = tokens[index++];
        if (isOperator(token, ')')) break;
        if (!isOperator(token, ',')) throw fail();
      }
    }

    return {args, column: name.column};
  };

  //the errors of a call of a function of the language name the function as written and the arguments it takes
  const parseCall = (name: Token): Expression => {
    const counts = FUNCTIONS[String(name.value)];
    const fail = () => argumentError(line, name.column, name.text ?? String(name.value), counts);
    const call = parseArguments(name, fail);
    if (call.args.length < counts.min || call.args.length > counts.max) throw fail();

    return {type: 'call', name: String(name.value), ...call};
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
  //in: a value in a list, or a text in a text
  const parseRelational = binary(
    parseAdditive,
    token => operators(['<', '>', '<=', '>='])(token) || isCommand(token, COMMAND.IN)
  );
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

const opens = (token: Token) => isOperator(token, '(') || isOperator(token, '[');
const closes = (token: Token) => isOperator(token, ')') || isOperator(token, ']');

//the parts of a line between the commas outside parentheses and brackets
const splitAtCommas = (tokens: Token[]): Token[][] => {
  const parts: Token[][] = [[]];
  let depth = 0;
  for (const token of tokens) {
    if (opens(token)) depth++;
    if (closes(token)) depth--;
    if (!depth && isOperator(token, ',')) parts.push([]);
    else parts[parts.length - 1].push(token);
  }
  return parts;
};

//the = of an assignment to an item, like list[1] = 5: the first one outside parentheses and brackets
const findEquals = (tokens: Token[]): number => {
  let depth = 0;
  return tokens.findIndex(token => {
    if (opens(token)) depth++;
    if (closes(token)) depth--;
    return !depth && isOperator(token, '=');
  });
};

//the parameters of a function, like (a, b), and nothing after them
const parseParameters = (tokens: Token[], line: number): string[] => {
  const [open, ...rest] = tokens;
  if (!isOperator(open, '(')) throw syntaxError(line, open);

  const parameters: string[] = [];
  let i = 0;
  if (isOperator(rest[0], ')')) {
    i = 1;
  } else {
    for (;;) {
      const name = rest[i++];
      if (!name || name.type !== 'identifier' || parameters.includes(name.value)) throw syntaxError(line, name);
      parameters.push(name.value);
      const next = rest[i++];
      if (isOperator(next, ')')) break;
      if (!isOperator(next, ',')) throw syntaxError(line, next);
    }
  }
  if (i < rest.length) throw syntaxError(line, rest[i]);

  return parameters;
};

//the expressions of a statement, without those of its blocks
const expressionsOf = (statement: Statement): (Expression | undefined)[] => {
  switch (statement.type) {
    case 'print':
      return statement.expressions;
    case 'input':
      return [statement.prompt];
    case 'assign':
    case 'return':
      return [statement.expression];
    case 'setItem':
      return [statement.target, statement.index, statement.expression];
    case 'add':
    case 'remove':
      return [statement.expression, statement.target];
    case 'call':
      return [statement.call];
    case 'while':
      return [statement.condition];
    case 'repeat':
      return [statement.count];
    case 'for':
      return [statement.from, statement.to, statement.step];
    case 'forEach':
      return [statement.expression];
    default:
      return [];
  }
};

//every call names a function of the program and gives it its count of arguments; checked in the order of the lines
const checkCalls = (statements: Statement[], functions: Map<string, number>): void => {
  const check = (expressions: (Expression | undefined)[], line: number) =>
    expressions.forEach(expression =>
      callsOf(expression).forEach(call => {
        const parameters = functions.get(call.name);
        if (parameters === undefined) {
          throw new CmilError({id: ERROR.UNDEFINED_FUNCTION, line, column: call.column, function: call.name});
        }
        if (call.args.length !== parameters) {
          throw argumentError(line, call.column, call.name, {min: parameters, max: parameters});
        }
      })
    );

  const visit = (statement: Statement): void => {
    switch (statement.type) {
      case 'if':
        statement.branches.forEach(branch => {
          check([branch.condition], branch.line);
          branch.body.forEach(visit);
        });
        statement.elseBody.forEach(visit);
        return;
      //the condition of do … while is on its last line
      case 'doWhile':
        statement.body.forEach(visit);
        check([statement.condition], statement.line);
        return;
    }

    check(expressionsOf(statement), statement.line);
    if ('body' in statement) statement.body.forEach(visit);
  };

  statements.forEach(visit);
};

/**
 * Builds the statements of a program; a block is the lines indented deeper than its header.
 * Functions are defined at the top level and can be called before their definition.
 *
 * @param lines - lines from the lexer.
 */
export const parse = (lines: Line[]): Statement[] => {
  let index = 0;
  let loopDepth = 0;
  let inFunction = false;
  //the count of parameters of each function
  const functions = new Map<string, number>();

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

    if (first.type === 'identifier' && isOperator(rest[0], '(')) {
      const call = parseExpression(tokens, line);
      if (call.type !== 'userCall') throw syntaxError(line, first);
      return {type: 'call', call, line};
    }

    const equals = first.type === 'identifier' && isOperator(rest[0], '[') ? findEquals(tokens) : -1;
    if (equals > 0) {
      const item = parseExpression(tokens.slice(0, equals), line);
      if (item.type !== 'index') throw syntaxError(line, tokens[equals]);
      const expression = parseExpression(tokens.slice(equals + 1), line);
      return {type: 'setItem', target: item.target, index: item.index, column: item.column, expression, line};
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
      case COMMAND.ADD:
      case COMMAND.REMOVE: {
        //add a value into a list, or remove it out of a list
        const separator = first.value === COMMAND.ADD ? COMMAND.INTO : COMMAND.OUT_OF;
        const at = rest.findIndex(token => isCommand(token, separator));
        if (at < 0) throw syntaxError(line, rest[rest.length - 1] ?? first);
        return {
          type: first.value === COMMAND.ADD ? 'add' : 'remove',
          expression: parseExpression(rest.slice(0, at), line),
          target: parseExpression(rest.slice(at + 1), line),
          line
        };
      }
      case COMMAND.FOR: {
        //for name from a to b, for name from a to b step c, or for name in a list or a text
        const [name, from] = rest;
        if (!name || name.type !== 'identifier') throw syntaxError(line, name ?? first);
        if (isCommand(from, COMMAND.IN)) {
          const expression = parseExpression(rest.slice(2), line);
          return {type: 'forEach', name: name.value, expression, body: parseBody(level, true), line};
        }
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
      case COMMAND.FUNCTION: {
        //function name(a, b), at the top level
        const [name, ...header] = rest;
        if (level || inFunction) throw syntaxError(line, first);
        if (!name || name.type !== 'identifier' || functions.has(name.value)) throw syntaxError(line, name ?? first);
        const parameters = parseParameters(header, line);
        functions.set(name.value, parameters.length);

        inFunction = true;
        const loops = loopDepth;
        loopDepth = 0;
        const body = parseBody(level);
        loopDepth = loops;
        inFunction = false;

        return {type: 'function', name: name.value, parameters, body, line};
      }
      case COMMAND.RETURN: {
        if (!inFunction) throw syntaxError(line, first);
        const statement: Statement = {type: 'return', line};
        if (rest.length) statement.expression = parseExpression(rest, line);
        return statement;
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

  const statements = parseBlock(0);
  checkCalls(statements, functions);
  return statements;
};
