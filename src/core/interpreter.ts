/**
 * Runs the instructions of one program. All the state of the program belongs to its interpreter.
 */
import CmilError from './error.ts';
import * as values from './values.ts';
import {COMMAND, ERROR, STATE, MAX_TEXT_LENGTH, MAX_OUTPUT_LENGTH} from '../constants/index.ts';
import type {Expression, Instruction, Program, Value} from './types.ts';

//a condition fails only on false
const isPassed = (value: Value) => value !== false;

export type RunStatus = (typeof STATE)[keyof typeof STATE];

class Interpreter {
  instructions: Instruction[];
  maxSteps: number;
  counters: number[];
  variables = new Map<string, Value>();
  position = 0;
  line = 0;
  input: Value | undefined = undefined;
  output: string[] = [];
  outputLength = 0;

  /**
   * @param maxSteps - the steps the program may run in one call of run().
   */
  constructor({instructions, slots}: Program, maxSteps: number) {
    this.instructions = instructions;
    this.maxSteps = maxSteps;
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
      case 'call':
        return values.FUNCTIONS[node.name].apply(...node.args.map(arg => this.evaluate(arg)));
      case 'unary': {
        const operand = this.evaluate(node.operand);
        if (node.operator === COMMAND.NOT) return !operand;
        return node.operator === '-' ? -operand : +operand;
      }
      case 'binary': {
        const left = this.evaluate(node.left);
        if (node.operator === COMMAND.AND) return left && this.evaluate(node.right);
        if (node.operator === COMMAND.OR) return left || this.evaluate(node.right);
        return this.checkText(values.binary(node.operator, left, this.evaluate(node.right)));
      }
    }
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
        case 'output': {
          const text = values.toText(this.evaluate(instruction.expression));
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
          if (this.input === undefined) return STATE.INPUT;
          this.variables.set(instruction.name, this.input);
          this.input = undefined;
          break;
        case 'assign':
          this.variables.set(instruction.name, this.evaluate(instruction.expression));
          break;
        case 'jump':
          next = instruction.target;
          break;
        case 'jumpUnless':
          if (!isPassed(this.evaluate(instruction.expression))) next = instruction.target;
          break;
        case 'jumpIf':
          if (isPassed(this.evaluate(instruction.expression))) next = instruction.target;
          break;
        case 'repeatStart':
          this.counters[instruction.slot] = 0;
          break;
        case 'repeatTest':
          if (this.counters[instruction.slot] < (this.evaluate(instruction.expression) as number)) {
            this.counters[instruction.slot]++;
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
