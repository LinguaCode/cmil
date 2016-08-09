const COMMAND = require('../command');

module.exports = [{
  command: COMMAND.INPUT,
  definition: '読みます'
}, {
  command: COMMAND.OUTPUT,
  definition: '書きます'
}, {
  command: COMMAND.DO,
  definition: '行う'
}, {
  command: COMMAND.IF,
  definition: 'もし'
}, {
  command: COMMAND.ELSE,
  definition: 'ほかに'
}, {
  command: COMMAND.BREAK,
  definition: 'ブレーク'
}, {
  command: COMMAND.CONTINUE,
  definition: '続けます'
}, {
  command: COMMAND.WHILE,
  definition: 'つつ'
}, {
  command: COMMAND.REPEAT,
  definition: 'リピート'
}, {
  command: COMMAND.TIMES,
  definition: '回'
}, {
  command: COMMAND.FUNCTION,
  definition: '機能'
}];