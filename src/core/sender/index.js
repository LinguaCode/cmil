const io = require('../../io');

exports.evaluate = (sessionId, output) => {
  io.emit(`${sessionId}_evaluated`, output)
};

exports.sessionEnd = (sessionId, errorMessage) => {
  io.emit(`${sessionId}_sessionEnd`, errorMessage)
};

exports.waitsForInput = sessionId => {
  io.emit(`${sessionId}_waitsForInput`)
};

exports.submitSuccess = sessionId => {
  io.emit(`${sessionId}_submitSuccess`)
};