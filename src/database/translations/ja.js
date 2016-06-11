/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license Apache-2.0
 */

var commands = require('../commands/variables');

module.exports = [{
  which: commands.input,
  toWhat: '読みます'
}, {
  which: commands.output,
  toWhat: '書きます'
}, {
  which: commands.do,
  toWhat: '行う'
}, {
  which: commands.if,
  toWhat: 'もし'
}, {
  which: commands.else,
  toWhat: 'ほかに'
}, {
  which: commands.var,
  toWhat: '変数'
}, {
  which: commands.break,
  toWhat: 'ブレーク'
}, {
  which: commands.continue,
  toWhat: '続けます'
}, {
  which: commands.while,
  toWhat: 'つつ'
}, {
  which: commands.repeat,
  toWhat: 'リピート'
}, {
  which: commands.times,
  toWhat: '回'
}, {
  which: commands.function,
  toWhat: '機能'
}];