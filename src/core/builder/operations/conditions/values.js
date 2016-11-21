let tools = require('../../../../libs/tools');
let _ = require('lodash');

exports.repeatCondition = (sessionId, countOfRepeats) => {
  console.llog('builder: repeatCondition');

  const conditionName = this.conditionNameInit(sessionId, 'repeat');
  const operation = `${conditionName} = typeof(${conditionName}) == "undefined" ? 0 : ${conditionName} + 1`;
  return `(${operation})<${countOfRepeats}`;
};

exports.doCondition = (sessionId, condition) => {
  console.llog('builder: doCondition');

  const conditionName = this.conditionNameInit(sessionId, 'do');
  condition = `${conditionName} = typeof(${conditionName}) == "undefined" ? true : ${condition}`;
  return condition;
};

exports.ifCondition = (sessionId, condition) => {
  console.llog('builder: ifCondition');

  const conditionName = this.conditionNameInit(sessionId, 'if');
  condition = `${conditionName} = ${condition}`;
  return condition;
};

exports.mainCondition = sessionId => {
  console.llog('builder: mainCondition');

  const conditionName = this.conditionNameInit(sessionId, 'main');
  return `${conditionName} = typeof(${conditionName}) == "undefined" ? true : false`;
};

exports.conditionNameInit = (sessionId, conditionType) => {
  console.llog('builder: conditionNameInit');

  const randomIndex = _.random(9999);
  const sessionName = `global[sessionId].`;
  const repeatVarWithIndex = `${conditionType}_${randomIndex}`;
  return sessionName + repeatVarWithIndex;
};