/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license GPLv3
 */

var variables = {
  if: '#if',
  var: '#var',
  else: '#else',
  input: '#input',
  output: '#output',
  repeat: '#repeat',
  while: '#while',
  do: '#do',
  times: '#times',
  break: '#break',
  continue: '#continue',
  function: '#function',
  or: '#or',
  and1: '#and',
  and2: '#and',
  false: '#false',
  true: '#true',
  then: '#then',   
  not: '#not'
};

variables.elif = variables.else + ' ' + variables.if;

module.exports = variables;
