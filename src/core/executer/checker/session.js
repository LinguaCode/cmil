exports.ended = function (sessionId) {
  let lastChildIndex = __store[sessionId].pathOfLocation.lastIndexOf('.');
  return lastChildIndex == -1;
};
