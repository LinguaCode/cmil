let _ = require('lodash');
let reservedWords = require('./reservedWords');
let tools = require('../../libs/tools');

module.exports = {

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

  brokenVariable: function (sessionId, toCompile) {
    let variables = getter.variables(sessionId);
    for (let i = 0; i < variables.length; i++) {
      let variableName = variables[i];
      let variableRealName = sessionId + '.' + variableName;
      let regExp = new RegExp(variableRealName + '(?![ ]*\\=)');
      if (regExp.test(toCompile)) {
        let variableReal = global[sessionId][variableName];
        if (_.isNil(variableReal)) {
          return variableName;
        }
      }
    }

    return false;
  }

};

let getter = require('../executer').getter;