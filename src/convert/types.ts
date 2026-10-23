/**
 * The types of the values of a program, for the languages that declare them: a number is whole when it is sure to be,
 * else real; a list has items of one type; the answer of an input() is a number where it is used as one, else a text.
 * A variable, a list or a function that gets values of two types is a conflict, which these languages can't write.
 */
import {COMMAND} from '../constants/index.ts';
import type {Expression, Statement} from '../core/types.ts';

export type Type =
  | 'whole'
  | 'real'
  | 'text'
  | 'boolean'
  //an answer whose use doesn't say yet whether it is a number or a text
  | 'answer'
  | 'unknown'
  | 'mixed'
  | {list: Type};

/** The types of a program: its variables by scope, '' for the program, and each of its expressions. */
export type Types = {
  variables: Map<string, Map<string, Type>>;
  //the type of the value each function returns, unknown when it returns none
  results: Map<string, Type>;
  expressions: Map<Expression, Type>;
  //the names that get values of two types, with the line where they get the second one; [] for a list
  conflicts: {line: number; name: string}[];
};

export const isNumber = (type: Type): boolean => type === 'whole' || type === 'real';
export const isList = (type: Type): type is {list: Type} => typeof type === 'object';

export const sameType = (a: Type, b: Type): boolean => (isList(a) && isList(b) ? sameType(a.list, b.list) : a === b);

/**
 * The type of a value that gets values of both types: a whole and a real number are real, a list joins its items.
 */
export const joinTypes = (a: Type, b: Type): Type => {
  if (a === 'unknown') return b;
  if (b === 'unknown') return a;
  if (isList(a) && isList(b)) {
    //a list whose items are of two types already is that list's conflict
    if (a.list === 'mixed' || b.list === 'mixed') return {list: 'mixed'};
    const item = joinTypes(a.list, b.list);
    return item === 'mixed' ? 'mixed' : {list: item};
  }
  if (a === b) return a;
  if (a === 'answer') return isNumber(b) ? 'real' : b === 'text' ? b : 'mixed';
  if (b === 'answer') return joinTypes(b, a);
  if (isNumber(a) && isNumber(b)) return 'real';
  return 'mixed';
};

//an answer that is never used as a number is a text
const settled = (type: Type): Type => (isList(type) ? {list: settled(type.list)} : type === 'answer' ? 'text' : type);

//the type of the result of each function of the language, from the types of its arguments
const callType = (name: string, args: Type[]): Type => {
  switch (name) {
    case COMMAND.SQR:
    case COMMAND.ABS:
      return args[0] === 'whole' ? 'whole' : 'real';
    case COMMAND.ROUND:
      return args.length === 1 ? 'whole' : 'real';
    case COMMAND.FLOOR:
    case COMMAND.CEIL:
    case COMMAND.RANDOM:
    case COMMAND.LENGTH:
      return 'whole';
    case COMMAND.UPPER:
    case COMMAND.LOWER:
    case COMMAND.TEXT:
    case COMMAND.JOIN:
      return 'text';
    case COMMAND.SPLIT:
      return {list: 'text'};
    default:
      return 'real';
  }
};

//what the functions of the language take: numbers, texts, a text or a list, or anything
const argumentKind = (name: string, index: number): 'number' | 'text' | 'items' | 'any' => {
  switch (name) {
    case COMMAND.UPPER:
    case COMMAND.LOWER:
    case COMMAND.SPLIT:
      return 'text';
    case COMMAND.NUMBER:
    case COMMAND.TEXT:
      return 'any';
    case COMMAND.LENGTH:
      return 'items';
    case COMMAND.JOIN:
      return index ? 'text' : 'items';
    default:
      return 'number';
  }
};

/**
 * Finds the types of a program's values, going over it again until no type changes.
 */
