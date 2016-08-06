let core = function (data, lng, command, definition) {
  let re, reStr;
  for (let i = 0; i < TRANSLATION[lng].length; i++) { //languages
    re = new RegExp(TRANSLATION[lng][i][command], 'ig');
    while ((reStr = re.exec(data)) !== null) { //in line
      if (tools.isPartOfCode(data, reStr.index)) {
        data = data.substring(0, reStr.index) +
          TRANSLATION[lng][i][definition].replace(/\\/g, '') +
          data.substring(reStr.index + reStr[0].length);
      }
    }
  }
  return data;
};

exports.toCode = (data, lng) => {
  return core(data, lng, 'definition', 'command');
};

let tools = require('../../libs/tools');
let TRANSLATION = require('../../constants').TRANSLATION;