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
    unexpectedIdentifier: /Unexpected identifier/i
  };
 
  if (errorRegEx.unexpectedIdentifier.test(errorMessage)) {
    errorStatus = 'Syntax error';
  } else {
    errorStatus = 'Syntax error';
  }

  return errorStatus;
};

