//packages
const path = require('path');
const io = require('socket.io-client');
const _ = require('lodash');
const cacheWiper = require('node-cache-wiper');

//constants
const constants = require('linguacode-constants');
const ENVIRONMENT = constants.ENVIRONMENT;

const serverPath = path.join(constants.SOURCE_FILE_PATH, constants.SERVER_FILE_NAME);
const currentPathOfTheServer = path.join(process.cwd(), serverPath);

let server = require(currentPathOfTheServer);

process.env.NODE_ENV = ENVIRONMENT.TEST;

/**Initialize the variables*/
const socket = io.connect('https://localhost:3005');
let compileId = 0;
let socketId;

const setSocketId = socketId => `_${socketId.replace(/-/, '_')}`;

const setSessionId = () => `${socketId}_${compileId}`;

const codeSubmit = (sessionId, sourceCode) => {
  const sendData = {
    sessionId,
    sourceCode
  };

  socket.emit('submit', sendData);

  socket.on(`${sessionId}_submitSuccess`, () => {
    console.log('Socket.IO: client: sourceCode has been successfully send!');
  });

  compileId = compileId + 1;
};

const dbAnalyzer = sources => {
  sources.forEach(source => {
    if (source.sources) {
      describe(source.group, () => {
        dbAnalyzer(source.sources);
      });
    } else {
      const title = source.title;
      const code = source.code || '';
      const expectedOutput = source.output || '';
      const inputs = source.inputs;

      it(title, done => {
        const sessionId = setSessionId();
        let evalResult = '';
        let inputDataIndex = 0;

        const socketPathResolve = path => `${sessionId}_${path}`;

        const PATH_EVALUATED = socketPathResolve(constants.EVALUATED);
        const PATH_WAITS_FOR_INPUT = socketPathResolve(constants.WAITS_FOR_INPUT);
        const PATH_SESSION_END = socketPathResolve(constants.SESSION_END);

        codeSubmit(sessionId, code);

        socket
          .on(PATH_EVALUATED, receivedData => {
            evalResult += receivedData ? `${receivedData}\n` : '';
          })
          .on(PATH_WAITS_FOR_INPUT, () => {
            if (inputs && inputs.length && inputDataIndex != inputs.length) {
              const toSendData = {
                sessionId,
                inputText: inputs[inputDataIndex++]
              };

              socket.emit('evaluated', toSendData);
            }
          })
          .on(PATH_SESSION_END, (error) => {
            const isErrorOccurred = !!error.id;
            if (isErrorOccurred) {
              const errorMessage = `\nError:\n${JSON.stringify(error)}\n\n`;
              if (errorCheck(source, error)) {
                console.log(errorMessage);
                done();
              } else {
                done(new Error(errorMessage));
              }

              return;
            }

            evalResult = evalResult ? evalResult.slice(0, -1) : '';

            const titleMessage = `\nTitle: ${title}`;
            const expectedResultMessage = `Expected result:\n${expectedOutput ? expectedOutput : 'n/a'}`;
            const finalResultMessage = `Final result:\n${evalResult || 'n/a'}\n\n`;
            const sourceCodeMessage = `Source code:\n== START ==\n${code ? `${code}\n` : ''}== END ==`;
            const errorMessage = `\n${expectedResultMessage}\n${finalResultMessage}`;

            console.log(titleMessage);
            console.log(sourceCodeMessage);

            if (evalResult == expectedOutput || (evalResult == expectedOutput && !evalResult)) {
              console.log(`\n${expectedResultMessage}\n\n`);
              done();
            } else if (evalResult && evalResult != `${expectedOutput}\n`) {
              done(new Error(errorMessage));
            }
          })
      });
    }
  });
};

const errorCheck = (expected, result) => {
  const expectedErrorId = expected.errorId;
  const expectedErrorParam = expected.errorParam;
  const expectedErrorParamVariable = _.get(expectedErrorParam, 'variable');
  const expectedErrorParamLine = _.get(expectedErrorParam, 'line');
  const expectedErrorParamIp = _.get(expectedErrorParam, 'ip');

  const errorId = result.id;
  const errorParam = result.param;
  const errorParamVariable = _.get(errorParam, 'variable');
  const errorParamLine = _.get(errorParam, 'line');
  const errorParamIp = _.get(errorParam, 'ip');

  const isErrorIdsEqual = expectedErrorId == errorId;
  const isErrorParamVariable = expectedErrorParamVariable == errorParamVariable;
  const isErrorParamLine = expectedErrorParamLine == errorParamLine;
  const isErrorParamIp = expectedErrorParamIp == errorParamIp;

  return isErrorIdsEqual && isErrorParamLine && isErrorParamVariable && isErrorParamIp;
};

/**=== TESTS ===*/
/**setup the connection*/
describe('initialize', () => {

  let isDonePassedOnce = false;
  it('socketId', done => {
    socket
      .on('connect', () => {
        if (isDonePassedOnce) return;

        isDonePassedOnce = true;
        socketId = setSocketId(socket.io.engine.id);
        done();
      })
      .on('error', done);
  });

});

/**passed db test*/
const dbs = ['successes', 'tutorials', 'errors'];
// const dbs = ['testDB'];
dbs.forEach((db) => {
  describe(db, () => {
    const sources = require(`./collection/${db}`);
    dbAnalyzer(sources);
  });
});

/**interrupt the connection*/
describe('disconnect', () => {

  it('disconnect', done => {
    socket.disconnect();
    done();
  });

});

describe('production test', () => {

  it('with cert files', done => {
    cacheWiper(serverPath);

    process.env.PORT = 3003;
    process.env.NODE_ENV = ENVIRONMENT.PRODUCTION;
    server = require(currentPathOfTheServer);

    setTimeout(() => {
      done();
    })
  });

  it('without cert files', done => {
    cacheWiper(serverPath);

    process.env.PORT = 3004;
    process.env.CERT_FILE_PATH = constants.FAKE_PATH;
    process.env.NODE_ENV = ENVIRONMENT.PRODUCTION;
    server = require(currentPathOfTheServer);

    setTimeout(() => {
      done();
    })
  });

});

describe('timeout ignore', () => {

  it('true', done => {
    cacheWiper(serverPath);

    process.env.PORT = 3007;
    process.env.TIMEOUT_IGNORE = true;
    server = require(currentPathOfTheServer);

    const sessionId = setSessionId();
    const code = '';

    socket
      .connect()
      .on('connect', () => {
        socketId = setSocketId(socket.io.engine.id);
        codeSubmit(sessionId, code);

        const socketPathResolve = path => `${sessionId}_${path}`;

        const PATH_SESSION_END = socketPathResolve(constants.SESSION_END);

        socket.on(PATH_SESSION_END, () => {
          done();
        });
      })

  });

});
