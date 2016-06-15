exports.indexIncrement = function (sessionId) {
  __store[sessionId].pathOfLocation = getter.parentObjectPath(sessionId) + '[' + ( getter.index(sessionId) + 1) + ']';
};

exports.upgrade = function (sessionId, typeOfInnerObject) {
  __store[sessionId].pathOfLocation += '.' + typeOfInnerObject + '[0]';
};

exports.downgrade = function (sessionId) {
  var lastObjectIndex = getter.pathOfLocation(sessionId).lastIndexOf('.');
  __store[sessionId].pathOfLocation = getter.pathOfLocation(sessionId).substring(0, lastObjectIndex);
};

exports.output = function (sessionId, output) {
  __store[sessionId].output += '\n' + output;
};

var getter = require('../getter');