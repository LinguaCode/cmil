/**
 * The types of the values of a program, for the languages that declare them: a number is whole when it is sure to be,
 * else real; a list has items of one type. Values are kept in slots: the variables of the program and of each function,
 * its parameters among them, the result of each function, and the items of each list. A value goes into a slot when it
 * is assigned, given as an argument, returned, added to a list, set as an item or written in one, or passed by a for …
 * in loop, and a slot's type joins the types of all the values that go into it: a slot that gets values of two types
 * is a conflict, which these languages can't write. The answer of an input() is a number or a text only by its use: it
 * takes the type of each slot it goes into and of each use that needs a number or a text, like arithmetic, and is a
 * text where nothing says.
 */
import {COMMAND} from '../constants/index.ts';
import type {Expression, Statement} from '../core/types.ts';

export type Type =
  | 'whole'
  | 'real'
  | 'text'
  | 'boolean'
  //an answer whose uses don't say yet whether it is a number or a text
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
 * The type of a value that gets values of both types: a whole and a real number are real, and two lists are a list of
 * their items joined, mixed when they are of two types.
 */
export const joinTypes = (a: Type, b: Type): Type => {
  if (a === 'unknown') return b;
  if (b === 'unknown') return a;
  if (isList(a) && isList(b)) return {list: joinTypes(a.list, b.list)};
  if (a === b) return a;
  if (a === 'answer') return isNumber(b) ? 'real' : b === 'text' ? b : 'mixed';
  if (b === 'answer') return joinTypes(b, a);
  if (isNumber(a) && isNumber(b)) return 'real';
  return 'mixed';
};

//whether a list, or a list in it, has items of two types
const mixedItems = (type: Type): boolean => isList(type) && (type.list === 'mixed' || mixedItems(type.list));

