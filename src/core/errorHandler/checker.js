const _ = require('lodash');
const tools = require('../../libs/tools');

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
    const variableRealName = _.escapeRegExp(`global['${sessionId}'].${variableName}`);
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