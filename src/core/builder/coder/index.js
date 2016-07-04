let _ = require('lodash');

exports.splitToCompilableParts = function (sessionId, sourceCode, variables) {
  console.llog('builder: splitToCompilableParts');
  
  sourceCode = sourceCode.join('\n');
  let labelOfSessionObject = sessionId + '.';
  let toCompiles = [];
  let reInput = new RegExp(commands.input + '\\s+(' + labelOfSessionObject + '(' + variables.join('|') + '))', 'g');
  let indexOfOperationBegin, indexOfOperationEnd;
  let reInputStrOld, reInputStrNew;
  let operations, inputVariable;
  let toCompile = {};

  reInputStrOld = reInput.exec(sourceCode);

  if (reInputStrOld === null || reInputStrOld.index != 0) {
    indexOfOperationBegin = 0;
    indexOfOperationEnd = reInputStrOld === null ? sourceCode.length : reInputStrOld.index;
    operations = sourceCode.substring(indexOfOperationBegin, indexOfOperationEnd);
    toCompile.operations = _.compact(operations.split('\n'));

    if (toCompile != {}) {
      toCompiles.push(_.cloneDeep(toCompile));
    }
  }

  while (reInputStrOld !== null) {
    indexOfOperationBegin = reInputStrOld.index + reInputStrOld[0].length;

    reInputStrNew = reInput.exec(sourceCode);
    indexOfOperationEnd = reInputStrNew != null ? reInputStrNew.index : sourceCode.length;

    inputVariable = reInputStrOld != null ? reInputStrOld[1] : '';

    operations = sourceCode.substring(indexOfOperationBegin, indexOfOperationEnd);
    operations = tools.trim(operations);

    //==toCompile==
    //toCompile.operations
    toCompile = {};
    if (operations) {
      toCompile.operations = _.compact(operations.split('\n'));
    }
    //toCompile.inputVariable
    if (inputVariable) {
      toCompile.inputVariable = inputVariable;
    }

    //===toCompiles===
    if (toCompile != {}) {
      toCompiles.push(_.cloneDeep(toCompile));
    }
    if (reInputStrNew) {
      reInputStrOld = _.cloneDeep(reInputStrNew);
    } else {
      break;
    }
  }

  return toCompiles;
};

let commands = require('../../../database/commands/variables');

let variables = exports.variables = require('./variables');
let tools = require('../../../libs/tools');


