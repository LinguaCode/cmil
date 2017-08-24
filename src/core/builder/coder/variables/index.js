const _ = require('lodash');
const tail = require('./tail');
const tools = require('../../../../libs/tools');
const constants = require('../../../../libs/constants');

const variableNameRegExpContent = tools.regExpContentExtract(/([^\d\u00AB\u00BB()%+\-*\/=@"'><\s!,][^\u00AB\u00BB()%+\-*\/=@'"\s,]*)/);
const preTailOfVariableNameRegExpContent = tools.regExpContentExtract(constants.preTailOfVariableNameRegExp);
const postTailOfVariableNameRegExpContent = tools.regExpContentExtract(constants.postTailOfVariableNameRegExp);

exports._get = sourceCode => {

  let listOfVariables = [];
  let regStr;
  const regExpArr = [
    new RegExp(`${preTailOfVariableNameRegExpContent}${variableNameRegExpContent}${postTailOfVariableNameRegExpContent}`, 'g'),
    new RegExp(`^${variableNameRegExpContent}${postTailOfVariableNameRegExpContent}`, 'g'),
    new RegExp(`${preTailOfVariableNameRegExpContent}${variableNameRegExpContent}$`, 'g'),
    new RegExp(`^${variableNameRegExpContent}$`, 'g')
  ];

  sourceCode
    .split('\n')
    .forEach((line) => {
      regExpArr.forEach(regExp => {
        while ((regStr = regExp.exec(line)) !== null) { //in line
          if (tools.isPartOfCode(line, regStr.index)) {
            listOfVariables.push(regStr[1]);
          }
        }
      })
    });

  return _.uniq(listOfVariables);
};

exports.variablesToObjectChild = (sessionId, sourceCode, listOfVariables) => {
  console.llog('builder: variablesToObjectChild', 'begin');
  let codeTailed = sourceCode
    .split('\n')
    .map((line) => {
      line = tail.concat(line);
      for (let i = 0; i < listOfVariables.length; i++) {
        const currentVariable = listOfVariables[i];

        const beforeVariableRegExp = '[\\<\\>\\-\\(\\+\\=\\*\\/\\%\\s\\,]';
        const afterVariableRegExp = '[\\-\\+\\=\\*\\/\\%\\s\\!\\>\\<\\)\\,]';
        let regExp = new RegExp(`(?!\\.)${beforeVariableRegExp}(${currentVariable})${afterVariableRegExp}`, 'g');

        let regIndexOfVariable;
        let indexOfVariable;
        let isPartOfCode;
        do {
          regIndexOfVariable = regExp.exec(line);
          indexOfVariable = regIndexOfVariable ? line.indexOf(currentVariable, regIndexOfVariable.index) : -1;
          isPartOfCode = tools.isPartOfCode(line, indexOfVariable);

          if (regIndexOfVariable && isPartOfCode) {
            const lineLeftPart = line.substring(0, indexOfVariable);
            const lineRightPart = line.substring(indexOfVariable + listOfVariables[i].length);
            const modifiedVariableName = `global[sessionId].${currentVariable}`;
            line = lineLeftPart + modifiedVariableName + lineRightPart;
          }
        }
        while (!!regIndexOfVariable);
      }

      return line.slice(1, -1);
    })
    .join('\n');

  console.llog('builder: variablesToObjectChild', 'end');
  return codeTailed;
};