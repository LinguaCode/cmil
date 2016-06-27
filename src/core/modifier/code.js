var core = function (data, lng, command, definition) {
  var re, reStr;
  for (var i = 0; i < database.translations[lng].length; i++) { //languages
    re = new RegExp(database.translations[lng][i][command], 'ig');
    while ((reStr = re.exec(data)) !== null) { //in line
      if (tools.isPartOfCode(data, reStr.index)) {
        data = data.substring(0, reStr.index) +
          database.translations[lng][i][definition].replace(/\\/g, '') +
          data.substring(reStr.index + reStr[0].length);
      }
    }
  }
  return data;
};

exports.toCode = function (data, lng) {
  return core(data, lng, 'definition', 'command');
};

var tools = require('../../libs/tools');
var database = require('../../database/connection');