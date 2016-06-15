module.exports = function () {
  return {
    replace: [{
      which: '։',
      toWhat: ':'
    }, {
      which: '"',
      toWhat: '\''
    }, {
      which: '«',
      toWhat: '\''
    }, {
      which: '»',
      toWhat: '\''
    }, {
      which: '․',
      toWhat: '.'
    }]
  };
};
