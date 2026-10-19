const logger = require('../../../libs/logger');
let _ = require('lodash');

exports.execute = function (sessionId, sourceCode) {
  logger.log('compiler: initialize', 'begin');
  this.structure(sessionId, sourceCode);
  this.mount(sessionId);
  logger.log('compiler: initialize', 'end');
};

exports.structure = function (sessionId, sourceCode) {
  logger.log('compiler: initialize: structure', 'begin');
  // make a tree
  __store[sessionId].structure = builder(sessionId, sourceCode);

  //current path of the tree
  __store[sessionId].pathOfLocation = '[0]';
  logger.log('compiler: initialize: structure', 'end');
};

exports.mount = sessionId => {
  logger.log('compiler: initialize: mount');
  global[sessionId] = {};
};

exports.unMount = sessionId => {
  logger.log('compiler: initialize: unMount');
  delete global[sessionId];
};

exports.output = sessionId => {
  logger.log('compiler: initialize: output');
  __store[sessionId].output = '';
};

exports.condition = function (conditionIdentifier) {
  logger.log('compiler: initialize: condition');
  _.set(global, conditionIdentifier, undefined);
};

let builder = require('../../builder');