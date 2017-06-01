const modify = require('../../../modifier/modify');

const SUCCESS = require('linguacode-constants').STATUS.SUCCESS;

exports.codeRun = function (sessionId, sourceCode, language) {
  console.llog('compiler: codeRun', 'begin');

  setter.sessionTime(sessionId);

  //prepare
  let codePrepared = modify.execute(sourceCode, language);
  //initialize

  initializer.execute(sessionId, codePrepared);

  try {
    parentExecute.positions.parent(sessionId);
  } catch (error) {
    errorExtract(sessionId, error);
  }

  console.llog('compiler: codeRun', 'end');
};

exports.listener = function (sessionId, input) {
  console.llog('compiler: listener', 'begin');


  //TODO: test: remove it
  if (!getter.data(sessionId)) {
    console.log(typeof getter.data(sessionId))
    console.log(getter.data(sessionId))
    throw new Error(sessionId);
  }

  setter.sessionTime(sessionId);
  setter.data(sessionId, {input});
  initializer.output(sessionId, SUCCESS, '');

  try {
    parentExecute.positions.toCompile(sessionId);
    listenerController(sessionId);

  } catch (error) {
    errorExtract(sessionId, error);
  }

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


const errorExtract = function (sessionId, error) {
  const isError = typeof(error) === 'object';
  if (isError) {
    setter.output(sessionId, error);
  }
};

const parentExecute = require('../parentExecute');
const initializer = require('../../initializer');
const setter = require('../../setter');
const getter = require('../../getter');
const checker = require('../../checker');