export const typesOf = (statements: Statement[]): Types => {
  const definitions = statements.filter(statement => statement.type === 'function');
  const variables = new Map<string, Map<string, Type>>([['', new Map()]]);
  const results = new Map<string, Type>();
  for (const {name, parameters} of definitions) {
    variables.set(name, new Map(parameters.map(parameter => [parameter, 'unknown'])));
    results.set(name, 'unknown');
  }

  //the answers of the input() that aren't stored in a variable, once their use says
  const inputs = new Map<Expression, Type>();
  const conflicts: Types['conflicts'] = [];
  let expressions = new Map<Expression, Type>();
  let changed = true;
  let line = 0;

  const conflict = (name: string) => {
    if (!conflicts.some(known => known.name === name)) conflicts.push({line, name});
  };

  //joins a type into a variable of a scope
  const set = (scope: Map<string, Type>, name: string, type: Type) => {
    const old = scope.get(name) ?? 'unknown';
    const next = joinTypes(old, type);
    if (next === 'mixed') conflict(name);
    if (!scope.has(name)) scope.set(name, next);
    if (!sameType(old, next)) {
      scope.set(name, next);
      changed = true;
    }
  };

  const scopeOf = (scopeName: string) => {
    const scope = variables.get(scopeName)!;

    //an answer used as a number or a text becomes one
    const need = (node: Expression, kind: 'number' | 'text') => {
      const type = kind === 'number' ? 'real' : 'text';
      if (node.type === 'variable' && scope.get(node.name) === 'answer') set(scope, node.name, type);
      if (node.type === 'input' && !inputs.has(node)) {
        inputs.set(node, type);
        changed = true;
      }
    };

    //a list that gets an item: a list in a variable, or a list in an item of one
    const listGets = (target: Expression, item: Type) => {
      if (target.type === 'variable') set(scope, target.name, {list: item});
      else if (target.type === 'index') listGets(target.target, {list: item});
    };

    const typeOf = (node: Expression): Type => {
      const type = compute(node);
      expressions.set(node, type);
      return type;
    };

    const compute = (node: Expression): Type => {
      switch (node.type) {
        case 'value':
          if (typeof node.value === 'number') return Number.isInteger(node.value) && !node.constant ? 'whole' : 'real';
          return typeof node.value === 'string' ? 'text' : 'boolean';
        case 'list': {
          //a list with items of two types is one conflict, not one more for each variable it is in
          const item = node.items.map(typeOf).reduce(joinTypes, 'unknown');
          if (item === 'mixed') conflict('[]');
          return {list: item};
        }
        case 'variable':
          return scope.get(node.name) ?? 'unknown';
        case 'index': {
          const target = typeOf(node.target);
          typeOf(node.index);
          need(node.index, 'number');
          if (isList(target)) return target.list;
          need(node.target, 'text');
          return 'text';
        }
        case 'input':
          return inputs.get(node) ?? 'answer';
        case 'call': {
          const args = node.args.map(typeOf);
          node.args.forEach((arg, index) => {
            const kind = argumentKind(node.name, index);
            if (kind === 'number' || kind === 'text') need(arg, kind);
            if (kind === 'items' && args[index] === 'answer') need(arg, 'text');
          });
          return callType(node.name, args);
        }
        case 'userCall': {
          const callee = variables.get(node.name)!;
          const parameters = definitions.find(({name}) => name === node.name)!.parameters;
          node.args.forEach((arg, index) => set(callee, parameters[index], typeOf(arg)));
          return results.get(node.name)!;
        }
        case 'unary': {
          const operand = typeOf(node.operand);
          if (node.operator === COMMAND.NOT) return 'boolean';
          need(node.operand, 'number');
          return operand === 'whole' ? 'whole' : 'real';
        }
        case 'binary': {
          const left = typeOf(node.left);
          const right = typeOf(node.right);
          switch (node.operator) {
            case '+':
              if (left === 'text' || right === 'text' || isList(left) || isList(right)) return 'text';
              if (left === 'boolean' || right === 'boolean') return 'text';
              //two answers added together, like first + second, or an answer and a number, are numbers
              if (left === 'answer' && right === 'answer') {
                need(node.left, 'number');
                need(node.right, 'number');
                return 'real';
              }
              if (left === 'answer' || right === 'answer') {
                need(left === 'answer' ? node.left : node.right, 'number');
                return 'real';
              }
              return left === 'whole' && right === 'whole' ? 'whole' : 'real';
            case '-':
            case '*':
            case '%':
              need(node.left, 'number');
              need(node.right, 'number');
              return left === 'whole' && right === 'whole' ? 'whole' : 'real';
            case '/':
              need(node.left, 'number');
              need(node.right, 'number');
              return 'real';
            case COMMAND.AND:
            case COMMAND.OR:
              return 'boolean';
            case COMMAND.IN:
              if (isList(right)) need(node.left, isNumber(right.list) ? 'number' : 'text');
              else need(node.left, 'text');
              if (!isList(right)) need(node.right, 'text');
              return 'boolean';
            default:
              //a comparison: an answer compared with a number is a number, with a text a text
              if (left === 'answer' && right !== 'answer' && right !== 'unknown') {
                need(node.left, isNumber(right) ? 'number' : 'text');
              }
              if (right === 'answer' && left !== 'answer' && left !== 'unknown') {
                need(node.right, isNumber(left) ? 'number' : 'text');
              }
              return 'boolean';
          }
        }
      }
    };

    const visit = (statement: Statement): void => {
      line = statement.line;
      switch (statement.type) {
        case 'print':
          typeOf(statement.expression);
          return;
        case 'assign':
          set(scope, statement.name, typeOf(statement.expression));
          //the answer of name = input() is what the variable is
          if (statement.expression.type === 'input') expressions.set(statement.expression, scope.get(statement.name)!);
          return;
        case 'setItem':
          typeOf(statement.target);
          typeOf(statement.index);
          need(statement.index, 'number');
          listGets(statement.target, typeOf(statement.expression));
          return;
        case 'add':
        case 'remove': {
          const list = typeOf(statement.target);
          if (isList(list)) need(statement.expression, isNumber(list.list) ? 'number' : 'text');
          listGets(statement.target, typeOf(statement.expression));
          return;
        }
        case 'call':
          typeOf(statement.call);
          return;
        case 'return':
          if (statement.expression) {
            const old = results.get(scopeName)!;
            const next = joinTypes(old, typeOf(statement.expression));
            if (next === 'mixed') conflict(scopeName);
            if (!sameType(old, next)) {
              results.set(scopeName, next);
              changed = true;
            }
          }
          return;
        case 'if':
          statement.branches.forEach(branch => {
            line = branch.line;
            typeOf(branch.condition);
            branch.body.forEach(visit);
          });
          statement.elseBody.forEach(visit);
          return;
        case 'while':
          typeOf(statement.condition);
          statement.body.forEach(visit);
          return;
        case 'doWhile':
          statement.body.forEach(visit);
          line = statement.line;
          typeOf(statement.condition);
          return;
        case 'repeat':
          typeOf(statement.count);
          need(statement.count, 'number');
          statement.body.forEach(visit);
          return;
        case 'for': {
          const from = typeOf(statement.from);
          typeOf(statement.to);
          const step = statement.step ? typeOf(statement.step) : 'whole';
          for (const bound of [statement.from, statement.to, statement.step]) if (bound) need(bound, 'number');
          set(scope, statement.name, from === 'whole' && step === 'whole' ? 'whole' : 'real');
          statement.body.forEach(visit);
          return;
        }
        case 'forEach': {
          const items = typeOf(statement.expression);
          if (!isList(items)) need(statement.expression, 'text');
          set(scope, statement.name, isList(items) ? items.list : 'text');
          statement.body.forEach(visit);
          return;
        }
        default:
          return;
      }
    };

    return visit;
  };

  //one pass over the program and every function
  const pass = () => {
    changed = false;
    expressions = new Map();
    statements.filter(statement => statement.type !== 'function').forEach(scopeOf(''));
    for (const {name, body} of definitions) body.forEach(scopeOf(name));
  };

  for (let round = 0; changed && round < 100; round++) pass();

  for (const scope of variables.values()) {
    for (const [name, type] of scope) scope.set(name, settled(type));
  }
  for (const [name, type] of results) results.set(name, settled(type));
  pass();
  for (const [node, type] of expressions) expressions.set(node, settled(type));

  return {variables, results, expressions, conflicts};
};
