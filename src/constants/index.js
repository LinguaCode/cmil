let requireDir = require('require-dir');

//collections of files of constants
exports.SYNTAX = requireDir('./syntax');
exports.TRANSLATION = requireDir('./translation');

//files of constants
exports.ENVIRONMENT = require('./environment');
exports.STATUS = require('./status');
exports.BOOLEAN_DEFINITION = require('./boolean_definition');
exports.COMMAND = require('./command');

//constants
exports.TIMEOUT_TIME = 9999666;

exports.EVALUATED = 'evaluated';
exports.WAITS_FOR_INPUT = 'waitsForInput';
exports.SESSION_END = 'sessionEnd';
exports.ERROR = 'error';

exports.FAKE_PATH = './fake/path';
exports.SERVER_FILE_NAME = 'server';
exports.SOURCE_FILE_PATH = './src/';