let tools = require('../../../libs/tools');
let errorHandler = require('../../errorHandler');

let errorCheck = require('../../errorHandler/checker');
let errorMessages = require('../../errorHandler/messages');


exports.condition = function (sessionId) {
  let formattedCondition = formatter.fullParse(sessionId, getter.condition(sessionId), true);
  let isPassed = eval(formattedCondition) === true;
  return isPassed;
};

exports.code = function (sessionId, sourceCode) {
  let evalResult = '';
  let evalStatus = 'success';

  for (let i = 0; i < sourceCode.length; i++) {
    let line = sourceCode[i];

    let codeFormatted = formatter.codeFormatting(sessionId, line);


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
        management.session.end(sessionId);
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

let formatter = require('../../formatter');

let getter = require('../getter');

let management = require('./management');