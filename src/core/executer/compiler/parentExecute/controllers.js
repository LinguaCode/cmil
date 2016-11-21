let _ = require('lodash');

const TIMEOUT = require('../../../../constants').STATUS.TIMEOUT;

let controller = {
  manage: sessionId => {
    console.llog('compiler: controller', 'begin');
    console.llog(__store[sessionId].pathOfLocation);

    let exKey = controller.oscillation(sessionId);
    if (exKey) {
      controller.directive(sessionId, exKey);
    }

    console.llog(__store[sessionId].pathOfLocation);
    console.llog('compiler: controller', 'end');
  },
  oscillation: sessionId => {
    console.llog('compiler: oscillation');

    let management = require('../management');

    let exKey = getter.nameOfProperty(sessionId);

    setter.indexIncrement(sessionId);

    if (checker.session.expired(sessionId)) {
      setter.output(sessionId, {
        id: TIMEOUT,
      });
      console.llog('compiler: trigger: timeout');
      return false;
    }

    if (checker.array.ended(sessionId)) {
      setter.downgrade(sessionId);

      if (checker.session.pathOfLocationEnded(sessionId)) {
        console.llog('compiler: trigger: session ended');
        return false;
      }
    }

    return exKey;
  },


  directive: function (sessionId, exKey) {
    console.llog('compiler: directive', 'begin');

    let currentParentObject = getter.object(sessionId);
    let nameOfProperty = getter.nameOfProperty(sessionId);


    if (nameOfProperty == 'child' && exKey == 'child') {
      //child[N++]

      let status;
      //execute after passing if-else
      if (currentParentObject.hasOwnProperty('parent')) {
        upgrade(sessionId, 'parent');
      }

      if (currentParentObject.hasOwnProperty('toCompile')) {
        status = upgrade(sessionId, 'toCompile');
      }

      if (status === false) {
        console.llog('compiler: directive', 'end');
        return false;
      }

      if (getter.nameOfProperty(sessionId) != 'toCompile') {
        controller.manage(sessionId);
      }
    } else if (nameOfProperty == 'toCompile') {
      positions.toCompile(sessionId);
    }

    console.llog('compiler: directive', 'end');
  },

};

exports.controller = controller.manage;

exports.prepareToCompile = function (sessionId, inputValue) {
  let codeToCompile = _.cloneDeep(getter.operations(sessionId));
  let inputOperation = '';
  if (inputValue) {
    inputOperation = evaluate.inputOperation(sessionId, inputValue);
    codeToCompile.unshift(inputOperation);
  }
  return codeToCompile;
};

let evaluate = require('../evaluate');

let getter = require('../../getter');

let setter = require('../../setter');

let checker = require('../../checker');

let upgrade = exports.upgrade = require('./positions').upgrade;

const positions = require('./positions');