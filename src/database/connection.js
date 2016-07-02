let fs = require('fs');

const dbs = ['translations', 'languages'];

/**
 * Database of languages.
 *
 *  @example
 * dbCollect('folder');
 *
 * @param {String} dbName
 * @returns {Object} Returns the database of languages.
 */
let dbCollect = function (dbName) {
  let db = {};
  let pathOfTranslation = require('path').join(__dirname, './' + dbName + '/');
  fs.readdirSync(pathOfTranslation).forEach(function (file) {
    let fileName = file.substring(0, file.indexOf('.'));
    db[fileName] = require('./' + dbName + '/' + file);
  });
  
  return db;
};

dbs.forEach(function (dbName) {
  exports[dbName] = dbCollect(dbName);
});