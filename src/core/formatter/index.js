exports.codeSemicolon = sourceCode => `${sourceCode.replace('\n', ';\n')};`;

const parse = {

  quotes: function (sourceCode) {
    const db = 'quotes';
    const quotes = SYNTAX[db];

    for (let i = 0; i < quotes.length; i++) {
      const command = quotes[i].command;
      const definition = quotes[i].definition;

      const re = new RegExp(`([^\\\\])${command}|^${command}`);

      let reStr;
      while ((reStr = re.exec(sourceCode)) !== null) {
        const index = reStr.index + 1;

        const isPartOfCode = tools.isPartOfCode(sourceCode, index);
        const toReplace = isPartOfCode ? definition : `\\${command}`;

        sourceCode = sourceCode.replace(re, `$1${toReplace}`);
      }
    }
    return sourceCode;
  },

  syntax: function (sourceCode, db) {
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
  },

  functions: function (sourceCode) {
    const db = 'functions';

    const commands = SYNTAX[db];
    for (let i = 0; i < commands.length; i++) {
      const instance = commands[i];
      const re = new RegExp(instance.command, 'g');

      let reStr;
      while ((reStr = re.exec(sourceCode)) !== null) {
        const indexOfResult = reStr.index;
        const isPartOfCode = tools.isPartOfCode(sourceCode, indexOfResult);
        if (!isPartOfCode) {
          continue;
        }

        const argumentPositions = tools.argumentPositions(sourceCode, indexOfResult);
        const indexOfBeginScope = argumentPositions.begin;
        const indexOfEndScope = argumentPositions.end;
        const functionArguments = tools.functionArguments(sourceCode, indexOfBeginScope, indexOfEndScope);
        const toReplace = tools.argumentReplace(functionArguments, instance.definition);

        const indexOfToReplaceFirstPartEnd = indexOfResult;
        const indexOfToReplaceSecondPartBegin = indexOfEndScope + 1;
        sourceCode = tools.partitionReplace(sourceCode, toReplace, indexOfToReplaceFirstPartEnd, indexOfToReplaceSecondPartBegin);
      }
    }
    return sourceCode;
  },
};

exports.fullParse = function (sessionId, sourceCode, isCondition) {
  const codeGlobalParsed = parse.syntax(sourceCode, 'globals');
  const codeFunctionsParsed = parse.functions(codeGlobalParsed);

  let codeSyntaxParsed = parse.syntax(codeFunctionsParsed, 'commands');
  if (!isCondition) {
    codeSyntaxParsed = parse.syntax(codeSyntaxParsed, 'source');
  }

  const codeQuotesParsed = parse.quotes(codeSyntaxParsed);

  return codeQuotesParsed;
};

exports.codeFormatting = function (sessionId, sourceCode) {
  const codeSemicoloned = this.codeSemicolon(sourceCode);
  return this.fullParse(sessionId, codeSemicoloned);
};

const tools = require('../../libs/tools');
const SYNTAX = require('linguacode-constants').SYNTAX;