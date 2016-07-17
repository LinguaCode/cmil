let path = require('path');
let io = require('socket.io-client');
let cacheWiper = require('node-cache-wiper');

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
let socket = io.connect('http://localhost:3005');
let compileId = 0;
let socketId;

let setSocketId = function (socketId) {
  return '_' + socketId.replace(/-/, '_');
};

let setSessionId = function () {
  return socketId + '_' + compileId;
};

let codeSubmit = function (sessionId, sourceCode) {
  let sendData = {
    sessionId: sessionId,
    sourceCode: sourceCode
  };

  socket.emit('submit', sendData);

  socket.on(sessionId + '_' + 'submitSuccess', () => {
    console.log('Socket.IO: client: sourceCode has been successfully send!');
  });

  compileId = compileId + 1;
};

let dbAnalyzer = function (sources) {
  sources.forEach(function (source) {
    if (source.sources) {
      describe(source.group, function () {
        dbAnalyzer(source.sources);
      });
    } else {
      let title = source.title;
      let code = source.code || '';
      let expectedOutput = source.output || '';
      let expectedStatus = new RegExp(source.status || 'success');
      let inputs = source.inputs;

      it(title, function (done) {
        let sessionId = setSessionId();
        let evalStatus = 'success';
        let evalResult = '';
        let inputDataIndex = 0;

        codeSubmit(sessionId, code);

        socket
          .on(sessionId + '_' + 'evaluated', function (receivedData) {

            evalStatus = receivedData.status;
            evalResult += receivedData.result ? receivedData.result + '\n' : '';

            if (inputs && inputs.length && inputDataIndex != inputs.length) {
              let toSendData = {
                sessionId: sessionId,
                inputText: inputs[inputDataIndex++]
              };

              socket.emit('evaluated', toSendData);
            }
          })
          .on(sessionId + '_' + 'sessionEnd', function () {
            evalResult = evalResult ? evalResult.slice(0, -1) : '';

            console.log(`\nTitle: ${title}`);
            console.log(`Source code:\n== START ==\n${code ? `${code}\n` : ''}== END ==`);

            if (evalStatus == 'success' && expectedStatus.test(evalStatus) && ( evalResult == expectedOutput || (evalResult == expectedOutput && !evalResult))) {
              console.log('Expected result:\n' + (expectedOutput ? expectedOutput : 'n/a'));
              console.log('Final result:\n' + (evalResult || 'n/a') + '\n\n');
              done();
            } else if (evalStatus !== 'success' && expectedStatus.test(evalStatus)) {
              console.log(`\nError message:\n${evalStatus}\n\n`);
              done();
            } else if (evalResult && evalResult != expectedOutput + '\n') {
              let errMessage =
                '\nExpected result:\n' + (expectedOutput ? expectedOutput : 'n/a') +
                '\nFinal result:\n' + (evalResult || 'n/a') + '\n\n';
              done(new Error(errMessage));
            } else {
              done(new Error(evalStatus));
            }
          });
      });
    }
  });
};

/**=== TESTS ===*/
/**setup the connection*/
describe('initialize', function () {

  it('socketId', function (done) {
    socket
      .on('connect', function () {
        socketId = setSocketId(socket.io.engine.id);
        done();
      })
      .on('error', function (err) {
        done(err);
      });
  });

});

/**passed db test*/
var dbs = ['successes', 'tutorials', 'errors'];
dbs.forEach((db)=> {
  describe(db, function () {
    dbAnalyzer(require('./database/' + db));
  });
});

/**interrupt the connection*/
describe('disconnect', function () {

  it('disconnect', function (done) {
    socket.disconnect();
    done();
  });

});


describe('production test', function () {

  it('with cert files', function (done) {
    cacheWiper(serverPath);

    process.env.PORT = 3003;
    process.env.NODE_ENV = ENV.production;
    server = require(currentPathOfTheServer);

    setTimeout(function () {
      done();
    })
  });

  it('without cert files', function (done) {
    cacheWiper(serverPath);
    const FAKE_PATH = './fake/path';

    process.env.PORT = 3004;
    process.env.CERT_FILE_PATH = FAKE_PATH;
    process.env.NODE_ENV = ENV.production;
    server = require(currentPathOfTheServer);

    setTimeout(function () {
      done();
    })
  });

});