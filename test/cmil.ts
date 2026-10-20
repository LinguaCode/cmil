//packages
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {Session, type ProgramError} from '../src/index.ts';
import successes from './collection/successes/index.ts';
import errors from './collection/errors/index.ts';
import tutorials from './collection/tutorials.ts';
import type {Case, Source} from './collection/types.ts';

/**Collections of the test cases and the language of their source codes*/
const collections = [
  {
    name: 'successes',
    sources: successes,
    language: 'en'
  },
  {
    name: 'errors',
    sources: errors,
    language: 'en'
  },
  {
    name: 'tutorials',
    sources: tutorials,
    language: 'hy-AM'
  }
];

type Result = {
  output: string;
  error: ProgramError | undefined;
};

/**
 * Runs the source code of the test case in a session, answering its input requests with the inputs of the case.
 * Returns the printed lines and the error of the session end.
 */
const run = (source: Case, language: string): Result => {
  const inputs = (source.inputs || []).slice();
  const session = new Session(source.code || '', language);
  let step = session.run();
  let output = step.output;
  while (step.state === 'input') {
    const input = inputs.shift();
    if (input === undefined) {
      throw new Error(`Input requested, but no inputs left.\nOutput so far:\n${output.join('\n')}`);
    }
    step = session.input(input);
    output = output.concat(step.output);
  }

  return {output: output.join('\n'), error: step.error};
};

const sourceCodeMessage = (source: Case) =>
  `Source code:\n== START ==\n${source.code ? `${source.code}\n` : ''}== END ==`;

const errorCheck = (source: Case, output: string, error: ProgramError | undefined) => {
  const message = `${sourceCodeMessage(source)}\nError:\n${JSON.stringify(error)}`;
  const params: Record<string, unknown> = error || {};

  assert.strictEqual(error?.id, source.errorId, message);

  (['variable', 'line'] as const).forEach(param => {
    assert.strictEqual(params[param], source.errorParam?.[param], `${param}: ${message}`);
  });

  //output printed before the error, checked when the case defines it
  if ('output' in source) {
    assert.strictEqual(output, source.output, sourceCodeMessage(source));
  }
};

const outputCheck = (source: Case, output: string, error: ProgramError | undefined) => {
  assert.strictEqual(error, undefined, `${sourceCodeMessage(source)}\nError:\n${JSON.stringify(error)}`);
  assert.strictEqual(output, source.output || '', sourceCodeMessage(source));
};

const analyze = (sources: Source[], language: string) => {
  sources.forEach(source => {
    if ('sources' in source) {
      describe(source.group, () => {
        analyze(source.sources, language);
      });
    } else {
      it(source.title, {todo: source.todo, skip: source.skip}, () => {
        const {output, error} = run(source, language);
        if (source.errorId) {
          errorCheck(source, output, error);
        } else {
          outputCheck(source, output, error);
        }
      });
    }
  });
};

/**=== TESTS ===*/
collections.forEach(({name, sources, language}) => {
  describe(name, () => {
    analyze(sources, language);
  });
});

/**sessions keep their own state*/
describe('sessions', () => {
  it('a session waiting for input survives another session', () => {
    const waiting = new Session('input name\noutput "A got " + name', 'en');
    assert.deepStrictEqual(waiting.run(), {state: 'input', output: []});
    assert.deepStrictEqual(new Session('output "B runs"', 'en').run(), {state: 'end', output: ['B runs']});
    assert.deepStrictEqual(waiting.input('Ani'), {state: 'end', output: ['A got Ani']});
  });
});

/**a session may set its own step limit*/
describe('step limit', () => {
  it('maxSteps ends a loop sooner', () => {
    const step = new Session('while 1 < 4\n    output 123', 'en', {maxSteps: 100}).run();
    assert.strictEqual(step.state, 'end');
    assert.strictEqual(step.state === 'end' && step.error?.id, 'timeout');
    assert.ok(step.output.length > 0 && step.output.every(line => line === '123'));
  });
});
