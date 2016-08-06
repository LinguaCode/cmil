const moment = require('moment');
const constants = require('../../../constants');
const getter = require('../getter');
const STATUS = constants.STATUS;

const isErrorOccurredCheck = outputStatus => {
  let isErrorOccurred = true;
  for (var key in STATUS) {
    if (outputStatus == STATUS[key]) {
      isErrorOccurred = false;
      break;
    }
  }

  return isErrorOccurred;
};

exports.pathOfLocationEnded = sessionId => {
  const pathOfLocation = __store[sessionId].pathOfLocation;
  const lastChildIndex = pathOfLocation.indexOf('.');
  return lastChildIndex == -1;
};

exports.ended = sessionId => {
  const output = getter.output(sessionId);
  const outputStatus = output.status;
  const is = {
    pathOfLocationEnded: exports.pathOfLocationEnded(sessionId),
    expired: exports.expired(sessionId),
    errorOccurred: isErrorOccurredCheck(outputStatus),
  };

  for (var key in is) {
    if (is[key] == true) {
      return true;
    }
  }

  return false;
};

exports.expired = sessionId => {
  const sessionTime = moment(getter.sessionTime(sessionId));
  const now = moment();
  const timeDifferenceBySeconds = now.diff(sessionTime);
  const timeOutCondition = !process.env.TIMEOUT_IGNORE ?
  timeDifferenceBySeconds > constants.TIMEOUT_TIME : false;

  return timeOutCondition;
};
