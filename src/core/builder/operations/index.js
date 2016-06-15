var tools = require('../../../libs/tools');

exports.execute = function (sessionId, sourceCode) {

  var variables = coder.variables._get(sourceCode);
  var varToObj = coder.variables.variablesToObjectChild(sessionId, sourceCode, variables);
  var listOfCommands = varToObj.split('\n');
  var listOfLevels = tools.codeDepthLevels.all(listOfCommands);
  listOfCommands.map(function (command, index, theListOfCommands) {
    theListOfCommands[index] = command.replace(/^\s+/, '');
  });

  return [{
    condition: conditions.values.mainCondition(sessionId),
    child: buildRecursion(sessionId, listOfCommands, listOfLevels, variables)
  }];
};

var buildRecursion = exports.buildRecursion  = function (sessionId, listOfCommands, listOfLevels, variables) {
  var components = require('../components');

  var toCompileIndexStart = 0;
  var parentOfParents = [];

  for (var i = 0; i < listOfLevels.length; i++) {
    var parent = components.parent(listOfCommands, listOfLevels, i);
    var _toCompile;
    if (i < listOfLevels.length - 1 && parent) {
      if (toCompileIndexStart !== parent.index.previous) {
        _toCompile = components.toCompile(sessionId, listOfCommands, variables, toCompileIndexStart, parent.index.previous);
      } else {
        _toCompile = [];
      }

      var conditionType = parent.conditions.type.previous.substring(1);
      var conditionResult = conditions.conditionals['_' + conditionType](sessionId, listOfCommands, listOfLevels, parent, variables);
      var _parent = conditionResult.child;

      var parentOfParent = {};
      if (_toCompile.length != 0) {
        parentOfParent.toCompile = _toCompile;
      }
      parentOfParent.parent = _parent;

      parentOfParents.push(parentOfParent);

      i += conditionResult.countOfCommands;
      toCompileIndexStart = i + 1;
    } else if (i >= listOfLevels.length - 1) {
      parentOfParents.push({
        toCompile: coder.splitToCompilableParts(sessionId, listOfCommands.slice(toCompileIndexStart), variables)
      });
    }
  }

  return parentOfParents;
};

exports.nextParentIndexInitialize = function (listOfLevels, currentIndex) {
  var indexOfNext = listOfLevels.indexOf(listOfLevels[currentIndex], currentIndex + 1);
  var isNextParentExist = indexOfNext != -1;
  if (!isNextParentExist) {
    indexOfNext = listOfLevels.length;
  }
  return {
    value: indexOfNext,
    isNextParentExist: isNextParentExist
  };
};

var coder = require('../coder');
var conditions = require('./conditions');