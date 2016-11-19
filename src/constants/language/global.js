module.exports = () => ({
  replace: [{
    command: '""|\'\'|«»',
    definition: 'String()'
  },{
    command: '։',
    definition: ':'
  }, {
    command: '\'',
    definition: '`'
  }, {
    command: '"',
    definition: '`'
  }, {
    command: '«',
    definition: '`'
  }, {
    command: '»',
    definition: '`'
  }, {
    command: '․',
    definition: '.'
  }, {
    command: '`',
    definition: '\''
  }]
});
