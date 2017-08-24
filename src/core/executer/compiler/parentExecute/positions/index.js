const constants = require('linguacode-constants');
const WAITS_FOR_INPUT = constants.STATUS.WAITS_FOR_INPUT;
const BOOLEAN_DEFINITION = constants.BOOLEAN_DEFINITION;

let preOutput = function (outputText) {

  console.llog('compiler: preOutput');
  for (let key in BOOLEAN_DEFINITION) {
    let regExp = new RegExp(key, 'g');
    if (regExp.test(outputText)) {
      const booleanDefinition = BOOLEAN_DEFINITION[key];
      outputText = outputText.replace(regExp, `\${${booleanDefinition}}`);
    }
  }

  return outputText;
};

exports.toCompile = function (sessionId) {
  let input = getter.data(sessionId, 'input');
  console.llog('compiler: toCompile', 'begin');

  //TODO: remove "input" variable check ?
  if ((typeof input === 'undefined' || input === '') && checker.needToInput(sessionId)) {
    setter.output(sessionId, WAITS_FOR_INPUT);
    //trig if there is nothing to evaluate
    console.llog(__store[sessionId].pathOfLocation);
    console.llog('compiler: Socket.IO: server: waiting for client input (ping: upgrade)');

    console.llog('compiler: toCompile', 'end');
    throw WAITS_FOR_INPUT;
  } else {
    setter.data(sessionId, {input: undefined});
  }

  const toCompile = controllers.prepareToCompile(sessionId, input);
  const evaluated = evaluate.code(sessionId, toCompile);

  evaluated.result = preOutput(evaluated.result);

  setter.output(sessionId, evaluated.status, evaluated.result);
  /*if (evaluated.result) {
    console.llog('compiler: Socket.IO: server: output text has been successfully send! (output)');
  } else {
    //trig if there no any
    console.llog('compiler: Socket.IO: server: there is nothing to output (ping: toCompile)');
  }*/

  controllers.controller(sessionId);

  console.llog('compiler: toCompile', 'end');
};

exports.child = function (sessionId) {
  console.llog('compiler: child', 'begin');

  let firstKeyOfObject = getter.firstKeyOfObject(sessionId);

  upgrade(sessionId, firstKeyOfObject);

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

    upgrade(sessionId, 'child');

    if (!checker.session.pathOfLocationEnded(sessionId)) {

      if (getter.nameOfProperty(sessionId) == 'parent') {
        this.parent(sessionId);
      }
    }

  } else {
    let conditionIdentifier = getter.conditionIdentifier(sessionId);
    //TODO: Find out why do we need to init condition ?
    //initializer.condition(conditionIdentifier);
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
