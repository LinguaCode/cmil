exports.concat = function (sourceCode) {
  return ' ' + sourceCode + ' ';
};

exports.cut = function (sourceCode) {
  return sourceCode.replace(/^\s+/, '').replace(/\s+$/, '');
};