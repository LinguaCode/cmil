let tools = require('../../../../libs/tools');
let _ = require('lodash');

exports.repeatCondition = function (sessionId, countOfRepeats) {
  console.llog('builder: repeatCondition');

  let conditionName = this.conditionNameInit(sessionId, 'repeat');
  let operation = conditionName + ' = typeof(' + conditionName + ') == "undefined" ? 0 : ' + conditionName + ' + 1';
  return '(' + operation + ')<' + countOfRepeats;
};

exports.doCondition = function (sessionId, condition) {
  console.llog('builder: doCondition');

  let conditionName = this.conditionNameInit(sessionId, 'do');
  condition = conditionName + ' = typeof(' + conditionName + ') == "undefined" ? true : ' + condition;
  return condition;
};

exports.ifCondition = function (sessionId, condition) {
  console.llog('builder: ifCondition');

  let conditionName = this.conditionNameInit(sessionId, 'if');
  condition = conditionName + ' = typeof(' + conditionName + ') == "undefined" ? ' + condition + ' : false';
  return condition;
};

exports.mainCondition = function (sessionId) {
  console.llog('builder: mainCondition', 'begin');

  let conditionName = this.conditionNameInit(sessionId, 'main');

  console.llog('builder: mainCondition', 'end');
  return conditionName + ' = typeof(' + conditionName + ') == "undefined" ? true : false';
};

exports.conditionNameInit = function (sessionId, conditionType) {
  console.llog('builder: conditionNameInit');

  let randomIndex = _.random(9999);
  let sessionName = sessionId + '.';
  let repeatVarWithIndex = conditionType + '_' + randomIndex;
  return sessionName + repeatVarWithIndex;
};

let commands = require('../../../../database/commands/variables');