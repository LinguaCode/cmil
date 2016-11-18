/**
 * This Module prepares the sourceCode to make be ready to be compiled.
 * @requires uglify:execute
 * @requires tools:isPartOfCode
 * @requires code:toCode
 */

const tools = require('../../libs/tools');
const uglify = require('./uglify');
const code = require('./code');

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
exports.codeNotSensitive = sourceCode => {
  sourceCode = sourceCode
    .split('\n')
    .map((line) => {
      for (let i = 0; i < line.length; i++) {
        if (tools.isPartOfCode(line, i)) {
          line = line.substring(0, i) + line[i].toLowerCase() + line.substring(i + 1);
        }
      }

      return line
    })
    .join('\n');

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
exports.execute = (sourceCode, language) => {
  console.llog('modify: main');
  const uglifiedSourceCode = uglify.execute(sourceCode);
  const convertedSourceCode = code.toCode(uglifiedSourceCode, language);

  return this.codeNotSensitive(convertedSourceCode);
};
