let commands = require('./commands/variables');
const ifWhileRepeatCommandsGroup =
  commands.if + '|' +
  commands.while + '|' +
  commands.repeat;

let constants = exports.constants = {
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
  let regexp = new RegExp(constants[nameOfConstant]);
  let result = regexp.exec(source);

  if (result) {
    if (nameOfConstant == 'conditionValue') {
      let regValueOfConditionRepeatTimes = new RegExp(constants.conditionRepeatTimesValue);
      let resultOfValueOfConditionRepeatTimes = regValueOfConditionRepeatTimes.exec(result[2]);
      result = resultOfValueOfConditionRepeatTimes ? resultOfValueOfConditionRepeatTimes[1] : result[2];
    } else {
      result = result[1];
    }


    return result.replace(/\s+$/, '');
  }
  return true;
};