const _ = require('lodash');
const COMMAND = require('../../../constants').COMMAND;
const tools = require('../../../libs/tools');
const variables = exports.variables = require('./variables');

exports.splitToCompilableParts = (sessionId, sourceCode, variables) => {
  console.llog('builder: splitToCompilableParts');

  sourceCode = sourceCode.join('\n');
  let toCompiles = [];
  let reInput = new RegExp(`${COMMAND.INPUT}\\s*\\((global\\[sessionId\\].(${variables.join('|')}))\\)`, 'g');
  let indexOfOperationBegin;
  let indexOfOperationEnd;
  let operations;
  let inputVariable;
  let toCompile = Object.create(null);

  let reInputStrOld = reInput.exec(sourceCode);

  if (reInputStrOld === null || reInputStrOld.index !== 0) {
    indexOfOperationBegin = 0;
    indexOfOperationEnd = reInputStrOld === null ? sourceCode.length : reInputStrOld.index;
    operations = sourceCode.substring(indexOfOperationBegin, indexOfOperationEnd);
    toCompile.operations = _.compact(operations.split('\n'));

    toCompiles.push(_.cloneDeep(toCompile));
  }

  while (reInputStrOld !== null) {
    indexOfOperationBegin = reInputStrOld.index + reInputStrOld[0].length;

    let reInputStrNew = reInput.exec(sourceCode);
    indexOfOperationEnd = reInputStrNew !== null ? reInputStrNew.index : sourceCode.length;

    inputVariable = reInputStrOld[1];

    operations = sourceCode.substring(indexOfOperationBegin, indexOfOperationEnd);
    operations = tools.trim(operations);

    //==toCompile==
    //toCompile.operations
    toCompile = Object.create(null);

    toCompile.operations = _.compact(operations.split('\n'));

    //toCompile.inputVariable
    toCompile.inputVariable = inputVariable;

    //===toCompiles===
    toCompiles.push(_.cloneDeep(toCompile));

    if (reInputStrNew) {
      reInputStrOld = _.cloneDeep(reInputStrNew);
    } else {
      break;
    }
  }

  return toCompiles;
};