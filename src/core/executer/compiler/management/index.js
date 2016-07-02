let modify = require('../../../modifier/modify');

exports.codeRun = function (sessionId, sourceCode, language) {
  //prepare
  let codePrepared = modify.execute(sourceCode, language);
  //initialize

   initializer.execute(sessionId, codePrepared);

  parentExecute.positions.parent(sessionId);
};

exports.listener = function (sessionId, inputText) {
  parentExecute.positions.toCompile(sessionId, inputText);

  if (getter.nameOfProperty(sessionId) == 'child') {
    parentExecute.controllers.controller(sessionId);
  }
};

let parentExecute = require('../parentExecute');
let initializer = require('../../initializer');
let getter = require('../../getter');

exports.session = require('./session');