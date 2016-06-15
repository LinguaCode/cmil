let io = require('socket.io-client');

let options = {
  transports: ['websocket'],
  'force new connection': true
};

let socketURL = 'http://localhost:3005';
let compileId = 0;

const sourceCodesDB = [{
  language: 'hy',
  sources: [{
    title: '#output («)',
    code: 'տպել «բարեւ»',
    output: 'բարեւ',
    inputs: []
  }]
}];

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
    console.log('Socket.IO: sourceCode has been successfully send!');
  });

  compileId = compileId + 1;
};

let socketId;

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
  sourceCodesDB.forEach(function (sourceCodes) {
    let language = sourceCodes.language;
    let sources = sourceCodes.sources;
    describe(language, function () {
      sources.forEach(function (source) {
        let title = source.title;
        let code = source.code;
        let expectedOutput = source.output;
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

              if (inputs.length) {
                let toSendData = {
                  sessionId: sessionId,
                  inputText: inputs[inputDataIndex++]
                };

                socket.emit('evaluated', toSendData);
              }
            })
            .on(sessionId + '_' + 'sessionEnd', function () {
              if (evalStatus == 'success' && evalResult == expectedOutput + '\n') {
                done();
              } else {
                done(new Error(evalStatus));
              }
            });
        });
      });
    });
  });
});