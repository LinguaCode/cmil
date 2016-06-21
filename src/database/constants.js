var commands = require('./commands/variables');
const ifWhileRepeatCommandsGroup =
  commands.if + '|' +
  commands.while + '|' +
  commands.repeat;

var constants = exports.constants = {
  conditionValue: '(' +
  ifWhileRepeatCommandsGroup +
  ')\\s+([^\\r\\n]*[^\\' + commands.then + '])( ' + commands.then + ')*',
  conditionRepeatTimesValue: '(.*)\\s+' + commands.times,

  conditionType: '\\s*(' +
  ifWhileRepeatCommandsGroup + '|' +
  commands.else + '|' +
  commands.do + '|' +
  commands.elif +
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