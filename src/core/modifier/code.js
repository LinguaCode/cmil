/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license Apache-2.0
 */

var core = function (data, lng, which, toWhat) {
  var re, reStr;
  for (var i = 0; i < database.translations[lng].length; i++) { //languages
    re = new RegExp(database.translations[lng][i][which], 'ig');
    while ((reStr = re.exec(data)) !== null) { //in line
      if (tools.isPartOfCode(data, reStr.index)) {
        data = data.substring(0, reStr.index) +
          database.translations[lng][i][toWhat].replace(/\\/g, '') +
          data.substring(reStr.index + reStr[0].length);
      }
    }
  }
  return data;
};

exports.toSpeech = function (data, lng) {
  return core(data, lng, 'which', 'toWhat');
};

exports.toCode = function (data, lng) {
  return core(data, lng, 'toWhat', 'which');
};

var tools = require('../../libs/tools');
var database = require('../../database/connection');