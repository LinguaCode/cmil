let modify = require('../../../modifier/modify');

const SUCCESS = require('../../../../constants').STATUS.SUCCESS;

exports.codeRun = function (sessionId, sourceCode, language) {
  console.llog('compiler: codeRun', 'begin');

  setter.sessionTime(sessionId);

  //prepare
  let codePrepared = modify.execute(sourceCode, language);
  //initialize

  initializer.execute(sessionId, codePrepared);

  parentExecute.positions.parent(sessionId);

  console.llog('compiler: codeRun', 'end');
};

exports.listener = function (sessionId, input) {
  console.llog('compiler: listener', 'begin');

  setter.sessionTime(sessionId);
  setter.input(sessionId, input);
  initializer.output(sessionId, SUCCESS, '');

  parentExecute.positions.toCompile(sessionId);

  if (getter.nameOfProperty(sessionId) == 'child') {
    parentExecute.controllers.controller(sessionId);
  }

  console.llog('compiler: listener', 'end');
};

let parentExecute = require('../parentExecute');
let initializer = require('../../initializer');
let setter = require('../../setter');
let getter = require('../../getter');
let checker = require('../../checker');