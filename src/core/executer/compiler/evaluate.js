const tools = require('../../../libs/tools');
const errorHandler = require('../../errorHandler');
const errorCheck = require('../../errorHandler/checker');
const formatter = require('../../formatter');
const getter = require('../getter');
const setter = require('../setter');
const management = require('./management');
const constants = require('../../../constants');

const UNDEFINED_VARIABLE = constants.STATUS.UNDEFINED_VARIABLE;
const SUCCESS = constants.STATUS.SUCCESS;

exports.condition = sessionId => {
  const condition = getter.condition(sessionId);
  let formattedCondition = formatter.fullParse(sessionId, condition, true);
  let isPassed = eval(formattedCondition) === true;
  return isPassed;
};

exports.code = (sessionId, sourceCode) => {
  let evalResult = '';
  let evalStatus = SUCCESS;

  for (let i = 0; i < sourceCode.length; i++) {
    let line = sourceCode[i];

    let codeFormatted = formatter.codeFormatting(sessionId, line);

    try {
      let output = eval(codeFormatted);
      if (output !== '') {
        evalResult += `${output}\n`;
      }

      evalStatus = SUCCESS;
    } catch (error) {
      evalResult = '';
      evalStatus = errorHandler.evalResult(error);
    }

    if (evalStatus == SUCCESS) {
      const undefinedVariable = errorCheck.undefinedVariable(sessionId, codeFormatted);

      if (undefinedVariable) {
        const error = {
          id: UNDEFINED_VARIABLE,
          param: undefinedVariable
        };

        setter.output(sessionId, error);
        console.llog('compiler: trigger: broken variable');
        throw new Error(UNDEFINED_VARIABLE);
      }
    }
  }

  return {
    result: evalResult.slice(0, -1),
    status: evalStatus
  }
};


exports.inputOperation = (sessionId, inputValue) => `${getter.inputVariable(sessionId)}=${tools.valueRender(inputValue)}`;