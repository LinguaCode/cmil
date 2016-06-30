const OPERATIONS = 'operations';
const INPUT_VARIABLE = 'inputVariable';

var conditionParse = function (sessionId, parseType) {
  return path.location(sessionId) + '.' + parseType;
};

exports.condition = function (sessionId) {
  return conditionParse(sessionId, 'condition');
};

exports.conditionType = function (sessionId) {
  return conditionParse(sessionId, 'type');
};

exports.operations = function (sessionId) {
  return path.location(sessionId) + '.' + OPERATIONS;
};

exports.inputVariable = function (sessionId) {
  return path.location(sessionId) + '.' + INPUT_VARIABLE;
};

var path = require('./');
var value = require('../value');