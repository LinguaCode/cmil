let modify = require('../../../modifier/modify');
let logger = require('linguacode-logger');

const status = {
  success: 'success',
  waitsForInput: 'waitsForInput'
};

exports.codeRun = function (sessionId, sourceCode, language) {
  console.llog('compiler: codeRun', 'begin');

  setter.sessionTime(sessionId);

  //prepare
  let codePrepared = modify.execute(sourceCode, language);
  //initialize

  initializer.execute(sessionId, codePrepared);

  parentExecute.positions.parent(sessionId);

  let output = getter.output(sessionId);
  sender.evaluate(sessionId, output);

  if (checker.session.ended(sessionId)) {
    sender.sessionEnd(sessionId);
  }

  console.llog('compiler: codeRun', 'end');
};

exports.listener = function (sessionId, input) {
  console.llog('compiler: listener', 'begin');

  setter.sessionTime(sessionId);
  setter.input(sessionId, input);

  parentExecute.positions.toCompile(sessionId);

  if (getter.nameOfProperty(sessionId) == 'child') {
    parentExecute.controllers.controller(sessionId);
  }

  let output = getter.output(sessionId);
  sender.evaluate(sessionId, output);

  if (checker.session.ended(sessionId)) {
    sender.sessionEnd(sessionId);
  }

  console.llog('compiler: listener', 'end');
};


let parentExecute = require('../parentExecute');
let initializer = require('../../initializer');
let setter = require('../../setter');
let getter = require('../../getter');
let sender = require('../../sender');
let checker = require('../../checker');

exports.session = require('./session');