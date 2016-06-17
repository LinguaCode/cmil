let io = require('socket.io-client');

let options = {
  transports: ['websocket'],
  'force new connection': true
};

const socketURL = 'http://localhost:3005';
let compileId = 0;
let socketId;

const sourceCodesDB = require('./sourceCodesDB');

let socket = io.connect(socketURL, options);

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

let paranoidalRecurser = function (sources) {
  sources.forEach(function (source) {
    if (source.sources) {
      describe(source.name, function () {
        paranoidalRecurser(source.sources);
      });
    } else {
      let title = source.title;
      let code = source.code || '';
      let expectedOutput = source.output || '';
      let inputs = source.inputs;

      it(title, function (done) {
        let sessionId = setSessionId();
        let evalStatus;
        let evalResult;
        let inputDataIndex = 0;

        codeSubmit(sessionId, code);

        socket
          .on(sessionId + '_' + 'evaluated', function (receivedData) {

            evalStatus = receivedData.status;
            evalResult = receivedData.result;

            if (inputs && inputs.length && inputDataIndex != inputs.length) {
              let toSendData = {
                sessionId: sessionId,
                inputText: inputs[inputDataIndex++]
              };

              socket.emit('evaluated', toSendData);
            }
          })
          .on(sessionId + '_' + 'sessionEnd', function () {
            if (evalStatus == 'success' && evalResult == expectedOutput + '\n' || (evalResult == expectedOutput && !evalResult)) {
              console.log(`\nTitle: ${title}`);
              console.log(`Source code:\n== START ==\n${code ? code + '\n' : ''}== END ==`);
              console.log('Expected result:\n' + (evalResult ? evalResult.substring(0, evalResult.length - 1) : 'n/a'));
              console.log('Final result:\n' + (expectedOutput ? expectedOutput : 'n/a') + '\n\n');
              done();
            } else if (evalResult && evalResult != expectedOutput + '\n') {
              let errMessage =
                'Expected result:\n' + (evalResult ? evalResult.substring(0, evalResult.length - 1) : 'n/a') +
                '\nFinal result:\n' + (expectedOutput ? expectedOutput : 'n/a') + '\n\n';
              done(new Error(errMessage));
            } else {
              done(new Error(evalStatus));
            }
          });
      });
    }
  });
};

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

describe('sockets', function () {
  paranoidalRecurser(sourceCodesDB);
});