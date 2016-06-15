const PARENT = 'parent';
const OPERATIONS = 'operations';
const INPUT_VARIABLE = 'inputVariable';

exports.condition = function (sessionId) {
  var nameOfProperty = value.nameOfProperty(sessionId);
  if (nameOfProperty !== 'child') {
    return path.location(sessionId) + '.condition';
  }

  return this.parent(sessionId) + '.condition';
};

exports.conditionType = function (sessionId) {
  var nameOfProperty = value.nameOfProperty(sessionId);
  if (nameOfProperty !== 'child') {
    return path.location(sessionId) + '.type';
  }

  return this.parent(sessionId) + '.type';
};


exports.operations = function (sessionId) {
  return path.location(sessionId) + '.' + OPERATIONS;
};

exports.inputVariable = function (sessionId) {
  return path.location(sessionId) + '.' + INPUT_VARIABLE;
};

exports.parent = function (sessionId) {
  var parentObjectPath = path.parentObject(sessionId);
  var indexOfLastParent = parentObjectPath.lastIndexOf(PARENT);
  var indexOfLastElementOfParent = parentObjectPath.indexOf('.', indexOfLastParent);
  return path.parentObject(sessionId).substring(0, indexOfLastElementOfParent);
};

var path = require('./');
var value = require('../value');