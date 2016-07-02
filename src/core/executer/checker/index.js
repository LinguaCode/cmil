exports.needToUpgrade = function (sessionId) {
  let isArrayEnded = this.array.ended(sessionId);
  let isArrayEmpty = this.array.empty(sessionId);
  return !isArrayEnded && !isArrayEmpty;
};

exports.needToInput = function (sessionId) {
  let currentToCompileObject = getter.object(sessionId);
  return currentToCompileObject ? currentToCompileObject.hasOwnProperty('inputVariable') : false;
};

exports.array = require('./array');
exports.session = require('./session');

let getter = require('../getter');