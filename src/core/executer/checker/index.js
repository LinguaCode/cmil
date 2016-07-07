exports.needToUpgrade = function (sessionId) {
  let isArrayEnded = this.array.ended(sessionId);
  let isArrayEmpty = this.array.empty(sessionId);
  return !isArrayEnded && !isArrayEmpty;
};

exports.needToInput = function (sessionId, typeOfObject) {
  let currentToCompileObject = getter.object(sessionId);
  let isToCompile = typeOfObject == 'toCompile';
  let hasInputVariableProperty = currentToCompileObject ? currentToCompileObject.hasOwnProperty('inputVariable') : false;
  return isToCompile && hasInputVariableProperty;
};

exports.array = require('./array');
exports.session = require('./session');

let getter = require('../getter');