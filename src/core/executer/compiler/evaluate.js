const tools = require('../../../libs/tools');
const errorHandler = require('../../errorHandler');
const errorCheck = require('../../errorHandler/checker');
const formatter = require('../../formatter');
const getter = require('../getter');
const setter = require('../setter');
const management = require('./management');
const STATUS = require('linguacode-constants').STATUS;

const UNDEFINED_VARIABLE = STATUS.UNDEFINED_VARIABLE;
const SUCCESS = STATUS.SUCCESS;

exports.condition = sessionId => {
  const condition = getter.condition(sessionId);
  let formattedCondition = formatter.fullParse(sessionId, condition, true);

  //if "else"=> return null
  let isPassed = eval(formattedCondition) !== false;
  return isPassed;
};

exports.code = (sessionId, sourceCode) => {
  let evalResult = '';
  let evalStatus = SUCCESS;

  for (let i = 0; i < sourceCode.length; i++) {
    const lineNumber = i + 1;
    let line = sourceCode[i];

    try {
      var codeFormatted = formatter.codeFormatting(sessionId, line);
    } catch (errorId) {
      throw {
        errorId,
        param: {
          line: lineNumber
        }
      }
    }

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

    if (evalStatus === SUCCESS) {
      const undefinedVariable = errorCheck.undefinedVariable(sessionId, codeFormatted);

      if (undefinedVariable) {
        const error = {
          errorId: UNDEFINED_VARIABLE,
          param: {
            variable: undefinedVariable,
            line: lineNumber
          }
        };

        setter.output(sessionId, error);
        console.llog('compiler: trigger: broken variable');
        throw error;
      }
    }
  }

  return {
    result: evalResult.slice(0, -1),
    status: evalStatus
  }
};


exports.inputOperation = (sessionId, inputValue) => {
  const firstPart = getter.inputVariable(sessionId);
  return `${firstPart}=${tools.valueRender(inputValue)}`;
};