exports.end = function (sessionId) {
  //TODO: fix: delete this variables
  //delete GLOBAL[sessionId];
  //delete __store[sessionId];

  console.llog('compiler: Socket.IO: server: Session closed.');
};