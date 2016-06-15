exports.index = function (sessionId) {
  var pathOfLocation = path.location(sessionId);
  var indexOfBracketBegin = pathOfLocation.lastIndexOf('[') + 1;
  var indexOfBracketEnd = pathOfLocation.lastIndexOf(']');
  var index = pathOfLocation.substring(indexOfBracketBegin, indexOfBracketEnd);
  return parseInt(index);
};

exports.nameOfProperty = function (sessionId) {
  var pathOfLocation = path.location(sessionId);
  if (pathOfLocation[pathOfLocation.length - 1] == ']') {
    var indexOfTypeEnd = pathOfLocation.lastIndexOf('[');
    var indexOfTypeBegin = pathOfLocation.lastIndexOf('.', indexOfTypeEnd) + 1;
    return pathOfLocation.substring(indexOfTypeBegin, indexOfTypeEnd);
  } else {
    return '';
  }
};

var path = require('../path');
exports.structure = require('./structure');