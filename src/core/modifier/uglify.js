/**
 * Converting the user written sourceCode into a LinguaCode's understandable sourceCode.
 *
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license GPLv3
 */

/**
 * Converts Windows standardized CR-LF format text into a Unix standardized LF format text.
 * @see {@link https://en.wikipedia.org/wiki/Newline|NewLine}
 *
 * @example
 * uglify.unixStandardize('output "Hello World"\r\n');
 * // returns 'output "Hello World"\n'
 *
 * @param {String} sourceCode
 * @returns {String} Returns Unix standardized CR format text.
 */
exports.unixStandardize = function (sourceCode) {
  return sourceCode.replace(/\r/g, '');
};

/**
 * Removes duplicated \n (new line) symbols.
 *
 * @example
 * uglify.codeCorrect('output "Hello World"\n\n');
 * // returns 'output "Hello World"\n'
 *
 * @param {String} sourceCode
 * @returns {String} Returns the same text, via removing duplicated \n (new line) symbols.
 */
exports.codeCorrect = function (sourceCode) {
  return sourceCode.replace(/[\n]{2,}/g, '\n');
};

/**
 * Removes all commented lines.
 *
 * @example
 * uglify.codeUnComment('output "Hello World"\n# this is comment line\n');
 * // returns 'output "Hello World"\n'
 *
 * @param {String} sourceCode
 * @returns {String} Returns the same text, via removing commented lines.
 */
exports.codeUnComment = function (sourceCode) {
  return sourceCode.replace(/#.*/g, '');
};

/**
 * Returns formatted sourceCode with via this pipeline:
 * - uglify.unixStandardize
 * - uglify.codeCorrect
 * - uglify.codeUnComment
 *
 * @example
 * uglify.execute('output "Hello World"\r\n\n# this is comment line\r\n\n\n\n\n');
 * // returns 'output "Hello World"\n'
 *
 * @param {String} sourceCode
 * @returns {String} Returns formatted sourceCode with via this pipeline:
 * - uglify.unixStandardize
 * - uglify.codeCorrect
 * - uglify.codeUnComment
 */
exports.execute = function (sourceCode) {
  sourceCode = this.unixStandardize(sourceCode);
  sourceCode = this.codeCorrect(sourceCode);
  sourceCode = this.codeUnComment(sourceCode);
  return sourceCode;
};