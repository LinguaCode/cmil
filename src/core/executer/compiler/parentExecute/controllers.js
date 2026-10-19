const logger = require('../../../../libs/logger');
let _ = require('lodash');

const STATUS = require('../../../../constants').STATUS;
const TIMEOUT = STATUS.TIMEOUT;
const SESSION_END = STATUS.SESSION_END;

let controller = {
  manage: sessionId => {
    logger.log('compiler: controller', 'begin');
    logger.log(__store[sessionId].pathOfLocation);

    const exKey = controller.oscillation(sessionId);
    controller.directive(sessionId, exKey);

    logger.log(__store[sessionId].pathOfLocation);
    logger.log('compiler: controller', 'end');
  },
  oscillation: sessionId => {
    logger.log('compiler: oscillation');

    let management = require('../management');

    setter.indexIncrement(sessionId);
    const exKey = getter.nameOfProperty(sessionId);

    if (checker.session.expired(sessionId)) {
      const error = {
        errorId: TIMEOUT,
        param: {}
      };
      logger.log('compiler: trigger: timeout');
      throw error;
    }

    if (checker.array.ended(sessionId)) {
      setter.downgrade(sessionId);

      if (checker.session.pathOfLocationEnded(sessionId)) {
        logger.log('compiler: trigger: session ended');
        throw SESSION_END;
      }
    }

    return exKey;
  },


  directive: function (sessionId, exKey) {
    logger.log('compiler: directive', 'begin');

    let currentParentObject = getter.object(sessionId);
    let nameOfProperty = getter.nameOfProperty(sessionId);


    if (nameOfProperty == 'child' && exKey == 'child') {
      //child[N++]

      //execute after passing if-else
      if (currentParentObject.hasOwnProperty('parent')) {
        upgrade(sessionId, 'parent');
      }

      if (currentParentObject.hasOwnProperty('toCompile')) {
        upgrade(sessionId, 'toCompile');
      }

      if (getter.nameOfProperty(sessionId) != 'toCompile') {
        controller.manage(sessionId);
      }
    } else if (nameOfProperty == 'toCompile') {
      positions.toCompile(sessionId);
    }

    logger.log('compiler: directive', 'end');
  },

};

exports.controller = controller.manage;

exports.prepareToCompile = function (sessionId, inputValue) {
  let codeToCompile = _.cloneDeep(getter.operations(sessionId));
  let inputOperation = '';
  if (inputValue !== '' && typeof inputValue !== 'undefined') {
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