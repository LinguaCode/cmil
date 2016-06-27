let fs = require('fs');
let reservedWords = require('./reservedWords');
let tools = require('./../libs/tools');

let pipeline = ['hackAttempted', 'indentFailure'];

let errorMessages = {

  hackAttempted: function (params) {
    let ipAddress = params.ipAddress;
    return 'Hack attempt. Your "' + ipAddress + '" ip address was saved in the our database.';
  },

  indentFailure: function (params) {
    let lineNumber = params.lineNumber;
    return 'Space error in ' + lineNumber + ' line.';
  }

};

let is = {

  hackAttempted: function (sourceCode, params) {
    let ipAddress = params.ipAddress;

    for (let i = 0; i < reservedWords.length; i++) {
      let regExp = new RegExp(reservedWords[i], 'g');
      if (regExp.test(sourceCode) && tools.isPartOfCode(sourceCode, regExp.lastIndex - reservedWords[i].length)) {
        return {
          ipAddress: ipAddress
        };
      }
    }

    return false;
  },

  indentFailure: function (sourceCode) {
    let listOfCommands = sourceCode.split('\n');
    for (let i = 0; i < listOfCommands.length; i++) {
      let levelsTemp = tools.codeDepthLevels.line(listOfCommands[i]);
      if (levelsTemp == -1) {
        return {
          lineNumber: i
        }
      }
    }

    return false;
  },

  brokenVariable: function (variableName) {
    return `The ${variableName} variable didn't defined.`;
  }
};

exports.brokenVariable = function (sessionId) {
  let sessionVariables = global[sessionId];
  let brokenVariableList = [];
  for (let key in sessionVariables) {
    //TODO: Arman: finish this part
  }
};

exports.analyze = function (sourceCode, params) {
  for (let i = 0; i < pipeline.length; i++) {
    let testName = pipeline[i];

    let errorParams = is[testName](sourceCode, params);
    if (errorParams) {
      return errorMessages[testName](errorParams);
    }

  }

  return false;
};

exports.evalResult = function (error) {
  let errorMessage = error.message;
  let errorStatus;
  let errorRegEx = {
    unexpectedIdentifier: /Unexpected identifier/i,
    isNotDefined: /is not defined/
  };

  if (errorRegEx.unexpectedIdentifier.test(errorMessage)) {
    errorStatus = 'Կոդում առկա է ուղղագրական սխալ։';
  } else if (errorRegEx.isNotDefined.test(errorMessage)) {
    //let errorCoordinates = error.stack.match(/\d:\d/)[0].split(':');
    //let errorLine = parseInt(errorCoordinates[0]) - 7;
    //let errorRow = parseInt(errorCoordinates[1]);
    let undefinedVariableName = error.message.match(/(.*) is not defined/)[1];

    errorStatus = 'Գրված «' + undefinedVariableName + '» փոփոխականը հայտարարված չէ։'/*
     + '\nՏես տող՝ ' + errorLine + ', դիրք՝ ' + errorRow + '։'*/;
  } else {
    errorStatus = 'Syntax error';
  }

  return errorStatus;
};