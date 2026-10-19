//tools
const translator = require('./translator');
const lexer = require('./core/lexer');
const parser = require('./core/parser');
const compiler = require('./core/compiler');
const Session = require('./core/interpreter');
const CmilError = require('./core/error');
const STATUS = require('./constants').STATUS;
const logger = require('./libs/logger');

class CodeSubmit {
  constructor(sourceCode, language) {
    this.outputCallback = null;
    this.inputCallback = null;
    this.endCallback = null;

    this.sourceCode = sourceCode;
    this.language = language;

    this.session = null;
    this.isRunning = false;
    this.isWaitingForInput = false;
    this.isInputReceived = false;

    return this;
  }

  get inputEmitter() {
    return inputValue => {
      logger.log(`CMIL: input: '${inputValue}' received`);
      if (!this.isWaitingForInput) return;

      //an empty input is requested again
      if (inputValue === '' || inputValue === undefined) {
        if (this.inputCallback) this.inputCallback();
        return;
      }

      this.isWaitingForInput = false;
      try {
        this.session.setInput(inputValue);
      } catch (error) {
        return this.end(error);
      }

      //an input given inside the input request callback is taken by the running loop
      this.isInputReceived = true;
      if (!this.isRunning) this.run();
    };
  }

  execute() {
    let program;
    try {
      const code = translator.toCode(this.sourceCode || '', this.language);
      program = compiler.compile(parser.parse(lexer.tokenize(code)));
    } catch (error) {
      if (error instanceof CmilError) return this.end(error);
      throw error;
    }

    this.session = new Session(program);
    this.run();

    return this;
  }

  run() {
    this.isRunning = true;

    for (;;) {
      let status;
      try {
        status = this.session.run();
      } catch (error) {
        this.isRunning = false;
        this.sendOutput();
        if (error instanceof CmilError) return this.end(error);
        throw error;
      }

      this.sendOutput();

      if (status === STATUS.SESSION_END) {
        this.isRunning = false;
        return this.end();
      }

      this.isWaitingForInput = true;
      this.isInputReceived = false;
      if (this.inputCallback) this.inputCallback();

      if (!this.isInputReceived) {
        this.isRunning = false;
        return this;
      }
    }
  }

  sendOutput() {
    const output = this.session.takeOutput();
    if (output.length && this.outputCallback) {
      this.outputCallback(output.join('\n'));
    }
  }

  end(error) {
    const result = error ? {errorId: error.errorId, param: error.param} : {errorId: undefined, param: {}};
    if (this.endCallback) this.endCallback(result);

    return this;
  }

  onInputRequest(inputCallback) {
    this.inputCallback = inputCallback;

    return this;
  }
  onOutput(outputCallback) {
    this.outputCallback = outputCallback;

    return this;
  }
  onSessionEnd(onSessionEndCallback) {
    this.endCallback = onSessionEndCallback;

    return this;
  }
}

module.exports = CodeSubmit;
