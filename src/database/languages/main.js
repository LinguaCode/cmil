module.exports = function () {
  return {
    replace: [{
      command: '։',
      definition: ':'
    }, {
      command: '"',
      definition: '\''
    }, {
      command: '«',
      definition: '\''
    }, {
      command: '»',
      definition: '\''
    }, {
      command: '․',
      definition: '.'
    }]
  };
};
