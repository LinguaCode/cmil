let io = require('../../io');

exports.evaluate = (sessionId, output) => {
  io.emit(`${sessionId}_evaluated`, output);
};

exports.sessionEnd = sessionId => {
  io.emit(`${sessionId}_sessionEnd`);
};

exports.waitsForInput = sessionId => {
  io.emit(`${sessionId}_waitsForInput`);
};

exports.error = (sessionId, message) => {
  io.emit(`${sessionId}_error`, message);
};

exports.submitSuccess = sessionId => {
  io.emit(`${sessionId}_submitSuccess`);
};