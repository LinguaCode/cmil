exports.needToUpgrade = function (sessionId) {
  var isArrayEnded = this.array.ended(sessionId);
  var isArrayEmpty = this.array.empty(sessionId);
  return !isArrayEnded && !isArrayEmpty;
};

exports.needToInput = function (sessionId) {
  var currentToCompileObject = getter.object(sessionId);
  return currentToCompileObject ? currentToCompileObject.hasOwnProperty('inputVariable') : false;
};

exports.array = require('./array');
exports.session = require('./session');

var getter = require('../getter');