let VARIABLE = require('../constants').VARIABLE;
const ifWhileRepeatCommandsGroup = `${VARIABLE.if}|${VARIABLE.while}|${VARIABLE.repeat}`;

const constants = exports.constants = {
  conditionValue: `(${ifWhileRepeatCommandsGroup})\\s+([^\\r\\n]*[^\\${VARIABLE.then}])( ${VARIABLE.then})*`,
  conditionRepeatTimesValue: `(.*)\\s+${VARIABLE.times}`,

  conditionType: `\\s*(${ifWhileRepeatCommandsGroup}|${VARIABLE.else}|${VARIABLE.do}|${VARIABLE.elif})`
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