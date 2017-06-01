/**
 * Increment the index of the element of the pathOfLocation.
 * */
exports.indexIncrement = sessionId => __store[sessionId].pathOfLocation = `${getter.parentObjectPath(sessionId)}[${getter.index(sessionId) + 1}]`;

/**
 * Upgrade the pathOfLocation.
 * */
exports.upgrade = (sessionId, typeOfInnerObject) => __store[sessionId].pathOfLocation += `.${typeOfInnerObject}[0]`;

/**
 * Downgrade the pathOfLocation.
 * */
exports.downgrade = sessionId => {
  let lastObjectIndex = getter.pathOfLocation(sessionId).lastIndexOf('.');
  __store[sessionId].pathOfLocation = getter.pathOfLocation(sessionId).substring(0, lastObjectIndex);
};

/**
 * Sets the last output.
 * All outputs in once.
 * */
exports.output = function (sessionId, status, output) {
  if (status === 'success' && output) {
    __store[sessionId].output += `${output}\n`;
  }

  __store[sessionId].status = status;
};

/**
 * Initialize the session time start.
 * Use case: to check for timeout.
 * */
exports.sessionTime = sessionId => __store[sessionId].sessionTime = new Date();

/**
 * Sets session language.
 * Standard: ISO 639-1.
 * */

exports.data = (sessionId, data) => {
  for (let key in data) {
    __store[sessionId][key] = data[key];
  }
};

let getter = require('../getter');