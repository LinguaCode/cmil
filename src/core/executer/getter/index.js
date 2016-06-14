/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license GPLv3
 */

var path = require('./path');
var value = exports.value = require('./value');

//paths
exports.parentObjectPath = path.operations.parentObject;
exports.pathOfLocation = path.location;

//values
exports.object = value.structure.object;
exports.operations = value.structure.operations;
exports.firstKeyOfObject = value.structure.firstKeyOfObject;
exports.limitOfArray = value.structure.limit;
exports.inputVariable = value.structure.inputVariable;
exports.condition = value.structure.condition;
exports.conditionType = value.structure.conditionType;

exports.nameOfProperty = value.nameOfProperty;
exports.index = value.index;