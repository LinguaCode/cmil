exports.ended = sessionId => {
  return getter.index(sessionId) >= getter.limitOfArray(sessionId);
};

exports.empty = sessionId => {
  return getter.limitOfArray(sessionId) == 0;
};

let getter = require('../getter');
