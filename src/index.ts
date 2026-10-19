//tools
import * as translator from './translator/index.ts';
import * as lexer from './core/lexer.ts';
import * as parser from './core/parser.ts';
import * as compiler from './core/compiler.ts';
import Session from './core/interpreter.ts';
import CmilError from './core/error.ts';
import {STATUS} from './constants/index.ts';
import * as logger from './libs/logger.ts';
import type {ErrorParam, Program} from './core/types.ts';

export type {ErrorParam} from './core/types.ts';

/** The result of a session: errorId is undefined when the program ended without an error. */
export type SessionEnd = {
  errorId: string | undefined;
  param: ErrorParam;
};

export type OutputCallback = (output: string) => void;
export type InputRequestCallback = () => void;
export type SessionEndCallback = (result: SessionEnd) => void;

class CodeSubmit {
  sourceCode: string;
  language: string;

  outputCallback: OutputCallback | null = null;
  inputCallback: InputRequestCallback | null = null;
  endCallback: SessionEndCallback | null = null;

  session: Session | null = null;
  isRunning = false;
  isWaitingForInput = false;
  isInputReceived = false;

  constructor(sourceCode: string, language: string) {
    this.sourceCode = sourceCode;
    this.language = language;
  }

  get inputEmitter(): (inputValue?: string | number) => void {
    return inputValue => {
      logger.log(`CMIL: input: '${inputValue}' received`);
      if (!this.isWaitingForInput || !this.session) return;

      //an empty input is requested again
      if (inputValue === '' || inputValue === undefined) {
        if (this.inputCallback) this.inputCallback();
        return;
      }

      this.isWaitingForInput = false;
      try {
        this.session.setInput(inputValue);
      } catch (error) {
        if (error instanceof CmilError) {
          this.end(error);
          return;
        }
        throw error;
      }

      //an input given inside the input request callback is taken by the running loop
      this.isInputReceived = true;
      if (!this.isRunning) this.run();
    };
  }

  execute(): this {
    let program: Program;
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

  run(): this {
    const session = this.session;
    if (!session) return this;

    this.isRunning = true;

    for (;;) {
      let status;
      try {
        status = session.run();
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

  sendOutput(): void {
    const output = this.session ? this.session.takeOutput() : [];
    if (output.length && this.outputCallback) {
      this.outputCallback(output.join('\n'));
    }
  }

  end(error?: CmilError): this {
    const result: SessionEnd = error ? {errorId: error.errorId, param: error.param} : {errorId: undefined, param: {}};
    if (this.endCallback) this.endCallback(result);

    return this;
  }

  onInputRequest(inputCallback: InputRequestCallback): this {
    this.inputCallback = inputCallback;

    return this;
  }
  onOutput(outputCallback: OutputCallback): this {
    this.outputCallback = outputCallback;

    return this;
  }
  onSessionEnd(onSessionEndCallback: SessionEndCallback): this {
    this.endCallback = onSessionEndCallback;

    return this;
  }
}

export default CodeSubmit;
export {CodeSubmit, CodeSubmit as 'module.exports'};
