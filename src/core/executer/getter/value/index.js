exports.index = function (sessionId) {
  let pathOfLocation = path.location(sessionId);
  let indexOfBracketBegin = pathOfLocation.lastIndexOf('[') + 1;
  let indexOfBracketEnd = pathOfLocation.lastIndexOf(']');
  let index = pathOfLocation.substring(indexOfBracketBegin, indexOfBracketEnd);
  return parseInt(index);
};

exports.nameOfProperty = function (sessionId) {
  let pathOfLocation = path.location(sessionId);
  let indexOfTypeEnd = pathOfLocation.lastIndexOf('[');
  let indexOfTypeBegin = pathOfLocation.lastIndexOf('.', indexOfTypeEnd) + 1;

  return pathOfLocation.substring(indexOfTypeBegin, indexOfTypeEnd);
};

exports.variables = function (sessionId) {
  return __store[sessionId].variables;
};

exports.output = function (sessionId) {
  let result = __store[sessionId].output;
  result = result ? result.substr(0, result.length - 1) : '';
  let status = __store[sessionId].status;

  return {
    result: result,
    status: status
  }
};

exports.input = function (sessionId) {
  return __store[sessionId].input;
};

let path = require('../path');

exports.structure = require('./structure');

exports.session = require('./session');