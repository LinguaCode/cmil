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

exports.session = sessionId => {
  console.llog('compiler: initialize: session');
  eval(LANGUAGE.linguacode(sessionId).initialize);
};

exports.output = sessionId => {
  console.llog('compiler: initialize: output');
  __store[sessionId].output = '';
};

exports.condition = function (conditionIdentifier) {
  console.llog('compiler: initialize: condition');
  _.set(global, conditionIdentifier, undefined);
};

let LANGUAGE = require('../../../constants').LANGUAGE;
let builder = require('../../builder');