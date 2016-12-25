const getter = require('../getter');

exports.needToInput = sessionId => {
  const currentToCompileObject = getter.object(sessionId);

  const hasInputVariableProperty = currentToCompileObject.hasOwnProperty('inputVariable');
  return hasInputVariableProperty;
};

exports.array = require('./array');
exports.session = require('./session');