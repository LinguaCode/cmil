const VARIABLE = require('../variable');

module.exports = [{
  command: VARIABLE.input,
  definition: '読みます'
}, {
  command: VARIABLE.output,
  definition: '書きます'
}, {
  command: VARIABLE.do,
  definition: '行う'
}, {
  command: VARIABLE.if,
  definition: 'もし'
}, {
  command: VARIABLE.else,
  definition: 'ほかに'
}, {
  command: VARIABLE.break,
  definition: 'ブレーク'
}, {
  command: VARIABLE.continue,
  definition: '続けます'
}, {
  command: VARIABLE.while,
  definition: 'つつ'
}, {
  command: VARIABLE.repeat,
  definition: 'リピート'
}, {
  command: VARIABLE.times,
  definition: '回'
}, {
  command: VARIABLE.function,
  definition: '機能'
}];