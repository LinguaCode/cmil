//packages
const STATUS = require('linguacode-constants').STATUS;

//tools
const errorHandler = require('./core/errorHandler');
const compiler = require('./core/executer/compiler');
const sender = require('./core/sender');
const setter = require('./core/executer/setter');
const checker = require('./core/executer/checker');
const getter = require('./core/executer/getter');
const logger = require('lingua-logger');
//console.llog = console.log;

const preExecute = sessionId => {
  require('./core/globals')(sessionId);
};

const postExecute = (sessionId) => {
  const output = getter.output(sessionId);
  const status = output.status;
  const isSucceed = status === STATUS.SUCCESS;
  const isWaitsForInput = status === STATUS.WAITS_FOR_INPUT;

  if (isWaitsForInput) {
    if (output.result) {
      sender.evaluate(sessionId, output.result);
    }
    sender.waitsForInput(sessionId);
  } else if (isSucceed) {
    sender.evaluate(sessionId, output.result);
  }

  const error = isSucceed ? {
    id: '',
    param: {}
  } : status;

  if (!isWaitsForInput && checker.session.ended(sessionId)) {
    return sender.sessionEnd(sessionId, error);
  }
};

const randomStringGenerate = (length) => {
  const randomStringChunk = () => Math.random().toString(36).slice(2);
  const randomStringGenerate = () => randomStringChunk() + randomStringChunk() + randomStringChunk() + randomStringChunk();
  const randomString = randomStringGenerate();

  return length ? randomString.slice(0, length) : randomString;
};

class CodeSubmit {
  constructor(sourceCode, language) {
    this.outputCallback = null;
    this.inputCallback = null;
    this.endCallback = null;

    this.sourceCode = sourceCode;
    this.language = language;

    const sessionId = randomStringGenerate();
    this.sessionId = sessionId;

    return this;
  }

  _output(outputCallback) {
    this.outputCallback = outputCallback;

    return this;
  };

  _onInputRequest(inputCallback) {
    const inputEmitter = (inputValue) => {
      let sessionId = this.sessionId;
      console.llog(`CMIL: input: '${inputValue}' text successfully received!`);

      compiler.listener(sessionId, inputValue);

      postExecute(sessionId);
    };

    this.inputCallback = () => {
      inputCallback(inputEmitter);
    };

    return this;
  };

  execute() {
    const sourceCode = this.sourceCode;
    const language = this.language;
    const sessionId = this.sessionId;
    preExecute(sessionId);

    //TODO: add error handler: unsupported language

    const error = errorHandler.analyze(sourceCode);
    if (error) {
      //TODO: Implement hack attempt detection
      console.llog('Output text has been successfully send! (Hack attempt)');

      setter.output(sessionId, error);
    } else {
      compiler.codeRun(sessionId, sourceCode, language);
    }

    setter.data(sessionId, {
      sourceCode,
      language,
      codeSubmitter: this,
    });

    postExecute(sessionId);

    return this;
  };

  onInputRequest(inputCallback) {
    this._onInputRequest(inputCallback);

    return this;
  };
  onOutput(outputCallback) {
    this._output(outputCallback);

    return this;
  };
  onSessionEnd(onSessionEndCallback) {
    this.endCallback = onSessionEndCallback;

    return this;
  };

  triggerInputRequest() {
    this.inputCallback();
  };
  triggerSessionEnd(error) {
    this.endCallback(error);
  };
  triggerOutput(outputText) {
    this.outputCallback(outputText);
  };
}

module.exports = CodeSubmit;