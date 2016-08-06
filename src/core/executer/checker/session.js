let moment = require('moment');
const constants = require('../../../constants');
const STATUS = constants.STATUS;

var isPathOfLocationEndedCheck = exports.pathOfLocationEnded = sessionId => {
  let pathOfLocation = __store[sessionId].pathOfLocation;
  let lastChildIndex = pathOfLocation.indexOf('.');
  return lastChildIndex == -1;
};

exports.ended = sessionId => {
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
  for (var key in STATUS) {
    if (outputStatus == STATUS[key]) {
      isErrorOccurred = false;
      break;
    }
  }

  return isErrorOccurred;
};

var isExpiredCheck = exports.expired = sessionId => {
  let sessionTime = moment(getter.sessionTime(sessionId));
  let now = moment();
  let timeDifferenceBySeconds = now.diff(sessionTime);
  const timeOutCondition = !process.env.TIMEOUT_IGNORE ?
  timeDifferenceBySeconds > constants.TIMEOUT_TIME : false;

  return timeOutCondition;
};

let getter = require('../getter');
