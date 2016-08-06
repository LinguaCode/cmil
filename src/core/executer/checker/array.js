const getter = require('../getter');

exports.ended = sessionId => getter.index(sessionId) >= getter.limitOfArray(sessionId);

exports.empty = sessionId => getter.limitOfArray(sessionId) == 0;