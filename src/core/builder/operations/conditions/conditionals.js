let requiredDataGetter = function (requiredFileNameList) {
  console.llog('builder: _requiredDataGetter', 'begin');
  let paths = {
    components: '../../components',
    commands: '../../../../database/commands/variables',
    operations: '../../operations'
  };

  let requiredFileList = {};
  requiredFileNameList.forEach(function (fileName) {
    requiredFileList[fileName] = require(paths[fileName]);
  });

  console.llog('builder: _requiredDataGetter', 'end');
  return requiredFileList;
};

exports._if = function (sessionId, listOfCommands, listOfLevels, parent, variables) {
  console.llog('builder: _if', 'begin');
  
  let requiredFiles = requiredDataGetter(['components', 'commands', 'operations']);

  let _child = [];
  let previousParentIndex = parent.index.previous;
  let countOfCommands = 0;
  let parentOfIfCommand;
  let nextParentConditionType;
  do {
    parentOfIfCommand = requiredFiles.components.parent(listOfCommands, listOfLevels, previousParentIndex);
    let nextParentIndex = parentOfIfCommand.index.next;

    //start
    let content = requiredFiles.components.child(listOfCommands, listOfLevels, parentOfIfCommand.index);
    let _content = requiredFiles.operations.buildRecursion(sessionId, content.listOfCommands, content.listOfLevels, variables);
    let _condition = values.ifCondition(sessionId, parentOfIfCommand.conditions.value.previous);

    _child.push({
      type: 'if',
      condition: _condition,
      child: _content
    });
    //end

    previousParentIndex = nextParentIndex;

    countOfCommands += content.listOfCommands.length + 1;
    nextParentConditionType = parentOfIfCommand.conditions.type.next;

  } while (parentOfIfCommand.isNextParentExist && (nextParentConditionType == requiredFiles.commands.else || nextParentConditionType == requiredFiles.commands.elif));

  countOfCommands--;
  
  console.llog('builder: _if', 'end');
  return {
    child: _child,
    countOfCommands: countOfCommands
  };
};

exports._repeat = function (sessionId, listOfCommands, listOfLevels, parent, variables) {
  console.llog('builder: _repeat', 'begin');
  
  let requiredFiles = requiredDataGetter(['components', 'operations']);

  let content = requiredFiles.components.child(listOfCommands, listOfLevels, parent.index);
  let _content = requiredFiles.operations.buildRecursion(sessionId, content.listOfCommands, content.listOfLevels, variables);
  let _condition = values.repeatCondition(sessionId, parent.conditions.value.previous);
  let _child = [{
    type: 'repeat',
    condition: _condition,
    child: _content
  }];

  let countOfCommands = content.listOfCommands.length;

  console.llog('builder: _repeat', 'end');
  return {
    child: _child,
    countOfCommands: countOfCommands
  };
};

exports._do = function (sessionId, listOfCommands, listOfLevels, parent, variables) {
  console.llog('builder: _do', 'begin');
  
  let requiredFiles = requiredDataGetter(['components', 'operations']);

  let content = requiredFiles.components.child(listOfCommands, listOfLevels, parent.index);
  let _content = requiredFiles.operations.buildRecursion(sessionId, content.listOfCommands, content.listOfLevels, variables);
  let _condition = values.doCondition(sessionId, parent.conditions.value.next);
  let _child = [{
    type: 'whileDo',
    condition: _condition,
    child: _content
  }];

  let countOfCommands = content.listOfCommands.length + 1;

  console.llog('builder: _do', 'end');
  return {
    type: 'do',
    child: _child,
    countOfCommands: countOfCommands
  };
};

exports._while = function (sessionId, listOfCommands, listOfLevels, parent, variables) {
  console.llog('builder: _while', 'begin');
  
  let requiredFiles = requiredDataGetter(['components', 'operations']);

  let content = requiredFiles.components.child(listOfCommands, listOfLevels, parent.index);
  let _content = requiredFiles.operations.buildRecursion(sessionId, content.listOfCommands, content.listOfLevels, variables);
  let _condition = parent.conditions.value.previous;
  let _child = [{
    type: 'while',
    condition: _condition,
    child: _content
  }];

  let countOfCommands = content.listOfCommands.length;

  console.llog('builder: _while', 'end');
  return {
    child: _child,
    countOfCommands: countOfCommands
  };
};

let values = require('./values');