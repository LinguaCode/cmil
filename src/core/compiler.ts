/**
 * Compiles the statements of a program into a flat list of instructions with jumps,
 * so the interpreter runs them in a loop and can pause at any input.
 *
 * Instructions:
 * - print {expressions}, input {name, prompt}, assign {name, expression}
 * - setItem {target, index, expression}, add {expression, target}: change a list
 * - jump {target}, jumpUnless {expression, target}, jumpIf {expression, target}
 * - repeatStart {slot, expression}, repeatTest {slot, target}: the passes left of a repeat loop, counted once
 * - forStart {slot, from, to, step}, forTest {slot, name, target}: the bounds of a for loop, read once, and its passes
 * - forEachStart {slot, expression}, forEachTest {slot, name, target}: the items of a for … in loop, and its passes
 */
import type {Instruction, Program, Statement} from './types.ts';

//a jump whose target is patched once the target is compiled
const UNPATCHED = -1;

type Loop = {
  breaks: number[];
  continues: number[];
};

export const compile = (statements: Statement[]): Program => {
  const instructions: Instruction[] = [];
  const loops: Loop[] = [];
  let slots = 0;

  const emit = (instruction: Instruction) => instructions.push(instruction) - 1;
  const here = () => instructions.length;
  const patch = (at: number, target: number) => {
    const instruction = instructions[at];
    if ('target' in instruction) instruction.target = target;
  };

  const loop = (continueTarget: number | undefined, compileBody: () => void) => {
    const current: Loop = {breaks: [], continues: []};
    loops.push(current);
    compileBody();
    loops.pop();

    return {
      end: (exitTarget: number) => current.breaks.forEach(at => patch(at, exitTarget)),
      continueAt: (target = continueTarget) => current.continues.forEach(at => patch(at, target ?? UNPATCHED))
    };
  };

  const block = (list: Statement[]) => list.forEach(statement);

  const statement = (node: Statement) => {
    const {line} = node;

    switch (node.type) {
      case 'print':
        emit({op: 'print', expressions: node.expressions, line});
        break;
      case 'input':
        emit({op: 'input', name: node.name, prompt: node.prompt, line});
        break;
      case 'assign':
        emit({op: 'assign', name: node.name, expression: node.expression, line});
        break;
      case 'setItem': {
        const {target, index, expression, column} = node;
        emit({op: 'setItem', target, index, expression, column, line});
        break;
      }
      case 'add':
        emit({op: 'add', expression: node.expression, target: node.target, line});
        break;
      case 'if': {
        const ends = node.branches.map(branch => {
          const test = emit({op: 'jumpUnless', expression: branch.condition, target: UNPATCHED, line: branch.line});
          block(branch.body);
          const end = emit({op: 'jump', target: UNPATCHED});
          patch(test, here());
          return end;
        });
        block(node.elseBody);
        ends.forEach(end => patch(end, here()));
        break;
      }
      case 'while': {
        const start = here();
        const test = emit({op: 'jumpUnless', expression: node.condition, target: UNPATCHED, line});
        const body = loop(start, () => block(node.body));
        emit({op: 'jump', target: start});
        patch(test, here());
        body.continueAt();
        body.end(here());
        break;
      }
      case 'doWhile': {
        const start = here();
        const body = loop(undefined, () => block(node.body));
        const test = here();
        emit({op: 'jumpIf', expression: node.condition, target: start, line});
        body.continueAt(test);
        body.end(here());
        break;
      }
      case 'repeat': {
        const slot = slots++;
        emit({op: 'repeatStart', slot, expression: node.count, line});
        const test = emit({op: 'repeatTest', slot, target: UNPATCHED, line});
        const body = loop(test, () => block(node.body));
        emit({op: 'jump', target: test});
        patch(test, here());
        body.continueAt();
        body.end(here());
        break;
      }
      case 'for': {
        const slot = slots++;
        emit({op: 'forStart', slot, from: node.from, to: node.to, step: node.step, line});
        const test = emit({op: 'forTest', slot, name: node.name, target: UNPATCHED, line});
        const body = loop(test, () => block(node.body));
        emit({op: 'jump', target: test});
        patch(test, here());
        body.continueAt();
        body.end(here());
        break;
      }
      case 'forEach': {
        const slot = slots++;
        emit({op: 'forEachStart', slot, expression: node.expression, line});
        const test = emit({op: 'forEachTest', slot, name: node.name, target: UNPATCHED, line});
        const body = loop(test, () => block(node.body));
        emit({op: 'jump', target: test});
        patch(test, here());
        body.continueAt();
        body.end(here());
        break;
      }
      case 'break':
        loops[loops.length - 1].breaks.push(emit({op: 'jump', target: UNPATCHED, line}));
        break;
      case 'continue':
        loops[loops.length - 1].continues.push(emit({op: 'jump', target: UNPATCHED, line}));
        break;
    }
  };

  block(statements);

  return {instructions, slots};
};
