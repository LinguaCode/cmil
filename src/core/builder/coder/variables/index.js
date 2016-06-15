exports._get = function (sourceCode) {
  var listOfVariables = [];
  var regStr;
  var regExpArr = [
    /[<>\-\(\+=\*\/%\s]([^\d\u00AB\u00BB\(\)%+\-\*\/=#"'><\s!][^\u00AB\u00BB\(\)%+\-\*\/=#'"\s]*)[\-+=\*\/%\s><\)!]/g,
    /[<>\-\(\+=\*\/%\s]([^\d\u00AB\u00BB\(\)%+\-\*\/=#"'><\s!][^\u00AB\u00BB\(\)%+\-\*\/=#'"\s]*)$/g];

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
  var regExp;
  var regStrZero;
  var regStrFirstIndex;

  var codeTailed = tail.concat(sourceCode);

  for (var i = 0; i < listOfVariables.length; i++) {
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
  return tail.cut(codeTailed);
};

var _ = require('lodash');

var tail = require('./tail');

var tools = require('../../../../libs/tools');