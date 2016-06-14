/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license GPLv3
 */

exports.ended = function (sessionId) {
  return getter.index(sessionId) >= getter.limitOfArray(sessionId);
};

exports.empty = function (sessionId) {
  return getter.limitOfArray(sessionId) == 0;
};

var getter = require('../getter');
