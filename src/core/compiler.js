/**
 * Compiles the statements of a program into a flat list of instructions with jumps,
 * so the interpreter runs them in a loop and can pause at any input.
 *
 * Instructions:
 * - output {expression}, input {name}, assign {name, expression}
 * - jump {target}, jumpUnless {expression, target}, jumpIf {expression, target}
 * - repeatStart {slot}, repeatTest {slot, expression, target}: the counter of a repeat loop
 */
exports.compile = statements => {
  const instructions = [];
  const loops = [];
  let slots = 0;

  const emit = instruction => instructions.push(instruction) - 1;
  const here = () => instructions.length;
  const patch = (at, target) => {
    instructions[at].target = target;
  };

  const loop = (continueTarget, compileBody) => {
    const current = {breaks: [], continues: []};
    loops.push(current);
    compileBody();
    loops.pop();

    return {
      end: exitTarget => current.breaks.forEach(at => patch(at, exitTarget)),
      continueAt: target => current.continues.forEach(at => patch(at, target === undefined ? continueTarget : target))
    };
  };

  const block = list => list.forEach(statement);

  const statement = node => {
    const {line} = node;

    switch (node.type) {
      case 'output':
        emit({op: 'output', expression: node.expression, line});
        break;
      case 'input':
        emit({op: 'input', name: node.name, line});
        break;
      case 'assign':
        emit({op: 'assign', name: node.name, expression: node.expression, line});
        break;
      case 'if': {
        const ends = node.branches.map(branch => {
          const test = emit({op: 'jumpUnless', expression: branch.condition, line: branch.line});
          block(branch.body);
          const end = emit({op: 'jump'});
          patch(test, here());
          return end;
        });
        block(node.elseBody);
        ends.forEach(end => patch(end, here()));
        break;
      }
      case 'while': {
        const start = here();
        const test = emit({op: 'jumpUnless', expression: node.condition, line});
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
        emit({op: 'repeatStart', slot, line});
        const test = emit({op: 'repeatTest', slot, expression: node.count, line});
        const body = loop(test, () => block(node.body));
        emit({op: 'jump', target: test});
        patch(test, here());
        body.continueAt();
        body.end(here());
        break;
      }
      case 'break':
        loops[loops.length - 1].breaks.push(emit({op: 'jump', line}));
        break;
      case 'continue':
        loops[loops.length - 1].continues.push(emit({op: 'jump', line}));
        break;
    }
  };

  block(statements);

  return {instructions, slots};
};
