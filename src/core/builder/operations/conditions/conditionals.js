var requiredDataGetter = function (requiredFileNameList) {
  var paths = {
    components: '../../components',
    commands: '../../../../database/commands/variables',
    operations: '../../operations'
  };

  var requiredFileList = {};
  requiredFileNameList.forEach(function (fileName) {
    requiredFileList[fileName] = require(paths[fileName]);
  });

  return requiredFileList;
};

exports._if = function (sessionId, listOfCommands, listOfLevels, parent, variables) {
  var requiredFiles = requiredDataGetter(['components', 'commands', 'operations']);

  var _child = [];
  var previousParentIndex = parent.index.previous;
  var countOfCommands = 0;
  do {
    var parentOfIfCommand = requiredFiles.components.parent(listOfCommands, listOfLevels, previousParentIndex);
    var nextParentIndex = parentOfIfCommand.index.next;

    //start
    var content = requiredFiles.components.child(listOfCommands, listOfLevels, parentOfIfCommand.index);
    var _content = requiredFiles.operations.buildRecursion(sessionId, content.listOfCommands, content.listOfLevels, variables);
    var _condition = values.ifCondition(sessionId, parentOfIfCommand.conditions.value.previous);

    _child.push({
      type: 'if',
      condition: _condition,
      child: _content
    });
    //end

    previousParentIndex = nextParentIndex;

    countOfCommands += content.listOfCommands.length + 1;
    var nextParentConditionType = parentOfIfCommand.conditions.type.next;

  } while (parentOfIfCommand.isNextParentExist && (nextParentConditionType == requiredFiles.commands.else || nextParentConditionType == requiredFiles.commands.elif));

  countOfCommands--;

  return {
    child: _child,
    countOfCommands: countOfCommands
  };
};

exports._repeat = function (sessionId, listOfCommands, listOfLevels, parent, variables) {
  var requiredFiles = requiredDataGetter(['components', 'operations']);

  var content = requiredFiles.components.child(listOfCommands, listOfLevels, parent.index);
  var _content = requiredFiles.operations.buildRecursion(sessionId, content.listOfCommands, content.listOfLevels, variables);
  var _condition = values.repeatCondition(sessionId, parent.conditions.value.previous);
  var _child = [{
    type: 'repeat',
    condition: _condition,
    child: _content
  }];

  var countOfCommands = content.listOfCommands.length;

  return {
    child: _child,
    countOfCommands: countOfCommands
  };
};

exports._do = function (sessionId, listOfCommands, listOfLevels, parent, variables) {
  var requiredFiles = requiredDataGetter(['components', 'operations']);

  var content = requiredFiles.components.child(listOfCommands, listOfLevels, parent.index);
  var _content = requiredFiles.operations.buildRecursion(sessionId, content.listOfCommands, content.listOfLevels, variables);
  var _condition = values.doCondition(sessionId, parent.conditions.value.next);
  var _child = [{
    type: 'whileDo',
    condition: _condition,
    child: _content
  }];

  var countOfCommands = content.listOfCommands.length + 1;

  return {
    type: 'do',
    child: _child,
    countOfCommands: countOfCommands
  };
};

exports._while = function (sessionId, listOfCommands, listOfLevels, parent, variables) {
  var requiredFiles = requiredDataGetter(['components', 'operations']);

  var content = requiredFiles.components.child(listOfCommands, listOfLevels, parent.index);
  var _content = requiredFiles.operations.buildRecursion(sessionId, content.listOfCommands, content.listOfLevels, variables);
  var _condition = parent.conditions.value.previous;
  var _child = [{
    type: 'while',
    condition: _condition,
    child: _content
  }];

  var countOfCommands = content.listOfCommands.length;

  return {
    child: _child,
    countOfCommands: countOfCommands
  };
};

var values = require('./values');