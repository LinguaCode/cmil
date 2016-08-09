const COMMAND = require('../../constants').COMMAND;

const coder = require('./coder');

const operations = require('./operations');

const executions = (source, constant) => {
  const regexp = new RegExp(constant);
  let result = regexp.exec(source);

  if (!result) {
    return true;
  }

  if (constant == COMMAND.CONDITION_VALUE) {
    const regValueOfConditionRepeatTimes = new RegExp(COMMAND.CONDITION_OF_REPEAT_TIMES_VALUE);
    const resultOfValueOfConditionRepeatTimes = regValueOfConditionRepeatTimes.exec(result[2]);
    result = resultOfValueOfConditionRepeatTimes ? resultOfValueOfConditionRepeatTimes[1] : result[2];
  } else {
    result = result[1];
  }

  return result.replace(/\s+$/, '');
};

exports.parent = (listOfCommands, listOfLevels, index) => {
  console.llog('builder: parent', 'begin');

  //checks if parent has been identified or not, if not - exit, else continue the interpretation
  if (listOfLevels.length === 1 || listOfLevels[index] === listOfLevels[index + 1]) {
    console.llog('builder: parent', 'end');
    return false;
  }

  //initializations of objects
  let parentIndexes = {};
  let parentConditionType = {};
  let parentConditionValue = {};

  //previous parent: START
  let parentIndexPrevious = index;
  let parentLine = listOfCommands[parentIndexPrevious];
  parentConditionType.previous = executions(parentLine, COMMAND.CONDITION_TYPE);
  parentConditionValue.previous = executions(parentLine, COMMAND.CONDITION_VALUE);
  parentIndexes.previous = parentIndexPrevious;
  //previous parent: END

  //next parent: START
  let nextParentIndex = operations.nextParentIndexInitialize(listOfLevels, parentIndexPrevious);
  parentIndexes.next = nextParentIndex.value;
  let isNextParentExist = nextParentIndex.isNextParentExist;
  if (isNextParentExist) {
    let nextParentLine = listOfCommands[nextParentIndex.value];

    parentConditionType.next = executions(nextParentLine, COMMAND.CONDITION_TYPE);
    parentConditionValue.next = executions(nextParentLine, COMMAND.CONDITION_VALUE);
  }
  //next parent: END

  //Concatenations
  let parentConditions = {
    type: parentConditionType,
    value: parentConditionValue
  };

  console.llog('builder: parent', 'end');
  return {
    conditions: parentConditions,
    index: parentIndexes,

    isNextParentExist: isNextParentExist
  };
};

exports.child = (listOfCommands, listOfLevels, parentIndex) => {
  console.llog('builder: child', 'begin');

  const contentIndexStart = parentIndex.previous + 1;
  const contentIndexEnd = parentIndex.next;

  const listOfCommandsOfTail = listOfCommands.slice(contentIndexStart, contentIndexEnd);

  const listOfLevelsOfTail = listOfLevels.slice(contentIndexStart, contentIndexEnd);

  console.llog('builder: child', 'end');
  return {
    listOfCommands: listOfCommandsOfTail,
    listOfLevels: listOfLevelsOfTail
  };
};

exports.toCompile = (sessionId, listOfCommands, variables, indexStart, indexEnd) => {
  console.llog('builder: toCompile');
  const toCompileCommandsArr = listOfCommands.slice(indexStart, indexEnd);
  return coder.splitToCompilableParts(sessionId, toCompileCommandsArr, variables);
};
