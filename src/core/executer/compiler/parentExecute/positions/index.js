exports.toCompile = function (sessionId, inputValue) {
  var toCompile = controllers.prepareToCompile(sessionId, inputValue);
  var evaluated = evaluate.code(sessionId, toCompile);
  var concatenatedCompileCode = toCompile.join('\n');

  //TODO: improve this part of code
  //this is hard coded part of checking for divide on zero.
  if (/\/\s*0/.test(concatenatedCompileCode)) {
    evaluated.result = evaluated.result.replace(/Infinity/g, 'Անվերջություն');
  }

  if (/true/.test(evaluated.result)) {
    evaluated.result = evaluated.result.replace(/true/g, 'ճիշտ');
  }

  if (/false/.test(evaluated.result)) {
    evaluated.result = evaluated.result.replace(/false/g, 'սխալ');
  }

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
    var firsKeyOfObject = getter.firstKeyOfObject(sessionId);
    upgrader(sessionId, firsKeyOfObject);
  }

  if (getter.nameOfProperty(sessionId) == 'child') {
    controllers.controller(sessionId);
  }
};

exports.parent = function (sessionId, isPassedBefore) {
  var isParentIfElseStatement = getter.conditionType(sessionId) == 'if';
  var isParentAllow = evaluate.condition(sessionId);
  var isConditionStatementPassed = isParentIfElseStatement && isParentAllow;
  var isNotConditionStatementPassed = isParentIfElseStatement && !isParentAllow;
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
    if (!checker.session.ended(sessionId)) {
      if (getter.nameOfProperty(sessionId) == 'child') {
        upgrader(sessionId, 'parent');
      }

      if (getter.nameOfProperty(sessionId) == 'parent') {
        this.parent(sessionId);
      }
    }
  } else {
    controllers.controller(sessionId);
  }
};

var upgrader = exports.upgrader = require('./upgrader');

var controllers = require('../controllers');

var evaluate = require('../../evaluate');

var checker = require('../../../checker');
var getter = require('../../../getter');
var setter = require('../../../setter');