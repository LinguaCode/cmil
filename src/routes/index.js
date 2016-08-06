const io = require('../io');
const code = require('../core/modifier/code');
const errorHandler = require('../core/errorHandler');
const compiler = require('../core/executer/compiler');
const STATUS = require('../constants').STATUS;
const sender = require('../core/sender');
const formatter = require('../core/formatter');
const setter = require('../core/executer/setter');
const checker = require('../core/executer/checker');
const getter = require('../core/executer/getter');

let ipAddress;

let sockets = {
  submit: receivedData => {
    let sourceCode = receivedData.sourceCode;
    let sessionId = receivedData.sessionId;

    require('../core/globals')(sessionId);

    sender.submitSuccess(sessionId);
    console.llog('Socket.IO: server: sourceCode has been successfully received!');

    let errorMessage = errorHandler.analyze(sourceCode, {ipAddress: ipAddress});
    if (errorMessage) {

      //TODO: Arman: put here mail logging system
      console.llog('Socket.IO: server: output text has been successfully send! (Hack attempt)');

      setter.output(sessionId, errorMessage);
    } else {
      compiler.codeRun(sessionId, sourceCode, __language[sessionId].old);
    }

    postExecute(sessionId);
  },

  disconnect: () => console.llog('Socket.IO: server: One of connections closed.'),

  evaluated: receivedData => {
    let inputText = receivedData.inputText;
    let sessionId = receivedData.sessionId;
    console.llog(`Socket.IO: server: '${inputText}' text successfully received!`);

    compiler.listener(sessionId, inputText);

    postExecute(sessionId);
  },

  init: function(socket) {

    socket.on('submit', this.submit);

    socket.on('disconnect', this.disconnect);

    socket.on('evaluated', this.evaluated);

  }
};

const postExecute = sessionId => {
  let output = getter.output(sessionId);
  let currentStatus = output.status;
  if ((!output.result && currentStatus == STATUS.SUCCESS) || currentStatus == STATUS.WAITS_FOR_INPUT) {
    if (output.result) {
      sender.evaluate(sessionId, output.result);
    }
    sender.waitsForInput(sessionId);
  } else if (currentStatus == STATUS.SUCCESS) {
    sender.evaluate(sessionId, output.result);
    sender.waitsForInput(sessionId);
  } else {
    sender.error(sessionId, currentStatus);
    sender.sessionEnd(sessionId);
  }

  if (checker.session.ended(sessionId)) {
    return sender.sessionEnd(sessionId);
  }
};

io.on('connection', socket => {
  ipAddress = socket.handshake.address;
  console.llog(`Socket.IO: server: New connection from ${ipAddress}`);

  sockets.init(socket);
});
