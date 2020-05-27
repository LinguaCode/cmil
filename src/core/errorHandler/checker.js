const _ = require('lodash');
const reservedWords = require('./reservedWords');
const tools = require('../../libs/tools');

exports.hackAttempt = (sourceCode) => {
  sourceCode = sourceCode.split('\n');
  for (let i = 0; i < sourceCode.length; i++) {
    const line = sourceCode[i];
    for (let j = 0; j < reservedWords.length; j++) {
      const reservedWord = reservedWords[j];
      const regExp = new RegExp(reservedWord, 'g');
      if (regExp.test(line) && tools.isPartOfCode(line, regExp.lastIndex - reservedWords[i].length)) {
        return {};
      }
    }
  }

  return null;
};

exports.indentError = sourceCode => {
  let listOfCommands = sourceCode.split('\n');
  for (let i = 0; i < listOfCommands.length; i++) {
    let levelsTemp = tools.codeDepthLevels.line(listOfCommands[i]);
    if (levelsTemp === -1) {
      const lineNumber = i + 1;
      return {
        line: lineNumber
      };
    }
  }

  return null;
};

exports.undefinedVariable = (sessionId, toCompile) => {
  let variables = getter.data(sessionId, 'variables');
  for (let i = 0; i < variables.length; i++) {
    const variableName = variables[i];
    const variableRealName = `global\\[sessionId\\].${variableName}`;
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