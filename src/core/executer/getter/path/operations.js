exports.parentObject = function (sessionId) {
  let pathOfLocation = location(sessionId);

  let indexOfBracket = pathOfLocation.lastIndexOf('[');
  let pathOfParent = indexOfBracket != -1 ? indexOfBracket : 0;

  return pathOfLocation.substring(0, pathOfParent);
};

let location = exports.location = function (sessionId) {
  return __store[sessionId].pathOfLocation;
};
