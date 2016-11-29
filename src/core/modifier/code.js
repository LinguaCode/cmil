let core = function (data, lng, command, definition) {
  let re, reStr;
  return data
    .split('\n')
    .map((line) => {
      for (let i = 0; i < TRANSLATION[lng].length; i++) { //languages
        const translation = TRANSLATION[lng][i][command];
        re = new RegExp(translation, 'ig');
        while ((reStr = re.exec(line)) !== null) { //in line
          const index = reStr.index;
          if (tools.isPartOfCode(line, index) && !tools.isPartOfCommand(line, translation, index)) {
            line = line.substring(0, index) +
              TRANSLATION[lng][i][definition].replace(/\\/g, '') +
              line.substring(index + reStr[0].length);
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