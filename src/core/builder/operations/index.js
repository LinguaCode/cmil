let tools = require('../../../libs/tools');

exports.execute = function (sessionId, sourceCode) {
  console.llog('builder: main', 'begin');

  let variables = coder.variables._get(sourceCode);
  setter.variables(sessionId, variables);

  let varToObj = coder.variables.variablesToObjectChild(sessionId, sourceCode, variables);
  let listOfCommands = varToObj.split('\n');
  let listOfLevels = tools.codeDepthLevels.all(listOfCommands);
  listOfCommands.map(function (command, index, theListOfCommands) {
    theListOfCommands[index] = command.replace(/^\s+/, '');
  });

  console.llog('builder: main', 'end');
  return [{
    condition: conditions.values.mainCondition(sessionId),
    child: buildRecursion(sessionId, listOfCommands, listOfLevels, variables)
  }];
};

let buildRecursion = exports.buildRecursion = function (sessionId, listOfCommands, listOfLevels, variables) {
  console.llog('builder: buildRecursion', 'begin');

  let components = require('../components');

  let toCompileIndexStart = 0;
  let parentOfParents = [];

  for (let i = 0; i < listOfLevels.length; i++) {
    let _parent = components.parent(listOfCommands, listOfLevels, i);
    let toCompile;
    if (i < listOfLevels.length - 1 && _parent !== false) {
      if (toCompileIndexStart !== _parent.index.previous) {
        toCompile = components.toCompile(sessionId, listOfCommands, variables, toCompileIndexStart, _parent.index.previous);
      } else {
        toCompile = [];
      }

      let conditionType = _parent.conditions.type.previous.substring(1);
      let conditionResult = conditions.conditionals['_' + conditionType](sessionId, listOfCommands, listOfLevels, _parent, variables);
      let parent = conditionResult.child;
      
      if (toCompile.length != 0) {
        parentOfParents.push({toCompile: toCompile});
      }

      parentOfParents.push({parent: parent});

      i += conditionResult.countOfCommands;
      toCompileIndexStart = i + 1;
    } else if (i >= listOfLevels.length - 1) {
      parentOfParents.push({
        toCompile: coder.splitToCompilableParts(sessionId, listOfCommands.slice(toCompileIndexStart), variables)
      });
    }
  }

  console.llog('builder: buildRecursion', 'end');
  return parentOfParents;
};

exports.nextParentIndexInitialize = function (listOfLevels, currentIndex) {
  console.llog('builder: nextParentIndexInitialize');

  let indexOfNext = listOfLevels.indexOf(listOfLevels[currentIndex], currentIndex + 1);
  let isNextParentExist = indexOfNext != -1;
  if (!isNextParentExist) {
    indexOfNext = listOfLevels.length;
  }

  return {
    value: indexOfNext,
    isNextParentExist: isNextParentExist
  };
};

let coder = require('../coder');
let setter = require('../../executer/setter');
let conditions = require('./conditions');