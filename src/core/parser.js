/**
 * Builds the syntax tree of a CMIL program from the lines of the lexer.
 */
const CmilError = require('./error');
const {COMMAND, STATUS, MAX_NESTING} = require('../constants');
const {FUNCTIONS, CONSTANTS} = require('./values');

const syntaxError = line => new CmilError(STATUS.SYNTAX_ERROR, {line});
const functionArgumentError = line => new CmilError(STATUS.FUNCTION_ARGUMENT_SCOPE_ERROR, {line});

const isCommand = (token, command) => !!token && token.type === 'command' && token.value === command;
const isOperator = (token, operator) => !!token && token.type === 'operator' && token.value === operator;

/**
 * Parses one expression of a line, from the lowest to the highest precedence:
 * or, and, not, == !=, < > <= >=, + -, * / %, unary - +, values.
 */
const parseExpression = (tokens, line) => {
  let index = 0;
  let depth = 0;

  const peek = () => tokens[index];

  const nest = parse => {
    if (++depth > MAX_NESTING) throw syntaxError(line);
    const node = parse();
    depth--;
    return node;
  };

  const binary = (parseOperand, matches) => () => {
    let node = parseOperand();
    let token;
    while ((token = peek()) && matches(token)) {
      index++;
      node = {type: 'binary', operator: token.value, left: node, right: parseOperand()};
    }
    return node;
  };

  const operators = list => token => token.type === 'operator' && list.includes(token.value);

  const parsePrimary = () => {
    const token = tokens[index++];
    if (!token) throw syntaxError(line);

    switch (token.type) {
      case 'number':
      case 'string':
        return {type: 'value', value: token.value};
      case 'identifier':
        //only the math functions can be called
        if (isOperator(peek(), '(')) throw syntaxError(line);
        return {type: 'variable', name: token.value};
      case 'operator':
        if (token.value !== '(') throw syntaxError(line);
        return nest(() => {
          const node = parseOr();
          if (!isOperator(tokens[index++], ')')) throw syntaxError(line);
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
      return nest(() => parseCall(token.value));
    }

    throw syntaxError(line);
  };

  const parseCall = name => {
    if (!isOperator(tokens[index++], '(')) throw functionArgumentError(line);

    const args = [];
    if (isOperator(peek(), ')')) {
      index++;
    } else {
      for (;;) {
        args.push(parseOr());
        const token = tokens[index++];
        if (isOperator(token, ')')) break;
        if (!isOperator(token, ',')) throw functionArgumentError(line);
      }
    }

    const {min, max} = FUNCTIONS[name];
    if (args.length < min || args.length > max) throw functionArgumentError(line);

    return {type: 'call', name, args};
  };

  const parseUnary = () => {
    const token = peek();
    if (isOperator(token, '-') || isOperator(token, '+')) {
      index++;
      return nest(() => ({type: 'unary', operator: token.value, operand: parseUnary()}));
    }
    return parsePrimary();
  };

  const parseMultiplicative = binary(parseUnary, operators(['*', '/', '%']));
  const parseAdditive = binary(parseMultiplicative, operators(['+', '-']));
  const parseRelational = binary(parseAdditive, operators(['<', '>', '<=', '>=']));
  const parseEquality = binary(parseRelational, operators(['==', '!=']));

  const parseNot = () => {
    if (isCommand(peek(), COMMAND.NOT)) {
      index++;
      return nest(() => ({type: 'unary', operator: COMMAND.NOT, operand: parseNot()}));
    }
    return parseEquality();
  };

  const parseAnd = binary(parseNot, token => isCommand(token, COMMAND.AND));
  const parseOr = binary(parseAnd, token => isCommand(token, COMMAND.OR));

  const node = parseOr();
  if (index !== tokens.length) throw syntaxError(line);

  return node;
};

/**
 * Builds the statements of a program; a block is the lines indented deeper than its header.
 *
 * @param {Array.<Object>} lines - lines of {number, level, tokens} from the lexer.
 * @returns {Array.<Object>} statements.
 */
exports.parse = lines => {
  let index = 0;
  let loopDepth = 0;

  const condition = (tokens, line, tail) => {
    const last = tokens[tokens.length - 1];
    if (tail && isCommand(last, tail)) tokens = tokens.slice(0, -1);
    return parseExpression(tokens, line);
  };

  const parseBody = (level, isLoop) => {
    const next = lines[index];
    if (!next || next.level <= level) return [];
    if (next.level > MAX_NESTING) throw syntaxError(next.number);

    if (isLoop) loopDepth++;
    const body = parseBlock(next.level);
    if (isLoop) loopDepth--;

    return body;
  };

  const parseIf = (tokens, line, level) => {
    const branches = [{condition: condition(tokens, line, COMMAND.THEN), body: parseBody(level), line}];
    let elseBody = [];

    while (lines[index] && lines[index].level === level && isCommand(lines[index].tokens[0], COMMAND.ELSE)) {
      const {number, tokens: elseTokens} = lines[index++];
      const rest = elseTokens.slice(1);

      if (isCommand(rest[0], COMMAND.IF)) {
        branches.push({condition: condition(rest.slice(1), number, COMMAND.THEN), body: parseBody(level), line: number});
      } else if (!rest.length) {
        elseBody = parseBody(level);
        break;
      } else {
        throw syntaxError(number);
      }
    }

    return {type: 'if', branches, elseBody, line};
  };

  const parseStatement = level => {
    const {number: line, tokens} = lines[index++];
    const [first, ...rest] = tokens;

    if (first.type === 'identifier' && isOperator(rest[0], '=')) {
      return {type: 'assign', name: first.value, expression: parseExpression(rest.slice(1), line), line};
    }

    if (first.type !== 'command') throw syntaxError(line);

    switch (first.value) {
      case COMMAND.OUTPUT:
        return {type: 'output', expression: parseExpression(rest, line), line};
      case COMMAND.INPUT:
        if (rest.length !== 1 || rest[0].type !== 'identifier') throw syntaxError(line);
        return {type: 'input', name: rest[0].value, line};
      case COMMAND.IF:
        return parseIf(rest, line, level);
      case COMMAND.WHILE:
        return {type: 'while', condition: condition(rest, line), body: parseBody(level, true), line};
      case COMMAND.REPEAT: {
        if (!isCommand(rest[rest.length - 1], COMMAND.TIMES)) throw syntaxError(line);
        return {type: 'repeat', count: condition(rest, line, COMMAND.TIMES), body: parseBody(level, true), line};
      }
      case COMMAND.DO: {
        if (rest.length) throw syntaxError(line);
        const body = parseBody(level, true);

        //the condition of do is the next line at the same level
        const next = lines[index];
        if (!next || next.level !== level || !isCommand(next.tokens[0], COMMAND.WHILE)) throw syntaxError(line);
        index++;

        return {type: 'doWhile', body, condition: condition(next.tokens.slice(1), next.number), line: next.number};
      }
      case COMMAND.BREAK:
      case COMMAND.CONTINUE:
        if (rest.length || !loopDepth) throw syntaxError(line);
        return {type: first.value === COMMAND.BREAK ? 'break' : 'continue', line};
    }

    throw syntaxError(line);
  };

  const parseBlock = level => {
    const statements = [];
    while (lines[index] && lines[index].level === level) {
      statements.push(parseStatement(level));
    }

    //deeper than the block, without a header
    if (lines[index] && lines[index].level > level) {
      throw new CmilError(STATUS.INDENT_ERROR, {line: lines[index].number});
    }

    return statements;
  };

  return parseBlock(0);
};
