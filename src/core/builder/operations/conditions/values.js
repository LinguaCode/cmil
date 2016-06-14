/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license GPLv3
 */

var tools = require('../../../../libs/tools');
var _ = require('lodash');

exports.repeatCondition = function (sessionId, countOfRepeats) {
  var conditionName = this.conditionNameInit(sessionId, 'repeat');
  var operation = conditionName + ' = typeof(' + conditionName + ') == "undefined" ? 0 : ' + conditionName + ' + 1';
  return '(' + operation + ')<' + countOfRepeats;
};

exports.doCondition = function (sessionId, condition) {
  var conditionName = this.conditionNameInit(sessionId, 'do');
  condition = conditionName + ' = typeof(' + conditionName + ') == "undefined" ? true : ' + condition;
  return condition;
};

exports.ifCondition = function (sessionId, condition) {
  var conditionName = this.conditionNameInit(sessionId, 'if');
  condition = conditionName + ' = typeof(' + conditionName + ') == "undefined" ? ' + condition + ' : false';
  return condition;
};

exports.mainCondition = function (sessionId) {
  var conditionName = this.conditionNameInit(sessionId, 'main');
  return conditionName + ' = typeof(' + conditionName + ') == "undefined" ? true : false';
};

exports.conditionNameInit = function (sessionId, conditionType) {
  var randomIndex = _.random(9999);
  var sessionName = sessionId + '.';
  var repeatVarWithIndex = conditionType + '_' + randomIndex;
  return sessionName + repeatVarWithIndex;
};

var commands = require('../../../../database/commands/variables');