exports._get = function (sourceCode) {
  let listOfVariables = [];
  let regStr;
  let regExpArr = [
    /[<>\-\(\+=\*\/%\s]([^\d\u00AB\u00BB\(\)%+\-\*\/=#"'><\s!][^\u00AB\u00BB\(\)%+\-\*\/=#'"\s]*)[\-+=\*\/%\s><\)!]/g,
    /[<>\-\(\+=\*\/%\s]([^\d\u00AB\u00BB\(\)%+\-\*\/=#"'><\s!][^\u00AB\u00BB\(\)%+\-\*\/=#'"\s]*)$/g
  ];

  regExpArr.forEach(function (regExp) {
    while ((regStr = regExp.exec(sourceCode)) !== null) { //in line
      if (tools.isPartOfCode(sourceCode, regStr.index)) {
        listOfVariables.push(regStr[1]);
      }
    }
  });
  return _.uniq(listOfVariables);
};

exports.variablesToObjectChild = function (sessionId, sourceCode, listOfVariables) {
  console.llog('builder: variablesToObjectChild', 'begin');
  let regExp;
  let regStrZero;
  let regStrFirstIndex;

  let codeTailed = tail.concat(sourceCode);

  for (let i = 0; i < listOfVariables.length; i++) {
    regExp = new RegExp('[\\<\\>\\-\\(\\+\\=\\*\\/\\%\\s](' + listOfVariables[i] + ')[\\-\\+\\=\\*\\/\\%\\s\\!\\>\\<\\)]', 'g');
    while ((regStrZero = regExp.exec(codeTailed)) !== null) { //in line
      if (tools.isPartOfCode(codeTailed, regStrZero.index)) {
        if ((regStrFirstIndex = codeTailed.indexOf(listOfVariables[i], regStrZero.index)) != -1) {
          codeTailed = codeTailed.substring(0, regStrFirstIndex) +
            sessionId + '.' + listOfVariables[i] +
            codeTailed.substring(regStrFirstIndex + listOfVariables[i].length);
        }
      }
    }
  }

  let cutedTail = tail.cut(codeTailed);

  console.llog('builder: variablesToObjectChild', 'end');
  return cutedTail;
};

let _ = require('lodash');

let tail = require('./tail');

let tools = require('../../../../libs/tools');