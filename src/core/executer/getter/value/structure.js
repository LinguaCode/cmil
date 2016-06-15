var _ = require('lodash');

const OPERATIONS = 'operations';
const INPUT_VARIABLE = 'inputVariable';

var value = function (sessionId, typeOfObject) {
  return _.get(current(sessionId), path.structure[typeOfObject](sessionId));
};

var current = function (sessionId) {
  return __store[sessionId].structure;
};

exports.limit = function (sessionId) {
  var currentStructure = current(sessionId);
  return _.get(currentStructure, path.parentObject(sessionId), currentStructure).length;
};

exports.condition = function (sessionId) {
  return value(sessionId, 'condition');
};

exports.conditionType = function (sessionId) {
  var conditionType = value(sessionId, 'conditionType');
  return conditionType || 'main';
};

exports.operations = function (sessionId) {
  return value(sessionId, OPERATIONS);
};

exports.inputVariable = function (sessionId) {
  return value(sessionId, INPUT_VARIABLE);
};

exports.object = function (sessionId) {
  return _.get(current(sessionId), path.location(sessionId));
};

exports.firstKeyOfObject = function (sessionId) {
  var thisElement = this.object(sessionId);
  var keysOfThisElement = Object.keys(thisElement);

  return keysOfThisElement[0];
};

var path = require('../path');