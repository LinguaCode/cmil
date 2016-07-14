let io = require('socket.io');

exports.evaluate = function (sessionId, output) {
  io.emit(sessionId + '_' + 'evaluated', output);
};

exports.sessionEnd = function (sessionId) {
  io.emit(sessionId + '_' + 'sessionEnd');
};

exports.submitSuccess = function (sessionId) {
  io.emit(sessionId + '_' + 'submitSuccess');
};