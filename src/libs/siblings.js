const fs = require('fs');
const path = require('path');

module.exports = pathToDirectory => {
  const realPath = path.join(__dirname, pathToDirectory);

  return fs.readdirSync(realPath).map(function (fileName) {
    fileName = fileName.replace(/\.[^/.]+$/, '');

    return [fileName] = require(`./${fileName}`);
  });
};