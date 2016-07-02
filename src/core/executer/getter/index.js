let path = require('./path');
let value = require('./value');

module.exports = {
  //paths
  parentObjectPath: path.operations.parentObject,
  pathOfLocation: path.location,

  //values
  object: value.structure.object,
  operations: value.structure.operations,
  firstKeyOfObject: value.structure.firstKeyOfObject,
  limitOfArray: value.structure.limit,
  inputVariable: value.structure.inputVariable,
  condition: value.structure.condition,
  conditionType: value.structure.conditionType,

  nameOfProperty: value.nameOfProperty,
  index: value.index,
  variables: value.variables
};

