exports.concat = function (sourceCode) {
  return ' ' + sourceCode + ' ';
};

exports.cut = function (sourceCode) {
  console.llog('builder: cut');
  return sourceCode.replace(/^\s+/, '').replace(/\s+$/, '');
};