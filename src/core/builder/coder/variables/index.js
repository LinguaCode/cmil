const _ = require('lodash');
const tail = require('./tail');
const tools = require('../../../../libs/tools');

exports._get = sourceCode => {
  let listOfVariables = [];
  let regStr;
  const regExpArr = [
    /[<>\-(+=*\/%\s]([^\d\u00AB\u00BB()%+\-*\/=#"'><\s!][^\u00AB\u00BB()%+\-*\/=#'"\s]*)[\-+=*\/%\s><)!]/g,
    /[<>\-(+=*\/%\s]([^\d\u00AB\u00BB()%+\-*\/=#"'><\s!][^\u00AB\u00BB()%+\-*\/=#'"\s]*)$/g
  ];

  regExpArr.forEach(regExp => {
    while ((regStr = regExp.exec(sourceCode)) !== null) { //in line
      if (tools.isPartOfCode(sourceCode, regStr.index)) {
        listOfVariables.push(regStr[1]);
      }
    }
  });
  return _.uniq(listOfVariables);
};

exports.variablesToObjectChild = (sessionId, sourceCode, listOfVariables) => {
  console.llog('builder: variablesToObjectChild', 'begin');
  let regStrZero;
  let regStrFirstIndex;

  let codeTailed = tail.concat(sourceCode);

  for (let i = 0; i < listOfVariables.length; i++) {
    let regExp = new RegExp(`[\\<\\>\\-\\(\\+\\=\\*\\/\\%\\s](${listOfVariables[i]})[\\-\\+\\=\\*\\/\\%\\s\\!\\>\\<\\)]`, 'g');

    while (
    (regStrZero = regExp.exec(codeTailed)) !== null &&
    tools.isPartOfCode(codeTailed, regStrZero.index) &&
    (regStrFirstIndex = codeTailed.indexOf(listOfVariables[i], regStrZero.index)) != -1) { //in line
      const codeTailedLeftPart = codeTailed.substring(0, regStrFirstIndex);
      const codeTailedRightPart = codeTailed.substring(regStrFirstIndex + listOfVariables[i].length);
      const modifiedVariableName = `${sessionId}.${listOfVariables[i]}`;
      codeTailed = codeTailedLeftPart + modifiedVariableName + codeTailedRightPart;
    }
  }

  let cut = tail.cut(codeTailed);

  console.llog('builder: variablesToObjectChild', 'end');
  return cut;
};