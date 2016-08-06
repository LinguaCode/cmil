exports.parentObject = sessionId => {
  let pathOfLocation = location(sessionId);

  let pathOfParent = pathOfLocation.lastIndexOf('[');

  return pathOfLocation.substring(0, pathOfParent);
};

let location = exports.location = sessionId => {
  return __store[sessionId].pathOfLocation;
};
