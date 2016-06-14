/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license GPLv3
 */

var commands = require('./variables');

module.exports = [
  [commands.input, commands.output, commands.function],
  [commands.break, commands.continue],
  [commands.false, commands.true],
  [commands.repeat, commands.times, commands.while, commands.do, commands.if, commands.else, commands.then],
  [commands.or, commands.and1, commands.and2, commands.not]
];