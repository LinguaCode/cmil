let moment = require('moment');

exports.ended = function (sessionId) {
  let lastChildIndex = __store[sessionId].pathOfLocation.lastIndexOf('.');
  return lastChildIndex == -1;
};

exports.expired = function (sessionId) {
  let sessionTime = moment(getter.sessionTime(sessionId));
  let now = moment();
  let timeDifferenceBySeconds = now.diff(sessionTime);
  if (timeDifferenceBySeconds > 666) {
    return true;
  }
};

let getter = require('../getter');