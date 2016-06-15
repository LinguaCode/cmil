var controller = {
  manage: function (sessionId) {
    var parentObject = controller.oscillation(sessionId);
    if (parentObject) {
      controller.directive(sessionId, parentObject);
    }
  },
  oscillation: function (sessionId) {
    var management = require('../management');

    var parentObject = getter.nameOfProperty(sessionId);

    setter.indexIncrement(sessionId);

    if (checker.array.ended(sessionId)) {
      setter.downgrade(sessionId);

      if (checker.session.ended(sessionId)) {
        management.session.end(sessionId);
        return false;
      }
    }


    return parentObject;
  },
  directive: function (sessionId, parentObject) {
    var currentParentObject = getter.object(sessionId);
    var nameOfProperty = getter.nameOfProperty(sessionId);

    if (currentParentObject.hasOwnProperty('toCompile') && parentObject == 'toCompile') {
      if (currentParentObject.hasOwnProperty('parent')) {
        upgrader(sessionId, 'parent');
      }
    } else if (nameOfProperty == 'child') {
      //execute after passing if-else
      var newNameOfProperty = getter.nameOfProperty(sessionId);
      if (newNameOfProperty == 'child' && parentObject == 'child') {
        if (currentParentObject.hasOwnProperty('parent')) {
          upgrader(sessionId, 'parent');
        }
        if (currentParentObject.hasOwnProperty('toCompile')) {
          upgrader(sessionId, 'toCompile');
        }
        this.oscillation(sessionId);
      }
    }
  }
  };

exports.controller = controller.manage;

exports.prepareToCompile = function (sessionId, inputValue) {
  var codeToCompile = getter.operations(sessionId) || [];
  var inputOperation = '';
  if (inputValue) {
    inputOperation = evaluate.inputOperation(sessionId, inputValue);
    codeToCompile.unshift(sessionId, inputOperation);
  }
  return codeToCompile;
};

var evaluate = require('../evaluate');

var getter = require('../../getter');

var setter = require('../../setter');

var checker = require('../../checker');

var upgrader = exports.upgrader = require('./positions').upgrader;