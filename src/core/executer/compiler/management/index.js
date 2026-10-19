const logger = require('../../../../libs/logger');
const modify = require('../../../modifier/modify');

const STATUS = require('../../../../constants').STATUS;
const SUCCESS = STATUS.SUCCESS;
const TIMEOUT = STATUS.TIMEOUT;

exports.codeRun = function (sessionId, sourceCode, language) {
  logger.log('compiler: codeRun', 'begin');

  setter.sessionTime(sessionId);

  //prepare
  let codePrepared = modify.execute(sourceCode, language);
  //initialize

  let isErrorOccurredOnBuildStage = false;
  try {
    initializer.execute(sessionId, codePrepared);
  } catch (error) {
    isErrorOccurredOnBuildStage = true;
    errorExtract(sessionId, error);
  }

  if (!isErrorOccurredOnBuildStage) {
    try {
      parentExecute.positions.parent(sessionId);
    } catch (error) {
      errorExtract(sessionId, error);
    }
  }

  logger.log('compiler: codeRun', 'end');
};

exports.listener = function (sessionId, input) {
  logger.log('compiler: listener', 'begin');


  //TODO: test: remove it
  if (!getter.data(sessionId)) {
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

  logger.log('compiler: listener', 'end');
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
  //the recursive executer can exhaust the call stack before the timeout check of a long-running loop
  if (errorHandler.isStackExhausted(error)) {
    error = {
      errorId: TIMEOUT,
      param: {}
    };
  }

  const isError = typeof(error) === 'object';
  if (isError) {
    setter.output(sessionId, error);
  }
};

const errorHandler = require('../../../errorHandler');
const parentExecute = require('../parentExecute');
const initializer = require('../../initializer');
const setter = require('../../setter');
const getter = require('../../getter');
const checker = require('../../checker');