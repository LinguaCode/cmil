const LOCALHOST = [
  '::ffff:127.0.0.1',
  '::1'
];

let code = require('../core/modifier/code');
let errorHandler = require('../libs/errorHandler');
let compiler = require('../core/executer/compiler');
let ipAddress;

let sockets = {
  submit: function (receivedData) {
    let sourceCode = receivedData.sourceCode;
    let sessionId = receivedData.sessionId;

    require('../core/globals')(sessionId);

    __io.emit(sessionId + '_' + 'submitSuccess');
    console.info('Socket.IO: server: sourceCode has been successfully received!');

    if (errorHandler.isHackAttempted(sourceCode)) {
      console.info('Socket.IO: server: output text has been successfully send! (Hack attempt)');
      let result = {
        result: '',
        status: 'Հաքերությունը հայտնաբերվա՛ծ է։ Ձեր "' + ipAddress + '" ip հասցեն պահպանված է ։）'
      };
      __io.emit(sessionId + '_' + 'evaluated', result);
      __io.emit(sessionId + '_' + 'sessionEnd');
    }

    console.log(compiler);
    compiler.codeRun(sessionId, sourceCode, __language[sessionId].old);
  },

  disconnect: function () {
    console.info('Socket.IO: server: One of connections closed.');
  },

  evaluated: function (receivedData) {
    let inputText = receivedData.inputText;
    let sessionId = receivedData.sessionId;
    console.info('Socket.IO: server: \'' + inputText + '\' text successfully received!');

    compiler.listener(sessionId, inputText);
  },

  init: function (socket) {
    socket.on('submit', this.submit);

    socket.on('disconnect', this.disconnect);

    socket.on('evaluated', this.evaluated);
  }
};

let ipAddressResolver = function (ipAddress) {
  return LOCALHOST.indexOf(ipAddress) != -1 ? '\'localhost\'' : ipAddress
};

__io.on('connection', function (socket) {

  ipAddress = ipAddressResolver(socket.handshake.address);
  console.info('Socket.IO: server: New connection from ' + ipAddress);

  sockets.init(socket);

});

let formatter = require('../core/formatter');
