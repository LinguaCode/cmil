/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license Apache-2.0
 */

exports.ended = function (sessionId) {
  var lastChildIndex = __store[sessionId].pathOfLocation.lastIndexOf('.');
  return lastChildIndex == -1;
};
