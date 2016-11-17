const SYNTAX_ERROR = 'syntaxError';
const HACK_ATTEMPT = 'hackAttempt';
const INDENT_ERROR = 'indentError';

const check = exports.check = require('./checker');

const pipeline = [HACK_ATTEMPT, INDENT_ERROR];

exports.analyze = (sourceCode, params) => {
  for (let i = 0; i < pipeline.length; i++) {
    const errorId = pipeline[i];

    const errorParam = check[errorId](sourceCode, params);
    if (errorParam) {
      return {
        id: errorId,
        param: errorParam
      };
    }
  }

  return null;
};

exports.evalResult = error => {
  const errorMessage = error.message;
  const unexpectedIdentifier = /Unexpected identifier/i;

  const errorId =
    unexpectedIdentifier.test(errorMessage) ?
      SYNTAX_ERROR : SYNTAX_ERROR;

  return {
    id: errorId
  };
};

