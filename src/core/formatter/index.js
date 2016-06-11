/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license Apache-2.0
 */

exports.codeSemicolon = function (sourceCode, levels) {
  var dataList = sourceCode.split('\n');
  var semicolon = ';';
  for (var i = 0; i < levels.length - 1; i++) {
    if (levels[i] >= levels[i + 1]) {
      dataList[i] += semicolon;
    }
  }
  dataList[dataList.length - 1] += semicolon;
  return dataList.join('\n');
};

exports.bracing = function (sourceCode, levels) {
  var dataList = sourceCode.split('\n');
  var isLevelPassed = [];
  for (var i = 0; i < levels.length - 2; i++) {
    for (var j = i + 2; j < levels.length; j++) {
      if ((isLevelPassed[j - 1]) && j != levels.length - 1) {
        break;
      }
      if (levels[i] == levels[i + 1]) {
        break;
      }
      if (levels[i] > levels[i + 1]) {
        break;
      }
      if (levels[j] == levels[i] && levels[i] > levels[i + 1]) {
        break;
      }

      if (levels[i] >= levels[j]) {
        dataList[i + 1] = dataList[i + 1].replace(new RegExp('[\\s]{' + (levels[i + 1] * 4) + '}'), '{');
        dataList[j - 1] = dataList[j - 1].replace(new RegExp('[\\s]{' + (levels[j - 1] * 4) + '}'), '') + '}';
        isLevelPassed[j] = true;
        break;
      }
      if (j == levels.length - 1) {
        dataList[i + 1] = dataList[i + 1].replace(new RegExp('[\\s]{' + (levels[i + 1] * 4) + '}'), '{');
        dataList[j] = dataList[j].replace(new RegExp('[\\s]{' + (levels[j] * 4) + '}'), '') + '}';
        isLevelPassed[j] = true;
        break;
      }
    }
  }
  if (levels[levels.length - 1] > levels[levels.length - 2]) {
    dataList[dataList.length - 1] = dataList[dataList.length - 1].replace(new RegExp('[\\s]{' + (levels[levels.length - 1] * 4) + '}'), '{') + '}';
  }
  return dataList.join('\n');
};

exports.parser = function (sessionId, sourceCode, lng, isCondition) {
  var re, reStr;
  var correctResult;
  var toReplace;
  var replaceObject = database.languages[lng](sessionId, isCondition).replace;
  for (var i = 0; i < replaceObject.length; i++) { //languages
    re = new RegExp(replaceObject[i].which, 'g');
    while ((reStr = re.exec(sourceCode)) !== null) { //in line
      correctResult = reStr[1] ? reStr[1] : reStr[0];
      if (tools.isPartOfCode(sourceCode, reStr.index)) {
        toReplace = replaceObject[i].toWhat.replace('$1', correctResult);
        sourceCode = sourceCode.substring(0, reStr.index) + toReplace + sourceCode.substring(reStr.index + reStr[0].length);
      }
    }
  }
  return sourceCode;
};

exports.fullParse = function (sessionId, sourceCode, isCondition) {
  var codeParsedMain = this.parser(sessionId, sourceCode, 'main');
  return this.parser(sessionId, codeParsedMain, 'linguacode', isCondition);
};
  
exports.codeFormatting = function (sessionId, sourceCode) {
  var levelOfCode = tools.codeDepthLevels.all(sourceCode);
  sourceCode = sourceCode.join('\n');

  var codeSemicoloned = this.codeSemicolon(sourceCode, levelOfCode);
  var codeBraced = this.bracing(codeSemicoloned, levelOfCode);
  return this.fullParse(sessionId, codeBraced);
};

var tools = require('../../libs/tools');
var database = require('../../database/connection');