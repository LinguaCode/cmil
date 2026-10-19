//collections of files of constants
exports.SYNTAX = {
  commands: require('./syntax/commands'),
  functions: require('./syntax/functions'),
  globals: require('./syntax/globals'),
  quotes: require('./syntax/quotes'),
  source: require('./syntax/source')
};

//files of constants
exports.STATUS = require('./status');
exports.BOOLEAN_DEFINITION = require('./boolean_definition');
exports.COMMAND = require('./command');

//constants
exports.TIMEOUT_TIME = 666;
