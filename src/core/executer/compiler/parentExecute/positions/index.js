const booleanDefinitions = {
  true: 'ճիշտ',
  false: 'սխալ'
};

let booleanParse = function (outputText) {
  for (var key in booleanDefinitions) {
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
  let concatenatedCompileCode = toCompile.join('\n');

  //TODO: improve this part of code
  //this is hard coded part of checking for divide on zero.
  if (/\/\s*0/.test(concatenatedCompileCode)) {
    evaluated.result = evaluated.result.replace(/Infinity/g, 'Անվերջություն');
  }

  evaluated.result = booleanParse(evaluated.result);

  __io.emit(sessionId + '_' + 'evaluated', evaluated);
  if (evaluated.result) {
    console.info('Socket.IO: server: output text has been successfully send! (output)');
  } else {
    console.info('Socket.IO: server: output text has been successfully send! (ping)');
  }

  controllers.controller(sessionId);
};

exports.child = function (sessionId) {
  if (checker.needToUpgrade(sessionId)) {
    let firsKeyOfObject = getter.firstKeyOfObject(sessionId);
    upgrader(sessionId, firsKeyOfObject);
  }

  if (getter.nameOfProperty(sessionId) == 'child') {
    controllers.controller(sessionId);
  }
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
    upgrader(sessionId, 'child');
    if (!checker.session.ended(sessionId) && getter.nameOfProperty(sessionId) == 'child') {
      upgrader(sessionId, 'parent');
    }
  } else {
    controllers.controller(sessionId);
  }
};

let upgrader = exports.upgrader = require('./upgrader');

let controllers = require('../controllers');

let evaluate = require('../../evaluate');

let checker = require('../../../checker');
let getter = require('../../../getter');
let setter = require('../../../setter');