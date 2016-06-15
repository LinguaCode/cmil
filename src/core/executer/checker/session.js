exports.ended = function (sessionId) {
  var lastChildIndex = __store[sessionId].pathOfLocation.lastIndexOf('.');
  return lastChildIndex == -1;
};
