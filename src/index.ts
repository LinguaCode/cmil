//tools
import * as translator from './translator/index.ts';
import * as lexer from './core/lexer.ts';
import * as parser from './core/parser.ts';
import * as compiler from './core/compiler.ts';
import Session from './core/interpreter.ts';
import CmilError from './core/error.ts';
import {STATUS} from './constants/index.ts';
import TRANSLATION from './translations/index.ts';
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

/** The codes of the languages programs can be written in, for example 'en' or 'hy-AM'. */
export const languages: readonly string[] = Object.freeze(Object.keys(TRANSLATION));

class CodeSubmit {
  #sourceCode: string;
  #language: string;

  #outputCallback: OutputCallback | null = null;
  #inputCallback: InputRequestCallback | null = null;
  #endCallback: SessionEndCallback | null = null;

  #session: Session | null = null;
  #isRunning = false;
  #isWaitingForInput = false;
  #isInputReceived = false;
  #hasEnded = false;

  constructor(sourceCode: string, language: string) {
    this.#sourceCode = sourceCode;
    this.#language = language;
  }

  /**
   * Gives the program the input it waits for. An empty input is requested again;
   * an input while the program doesn't wait for one is ignored.
   */
  input(value?: string | number): this {
    logger.log(`CMIL: input: '${value}' received`);
    if (this.#hasEnded || !this.#isWaitingForInput || !this.#session) return this;

    if (value === '' || value === undefined) {
      if (this.#inputCallback) this.#inputCallback();
      return this;
    }

    this.#isWaitingForInput = false;
    try {
      this.#session.setInput(value);
    } catch (error) {
      if (error instanceof CmilError) return this.#end(error);
      throw error;
    }

    //an input given inside the input request callback is taken by the running loop
    this.#isInputReceived = true;
    if (!this.#isRunning) this.#run();

    return this;
  }

  execute(): this {
    this.#hasEnded = false;
    this.#isWaitingForInput = false;
    this.#session = null;

    if (!Object.hasOwn(TRANSLATION, this.#language)) {
      return this.#end(new CmilError(STATUS.UNKNOWN_LANGUAGE, {language: this.#language}));
    }

    let program: Program;
    try {
      const code = translator.toCode(this.#sourceCode || '', this.#language);
      program = compiler.compile(parser.parse(lexer.tokenize(code)));
    } catch (error) {
      if (error instanceof CmilError) return this.#end(error);
      throw error;
    }

    this.#session = new Session(program);
    this.#run();

    return this;
  }

  /** Ends the session: it takes no more input, and onSessionEnd isn't called. */
  stop(): this {
    this.#hasEnded = true;
    this.#isWaitingForInput = false;
    this.#session = null;

    return this;
  }

  onInputRequest(inputCallback: InputRequestCallback): this {
    this.#inputCallback = inputCallback;

    return this;
  }
  onOutput(outputCallback: OutputCallback): this {
    this.#outputCallback = outputCallback;

    return this;
  }
  onSessionEnd(onSessionEndCallback: SessionEndCallback): this {
    this.#endCallback = onSessionEndCallback;

    return this;
  }

  #run(): this {
    const session = this.#session;
    if (!session) return this;

    this.#isRunning = true;

    for (;;) {
      let status;
      try {
        status = session.run();
      } catch (error) {
        this.#isRunning = false;
        this.#sendOutput(session);
        if (error instanceof CmilError) return this.#end(error);
        throw error;
      }

      this.#sendOutput(session);

      //stopped from a callback
      if (this.#hasEnded) {
        this.#isRunning = false;
        return this;
      }

      if (status === STATUS.SESSION_END) {
        this.#isRunning = false;
        return this.#end();
      }

      this.#isWaitingForInput = true;
      this.#isInputReceived = false;
      if (this.#inputCallback) this.#inputCallback();

      if (!this.#isInputReceived) {
        this.#isRunning = false;
        return this;
      }
    }
  }

  #sendOutput(session: Session): void {
    const output = session.takeOutput();
    if (output.length && this.#outputCallback) {
      this.#outputCallback(output.join('\n'));
    }
  }

  #end(error?: CmilError): this {
    if (this.#hasEnded) return this;
    this.#hasEnded = true;
    this.#isWaitingForInput = false;

    const result: SessionEnd = error ? {errorId: error.errorId, param: error.param} : {errorId: undefined, param: {}};
    if (this.#endCallback) this.#endCallback(result);

    return this;
  }
}

export default CodeSubmit;
export {CodeSubmit, CodeSubmit as 'module.exports'};
