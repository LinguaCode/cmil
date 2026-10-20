/**
 * A session runs one program step by step: run() starts it, and input() continues it when it waits for input.
 */
import * as lexer from './core/lexer.ts';
import * as parser from './core/parser.ts';
import * as compiler from './core/compiler.ts';
import Interpreter from './core/interpreter.ts';
import {wordsOf} from './core/words.ts';
import CmilError from './core/error.ts';
import {ERROR, MAX_STEPS, STATE} from './constants/index.ts';
import TRANSLATION from './translations/index.ts';
import type {Program, ProgramError} from './core/types.ts';

/**
 * What a program did in one call of run() or input(): the lines it printed,
 * and whether it waits for input, with the prompt of the input if it has one,
 * or has ended, with its error if it has one.
 */
export type Step =
  | {state: typeof STATE.INPUT; output: string[]; prompt?: string}
  | {state: typeof STATE.END; output: string[]; error?: ProgramError};

export type SessionOptions = {
  /** The steps a program may run in one call of run() or input() before it ends with timeout. */
  maxSteps?: number;
};

//the program of a source code; errors in the source are thrown as CmilError
const compile = (sourceCode: string, language: string): Program => {
  if (!Object.hasOwn(TRANSLATION, language)) {
    throw new CmilError({id: ERROR.UNKNOWN_LANGUAGE, language});
  }

  return compiler.compile(parser.parse(lexer.tokenize(sourceCode, language)));
};

/**
 * Returns the first error a program has before it runs: a syntax, indentation or argument error,
 * a call of a function it doesn't define, or an unknown language; null when it has none.
 */
export const check = (sourceCode: string, language: string): ProgramError | null => {
  try {
    compile(sourceCode, language);
    return null;
  } catch (error) {
    if (error instanceof CmilError) return error.error;
    throw error;
  }
};

export class Session {
  #sourceCode: string;
  #language: string;
  #maxSteps: number;

  #interpreter: Interpreter | null = null;
  #state: 'new' | Step['state'] = 'new';
  #error: ProgramError | undefined;

  constructor(sourceCode: string, language: string, {maxSteps = MAX_STEPS}: SessionOptions = {}) {
    this.#sourceCode = sourceCode;
    this.#language = language;
    this.#maxSteps = maxSteps;
  }

  /**
   * Starts the program; it runs until it waits for input or ends.
   * Called again, it returns the state of the session without output.
   */
  run(): Step {
    if (this.#state !== 'new') return this.#current();

    try {
      const program = compile(this.#sourceCode, this.#language);
      const {first} = wordsOf(this.#language);
      this.#interpreter = new Interpreter(program, this.#maxSteps, command => first.get(command) ?? command);
    } catch (error) {
      return this.#fail(error, []);
    }

    return this.#continue();
  }

  /**
   * Gives the program the input it waits for, and runs it until it waits again or ends.
   * An empty input is asked for again; an input while the program doesn't wait for one is ignored.
   */
  input(value: string | number): Step {
    if (this.#state === 'new') throw new Error('Call run() before input().');
    if (this.#state !== STATE.INPUT || !this.#interpreter) return this.#current();
    if (value === '' || value === undefined) return this.#current();

    try {
      this.#interpreter.setInput(value);
    } catch (error) {
      return this.#fail(error, []);
    }

    return this.#continue();
  }

  /** Ends the session: it takes no more input. */
  stop(): void {
    this.#state = STATE.END;
    this.#interpreter = null;
  }

  #continue(): Step {
    const interpreter = this.#interpreter as Interpreter;

    let state;
    try {
      state = interpreter.run();
    } catch (error) {
      return this.#fail(error, interpreter.takeOutput());
    }

    const output = interpreter.takeOutput();
    this.#state = state;
    if (state === STATE.END) {
      this.#interpreter = null;
      return {state, output};
    }

    return this.#waiting(output);
  }

  //the input step, with the prompt of the input when it has one
  #waiting(output: string[]): Step {
    const prompt = this.#interpreter?.prompt;
    return prompt ? {state: STATE.INPUT, output, prompt} : {state: STATE.INPUT, output};
  }

  //output printed before the error is returned with it
  #fail(error: unknown, output: string[]): Step {
    if (!(error instanceof CmilError)) throw error;

    this.#state = STATE.END;
    this.#interpreter = null;
    this.#error = error.error;

    return {state: STATE.END, output, error: this.#error};
  }

  #current(): Step {
    if (this.#state === STATE.INPUT) return this.#waiting([]);
    return this.#error ? {state: STATE.END, output: [], error: this.#error} : {state: STATE.END, output: []};
  }
}
