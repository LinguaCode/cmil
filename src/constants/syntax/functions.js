const COMMAND = require('../command');

module.exports = [{
  command: `${COMMAND.POW}\\s*\\(([^\\)\(]+)\\)(.*);`,
  definition: `Math.pow($1);`,
}, {
  command: `${COMMAND.SQRT}\\s*\\((.*)\\)(.*);`,
  definition: `Math.pow($1, 1/2);`,
}, {
  command: `${COMMAND.SQR}\\s*\\((.*)\\)(.*);`,
  definition: `Math.pow($1, 2);`,
}, {
  command: `${COMMAND.ROUND}\\s*\\(([^\\)\(]+)\\)(.*);`,
  definition: `Math.round($1);`,
}, {
  command: `${COMMAND.FLOOR}\\s*\\(([^\\)\(]+)\\)(.*);`,
  definition: `Math.floor($1);`,
}, {
  command: `${COMMAND.CEIL}\\s*\\(([^\\)\(]+)\\)(.*);`,
  definition: `Math.ceil($1);`
}, {
  command: `${COMMAND.LG}\\s*\\(([^\\)\(]+)\\)(.*);`,
  definition: `Math.log10($1);`
}, {
  command: `${COMMAND.LN}\\s*\\(([^\\)\(]+)\\)(.*);`,
  definition: `Math.log($1);`
}, {
  command: `${COMMAND.LOG}\\s*\\((([^\\)\(]+),([^\\)\(]+))\\)(.*);`,
  definition: `Math.log($3)/Math.log($2);`
}, {
  command: `${COMMAND.RANDOM}\\s*\\((([^\\)\(]+),*([^\\)\(]+)*)\\)(.*);`,
  definition: `((min,max)=>{if(typeof(max)=='undefined') {max=min;min=0}\nreturn Math.floor(Math.random()*(max-min+1)+min)})($2,eval('$3'))`
}, {
  command: `${COMMAND.ABS}\\s*\\(([^\\)\(]+)\\)(.*);`,
  definition: `Math.abs($1);`
}, {
  command: `${COMMAND.ARCSIN}\\s*\\(([^\\)\(]+)\\)(.*);`,
  definition: `Math.asin($1);`
}, {
  command: `${COMMAND.ARCCOS}\\s*\\(([^\\)\(]+)\\)(.*);`,
  definition: `Math.acos($1);`
}, {
  command: `${COMMAND.ARCTAN}\\s*\\(([^\\)\(]+)\\)(.*);`,
  definition: `Math.atan($1);`
}, {
  command: `${COMMAND.ARCCTG}\\s*\\(([^\\)\(]+)\\)(.*);`,
  definition: `(Math.PI / 2 - Math.atan($1));`
}, {
  command: `${COMMAND.SIN}\\s*\\(([^\\)\(]+)\\)(.*);`,
  definition: `Math.sin($1);`
}, {
  command: `${COMMAND.COS}\\s*\\(([^\\)\(]+)\\)(.*);`,
  definition: `Math.cos($1);`
}, {
  command: `${COMMAND.TAN}\\s*\\(([^\\)\(]+)\\)(.*);`,
  definition: `Math.tan($1);`
}, {
  command: `${COMMAND.CTG}\\s*\\(([^\\)\(]+)\\)(.*);`,
  definition: `1/Math.tan($1);`
}];