/**
 * Walks the syntax tree: the calls of functions and the inputs in an expression.
 */
import type {Expression} from './types.ts';

export type UserCall = Expression & {type: 'userCall'};
export type Pause = Expression & {type: 'userCall' | 'input'};

/**
 * The calls of functions of the program and the inputs in an expression, which stop its instruction, in the order
 * they run.
 */
export const pausesOf = (node: Expression | undefined, pauses: Pause[] = []): Pause[] => {
  if (!node) return pauses;

  switch (node.type) {
    case 'list':
      node.items.forEach(item => pausesOf(item, pauses));
      break;
    case 'index':
      pausesOf(node.target, pauses);
      pausesOf(node.index, pauses);
      break;
    case 'call':
      node.args.forEach(arg => pausesOf(arg, pauses));
      break;
    case 'userCall':
      node.args.forEach(arg => pausesOf(arg, pauses));
      pauses.push(node);
      break;
    case 'input':
      pauses.push(node);
      break;
    case 'unary':
      pausesOf(node.operand, pauses);
      break;
    case 'binary':
      pausesOf(node.left, pauses);
      pausesOf(node.right, pauses);
      break;
  }

  return pauses;
};

/**
 * The calls of functions of the program in an expression, in the order they run.
 */
export const callsOf = (node: Expression | undefined): UserCall[] =>
  pausesOf(node).filter((pause): pause is UserCall => pause.type === 'userCall');
