var commands = require('../commands/variables');

module.exports = [{
  command: commands.input,
  definition: 'წაკითხული'
}, {
  command: commands.output,
  definition: 'დაწერა'
}, {
  command: commands.do,
  definition: 'ამის'
}, {
  command: commands.if,
  definition: 'თუ'
}, {
  command: commands.else,
  definition: 'სხვა'
}, {
  command: commands.var,
  definition: 'ცვლადი'
}, {
  command: commands.break,
  definition: 'შესვენების'
}, {
  command: commands.continue,
  definition: 'გაგრძელდება'
}, {
  command: commands.while,
  definition: 'ხოლო'
}, {
  command: commands.repeat,
  definition: 'განმეორებითი'
}, {
  command: commands.times,
  definition: 'ჯერ'
}, {
  command: commands.function,
  definition: 'ფუნქცია'
}];