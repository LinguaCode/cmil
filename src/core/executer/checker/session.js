/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license GPLv3
 */

exports.ended = function (sessionId) {
  var lastChildIndex = __store[sessionId].pathOfLocation.lastIndexOf('.');
  return lastChildIndex == -1;
};
