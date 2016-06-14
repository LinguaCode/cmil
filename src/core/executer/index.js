/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license GPLv3
 */

var compiler = exports.operations = require('./compiler');
exports.getter = require('./getter');
exports.setter = require('./setter');
exports.checker = require('./checker');
exports.initializer = require('./initializer');

exports.codeRun = compiler.codeRun;
exports.listener = compiler.listener;