exports.codeSemicolon = sourceCode => `${sourceCode.replace('\n', ';\n')};`;

exports.parser = function (sessionId, sourceCode, db, isCondition) {
  let re, reStr;
  let correctResult;
  let toReplace;
  let scopes = ['\'', '"', '«', '»'];
  let replaceObject = LANGUAGES[db](sessionId, isCondition).replace;
  for (let i = 0; i < replaceObject.length; i++) { //languages
    let isGlobal = db === 'global';
    re = new RegExp(isGlobal ? `[^\\\\](${replaceObject[i].command})` : replaceObject[i].command, 'g');
    while ((reStr = re.exec(sourceCode)) !== null) { //in line
      const isContainInnerReplacements = /\$\d+/.test(replaceObject[i].definition);
      correctResult = isContainInnerReplacements || !reStr[1] ? reStr[0] : reStr[1];
      let indexOfResult = isGlobal ? reStr.index + 1 : reStr.index;
      if (tools.isPartOfCode(sourceCode, indexOfResult)) {
        toReplace = isContainInnerReplacements ?
          correctResult.replace(new RegExp(replaceObject[i].command), replaceObject[i].definition) :
          replaceObject[i].definition;
      } else if (scopes.indexOf(correctResult) !== -1) {
        toReplace = `\\${correctResult}`;
      } else {
        toReplace = replaceObject[i].command;
      }

      sourceCode = sourceCode.substring(0, indexOfResult) + toReplace + sourceCode.substring(reStr.index + reStr[0].length);
    }
  }
  return sourceCode;
};

exports.fullParse = function (sessionId, sourceCode, isCondition) {
  let codeParsedMain = this.parser(sessionId, sourceCode, 'global');
  return this.parser(sessionId, codeParsedMain, 'linguacode', isCondition);
};

exports.codeFormatting = function (sessionId, sourceCode) {
  let codeSemicoloned = this.codeSemicolon(sourceCode);
  return this.fullParse(sessionId, codeSemicoloned);
};

let tools = require('../../libs/tools');
let LANGUAGES = require('../../constants').LANGUAGE;