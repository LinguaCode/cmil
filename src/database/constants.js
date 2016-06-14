/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license GPLv3
 */

var commands = require('./commands/variables');

var constants = exports.constants = {
  conditionValue: '(' +
  commands.if + '|' +
  commands.while + '|' +
  commands.repeat +
  ')\\s+([^\\r\\n]*[^\\' + commands.then + '])( ' + commands.then + ')*',
  conditionRepeatTimesValue: '(.*)\\s+' + commands.times,

  conditionType: '\\s*(' +
  commands.if + '|' +
  commands.elif + '|' +
  commands.else + '|' +
  commands.do + '|' +
  commands.while + '|' +
  commands.repeat +
  ')'
};

exports.executions = function (source, nameOfConstant) {
  var regexp = new RegExp(constants[nameOfConstant]);
  var result = regexp.exec(source);

  if (result) {
    if (nameOfConstant == 'conditionValue') {
      var regValueOfConditionRepeatTimes = new RegExp(constants.conditionRepeatTimesValue);
      var resultOfValueOfConditionRepeatTimes = regValueOfConditionRepeatTimes.exec(result[2]);
      result = resultOfValueOfConditionRepeatTimes ? resultOfValueOfConditionRepeatTimes[1] : result[2];
    } else {
      result = result[1];
    }


    return result.replace(/\s+$/, '');
  }
  return true;
};