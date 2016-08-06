const VARIABLE = require('../variable');

module.exports = [{
  command: VARIABLE.input,
  definition: 'ввести'
}, {
  command: VARIABLE.output,
  definition: 'вывести'
}, {
  command: VARIABLE.do,
  definition: 'сделать'
}, {
  command: VARIABLE.if,
  definition: 'если'
}, {
  command: VARIABLE.else,
  definition: 'иначе'
}, {
  command: VARIABLE.break,
  definition: 'прервать'
}, {
  command: VARIABLE.continue,
  definition: 'продолжить'
}, {
  command: VARIABLE.while,
  definition: 'пока'
}, {
  command: VARIABLE.repeat,
  definition: 'повторить'
}, {
  command: VARIABLE.times,
  definition: 'раз'
}, {
  command: VARIABLE.function,
  definition: 'функция'
}];