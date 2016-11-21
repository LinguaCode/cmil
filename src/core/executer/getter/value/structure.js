let _ = require('lodash');

const OPERATIONS = 'operations';
const INPUT_COMMAND = 'inputVariable';

let value = function (sessionId, typeOfObject) {
  return _.get(current(sessionId), path.structure[typeOfObject](sessionId));
};

let current = sessionId => {
  return __store[sessionId].structure;
};

exports.limit = sessionId => {
  let currentStructure = current(sessionId);
  return _.get(currentStructure, path.parentObject(sessionId), currentStructure).length;
};

exports.condition = sessionId => {
  return value(sessionId, 'condition');
};

exports.conditionType = sessionId => {
  let conditionType = value(sessionId, 'conditionType');
  return conditionType || 'main';
};

exports.conditionIdentifier = sessionId => {
  let condition = value(sessionId, 'condition');
  let identifierRegExp = new RegExp(`global\\[sessionId\\]\\.\\D+\\d+`);
  let identifier = identifierRegExp.exec(condition)[0];
  const identifierParsed = identifier.replace('global[sessionId]', `global[${sessionId}]`);
  return identifierParsed;
};

exports.operations = sessionId => {
  return value(sessionId, OPERATIONS);
};

exports.inputVariable = sessionId => {
  return value(sessionId, INPUT_COMMAND);
};

exports.object = sessionId => {
  return _.get(current(sessionId), path.location(sessionId));
};

exports.firstKeyOfObject = sessionId => {
  let thisElement = this.object(sessionId);
  let keys = Object.keys(thisElement);

  return keys[0];
};

let path = require('../path');