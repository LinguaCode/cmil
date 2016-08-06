const constants = require('../../../../../constants');
const WAITS_FOR_INPUT = constants.STATUS.WAITS_FOR_INPUT;
const BOOLEAN_DEFINITION = constants.BOOLEAN_DEFINITION;

let preOutput = function (outputText) {

  console.llog('compiler: preOutput');
  for (let key in BOOLEAN_DEFINITION) {
    let regExp = new RegExp(key, 'g');
    if (regExp.test(outputText)) {
      outputText = outputText.replace(regExp, BOOLEAN_DEFINITION[key]);
    }
  }

  return outputText;
};

exports.toCompile = function (sessionId) {
  let input = getter.input(sessionId);
  console.llog('compiler: toCompile', 'begin');

  if (!input && checker.needToInput(sessionId)) {

    setter.output(sessionId, WAITS_FOR_INPUT);
    //trig if there is nothing to evaluate
    console.llog('compiler: Socket.IO: server: waiting for client input (ping: upgrade)');

    console.llog('compiler: toCompile', 'end');
    return false;
  } else {
    setter.input(sessionId, undefined);
  }

  let toCompile = controllers.prepareToCompile(sessionId, input);
  let evaluated = evaluate.code(sessionId, toCompile);

  if (evaluated === false) {
    console.llog('compiler: toCompile', 'end');
    return false;
  }

  evaluated.result = preOutput(evaluated.result);

  setter.output(sessionId, evaluated.status, evaluated.result);
  if (evaluated.result) {
    console.llog('compiler: Socket.IO: server: output text has been successfully send! (output)');
  } else {
    //trig if there no any
    console.llog('compiler: Socket.IO: server: there is nothing to output (ping: toCompile)');
  }

  controllers.controller(sessionId);

  console.llog('compiler: toCompile', 'end');
};

exports.child = function (sessionId) {
  console.llog('compiler: child', 'begin');

  let firstKeyOfObject = getter.firstKeyOfObject(sessionId);

  let sessionContinue = upgrade(sessionId, firstKeyOfObject);

  if (checker.needToUpgrade(sessionId) && sessionContinue === false) {
    console.llog('compiler: child', 'end');
    return false;
  }

  if (getter.nameOfProperty(sessionId) == 'child') {
    controllers.controller(sessionId);
  }

  console.llog('compiler: child', 'end');
};

exports.parent = function (sessionId) {
  console.llog('compiler: parent', 'begin');

  let isParentIfElseStatement = getter.conditionType(sessionId) == 'if';
  let isParentAllow = evaluate.condition(sessionId);
  let isConditionStatementPassed = isParentIfElseStatement && isParentAllow;
  let isNotConditionStatementPassed = isParentIfElseStatement && !isParentAllow;

  if (isConditionStatementPassed) {
    upgrade(sessionId, 'child');

    setter.downgrade(sessionId);

  } else if (isNotConditionStatementPassed) {
    controllers.controller(sessionId);
    if (getter.nameOfProperty(sessionId) == 'parent') {
      this.parent(sessionId);
    }
  } else if (isParentAllow) {

    let statusOfPassing = upgrade(sessionId, 'child');
    if (statusOfPassing === false) {
      console.llog('compiler: parent', 'end');
      return false;
    }

    if (!checker.session.pathOfLocationEnded(sessionId)) {

      if (getter.nameOfProperty(sessionId) == 'parent') {
        this.parent(sessionId);
      }
    }

  } else {
    let conditionIdentifier = getter.conditionIdentifier(sessionId);
    initializer.condition(conditionIdentifier);
    controllers.controller(sessionId);
  }

  console.llog('compiler: parent', 'end');
};

let upgrade = exports.upgrade = require('./upgrade');

let controllers = require('../controllers');

let evaluate = require('../../evaluate');

let checker = require('../../../checker');
let getter = require('../../../getter');
let setter = require('../../../setter');
let initializer = require('../../../initializer');
