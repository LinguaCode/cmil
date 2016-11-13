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
  let regStrFirstIndex;

  let codeTailed = tail.concat(sourceCode);

  for (let i = 0; i < listOfVariables.length; i++) {
    const currentVariable = listOfVariables[i];

    let regExp = new RegExp(`[\\<\\>\\-\\(\\+\\=\\*\\/\\%\\s](${currentVariable})[\\-\\+\\=\\*\\/\\%\\s\\!\\>\\<\\)]`, 'g');

    let regIndexOfVariable ;
    let indexOfVariable;
    let isPartOfCode;

    do {
      regIndexOfVariable = regExp.exec(codeTailed);
      indexOfVariable = regIndexOfVariable ? codeTailed.indexOf(currentVariable, regIndexOfVariable.index) : -1;
      isPartOfCode = tools.isPartOfCode(codeTailed, indexOfVariable);

      if (regIndexOfVariable && indexOfVariable !== -1 && isPartOfCode) {
        const codeTailedLeftPart = codeTailed.substring(0, indexOfVariable);
        const codeTailedRightPart = codeTailed.substring(indexOfVariable + listOfVariables[i].length);
        const modifiedVariableName = `${sessionId}.${currentVariable}`;
        codeTailed = codeTailedLeftPart + modifiedVariableName + codeTailedRightPart;
      }
    }
    while (!!regIndexOfVariable);
  }

  let cut = tail.cut(codeTailed);

  console.llog('builder: variablesToObjectChild', 'end');
  return cut;
};