//a type whose answers take the type wanted where they are: an answer where a number is wanted is a real number
const answered = (type: Type, wanted: Type): Type => {
  if (type === 'answer') return isNumber(wanted) ? 'real' : wanted === 'text' ? 'text' : type;
  return isList(type) && isList(wanted) ? {list: answered(type.list, wanted.list)} : type;
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

//what the functions of the language take, where an answer is wanted as a number or a text: an answer whose length
//is counted is a text, and one given to to_number or to_text is either
const argumentType = (name: string): Type => {
  switch (name) {
    case COMMAND.NUMBER:
    case COMMAND.TEXT:
      return 'unknown';
    case COMMAND.UPPER:
    case COMMAND.LOWER:
    case COMMAND.SPLIT:
    case COMMAND.LENGTH:
    case COMMAND.JOIN:
      return 'text';
    default:
      return 'real';
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
  //the names whose type changed in the last pass, with the line where it did
  let growing = new Map<string, number>();
  let line = 0;

  const conflict = (name: string) => {
    if (!conflicts.some(known => known.name === name)) conflicts.push({line, name});
  };

  //joins a type into a slot: a variable of a scope, or the result of a function
  const set = (slots: Map<string, Type>, name: string, type: Type) => {
    const old = slots.get(name) ?? 'unknown';
    const next = joinTypes(old, type);
    if (next === 'mixed') conflict(name);
    else if (mixedItems(next)) conflict('[]');
    if (!slots.has(name)) slots.set(name, next);
    if (!sameType(old, next)) {
      slots.set(name, next);
      changed = true;
      growing.set(name, line);
    }
  };

  const scopeOf = (scopeName: string) => {
    const scope = variables.get(scopeName)!;

    //a value that goes where a type is wanted: an answer in it takes that type, like an answer given to a parameter
    //that is a number, or added to a list of texts; so does the slot the answer came from
    const need = (node: Expression, wanted: Type) => {
      switch (node.type) {
        case 'input':
          if (answered('answer', wanted) !== 'answer' && !inputs.has(node)) {
            inputs.set(node, answered('answer', wanted));
            changed = true;
          }
          return;
        case 'variable': {
          const type = scope.get(node.name) ?? 'unknown';
          if (!sameType(answered(type, wanted), type)) set(scope, node.name, answered(type, wanted));
          return;
        }
        case 'userCall': {
          const type = results.get(node.name)!;
          if (!sameType(answered(type, wanted), type)) set(results, node.name, answered(type, wanted));
          return;
        }
        case 'index': {
          //an item of a list; a letter of a text is a text
          const target = expressions.get(node.target);
          if (target && isList(target)) need(node.target, {list: wanted});
          return;
        }
        case 'list':
          if (isList(wanted)) node.items.forEach(item => need(item, wanted.list));
          return;
        default:
          return;
      }
    };

    //a list that gets an item: a list in a variable, or a list in an item of one; a value that is no list, like a
    //number, gets none, as CMIL stops there
    const listGets = (target: Expression, item: Type) => {
      const type = expressions.get(target) ?? 'unknown';
      if (!isList(type) && type !== 'unknown') return;
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
        case 'template':
          node.parts.forEach(part => typeof part !== 'string' && typeOf(part));
          return 'text';
        case 'list': {
          //a list with items of two types is one conflict, not one more for each variable it is in
          const list = {list: node.items.map(typeOf).reduce(joinTypes, 'unknown')};
          if (mixedItems(list)) conflict('[]');
          node.items.forEach(item => need(item, list.list));
          return list;
        }
        case 'variable':
          return scope.get(node.name) ?? 'unknown';
        case 'index': {
          const target = typeOf(node.target);
          typeOf(node.index);
          need(node.index, 'real');
          if (isList(target)) return target.list;
          need(node.target, 'text');
          return 'text';
        }
        case 'input':
          return inputs.get(node) ?? 'answer';
        case 'call': {
          const args = node.args.map(typeOf);
          node.args.forEach(arg => need(arg, argumentType(node.name)));
          return callType(node.name, args);
        }
        case 'userCall': {
          const callee = variables.get(node.name)!;
          const parameters = definitions.find(({name}) => name === node.name)!.parameters;
          node.args.forEach((arg, index) => {
            set(callee, parameters[index], typeOf(arg));
            need(arg, callee.get(parameters[index])!);
          });
          return results.get(node.name)!;
        }
        case 'unary': {
          const operand = typeOf(node.operand);
          if (node.operator === COMMAND.NOT) return 'boolean';
          need(node.operand, 'real');
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
                need(node.left, 'real');
                need(node.right, 'real');
                return 'real';
              }
              if (left === 'answer' || right === 'answer') {
                need(left === 'answer' ? node.left : node.right, 'real');
                return 'real';
              }
              return left === 'whole' && right === 'whole' ? 'whole' : 'real';
            case '-':
            case '*':
            case '%':
              need(node.left, 'real');
              need(node.right, 'real');
              return left === 'whole' && right === 'whole' ? 'whole' : 'real';
            case '/':
              need(node.left, 'real');
              need(node.right, 'real');
              return 'real';
            case COMMAND.AND:
            case COMMAND.OR:
              return 'boolean';
            case COMMAND.IN:
              //a value in a list is of its items' type, a text in a text a text
              need(node.left, isList(right) ? right.list : 'text');
              if (!isList(right)) need(node.right, 'text');
              return 'boolean';
            default:
              //a comparison: an answer compared with a number is a number, with a text a text
              need(node.left, right);
              need(node.right, left);
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
          need(statement.expression, scope.get(statement.name)!);
          return;
        case 'setItem': {
          const list = typeOf(statement.target);
          typeOf(statement.index);
          need(statement.index, 'real');
          listGets(statement.target, typeOf(statement.expression));
          if (isList(list)) need(statement.expression, list.list);
          return;
        }
        //a value removed from a list is of its items' type too
        case 'add':
        case 'remove': {
          const list = typeOf(statement.target);
          listGets(statement.target, typeOf(statement.expression));
          if (isList(list)) need(statement.expression, list.list);
          return;
        }
        case 'call':
          typeOf(statement.call);
          return;
        case 'return':
          if (statement.expression) {
            set(results, scopeName, typeOf(statement.expression));
            need(statement.expression, results.get(scopeName)!);
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
          need(statement.count, 'real');
          statement.body.forEach(visit);
          return;
        case 'for': {
          const from = typeOf(statement.from);
          typeOf(statement.to);
          const step = statement.step ? typeOf(statement.step) : 'whole';
          for (const bound of [statement.from, statement.to, statement.step]) if (bound) need(bound, 'real');
          //a counter whose bounds aren't known yet, like the result of a function a later pass knows, waits for them
          const known = from !== 'unknown' && step !== 'unknown';
          if (known) set(scope, statement.name, from === 'whole' && step === 'whole' ? 'whole' : 'real');
          statement.body.forEach(visit);
          return;
        }
        case 'forEach': {
          //the items of a list, which take the type of the variable they go into, or the letters of a text
          const items = typeOf(statement.expression);
          set(scope, statement.name, isList(items) ? items.list : 'text');
          need(statement.expression, isList(items) ? {list: scope.get(statement.name)!} : 'text');
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
    growing = new Map();
    expressions = new Map();
    statements.filter(statement => statement.type !== 'function').forEach(scopeOf(''));
    for (const {name, body} of definitions) body.forEach(scopeOf(name));
  };

  for (let round = 0; changed && round < 100; round++) pass();
  //a type still growing, like that of x = [x] in a loop, a list of lists of ever more lists, gets values of two kinds
  if (changed) {
    for (const [name, at] of growing) {
      line = at;
      conflict(name);
    }
  }

  for (const scope of variables.values()) {
    for (const [name, type] of scope) scope.set(name, settled(type));
  }
  for (const [name, type] of results) results.set(name, settled(type));
  pass();
  for (const [node, type] of expressions) expressions.set(node, settled(type));

  return {variables, results, expressions, conflicts};
};
