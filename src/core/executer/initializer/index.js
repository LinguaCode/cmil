exports.execute = function (sessionId, sourceCode) {
  this.structure(sessionId, sourceCode);
  this.session(sessionId);
};

exports.structure = function (sessionId, sourceCode) {
  __store[sessionId].structure = builder(sessionId, sourceCode);
  __store[sessionId].pathOfLocation = '[0]';
};

exports.session = function (sessionId) {
  //noinspection JSUnresolvedVariable
  eval(database.languages.linguacode(sessionId).initialize);
};

var database = require('../../../database/connection');
var builder = require('../../builder');