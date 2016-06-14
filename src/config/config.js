/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license GPLv3
 */

var env = process.env;
var config = {
  local: {
    yandexTranslate: process.env.YTRANSLATE,
    DB: env.DB_URI || 'mongodb://localhost:27017/linguacode',
    PORT: env.PORT || 3000
  },
  production: {
    yandexTranslate: process.env.YTRANSLATE,
    DB: env.DB_URI || 'mongodb://localhost:27017/linguacode',
    PORT: env.PORT || 3000
  }
};

module.exports = config;