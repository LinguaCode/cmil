let COMMAND = require('../constants').COMMAND;

const constants =  {
  conditionValue: `(${COMMAND.IF_WHILE_REPEAT})\\s+([^\\r\\n]*[^\\${COMMAND.THEN}])( ${COMMAND.THEN})*`,
  conditionRepeatTimesValue: `(.*)\\s+${COMMAND.TIMES}`,

  conditionType: `\\s*(${COMMAND.IF_WHILE_REPEAT}|${COMMAND.ELSE}|${COMMAND.DO}|${COMMAND.ELIF})`
};

exports.executions = (source, nameOfConstant) => {
  const regexp = new RegExp(constants[nameOfConstant]);
  let result = regexp.exec(source);

  if (!result) {
    return true;
  }

  if (nameOfConstant == 'conditionValue') {
    const regValueOfConditionRepeatTimes = new RegExp(constants.conditionRepeatTimesValue);
    const resultOfValueOfConditionRepeatTimes = regValueOfConditionRepeatTimes.exec(result[2]);
    result = resultOfValueOfConditionRepeatTimes ? resultOfValueOfConditionRepeatTimes[1] : result[2];
  } else {
    result = result[1];
  }

  return result.replace(/\s+$/, '');
};