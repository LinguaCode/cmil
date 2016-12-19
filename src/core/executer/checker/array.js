const getter = require('../getter');

exports.ended = sessionId => getter.index(sessionId) >= getter.limitOfArray(sessionId);