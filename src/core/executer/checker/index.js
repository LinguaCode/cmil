const getter = require('../getter');

exports.needToUpgrade = sessionId => {
  let isArrayEnded = this.array.ended(sessionId);
  let isArrayEmpty = this.array.empty(sessionId);
  return !isArrayEnded && !isArrayEmpty;
};

exports.needToInput = sessionId => {
  const currentToCompileObject = getter.object(sessionId);

  const hasInputVariableProperty = currentToCompileObject.hasOwnProperty('inputVariable');
  return hasInputVariableProperty;
};

exports.array = require('./array');
exports.session = require('./session');