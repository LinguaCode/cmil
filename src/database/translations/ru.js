/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license GPLv3
 */

var commands = require('../commands/variables');

module.exports = [{
  which: commands.input,
  toWhat: 'ввести'
}, {
  which: commands.output,
  toWhat: 'вывести'
}, {
  which: commands.do,
  toWhat: 'կատարել'
}, {
  which: commands.if,
  toWhat: 'если'
}, {
  which: commands.else,
  toWhat: 'иначе'
}, {
  which: commands.var,
  toWhat: 'переменная'
}, {
  which: commands.break,
  toWhat: 'прервать'
}, {
  which: commands.continue,
  toWhat: 'продолжить'
}, {
  which: commands.while,
  toWhat: 'пока'
}, {
  which: commands.repeat,
  toWhat: 'повторить'
}, {
  which: commands.times,
  toWhat: 'раз'
}, {
  which: commands.function,
  toWhat: 'функция'
}];