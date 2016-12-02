let core = function (data, lng, command, definition) {
  let re, reStr;
  return data
    .split('\n')
    .map((line) => {
      line = tail.concat(line);

      for (let i = 0; i < TRANSLATION[lng].length; i++) { //languages
        const translation = TRANSLATION[lng][i][command];
        re = new RegExp(`[^#](${translation})`, 'ig');
        while ((reStr = re.exec(line)) !== null) { //in line
          const index = reStr.index;
          if (translation == 'e') {
            console.log();
          }
          if (tools.isPartOfCode(line, index) && !tools.isPartOfCommand(line, translation, index +1)) {
            line = line.substring(0, index +1) +
              TRANSLATION[lng][i][definition].replace(/\\/g, '') +
              line.substring(index + reStr[0].length);
          }
        }
      }

      return tail.cut(line);
    })
    .join('\n');
};

exports.toCode = (data, lng) => {
  return core(data, lng, 'definition', 'command');
};

let tools = require('../../libs/tools');
let tail = require('../builder/coder/variables/tail');
let TRANSLATION = require('../../constants').TRANSLATION;