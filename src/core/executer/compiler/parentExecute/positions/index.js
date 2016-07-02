let _ = require('lodash');
let errorCheck = require('../../../../errorHandler/checker');

const booleanDefinitions = {
  true: 'ճիշտ',
  false: 'սխալ',
  NaN: 'անորոշ',
  null: 'անհայտ',
  Infinity: 'Անվերջություն',
  undefined: 'չհայտաարարված'
};

let postParser = function (outputText) {
  for (let key in booleanDefinitions) {
    let regExp = new RegExp(key, 'g');
    if (regExp.test(outputText)) {
      outputText = outputText.replace(regExp, booleanDefinitions[key]);
    }
  }

  return outputText;
};

exports.toCompile = function (sessionId, inputValue) {
  let toCompile = controllers.prepareToCompile(sessionId, inputValue);
  let evaluated = evaluate.code(sessionId, toCompile);

  if (evaluated === false) {
    return false;
  }

  evaluated.result = postParser(evaluated.result);

  __io.emit(sessionId + '_' + 'evaluated', evaluated);
  if (evaluated.result) { 
    console.info('Socket.IO: server: output text has been successfully send! (output)');
  } else {
    console.info('Socket.IO: server: output text has been successfully send! (ping)');
  }

  controllers.controller(sessionId);
  //goto: upgrader
};

exports.child = function (sessionId) {
  if (checker.needToUpgrade(sessionId)) {
    let firsKeyOfObject = getter.firstKeyOfObject(sessionId);

    let sessionContinue = upgrader(sessionId, firsKeyOfObject);
    if (sessionContinue === false) {
      return false;
    }
  }

  if (getter.nameOfProperty(sessionId) == 'child') {
    controllers.controller(sessionId);
  }

  //parent = upgrader|
};

exports.parent = function (sessionId, isPassedBefore) {
  let isParentIfElseStatement = getter.conditionType(sessionId) == 'if';
  let isParentAllow = evaluate.condition(sessionId);
  let isConditionStatementPassed = isParentIfElseStatement && isParentAllow;
  let isNotConditionStatementPassed = isParentIfElseStatement && !isParentAllow;
  isPassedBefore = typeof(isPassedBefore) !== 'undefined' ? isPassedBefore : false;

  if (isConditionStatementPassed && !isPassedBefore) {
    upgrader(sessionId, 'child');

    setter.downgrade(sessionId);
  } else if (isNotConditionStatementPassed || isPassedBefore) {
    controllers.controller(sessionId);
    if (getter.nameOfProperty(sessionId) == 'parent') {
      this.parent(sessionId);
    }
  } else if (isParentAllow) {
    let statusOfPassing = upgrader(sessionId, 'child');
    if (statusOfPassing === false) {
      return false;
    }



    if (!checker.session.ended(sessionId)) {

      if (getter.nameOfProperty(sessionId) == 'parent') {
        this.parent(sessionId);
      }
    }
  } else {
    controllers.controller(sessionId);
    //goto: upgrader
  }
};

let upgrader = exports.upgrader = require('./upgrader');

let controllers = require('../controllers');

let evaluate = require('../../evaluate');

let checker = require('../../../checker');
let getter = require('../../../getter');
let setter = require('../../../setter');
