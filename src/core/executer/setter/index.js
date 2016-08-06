/**
 * Increment the index of the element of the pathOfLocation.
 * */
exports.indexIncrement = function (sessionId) {
  __store[sessionId].pathOfLocation = `${getter.parentObjectPath(sessionId)}[${getter.index(sessionId) + 1}]`;
};

/**
 * Upgrade the pathOfLocation.
 * */
exports.upgrade = function (sessionId, typeOfInnerObject) {
  __store[sessionId].pathOfLocation += `.${typeOfInnerObject}[0]`;
};

/**
 * Downgrade the pathOfLocation.
 * */
exports.downgrade = function (sessionId) {
  let lastObjectIndex = getter.pathOfLocation(sessionId).lastIndexOf('.');
  __store[sessionId].pathOfLocation = getter.pathOfLocation(sessionId).substring(0, lastObjectIndex);
};

/**
 * Sets the last output.
 * All outputs in once.
 * */
exports.output = function (sessionId, status, output) {
  if (status == 'success' && output) {
    __store[sessionId].output += `${output}\n`;
  }

  __store[sessionId].status = status;
};

/**
 * Sets list of variables for current application.
 * Use case: to check for undefined variable.
 * */
exports.variables = function (sessionId, variables) {
  __store[sessionId].variables = variables;
};

/**
 * Initialize the session time start.
 * Use case: to check for timeout.
 * */
exports.sessionTime = function (sessionId) {
  __store[sessionId].time = new Date();
};

/**
 * Sets input text.
 * Input text receives from client.
 * */
exports.input = function (sessionId, input) {
  __store[sessionId].input = input;
};

let getter = require('../getter');