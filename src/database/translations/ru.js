let commands = require('../commands/variables');

module.exports = [{
  command: commands.input,
  definition: 'ввести'
}, {
  command: commands.output,
  definition: 'вывести'
}, {
  command: commands.do,
  definition: 'կատարել'
}, {
  command: commands.if,
  definition: 'если'
}, {
  command: commands.else,
  definition: 'иначе'
}, {
  command: commands.var,
  definition: 'переменная'
}, {
  command: commands.break,
  definition: 'прервать'
}, {
  command: commands.continue,
  definition: 'продолжить'
}, {
  command: commands.while,
  definition: 'пока'
}, {
  command: commands.repeat,
  definition: 'повторить'
}, {
  command: commands.times,
  definition: 'раз'
}, {
  command: commands.function,
  definition: 'функция'
}];