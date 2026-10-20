/**
 * Runs the instructions of one program. All the state of the program belongs to its interpreter.
 */
import CmilError from './error.ts';
import * as values from './values.ts';
import {COMMAND, ERROR, STATE, MAX_TEXT_LENGTH, MAX_OUTPUT_LENGTH} from '../constants/index.ts';
import type {Expression, Instruction, Program, Value} from './types.ts';

export type RunStatus = (typeof STATE)[keyof typeof STATE];

class Interpreter {
  instructions: Instruction[];
  maxSteps: number;
  wordOf: (command: string) => string;
  booleans: values.Booleans;
  counters: number[];
  variables = new Map<string, Value>();
  position = 0;
  line = 0;
  input: Value | undefined = undefined;
  //the prompt of the input the program waits for
  prompt: string | undefined = undefined;
  output: string[] = [];
  outputLength = 0;

  /**
   * @param maxSteps - the steps the program may run in one call of run().
   * @param wordOf - the word of a command in the program's language, or an operator as it is; output and errors use it.
   */
  constructor({instructions, slots}: Program, maxSteps: number, wordOf: (command: string) => string) {
    this.instructions = instructions;
    this.maxSteps = maxSteps;
    this.wordOf = wordOf;
    this.booleans = {true: wordOf(COMMAND.TRUE), false: wordOf(COMMAND.FALSE)};
    this.counters = new Array<number>(slots).fill(0);
  }

  /**
   * Gives the value for the input the program waits for.
   */
  setInput(input: string | number): void {
    this.input = values.fromInput(input);
    this.checkText(this.input);
  }

  /**
   * Returns and clears the lines printed since the last call.
   */
  takeOutput(): string[] {
    const output = this.output;
    this.output = [];
    this.outputLength = 0;
    return output;
  }

  checkText(value: Value): Value {
    if (typeof value === 'string' && value.length > MAX_TEXT_LENGTH) {
      throw new CmilError({id: ERROR.MEMORY_LIMIT, line: this.line});
    }
    return value;
  }

  evaluate(node: Expression): Value {
    switch (node.type) {
      case 'value':
        return node.value;
      case 'variable': {
        const value = this.variables.get(node.name);
        if (value === undefined) {
          throw new CmilError({
            id: ERROR.UNDEFINED_VARIABLE,
            line: this.line,
            column: node.column,
            variable: node.name
          });
        }
        return value;
      }
      case 'call': {
        const args = node.args.map(arg => this.evaluate(arg));
        return this.apply(node, node.name, () => values.FUNCTIONS[node.name].apply(...args));
      }
      case 'unary': {
        const operand = this.evaluate(node.operand);
        return this.apply(node, node.operator, () => values.unary(node.operator, operand));
      }
      case 'binary': {
        const left = this.evaluate(node.left);
        const {operator} = node;

        //and and or skip their right side when the left one decides
        if (operator === COMMAND.AND || operator === COMMAND.OR) {
          const decided = this.apply(node, operator, () => values.boolean(left)) === (operator === COMMAND.OR);
          if (decided) return left;
          const right = this.evaluate(node.right);
          return this.apply(node, operator, () => values.boolean(right));
        }

        const right = this.evaluate(node.right);
        return this.checkText(this.apply(node, operator, () => values.binary(operator, left, right, this.booleans)));
      }
    }
  }

  /**
   * Computes a value of an operator or a function; a value that doesn't fit it is an error at its column.
   *
   * @param operator - an operator, or the command of a function or of not, and or or.
   */
  apply(node: {column?: number}, operator: string, compute: () => Value): Value {
    try {
      return compute();
    } catch (error) {
      if (!(error instanceof values.ValueError)) throw error;

      const where = {line: this.line, ...(node.column && {column: node.column})};
      if (error.id === ERROR.DIVISION_BY_ZERO) throw new CmilError({id: error.id, ...where});
      throw new CmilError({id: error.id, ...where, operator: this.wordOf(operator)});
    }
  }

  //a condition must be true or false
  test(expression: Expression): boolean {
    const value = this.evaluate(expression);
    if (typeof value !== 'boolean') throw new CmilError({id: ERROR.CONDITION_ERROR, line: this.line});
    return value;
  }

  /**
   * Runs until the program ends or waits for an input; the limits count from this call.
   * Errors of the program are thrown as CmilError.
   */
  run(): RunStatus {
    let steps = 0;

    while (this.position < this.instructions.length) {
      if (++steps > this.maxSteps) {
        throw new CmilError({id: ERROR.TIMEOUT});
      }

      const instruction = this.instructions[this.position];
      if (instruction.line) this.line = instruction.line;
      let next = this.position + 1;

      switch (instruction.op) {
        case 'print': {
          const text = instruction.expressions
            .map(expression => values.toText(this.evaluate(expression), this.booleans))
            .join(' ');
          if (text !== '') {
            this.outputLength += text.length + 1;
            if (this.outputLength > MAX_OUTPUT_LENGTH) {
              throw new CmilError({id: ERROR.MEMORY_LIMIT, line: this.line});
            }
            this.output.push(text);
          }
          break;
        }
        case 'input':
          if (this.input === undefined) {
            if (instruction.prompt) this.prompt = values.toText(this.evaluate(instruction.prompt), this.booleans);
            return STATE.INPUT;
          }
          this.variables.set(instruction.name, this.input);
          this.input = undefined;
          this.prompt = undefined;
          break;
        case 'assign':
          this.variables.set(instruction.name, this.evaluate(instruction.expression));
          break;
        case 'jump':
          next = instruction.target;
          break;
        case 'jumpUnless':
          if (!this.test(instruction.expression)) next = instruction.target;
          break;
        case 'jumpIf':
          if (this.test(instruction.expression)) next = instruction.target;
          break;
        case 'repeatStart': {
          //the count of passes is read once
          const count = this.evaluate(instruction.expression);
          this.counters[instruction.slot] = this.apply({}, COMMAND.REPEAT, () => values.passes(count)) as number;
          break;
        }
        case 'repeatTest':
          if (this.counters[instruction.slot] > 0) {
            this.counters[instruction.slot]--;
          } else {
            next = instruction.target;
          }
          break;
      }

      this.position = next;
    }

    return STATE.END;
  }
}

export default Interpreter;
