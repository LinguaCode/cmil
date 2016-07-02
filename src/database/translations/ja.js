let commands = require('../commands/variables');

module.exports = [{
  command: commands.input,
  definition: '読みます'
}, {
  command: commands.output,
  definition: '書きます'
}, {
  command: commands.do,
  definition: '行う'
}, {
  command: commands.if,
  definition: 'もし'
}, {
  command: commands.else,
  definition: 'ほかに'
}, {
  command: commands.var,
  definition: '変数'
}, {
  command: commands.break,
  definition: 'ブレーク'
}, {
  command: commands.continue,
  definition: '続けます'
}, {
  command: commands.while,
  definition: 'つつ'
}, {
  command: commands.repeat,
  definition: 'リピート'
}, {
  command: commands.times,
  definition: '回'
}, {
  command: commands.function,
  definition: '機能'
}];