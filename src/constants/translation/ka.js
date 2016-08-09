const COMMAND = require('../command');

module.exports = [{
  command: COMMAND.INPUT,
  definition: 'წაკითხული'
}, {
  command: COMMAND.OUTPUT,
  definition: 'დაწერა'
}, {
  command: COMMAND.DO,
  definition: 'ამის'
}, {
  command: COMMAND.IF,
  definition: 'თუ'
}, {
  command: COMMAND.ELSE,
  definition: 'სხვა'
}, {
  command: COMMAND.BREAK,
  definition: 'შესვენების'
}, {
  command: COMMAND.CONTINUE,
  definition: 'გაგრძელდება'
}, {
  command: COMMAND.WHILE,
  definition: 'ხოლო'
}, {
  command: COMMAND.REPEAT,
  definition: 'განმეორებითი'
}, {
  command: COMMAND.TIMES,
  definition: 'ჯერ'
}, {
  command: COMMAND.FUNCTION,
  definition: 'ფუნქცია'
}];