exports.needToUpgrade = function (sessionId) {
  let isArrayEnded = this.array.ended(sessionId);
  let isArrayEmpty = this.array.empty(sessionId);
  return !isArrayEnded && !isArrayEmpty;
};

exports.needToInput = function (sessionId) {
  let currentToCompileObject = getter.object(sessionId);

  let hasInputVariableProperty = currentToCompileObject ? currentToCompileObject.hasOwnProperty('inputVariable') : false;
  return hasInputVariableProperty;
};

exports.array = require('./array');
exports.session = require('./session');

let getter = require('../getter');