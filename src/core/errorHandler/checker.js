const _ = require('lodash');
const reservedWords = require('./reservedWords');
const tools = require('../../libs/tools');

exports.hackAttempt = (sourceCode, params) => {
  let ipAddress = params.ipAddress;

  sourceCode = sourceCode.split('\n');
  for (let i = 0; i < sourceCode.length; i++) {
    const line = sourceCode[i];
    for (let j = 0; j < reservedWords.length; j++) {
      let regExp = new RegExp(reservedWords[i], 'g');
      if (regExp.test(line) && tools.isPartOfCode(line, regExp.lastIndex - reservedWords[i].length)) {
        return ipAddress;
      }
    }
  }

  return null;
};

exports.indentError = sourceCode => {
  let listOfCommands = sourceCode.split('\n');
  for (let i = 0; i < listOfCommands.length; i++) {
    let levelsTemp = tools.codeDepthLevels.line(listOfCommands[i]);
    if (levelsTemp == -1) {
      const lineNumber = i + 1;
      return lineNumber;
    }
  }

  return null;
};

exports.undefinedVariable = (sessionId, toCompile) => {
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

  return null;
};

const getter = require('../executer').getter;