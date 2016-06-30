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

let path = require('../path');
exports.structure = require('./structure');