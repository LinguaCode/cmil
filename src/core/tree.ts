/**
 * Walks the syntax tree: the calls of functions in an expression.
 */
import type {Expression} from './types.ts';

export type UserCall = Expression & {type: 'userCall'};

/**
 * The calls of functions of the program in an expression, in the order they run.
 */
export const callsOf = (node: Expression | undefined, calls: UserCall[] = []): UserCall[] => {
  if (!node) return calls;

  switch (node.type) {
    case 'list':
      node.items.forEach(item => callsOf(item, calls));
      break;
    case 'index':
      callsOf(node.target, calls);
      callsOf(node.index, calls);
      break;
    case 'call':
      node.args.forEach(arg => callsOf(arg, calls));
      break;
    case 'userCall':
      node.args.forEach(arg => callsOf(arg, calls));
      calls.push(node);
      break;
    case 'unary':
      callsOf(node.operand, calls);
      break;
    case 'binary':
      callsOf(node.left, calls);
      callsOf(node.right, calls);
      break;
  }

  return calls;
};
