let core = function (data, lng, command, definition) {
  let re, reStr;
  return data
    .split('\n')
    .map((line) => {
      for (let i = 0; i < TRANSLATION[lng].length; i++) { //languages
        re = new RegExp(TRANSLATION[lng][i][command], 'ig');
        while ((reStr = re.exec(line)) !== null) { //in line
          if (tools.isPartOfCode(line, reStr.index)) {
            line = line.substring(0, reStr.index) +
              TRANSLATION[lng][i][definition].replace(/\\/g, '') +
              line.substring(reStr.index + reStr[0].length);
          }
        }
      }

      return line;
    })
    .join('\n');
};

exports.toCode = (data, lng) => {
  return core(data, lng, 'definition', 'command');
};

let tools = require('../../libs/tools');
let TRANSLATION = require('../../constants').TRANSLATION;