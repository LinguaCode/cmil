//packages
import assert from 'node:assert';
import {describe, it, before, after} from 'node:test';

import CodeSubmit, {type SessionEnd} from '../src/index.ts';
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
  error: SessionEnd;
};

/**
 * Executes the source code of the test case via CodeSubmit.
 * Resolves with the collected output and the error of the session end.
 */
const run = (source: Case, language: string) =>
  new Promise<Result>((resolve, reject) => {
    const inputs = (source.inputs || []).slice();
    let output = '';

    const codeSubmit = new CodeSubmit(source.code || '', language);

    codeSubmit
      .onOutput(receivedData => {
        output += receivedData ? `${receivedData}\n` : '';
      })
      .onInputRequest(() => {
        if (!inputs.length) {
          return reject(new Error(`Input requested, but no inputs left.\nOutput so far:\n${output}`));
        }

        setImmediate(() => codeSubmit.inputEmitter(inputs.shift()));
      })
      .onSessionEnd(error => {
        resolve({
          output: output.slice(0, -1),
          error
        });
      })
      .execute();
  });

const sourceCodeMessage = (source: Case) =>
  `Source code:\n== START ==\n${source.code ? `${source.code}\n` : ''}== END ==`;

const errorCheck = (source: Case, output: string, error: SessionEnd) => {
  const message = `${sourceCodeMessage(source)}\nError:\n${JSON.stringify(error)}`;

  assert.strictEqual(error.errorId, source.errorId, message);

  (['variable', 'line'] as const).forEach(param => {
    assert.strictEqual(error.param?.[param], source.errorParam?.[param], `${param}: ${message}`);
  });

  //output printed before the error, checked when the case defines it
  if ('output' in source) {
    assert.strictEqual(output, source.output, sourceCodeMessage(source));
  }
};

const outputCheck = (source: Case, output: string, error: SessionEnd) => {
  assert.strictEqual(error.errorId, undefined, `${sourceCodeMessage(source)}\nError:\n${JSON.stringify(error)}`);
  assert.strictEqual(output, source.output || '', sourceCodeMessage(source));
};

const analyze = (sources: Source[], language: string) => {
  sources.forEach(source => {
    if ('sources' in source) {
      describe(source.group, () => {
        analyze(source.sources, language);
      });
    } else {
      it(source.title, {todo: source.todo, skip: source.skip}, () =>
        run(source, language).then(({output, error}) => {
          if (source.errorId) {
            errorCheck(source, output, error);
          } else {
            outputCheck(source, output, error);
          }
        })
      );
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
  it('a session waiting for input survives another session', () =>
    new Promise<void>((resolve, reject) => {
      const outputs: string[] = [];

      const waiting = new CodeSubmit('input name\noutput "A got " + name', 'en');
      waiting
        .onOutput(text => outputs.push(text))
        .onInputRequest(() => {})
        .onSessionEnd(error => {
          try {
            assert.strictEqual(error.errorId, undefined, JSON.stringify(error));
            assert.deepStrictEqual(outputs, ['B runs', 'A got Ani']);
            resolve();
          } catch (assertionError) {
            reject(assertionError);
          }
        })
        .execute();

      new CodeSubmit('output "B runs"', 'en')
        .onOutput(text => outputs.push(text))
        .onInputRequest(() => {})
        .onSessionEnd(() => {})
        .execute();

      waiting.inputEmitter('Ani');
    }));
});

/**without the time limit, the step limit still ends a long-running loop*/
describe('step limit', () => {
  before(() => {
    process.env.TIMEOUT_IGNORE = 'true';
  });

  after(() => {
    delete process.env.TIMEOUT_IGNORE;
  });

  analyze(
    [
      {
        title: 'Infinity loop: timeout ignored',
        code: 'while 1 < 4\n    output 123',
        errorId: 'timeout'
      }
    ],
    'en'
  );
});
