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

const preExecute = sessionId => {
  require('../core/globals')(sessionId);
};

const sockets = {
  submit: receivedData => {
    const sourceCode = receivedData.sourceCode;
    const sessionId = receivedData.sessionId;
    preExecute(sessionId);

    //TODO: add error handler: unsupported language
    const language = receivedData.language || 'hy';

    setter.language(sessionId, language);

    sender.submitSuccess(sessionId);
    console.llog('Socket.IO: server: sourceCode has been successfully received!');

    const error = errorHandler.analyze(sourceCode, {ipAddress: ipAddress});
    if (error) {

      //TODO: Arman: put here mail logging system
      console.llog('Socket.IO: server: output text has been successfully send! (Hack attempt)');

      setter.output(sessionId, error);
    } else {
      compiler.codeRun(sessionId, sourceCode, language);
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

  init: function (socket) {

    socket.on('submit', this.submit);

    socket.on('disconnect', this.disconnect);

    socket.on('evaluated', this.evaluated);

  }
};

const postExecute = sessionId => {
  const output = getter.output(sessionId);
  const status = output.status;
  const isSucceed = status === STATUS.SUCCESS;
  const isWaitsForInput = status === STATUS.WAITS_FOR_INPUT;

  if ((!output.result && isSucceed) || isWaitsForInput) {
    if (output.result) {
      sender.evaluate(sessionId, output.result);
    }
    sender.waitsForInput(sessionId);
  } else if (isSucceed) {
    sender.evaluate(sessionId, output.result);
  }

  const error = isSucceed ? '' : status;

  if (checker.session.ended(sessionId)) {
    return sender.sessionEnd(sessionId, error);
  }
};

io.on('connection', socket => {
  ipAddress = socket.handshake.address;
  console.llog(`Socket.IO: server: New connection from ${ipAddress}`);

  sockets.init(socket);
});
