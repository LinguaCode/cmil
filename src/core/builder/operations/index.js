const tools = require('../../../libs/tools');

const coder = require('../coder');
const setter = require('../../executer/setter');
const conditions = require('./conditions');
const components = require('../components');

exports.execute = (sessionId, sourceCode) => {
  console.llog('builder: main', 'begin');

  let variables = coder.variables._get(sourceCode);
  setter.data(sessionId, {variables});

  let varToObj = coder.variables.variablesToObjectChild(sessionId, sourceCode, variables);
  let listOfCommands = varToObj.split('\n');
  let listOfLevels = tools.codeDepthLevels.all(listOfCommands);
  listOfCommands = listOfCommands.map(command => command.replace(/^\s+/, ''));

  console.llog('builder: main', 'end');
  return [{
    condition: conditions.values.mainCondition(sessionId),
    child: exports.buildRecursion(sessionId, listOfCommands, listOfLevels, variables)
  }];
};

exports.buildRecursion = (sessionId, listOfCommands, listOfLevels, variables) => {
  console.llog('builder: buildRecursion', 'begin');

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

      //TODO: test: remove it
      if (!_parent.conditions.type.previous.substring) {
        throw new Error(sessionId);
      }

      let conditionType = _parent.conditions.type.previous.substring(1);
      let conditionResult = conditions.conditionals[`_${conditionType}`](sessionId, listOfCommands, listOfLevels, _parent, variables);
      let parent = conditionResult.child;

      if (toCompile.length) {
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

exports.nextParentIndexInitialize = (listOfLevels, currentIndex) => {
  console.llog('builder: nextParentIndexInitialize');

  let indexOfNext = listOfLevels.indexOf(listOfLevels[currentIndex], currentIndex + 1);
  const isNextParentExist = indexOfNext != -1;

  if (!isNextParentExist) {
    indexOfNext = listOfLevels.length;
  }

  return {
    value: indexOfNext,
    isNextParentExist: isNextParentExist
  };
};