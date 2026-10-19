//packages
const assert = require('assert');
const _ = require('lodash');

const CodeSubmit = require('../src');

/**Collections of the test cases and the language of their source codes*/
const collections = [{
  name: 'successes',
  language: 'en'
}, {
  name: 'errors',
  language: 'en'
}, {
  name: 'tutorials',
  language: 'hy-AM'
}];

/**
 * Executes the source code of the test case via CodeSubmit.
 * Resolves with the collected output and the error of the session end.
 */
const run = (source, language) => new Promise((resolve, reject) => {
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

const sourceCodeMessage = source => `Source code:\n== START ==\n${source.code ? `${source.code}\n` : ''}== END ==`;

const errorCheck = (source, error) => {
  const message = `${sourceCodeMessage(source)}\nError:\n${JSON.stringify(error)}`;

  assert.strictEqual(error.errorId, source.errorId, message);

  ['variable', 'line', 'ip'].forEach(param => {
    assert.strictEqual(_.get(error.param, param), _.get(source.errorParam, param), `${param}: ${message}`);
  });
};

const outputCheck = (source, output, error) => {
  assert.strictEqual(error.errorId, undefined, `${sourceCodeMessage(source)}\nError:\n${JSON.stringify(error)}`);
  assert.strictEqual(output, source.output || '', sourceCodeMessage(source));
};

const analyze = (sources, language) => {
  sources.forEach(source => {
    if (source.sources) {
      describe(source.group, () => {
        analyze(source.sources, language);
      });
    } else {
      it(source.title, () => run(source, language).then(({output, error}) => {
        if (source.errorId) {
          errorCheck(source, error);
        } else {
          outputCheck(source, output, error);
        }
      }));
    }
  });
};

/**=== TESTS ===*/
collections.forEach(({name, language}) => {
  describe(name, () => {
    analyze(require(`./collection/${name}`), language);
  });
});

/**without the timeout check, a long-running loop exhausts the call stack of the recursive executer*/
describe('stack exhaustion', function () {
  this.timeout(5000);

  before(() => {
    process.env.TIMEOUT_IGNORE = true;
  });

  after(() => {
    delete process.env.TIMEOUT_IGNORE;
  });

  analyze([{
    title: 'Infinity loop: timeout ignored',
    code: 'while 1 < 4\n    output 123',
    errorId: 'timeout'
  }], 'en');
});
