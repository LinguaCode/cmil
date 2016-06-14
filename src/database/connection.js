/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license GPLv3
 */

var fs = require('fs');

/**
 * Database of translations.
 * exports.tutorials();
 * @returns {Object} Returns the database of translations.
 */
var translations = {};
var pathOfTranslation = require('path').join(__dirname, './translations/');
fs.readdirSync(pathOfTranslation).forEach(function (file) {
  var fileName = file.substring(0, file.indexOf('.'));
  translations[fileName] = require('./translations/' + file);
});
exports.translations = translations;

/**
 * Database of languages.
 * exports.tutorials();
 * @returns {Object} Returns the database of languages.
 */
var languages = {};
var pathOfLanguages = require('path').join(__dirname, './languages/');
fs.readdirSync(pathOfLanguages).forEach(function (file) {
  var fileName = file.substring(0, file.indexOf('.'));
  languages[fileName] = require('./languages/' + file);
});
exports.languages = languages;