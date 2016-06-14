/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license GPLv3
 */

var modify = require('../../../modifier/modify');

exports.codeRun = function (sessionId, sourceCode, language) {
  //prepare
  var codePrepared = modify.execute(sourceCode, language);
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

var parentExecute = require('../parentExecute');
var initializer = require('../../initializer');
var getter = require('../../getter');

exports.session = require('./session');