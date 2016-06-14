/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license GPLv3
 */

var commands = require('../commands/variables');

module.exports = [{
  which: commands.input,
  toWhat: 'წაკითხული'
}, {
  which: commands.output,
  toWhat: 'დაწერა'
}, {
  which: commands.do,
  toWhat: 'ამის'
}, {
  which: commands.if,
  toWhat: 'თუ'
}, {
  which: commands.else,
  toWhat: 'სხვა'
}, {
  which: commands.var,
  toWhat: 'ცვლადი'
}, {
  which: commands.break,
  toWhat: 'შესვენების'
}, {
  which: commands.continue,
  toWhat: 'გაგრძელდება'
}, {
  which: commands.while,
  toWhat: 'ხოლო'
}, {
  which: commands.repeat,
  toWhat: 'განმეორებითი'
}, {
  which: commands.times,
  toWhat: 'ჯერ'
}, {
  which: commands.function,
  toWhat: 'ფუნქცია'
}];