/**
 * This Module prepares the sourceCode to make be ready to be compiled.
 * @requires uglify:execute
 * @requires tools:isPartOfCode
 * @requires code:toCode
 */

let tools = require('../../libs/tools');
let uglify = require('./uglify');
let code = require('./code');

/**
 * Changes sourceCode into a lower case, except String type texts.
 *
 * @example
 * modify.codeNotSensitive('Output "Hello World"\n\n');
 * // returns 'output "Hello World"\n'
 *
 * @param {String} sourceCode
 * @returns {String} Returns lower cased sourceCode, except String type texts.
 */
exports.codeNotSensitive = function (sourceCode) {
  for (let i = 0; i < sourceCode.length; i++) {
    if (tools.isPartOfCode(sourceCode, i)) {
      sourceCode = sourceCode.substring(0, i) + sourceCode[i].toLowerCase() + sourceCode.substring(i + 1);
    }
  }
  return sourceCode;
};

/**
 * Returns modified sourceCode via this pipeline:
 * - uglify.execute
 * - code.toCode
 * - this.codeNotSensitive
 *
 * @example
 * modify.execute('Output "Hello World"\n\n', 'en');
 * // returns 'output "Hello World"\n'
 *
 * @param {String} sourceCode
 * @param {String} language - type: ISO 639-1.
 * @returns {String} Returns modified sourceCode via this pipeline:
 * - uglify.execute
 * - code.toCode
 * - this.codeNotSensitive
 */
exports.execute = function (sourceCode, language) {
  let uglifiedSourceCode = uglify.execute(sourceCode);
  let convertedSourceCode = code.toCode(uglifiedSourceCode, language);
  return this.codeNotSensitive(convertedSourceCode);
};
