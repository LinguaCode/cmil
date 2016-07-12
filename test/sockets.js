const serverPath = '../src/server';
let server = require(serverPath);
let io = require('socket.io-client');
let purgeCache = require('../src/libs/purgeCache');

process.env.NODE_ENV = 'testing';

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
            evalResult += receivedData.result;

            if (inputs && inputs.length && inputDataIndex != inputs.length) {
              let toSendData = {
                sessionId: sessionId,
                inputText: inputs[inputDataIndex++]
              };

              socket.emit('evaluated', toSendData);
            }
          })
          .on(sessionId + '_' + 'sessionEnd', function () {

            console.log(`\nTitle: ${title}`);
            console.log(`Source code:\n== START ==\n${code ? code + '\n' : ''}== END ==`);

            if (evalStatus == 'success' && expectedStatus.test(evalStatus) && ( evalResult == expectedOutput + '\n' || (evalResult == expectedOutput && !evalResult))) {
              console.log('Expected result:\n' + (expectedOutput ? expectedOutput : 'n/a'));
              console.log('Final result:\n' + (evalResult ? evalResult.substring(0, evalResult.length - 1) : 'n/a') + '\n\n');
              done();
            } else if (evalStatus !== 'success' && expectedStatus.test(evalStatus)) {
              console.log(`\nError message:\n${evalStatus}\n\n`);
              done();
            } else if (evalResult && evalResult != expectedOutput + '\n') {
              let errMessage =
                '\nExpected result:\n' + (expectedOutput ? expectedOutput : 'n/a') +
                '\nFinal result:\n' + (evalResult ? evalResult.substring(0, evalResult.length - 1) : 'n/a') + '\n\n';
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

  it('run', function (done) {
    process.env.NODE_ENV = 'production';
    let port = process.env.PORT;
    purgeCache(serverPath);

    server = require(serverPath);

    server.listen(port, function () {
      server.close();
    });
    done();
  });

});