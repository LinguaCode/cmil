exports.execute = function (sessionId, sourceCode) {
  this.structure(sessionId, sourceCode);
  this.session(sessionId);
};

exports.structure = function (sessionId, sourceCode) {
  // make a tree
  __store[sessionId].structure = builder(sessionId, sourceCode);

  //current path of the tree
  __store[sessionId].pathOfLocation = '[0]';
};

exports.session = function (sessionId) {
  //noinspection JSUnresolvedVariable
  eval(database.languages.linguacode(sessionId).initialize);
};

var database = require('../../../database/connection');
var builder = require('../../builder');