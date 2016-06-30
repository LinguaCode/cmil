exports.codeSemicolon = function (sourceCode) {
  return sourceCode.replace('\n', ';\n') + ';';
};

exports.parser = function (sessionId, sourceCode, lng, isCondition) {
  var re, reStr;
  var correctResult;
  var toReplace;
  var replaceObject = database.languages[lng](sessionId, isCondition).replace;
  for (var i = 0; i < replaceObject.length; i++) { //languages
    re = new RegExp('[^\\\\](' + replaceObject[i].command+')', 'g');
    while ((reStr = re.exec(sourceCode)) !== null) { //in line
      correctResult = reStr[1] ? reStr[1] : reStr[0];
      let indexOfResult = reStr.index + 1;
      if (tools.isPartOfCode(sourceCode, indexOfResult)) {
        toReplace = replaceObject[i].definition.replace('$1', correctResult);
        sourceCode = sourceCode.substring(0, indexOfResult) + toReplace + sourceCode.substring(reStr.index + reStr[0].length);
      } else if (correctResult == '\'') {
        toReplace = '\\\'';
        sourceCode = sourceCode.substring(0, indexOfResult) + toReplace + sourceCode.substring(reStr.index + reStr[0].length);
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
  var codeSemicoloned = this.codeSemicolon(sourceCode);
  return this.fullParse(sessionId, codeSemicoloned);
};

var tools = require('../../libs/tools');
var database = require('../../database/connection');