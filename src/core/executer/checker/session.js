let moment = require('moment');

const status = {
  success: 'success',
  waitsForInput: 'waitsForInput',
  timeout: 'timeout'
};

var isPathOfLocationEndedCheck = exports.pathOfLocationEnded = function (sessionId) {
  let pathOfLocation = __store[sessionId].pathOfLocation;
  let lastChildIndex = pathOfLocation.indexOf('.');
  return lastChildIndex == -1;
};

exports.ended = function (sessionId) {
  let output = getter.output(sessionId);
  let outputStatus = output.status;
  let is = {
    pathOfLocationEnded: isPathOfLocationEndedCheck(sessionId),
    expired: isExpiredCheck(sessionId),
    errorOccurred: isErrorOccurredCheck(outputStatus),
  };

  for (var key in is) {
    if (is[key] == true) {
      return true;
    }
  }

  return false;
};

let isErrorOccurredCheck = function (outputStatus) {
  let isErrorOccurred = true;
  for (var key in status) {
    if (outputStatus == status[key]) {
      isErrorOccurred = false;
      break;
    }
  }

  return isErrorOccurred;
};

var isExpiredCheck = exports.expired = function (sessionId) {
  let sessionTime = moment(getter.sessionTime(sessionId));
  let now = moment();
  let timeDifferenceBySeconds = now.diff(sessionTime);
  if (/*timeDifferenceBySeconds > 666*/false) {
    return true;
  }

  return false;
};

let getter = require('../getter');
