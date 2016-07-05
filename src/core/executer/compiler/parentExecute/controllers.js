let controller = {
  manage: function (sessionId) {
    console.llog('compiler: controller', 'begin');

    let parentObject = controller.oscillation(sessionId);
    if (parentObject) {
      controller.directive(sessionId, parentObject);
    }

    console.llog('compiler: controller', 'end');
  },
  oscillation: function (sessionId) {
    console.llog('compiler: oscillation');

    let management = require('../management');

    let parentObject = getter.nameOfProperty(sessionId);

    setter.indexIncrement(sessionId);

    if (checker.session.expired(sessionId)) {
      __io.emit(sessionId + '_' + 'evaluated', {
        result: '',
        status: 'timeout'
      });

      management.session.end(sessionId);
      return false;
    }

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
    console.llog('compiler: directive', 'begin');

    let currentParentObject = getter.object(sessionId);
    let nameOfProperty = getter.nameOfProperty(sessionId);

    if (currentParentObject.hasOwnProperty('toCompile') && parentObject == 'toCompile') {
      if (currentParentObject.hasOwnProperty('parent')) {
        upgrader(sessionId, 'parent');
      }
    } else if (nameOfProperty == 'child') {
      //execute after passing if-else
      let newNameOfProperty = getter.nameOfProperty(sessionId);
      if (newNameOfProperty == 'child' && parentObject == 'child') {
        if (currentParentObject.hasOwnProperty('parent')) {
          upgrader(sessionId, 'parent');
        }

        let status = this.oscillation(sessionId);
        if (status === false) {
          console.llog('compiler: directive', 'end');
          return false;
        }

        upgrader(sessionId, 'parent');
        controller.manage(sessionId);
      }
    }

    console.llog('compiler: directive', 'end');
  }
};

exports.controller = controller.manage;

exports.prepareToCompile = function (sessionId, inputValue) {
  let codeToCompile = getter.operations(sessionId) || [];
  let inputOperation = '';
  if (inputValue) {
    inputOperation = evaluate.inputOperation(sessionId, inputValue);
    codeToCompile.unshift(sessionId, inputOperation);
  }
  return codeToCompile;
};

let evaluate = require('../evaluate');

let getter = require('../../getter');

let setter = require('../../setter');

let checker = require('../../checker');

let upgrader = exports.upgrader = require('./positions').upgrader;