const getter = require('../executer/getter');

exports.evaluate = (sessionId, output) => {
  const {codeSubmitter} = getter.data(sessionId) || {};
  codeSubmitter.triggerOutput(output);
};

exports.sessionEnd = (sessionId, errorMessage) => {
  const {codeSubmitter} = getter.data(sessionId) || {};
  console.log('WOW')
  codeSubmitter.triggerSessionEnd(errorMessage);
};

exports.waitsForInput = (sessionId) => {
  const {codeSubmitter} = getter.data(sessionId) || {};
  codeSubmitter.triggerInputRequest();
};

/*
exports.submitSuccess = (sessionId) => {
  const codeSubmitter = getter.data(sessionId) || {};
  codeSubmitter.triggerSubmitSuccess();
};*/
