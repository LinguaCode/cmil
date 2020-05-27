const getter = require('../executer/getter');

exports.evaluate = (sessionId, output) => {
  const {codeSubmitter} = getter.data(sessionId) || {};
  codeSubmitter.triggerOutput(output);
};

exports.sessionEnd = (sessionId, errorMessage) => {
  const {codeSubmitter} = getter.data(sessionId) || {};
  codeSubmitter.triggerSessionEnd(errorMessage);
};

exports.waitsForInput = (sessionId) => {
  const {codeSubmitter} = getter.data(sessionId) || {};
  codeSubmitter.triggerInputRequest();
};
