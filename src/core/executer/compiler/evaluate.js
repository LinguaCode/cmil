var tools = require('../../../libs/tools');
var errorHandler = require('../../errorHandler');

let errorCheck = require('../../errorHandler/checker');
let errorMessages = require('../../errorHandler/messages');


exports.condition = function (sessionId) {
  var formattedCondition = formatter.fullParse(sessionId, getter.condition(sessionId), true);
  return eval(formattedCondition) === true;
};

exports.code = function (sessionId, sourceCode) {
  var evalResult = '';
  var evalStatus = 'success';

  for (var i = 0; i < sourceCode.length; i++) {
    let line = sourceCode[i];

    var codeFormatted = formatter.codeFormatting(sessionId, line);


    try {
      let output = eval(codeFormatted);
      if (output) {
        evalResult += output;
      }

      let hasBrokenVariable = errorCheck.brokenVariable(sessionId, codeFormatted);
      if (hasBrokenVariable) {
        __io.emit(sessionId + '_' + 'evaluated', {
          result: '',
          status: errorMessages.brokenVariable(hasBrokenVariable)
        });
        return false;
      }

      evalStatus = 'success';
    } catch (error) {
      evalResult = '';
      evalStatus = errorHandler.evalResult(error);
    }
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