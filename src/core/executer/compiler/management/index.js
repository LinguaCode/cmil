let modify = require('../../../modifier/modify');

const SUCCESS = require('../../../../constants').STATUS.SUCCESS;

exports.codeRun = function (sessionId, sourceCode, language) {
  console.llog('compiler: codeRun', 'begin');

  setter.sessionTime(sessionId);

  //prepare
  let codePrepared = modify.execute(sourceCode, language);
  //initialize

  initializer.execute(sessionId, codePrepared);

  try {
    parentExecute.positions.parent(sessionId);
  } catch (e) {
    console.log(e.message);
  }

  console.llog('compiler: codeRun', 'end');
};

exports.listener = function (sessionId, input) {
  console.llog('compiler: listener', 'begin');

  setter.sessionTime(sessionId);
  setter.input(sessionId, input);
  initializer.output(sessionId, SUCCESS, '');

  parentExecute.positions.toCompile(sessionId);

  listenerController(sessionId);

  console.llog('compiler: listener', 'end');
};

function listenerController(sessionId) {
  if (getter.nameOfProperty(sessionId) == 'child') {
    parentExecute.controllers.controller(sessionId);
    listenerController(sessionId);
  } else if (getter.nameOfProperty(sessionId) == 'parent') {
    parentExecute.positions.parent(sessionId);
    if (getter.nameOfProperty(sessionId) != 'toCompile') {
      listenerController(sessionId);
    }
  }
}

let parentExecute = require('../parentExecute');
let initializer = require('../../initializer');
let setter = require('../../setter');
let getter = require('../../getter');
let checker = require('../../checker');