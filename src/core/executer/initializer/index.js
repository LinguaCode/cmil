let _ = require('lodash');

exports.execute = function (sessionId, sourceCode) {
  console.llog('compiler: initialize', 'begin');
  this.structure(sessionId, sourceCode);
  this.session(sessionId);
  console.llog('compiler: initialize', 'end');
};

exports.structure = function (sessionId, sourceCode) {
  console.llog('compiler: initialize: structure', 'begin');
  // make a tree
  __store[sessionId].structure = builder(sessionId, sourceCode);

  //current path of the tree
  __store[sessionId].pathOfLocation = '[0]';
  console.llog('compiler: initialize: structure', 'end');
};

exports.session = function (sessionId) {
  eval(database.languages.linguacode(sessionId).initialize);
};

exports.condition = function (conditionIdentifier) {
  _.set(global, conditionIdentifier, undefined);
};

let database = require('../../../database/connection');
let builder = require('../../builder');