const _ = require('lodash');
const reservedWords = require('./reservedWords');
const tools = require('../../libs/tools');

exports.hackAttempted = (sourceCode, params) => {
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
};

exports.indentFailure = sourceCode => {
  let listOfCommands = sourceCode.split('\n');
  for (let i = 0; i < listOfCommands.length; i++) {
    let levelsTemp = tools.codeDepthLevels.line(listOfCommands[i]);
    if (levelsTemp == -1) {
      return {
        lineNumber: i + 1
      }
    }
  }

  return false;
};

exports.brokenVariable = (sessionId, toCompile) => {
  let variables = getter.variables(sessionId);
  for (let i = 0; i < variables.length; i++) {
    const variableName = variables[i];
    const variableRealName = `${sessionId}.${variableName}`;
    let regExp = new RegExp(`${variableRealName}(?![ ]*\\=)`);
    if (regExp.test(toCompile)) {
      let variableReal = global[sessionId][variableName];
      if (_.isNil(variableReal)) {
        return variableName;
      }
    }
  }

  return false;
};

const getter = require('../executer').getter;