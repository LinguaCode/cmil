let debug = require(' src/libs/debug');

let executions = require('../../database/constants').executions;

exports.parent = function (listOfCommands, listOfLevels, index) {

  //checks if parent has been identified or not, if not - exit, else continue the interpretation
  if (listOfLevels.length == 1 || listOfLevels[index] == listOfLevels[index + 1]) {
    return false;
  }

  //initializations of objects
  let parentIndexes = {};
  let parentConditionType = {};
  let parentConditionValue = {};

  //previous parent: START
  let parentIndexPrevious = index;
  let parentLine = listOfCommands[parentIndexPrevious];
  parentConditionType.previous = executions(parentLine, 'conditionType');
  parentConditionValue.previous = executions(parentLine, 'conditionValue');
  parentIndexes.previous = parentIndexPrevious;
  //previous parent: END

  //next parent: START
  let nextParentIndex = operations.nextParentIndexInitialize(listOfLevels, parentIndexPrevious);
  parentIndexes.next = nextParentIndex.value;
  let isNextParentExist = nextParentIndex.isNextParentExist;
  if (isNextParentExist) {
    let nextParentLine = listOfCommands[nextParentIndex.value];

    parentConditionType.next = executions(nextParentLine, 'conditionType');
    parentConditionValue.next = executions(nextParentLine, 'conditionValue');
  }
  //next parent: END

  //Concatenations
  let parentConditions = {
    type: parentConditionType,
    value: parentConditionValue
  };

  return {
    conditions: parentConditions,
    index: parentIndexes,

    isNextParentExist: isNextParentExist
  };
};

exports.child = function (listOfCommands, listOfLevels, parentIndex) {
  let contentIndexStart = parentIndex.previous + 1;
  let contentIndexEnd = parentIndex.next;

  let listOfCommandsOfTail = listOfCommands.slice(contentIndexStart, contentIndexEnd);

  let listOfLevelsOfTail = listOfLevels.slice(contentIndexStart, contentIndexEnd);

  return {
    listOfCommands: listOfCommandsOfTail,
    listOfLevels: listOfLevelsOfTail
  };
};

exports.toCompile = function (sessionId, listOfCommands, variables, indexStart, indexEnd) {
  let toCompileCommandsArr = listOfCommands.slice(indexStart, indexEnd);
  return coder.splitToCompilableParts(sessionId, toCompileCommandsArr, variables);
};

let coder = require('./coder');
let operations = require('./operations');
