const COMMAND = require('linguacode-constants').COMMAND;
const components = require('../../components');
const operations = require('../../operations');

const values = require('./values');

exports._if = (sessionId, listOfCommands, listOfLevels, parent, variables) => {
  console.llog('builder: _if', 'begin');

  let _child = [];
  let previousParentIndex = parent.index.previous;
  let countOfCommands = 0;
  let parentOfIfCommand;
  let nextParentConditionType;
  do {
    parentOfIfCommand = components.parent(listOfCommands, listOfLevels, previousParentIndex);
    let nextParentIndex = parentOfIfCommand.index.next;

    //start
    const content = components.child(listOfCommands, listOfLevels, parentOfIfCommand.index);
    const _content = operations.buildRecursion(sessionId, content.listOfCommands, content.listOfLevels, variables);
    const _condition = values.ifCondition(sessionId, parentOfIfCommand.conditions.value.previous);

    _child.push({
      type: 'if',
      condition: _condition,
      child: _content
    });
    //end

    previousParentIndex = nextParentIndex;

    countOfCommands += content.listOfCommands.length + 1;
    nextParentConditionType = parentOfIfCommand.conditions.type.next;

  } while (parentOfIfCommand.isNextParentExist && (nextParentConditionType == COMMAND.ELSE || nextParentConditionType == COMMAND.ELIF));

  countOfCommands--;

  console.llog('builder: _if', 'end');
  return {
    child: _child,
    countOfCommands: countOfCommands
  };
};

exports._repeat = (sessionId, listOfCommands, listOfLevels, parent, variables) => {
  console.llog('builder: _repeat', 'begin');

  const content = components.child(listOfCommands, listOfLevels, parent.index);
  const _content = operations.buildRecursion(sessionId, content.listOfCommands, content.listOfLevels, variables);
  const _condition = values.repeatCondition(sessionId, parent.conditions.value.previous);
  const _child = [{
    type: 'repeat',
    condition: _condition,
    child: _content
  }];

  const countOfCommands = content.listOfCommands.length;

  console.llog('builder: _repeat', 'end');
  return {
    child: _child,
    countOfCommands: countOfCommands
  };
};

exports._do = (sessionId, listOfCommands, listOfLevels, parent, variables) => {
  console.llog('builder: _do', 'begin');

  const content = components.child(listOfCommands, listOfLevels, parent.index);
  const _content = operations.buildRecursion(sessionId, content.listOfCommands, content.listOfLevels, variables);
  const _condition = values.doCondition(sessionId, parent.conditions.value.next);
  const _child = [{
    type: 'whileDo',
    condition: _condition,
    child: _content
  }];

  const countOfCommands = content.listOfCommands.length + 1;

  console.llog('builder: _do', 'end');
  return {
    type: 'do',
    child: _child,
    countOfCommands: countOfCommands
  };
};

exports._while = (sessionId, listOfCommands, listOfLevels, parent, variables) => {
  console.llog('builder: _while', 'begin');

  const content = components.child(listOfCommands, listOfLevels, parent.index);
  const _content = operations.buildRecursion(sessionId, content.listOfCommands, content.listOfLevels, variables);
  const _condition = parent.conditions.value.previous;
  const _child = [{
    type: 'while',
    condition: _condition,
    child: _content
  }];

  const countOfCommands = content.listOfCommands.length;

  console.llog('builder: _while', 'end');
  return {
    child: _child,
    countOfCommands: countOfCommands
  };
};