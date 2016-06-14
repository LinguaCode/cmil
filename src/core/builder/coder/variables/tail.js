/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license GPLv3
 */

exports.concat = function (sourceCode) {
  return ' ' + sourceCode + ' ';
};

exports.cut = function (sourceCode) {
  return sourceCode.replace(/^\s+/, '').replace(/\s+$/, '');
};