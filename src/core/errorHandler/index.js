let check = exports.check = require('./checker');
let messages = require('./messages');

let pipeline = ['hackAttempted', 'indentFailure'];
exports.analyze = function (sourceCode, params) {
  for (let i = 0; i < pipeline.length; i++) {
    let testName = pipeline[i];

    let errorParams = check[testName](sourceCode, params);
    if (errorParams) {
      return messages[testName](errorParams);
    }

  }

  return false;
};

exports.evalResult = function (error) {
  let errorMessage = error.message;
  let errorStatus;
  let errorRegEx = {
    unexpectedIdentifier: /Unexpected identifier/i,
    isNotDefined: /is not defined/
  };

  if (errorRegEx.unexpectedIdentifier.test(errorMessage)) {
    errorStatus = 'Syntax error';
  } else if (errorRegEx.isNotDefined.test(errorMessage)) {
    //let errorCoordinates = error.stack.match(/\d:\d/)[0].split(':');
    //let errorLine = parseInt(errorCoordinates[0]) - 7;
    //let errorRow = parseInt(errorCoordinates[1]);
    let undefinedVariableName = error.message.match(/(.*) is not defined/)[1];

    errorStatus = 'Գրված «' + undefinedVariableName + '» փոփոխականը հայտարարված չէ։'/*
     + '\nՏես տող՝ ' + errorLine + ', դիրք՝ ' + errorRow + '։'*/;
  } else {
    errorStatus = 'Syntax error';
  }

  return errorStatus;
};

