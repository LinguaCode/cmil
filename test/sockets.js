let io = require('socket.io-client');

let options = {
  transports: ['websocket'],
  'force new connection': true
};

let socketURL = 'http://localhost:3005';
let compileId = 0;
let sessionId;

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
socket
  .on('connect', function () {
    socketId = setSocketId(socket.io.engine.id);
  })
  .on('error', function (err) {
    console.log(err);
  });

let setSocketId = function (socketId) {
  return '_' + socketId.replace(/-/, '_');
};

let setSessionId = function () {
  sessionId = socketId + '_' + compileId;
};

let codeSubmit = function () {
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

describe("Codes", function () {
  sourceCodesDB.forEach(function (sourceCodes) {
    let language = sourceCodes.language;
    let sources = sourceCodes.sources;

    sources.forEach(function (source) {
      let title = source.title;
      let code = source.code;
      let output = source.output;
      let inputs = source.inputs;

      let testTitle = language +': '+ title;

      it(testTitle, function (done) {
        let sessionId = setSessionId();

        codeSubmit(code);
      });
    });
  });
});