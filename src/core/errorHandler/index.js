const check = exports.check = require('./checker');
const messages = require('./messages');

const pipeline = ['hackAttempted', 'indentFailure'];

exports.analyze = (sourceCode, params) => {
  for (let i = 0; i < pipeline.length; i++) {
    const testName = pipeline[i];

    const errorParams = check[testName](sourceCode, params);
    if (errorParams) {
      return messages[testName](errorParams);
    }
  }

  return false;
};

exports.evalResult = error => {
  const errorMessage = error.message;
  let errorStatus;
  const unexpectedIdentifier = /Unexpected identifier/i;

  if (unexpectedIdentifier.test(errorMessage)) {
    errorStatus = 'Syntax error';
  } else {
    errorStatus = 'Syntax error';
  }

  return errorStatus;
};

