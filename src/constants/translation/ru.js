const COMMAND = require('../command');

module.exports = [{
  command: COMMAND.INPUT,
  definition: 'ввести'
}, {
  command: COMMAND.OUTPUT,
  definition: 'вывести'
}, {
  command: COMMAND.DO,
  definition: 'сделать'
}, {
  command: COMMAND.IF,
  definition: 'если'
}, {
  command: COMMAND.ELSE,
  definition: 'иначе'
}, {
  command: COMMAND.BREAK,
  definition: 'прервать'
}, {
  command: COMMAND.CONTINUE,
  definition: 'продолжить'
}, {
  command: COMMAND.WHILE,
  definition: 'пока'
}, {
  command: COMMAND.REPEAT,
  definition: 'повторить'
}, {
  command: COMMAND.TIMES,
  definition: 'раз'
}, {
  command: COMMAND.FUNCTION,
  definition: 'функция'
}];