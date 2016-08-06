let _ = require('lodash');

const OPERATIONS = 'operations';
const INPUT_VARIABLE = 'inputVariable';

let value = function (sessionId, typeOfObject) {
  return _.get(current(sessionId), path.structure[typeOfObject](sessionId));
};

let current = function (sessionId) {
  return __store[sessionId].structure;
};

exports.limit = function (sessionId) {
  let currentStructure = current(sessionId);
  return _.get(currentStructure, path.parentObject(sessionId), currentStructure).length;
};

exports.condition = function (sessionId) {
  return value(sessionId, 'condition');
};

exports.conditionType = function (sessionId) {
  let conditionType = value(sessionId, 'conditionType');
  return conditionType || 'main';
};

exports.conditionIdentifier = function (sessionId) {
  let condition = value(sessionId, 'condition');
  let identifierRegExp = new RegExp(`${sessionId}\\.\\D+\\d+`);
  let identifier = identifierRegExp.exec(condition)[0];
  return identifier;
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
  let thisElement = this.object(sessionId);
  let keys = Object.keys(thisElement);

  return keys[0];
};

let path = require('../path');