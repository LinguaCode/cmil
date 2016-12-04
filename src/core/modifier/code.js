exports.toCode = (data, lng) => {
  let re, reStr;
  return data
    .split('\n')
    .map(line => {
      for (let i = 0; i < TRANSLATION[lng].length; i++) {
        const instance = TRANSLATION[lng][i];

        const definition = instance.definition;
        re = new RegExp(`[^#](${definition})|^${definition}`, 'ig');
        while ((reStr = re.exec(line)) !== null) { //in line
          const index = reStr[1] ? reStr.index + 1 : reStr.index;

          const isPartOfCode = tools.isPartOfCode(line, index);
          const isPartOfCommand = tools.isPartOfCommand(line, definition, index);

          if (isPartOfCode && !isPartOfCommand) {
            const toReplace = instance.command.replace(/\\/g, '');

            const firstPartEndIndex = index;
            const secondPartBeginIndex = index + definition.length;
            line = tools.partitionReplace(line, toReplace, firstPartEndIndex, secondPartBeginIndex);
          }
        }
      }

      return line;
    })
    .join('\n');
};

let tools = require('../../libs/tools');
let tail = require('../builder/coder/variables/tail');
let TRANSLATION = require('../../constants').TRANSLATION;