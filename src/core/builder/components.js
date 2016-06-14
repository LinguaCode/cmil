/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license GPLv3
 */

var executions = require('../../database/constants').executions;

exports.parent = function (listOfCommands, listOfLevels, index) {

  //checks if parent has been identified or not, if not - exit, else continue the interpretation
  if (listOfLevels.length == 1 || listOfLevels[index] == listOfLevels[index + 1]) {
    return false;
  }

  //initializations of objects
  var parentIndexes = {};
  var parentConditionType = {};
  var parentConditionValue = {};

  //previous parent: START
  var parentIndexPrevious = index;
  var parentLine = listOfCommands[parentIndexPrevious];
  parentConditionType.previous = executions(parentLine, 'conditionType');
  parentConditionValue.previous = executions(parentLine, 'conditionValue');
  parentIndexes.previous = parentIndexPrevious;
  //previous parent: END

  //next parent: START
  var nextParentIndex = operations.nextParentIndexInitialize(listOfLevels, parentIndexPrevious);
  parentIndexes.next = nextParentIndex.value;
  var isNextParentExist = nextParentIndex.isNextParentExist;
  if (isNextParentExist) {
    var nextParentLine = listOfCommands[nextParentIndex.value];

    parentConditionType.next = executions(nextParentLine, 'conditionType');
    parentConditionValue.next = executions(nextParentLine, 'conditionValue');
  }
  //next parent: END

  //Concatenations
  var parentConditions = {
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
  var contentIndexStart = parentIndex.previous + 1;
  var contentIndexEnd = parentIndex.next;

  var listOfCommandsOfTail = listOfCommands.slice(contentIndexStart, contentIndexEnd);

  var listOfLevelsOfTail = listOfLevels.slice(contentIndexStart, contentIndexEnd);

  return {
    listOfCommands: listOfCommandsOfTail,
    listOfLevels: listOfLevelsOfTail
  };
};

exports.toCompile = function (sessionId, listOfCommands, variables, indexStart, indexEnd) {
  var toCompileCommandsArr = listOfCommands.slice(indexStart, indexEnd);
  return coder.splitToCompilableParts(sessionId, toCompileCommandsArr, variables);
};

var coder = require('./coder');
var operations = require('./operations');
