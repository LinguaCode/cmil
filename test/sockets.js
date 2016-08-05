const path = require('path');
const io = require('socket.io-client');
const cacheWiper = require('node-cache-wiper');

const EVALUATED = 'evaluated';
const WAITS_FOR_INPUT = 'waitsForInput';
const SESSION_END = 'sessionEnd';
const ERROR = 'error';

const serverFileName = 'server';
const sourceFilePath = './src/';
const serverPath = path.join(sourceFilePath, serverFileName);
const currentPathOfTheServer = path.join(process.cwd(), serverPath);

let server = require(currentPathOfTheServer);

const ENV = {
  testing: 'testing',
  production: 'production'
};

process.env.NODE_ENV = ENV.testing;

/**Initialize the variables*/
const socket = io.connect('http://localhost:3005');
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
      const expectedStatus = new RegExp(source.status);
      const inputs = source.inputs;

      it(title, done => {
        const sessionId = setSessionId();
        let evalResult = '';
        let inputDataIndex = 0;

        const socketPathResolve = path => `${sessionId}_${path}`;

        const path = {
          evaluated: socketPathResolve(EVALUATED),
          waitsForInput: socketPathResolve(WAITS_FOR_INPUT),
          sessionEnd: socketPathResolve(SESSION_END),
          error: socketPathResolve(ERROR),
        };

        codeSubmit(sessionId, code);

        socket
          .on(path.evaluated, receivedData => {
            evalResult += receivedData ? `${receivedData}\n` : '';
          })
          .on(path.waitsForInput, () => {
            if (inputs && inputs.length && inputDataIndex != inputs.length) {
              const toSendData = {
                sessionId,
                inputText: inputs[inputDataIndex++]
              };

              socket.emit('evaluated', toSendData);
            }
          })
          .on(path.sessionEnd, () => {
            evalResult = evalResult ? evalResult.slice(0, -1) : '';

            console.log(`\nTitle: ${title}`);
            console.log(`Source code:\n== START ==\n${code ? `${code}\n` : ''}== END ==`);

            if (evalResult == expectedOutput || (evalResult == expectedOutput && !evalResult)) {
              console.log(`Expected result:\n${expectedOutput ? expectedOutput : 'n/a'}`);
              console.log(`Final result:\n${evalResult || 'n/a'}\n\n`);
              done();
            } else if (evalResult && evalResult != `${expectedOutput}\n`) {
              const errMessage = `\nExpected result:\n${expectedOutput ? expectedOutput : 'n/a'}\nFinal result:\n${evalResult || 'n/a'}\n\n`;
              done(new Error(errMessage));
            }
          })
          .on(path.error, evalStatus => {
            const errorMessage = `\nError message:\n${evalStatus}\n\n`;
            if (expectedStatus.test(evalStatus)) {
              console.log(errorMessage);
              done();
            } else {
              done(new Error(errorMessage));
            }
          });
      });
    }
  });
};

/**=== TESTS ===*/
/**setup the connection*/
describe('initialize', () => {

  it('socketId', done => {
    socket
      .on('connect', () => {
        socketId = setSocketId(socket.io.engine.id);
        done();
      })
      .on('error', err => {
        done(err);
      });
  });

});

/**passed db test*/
const dbs = ['successes', 'tutorials', 'errors'];
dbs.forEach((db)=> {
  describe(db, () => {
    dbAnalyzer(require(`./database/${db}`));
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
    process.env.NODE_ENV = ENV.production;
    server = require(currentPathOfTheServer);

    setTimeout(() => {
      done();
    })
  });

  it('without cert files', done => {
    cacheWiper(serverPath);
    const FAKE_PATH = './fake/path';

    process.env.PORT = 3004;
    process.env.CERT_FILE_PATH = FAKE_PATH;
    process.env.NODE_ENV = ENV.production;
    server = require(currentPathOfTheServer);

    setTimeout(() => {
      done();
    })
  });

});