var tools = require('../../../libs/tools');
var errorHandler = require('../../../libs/errorHandler');

exports.condition = function (sessionId) {
  var formattedCondition = formatter.fullParse(sessionId, getter.condition(sessionId), true);
  return eval(formattedCondition) === true;
};

exports.code = function (sessionId, sourceCode) {
  if (sourceCode.length == 0) {
    return '';
  }

  var codeFormatted = formatter.codeFormatting(sessionId, sourceCode);

  var evalResult;
  var evalStatus;

  try {
    evalResult = eval(codeFormatted);
    evalStatus = 'success';
  } catch (error) {
    evalResult = '';
    evalStatus = errorHandler.evalResult(error);
  }

  return {
    result: evalResult,
    status: evalStatus
  }
};

exports.inputOperation = function (sessionId, inputValue) {
  return getter.inputVariable(sessionId) + '=' + tools.valueRender(inputValue);
};

var formatter = require('../../formatter');

var getter = require('../getter');