exports.codeSemicolon = sourceCode => `${sourceCode.replace('\n', ';\n')};`;

const parse = {
  scopes: function (sourceCode) {
    const scopes = ['\'', '"', '«', '»'];
    const es6Scope = '`';

    for (let i = 0; i < scopes.length; i++) {
      const scope = scopes[i];

      const re = new RegExp(`([^\\\\]${scope}|^${scope})`, 'g');

      let reStr;
      while ((reStr = re.exec(sourceCode)) !== null) {
        const index = reStr.index;

        const isPartOfCode = tools.isPartOfCode(sourceCode, index);
        const toReplace = isPartOfCode ? es6Scope : `\\${scope}`;

        sourceCode = sourceCode.replace(re, toReplace);
      }
    }
    return sourceCode;
  },

  syntax: function (sessionId, sourceCode, db) {
    const commands = SYNTAX[db];
    for (let i = 0; i < commands.length; i++) {
      const instance = commands[i];

      const re = new RegExp(instance.command, 'g');

      let reStr;
      while ((reStr = re.exec(sourceCode)) !== null) {
        const correctResult = reStr[0];
        const indexOfResult = reStr.index;
        const isPartOfCode = tools.isPartOfCode(sourceCode, indexOfResult);

        if (isPartOfCode) {
          const isContainInnerReplacements = /\$\d+/.test(instance.definition);

          const toReplace = isContainInnerReplacements ?
            correctResult.replace(new RegExp(instance.command), instance.definition) :
            instance.definition;

          const firstPartEndIndex = indexOfResult;
          const secondPartBeginIndex = reStr.index + reStr[0].length;
          sourceCode = tools.partitionReplace(sourceCode, toReplace, firstPartEndIndex, secondPartBeginIndex);
        }

      }
    }
    return sourceCode;
  }
};

exports.fullParse = function (sessionId, sourceCode) {
  const codeGlobalParsed = parse.syntax(sessionId, sourceCode, 'globals');
  const codeSyntaxParsed = parse.syntax(sessionId, codeGlobalParsed, 'commands');
  const codeScopesParsed = parse.scopes(codeSyntaxParsed);

  return codeScopesParsed;
};

exports.codeFormatting = function (sessionId, sourceCode) {
  const codeSemicoloned = this.codeSemicolon(sourceCode);
  return this.fullParse(sessionId, codeSemicoloned);
};

const tools = require('../../libs/tools');
const SYNTAX = require('../../constants').SYNTAX;