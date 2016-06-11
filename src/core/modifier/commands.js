/**
 * This Module prepares the sourceCode to make be ready to be compiled.
 * @requires store:io
 * @requires keys:yandexTranslate
 * @requires module/yandexTranslate
 * @requires database/commands:listOfCommandGroups
 * @requires database/connection
 * @requires uglify:unixStandardize
 *
 *
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license Apache-2.0
 */

var yandexTranslateKey = require('../../config/config').yandexTranslate;
var yandexTranslate = require('yandex-translate-api')(yandexTranslateKey);
var listOfCommandGroups = require('../../database/commands/groups');
var database = require('../../database/connection');
var uglify = require('./uglify');

/**
 * Group all translated commands to send to client for correct syntax highlight.
 *
 * @example
 * modify.groupAllTranslations('en');
 * // returns [
 *    [output, input]
 *    [break, continue]
 *    [if, else, for, while, do]
 *    ...
 * ]
 *
 * @param {String} language - type: ISO 639-1.
 * @returns {Array} Returns group the all of translated commands.
 */
exports.groupAllTranslations = function (language) {
  return listOfCommandGroups.map(function (commandGroup) {
    var convertedCommandGroup = [];
    database.translations[language].forEach(function (translation) {
      if (commandGroup.indexOf(translation.which) != -1) {
        convertedCommandGroup.push(translation.toWhat);
      }
    });

    return convertedCommandGroup;
  });
};

/**
 * Group all translated commands to send to client for correct syntax highlight.
 *
 * @example
 * modify.codeNotSensitive('en');
 * // returns [
 *    [output, input]
 *    [break, continue]
 *    [if, else, for, while, do]
 *    ...
 * ]
 *
 * @param {String} sourceCode
 * @returns {Array} Returns group the all of translated commands.
 */
exports.prepareToTranslate = function (sourceCode) {
  var unixStandardizedSourceCode = uglify.unixStandardize(sourceCode);
  var reArray, reStr;
  var listOfToTranslate = [];
  //text
  reArray = [
    /#(.*)\n/g,
    /'([^\n']+)'/g
  ];
  reArray.forEach(function (re) {
    while ((reStr = re.exec(unixStandardizedSourceCode)) !== null) {
      listOfToTranslate.push(reStr[1]);
    }
  });
  return listOfToTranslate;
};

exports.translate = function (sessionId, language) {
  var _this = this;
  //noinspection JSUnresolvedFunction
  yandexTranslate.translate(
    __translator[sessionId].from[__translator[sessionId].index], {to: language},
    function (err, translation) {
      if (__translator[sessionId].index !== __translator[sessionId].from.length) {
        var index1 = __translator[sessionId].input.indexOf(__translator[sessionId].from[__translator[sessionId].index]);
        var index2 = index1 + __translator[sessionId].from[__translator[sessionId].index].length;
        __translator[sessionId].input = __translator[sessionId].input.substring(0, index1) + translation.text[0] + __translator[sessionId].input.substring(index2);
        __translator[sessionId].index++;
        _this.translate(sessionId, language);
      } else {
        __io.emit(sessionId + '_' + 'languageNewSuccess', __translator[sessionId].input);
      }
    });
};