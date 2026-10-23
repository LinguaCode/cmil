/**
 * Runs the instructions of one program. All the state of the program belongs to its interpreter.
 *
 * A call of a function runs the instructions of the function in the same loop, so a function can wait for input.
 * The instruction with the call stops, and records the values it computed until the call; when the function returns,
 * the instruction runs again with the recorded values and the value of the call, and continues where it was.
 */
import CmilError from './error.ts';
import * as values from './values.ts';
import {COMMAND, ERROR, STATE, MAX_TEXT_LENGTH, MAX_OUTPUT_LENGTH, MAX_RECURSION} from '../constants/index.ts';
import type {UserCall} from './tree.ts';
import type {Quotes} from '../translations/index.ts';
import type {Expression, Instruction, Program, UserFunction, Value} from './types.ts';

export type RunStatus = (typeof STATE)[keyof typeof STATE];

//thrown when an instruction stops at a call of a function
const SUSPEND = Symbol('suspend');
//the value of a call of a function that returned without a value
const NONE = Symbol('none');

//a value an instruction computed, and the number of the next value after it and its parts
type Recorded = {value: Value | typeof NONE; end: number};

//the state of the caller of a function
type Frame = {
  //the instruction with the call, which runs again when the function returns
  position: number;
  variables: Map<string, Value>;
  counters: number[];
  ranges: Interpreter['ranges'];
  sequences: Interpreter['sequences'];
  tape: Recorded[];
  //the number of the call in the tape, and the number after its arguments
  call: number;
  end: number;
};

class Interpreter {
  instructions: Instruction[];
  functions: Map<string, UserFunction>;
  replays: boolean[];
  maxSteps: number;
  wordOf: (command: string) => string;
  format: values.Format;
  random: () => number;
  counters: number[];
  //the bounds of each for loop, and the passes it has made
  ranges: {from: number; to: number; step: number; passes: number}[] = [];
  //the items of each for … in loop, and the passes it has made
  sequences: {items: Value[]; passes: number}[] = [];
  variables = new Map<string, Value>();
  position = 0;
  line = 0;
  input: Value | undefined = undefined;
  output: string[] = [];
  outputLength = 0;
  //the callers of the functions that haven't returned yet
  frames: Frame[] = [];
  //the values the current instruction computed, when it has calls of functions, and the number of the next value
  tape: Recorded[] | null = null;
  counter = 0;
  //the values of the instruction that runs again after a call returned
  resumed: Recorded[] | null = null;

  /**
   * @param maxSteps - the steps the program may run in one call of run().
   * @param wordOf - the word of a command in the program's language, or an operator as it is; output and errors use it.
   * @param quotes - the quotes of texts in printed lists.
   * @param random - a number from 0 up to 1, like Math.random(), for random().
   */
  constructor(
    {instructions, slots, functions, replays}: Program,
    maxSteps: number,
    wordOf: (command: string) => string,
    quotes: Quotes,
    random: () => number = Math.random
  ) {
    this.instructions = instructions;
    this.functions = functions;
    this.replays = replays;
    this.maxSteps = maxSteps;
    this.wordOf = wordOf;
    this.format = {true: wordOf(COMMAND.TRUE), false: wordOf(COMMAND.FALSE), quotes};
    this.random = random;
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

  //a value as it is printed; a list printed longer than a text may be is a memoryLimit
  text(value: Value): string {
    return this.apply({}, '', () => values.toText(value, this.format));
  }

  /**
   * The value of an expression; a call of a function used in it must return a value.
   */
  evaluate(node: Expression): Value {
    if (!this.tape) return this.compute(node);

    const value = this.replay(node);
    if (value !== NONE) return value;
    const {name, column} = node as UserCall;
    throw new CmilError({id: ERROR.NO_VALUE, line: this.line, column, function: name});
  }

  /**
   * The value of an expression in an instruction with calls: the recorded value, or a value computed and recorded.
   * A call that hasn't returned yet starts its function and stops the instruction.
   */
  replay(node: Expression): Value | typeof NONE {
    const tape = this.tape as Recorded[];
    const number = this.counter++;
    const recorded = tape[number];
    if (recorded) {
      this.counter = recorded.end;
      return recorded.value;
    }

    if (node.type === 'userCall') {
      const args = node.args.map(arg => this.evaluate(arg));
      this.enter(node, args, number);
      throw SUSPEND;
    }

    const value = this.compute(node);
    tape[number] = {value, end: this.counter};
    return value;
  }

  //starts a function: its parameters are its only variables
  enter(call: UserCall, args: Value[], number: number): void {
    if (this.frames.length >= MAX_RECURSION) throw new CmilError({id: ERROR.RECURSION_LIMIT, line: this.line});

    const {start, parameters} = this.functions.get(call.name) as UserFunction;
    const {position, variables, counters, ranges, sequences, counter: end} = this;
    this.frames.push({
      position,
      variables,
      counters,
      ranges,
      sequences,
      tape: this.tape as Recorded[],
      call: number,
      end
    });

    this.variables = new Map(parameters.map((name, i) => [name, args[i]]));
    this.counters = [];
    this.ranges = [];
    this.sequences = [];
    this.position = start;
  }

  compute(node: Expression): Value {
    switch (node.type) {
      case 'value':
        return node.value;
      case 'list':
        return node.items.map(item => this.evaluate(item));
      case 'index': {
        const target = this.evaluate(node.target);
        const index = this.evaluate(node.index);
        return this.apply(node, '[]', () => values.item(target, index));
      }
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
        return this.checkText(
          this.apply(node, node.name, () => values.FUNCTIONS[node.name].apply(args, this.format, this.random))
        );
      }
      case 'userCall':
        throw new Error('A call of a function in an instruction without calls.');
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
        return this.checkText(this.apply(node, operator, () => values.binary(operator, left, right, this.format)));
      }
    }
  }

  /**
   * Computes a value of an operator or a function; a value that doesn't fit it is an error at its column.
   *
   * @param operator - an operator, [] of an index, or the command of a function, of a loop or of not, and or or.
   */
  apply<T>(node: {column?: number}, operator: string, compute: () => T): T {
    try {
      return compute();
    } catch (error) {
      if (!(error instanceof values.ValueError)) throw error;

      const where = {line: this.line, ...(node.column && {column: node.column})};
      if (error.id === ERROR.MEMORY_LIMIT) throw new CmilError({id: error.id, line: this.line});
      if (error.id === ERROR.INDEX_ERROR) {
        throw new CmilError({id: error.id, line: this.line, column: node.column ?? 0, index: error.index});
      }
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

      this.tape = this.replays[this.position] ? (this.resumed ?? []) : null;
      this.resumed = null;
      this.counter = 0;

      try {
        switch (instruction.op) {
          case 'print': {
            const text = this.text(this.evaluate(instruction.expression));
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
          case 'setItem': {
            const target = this.evaluate(instruction.target);
            const index = this.evaluate(instruction.index);
            const value = this.evaluate(instruction.expression);
            this.apply(instruction, '[]', () => values.setItem(target, index, value));
            break;
          }
          case 'add': {
            const value = this.evaluate(instruction.expression);
            const target = this.evaluate(instruction.target);
            this.apply({}, COMMAND.ADD, () => values.add(value, target));
            break;
          }
          case 'remove': {
            const value = this.evaluate(instruction.expression);
            const target = this.evaluate(instruction.target);
            if (!this.apply({}, COMMAND.REMOVE, () => values.remove(value, target))) {
              const item = this.apply({}, '', () => values.itemText(value, this.format));
              throw new CmilError({id: ERROR.ITEM_ERROR, line: this.line, item});
            }
            break;
          }
          case 'call':
            //the value of the call isn't used, and the function may return none
            this.replay(instruction.call);
            break;
          case 'return': {
            const value = instruction.expression ? this.evaluate(instruction.expression) : NONE;
            const frame = this.frames.pop() as Frame;
            ({
              variables: this.variables,
              counters: this.counters,
              ranges: this.ranges,
              sequences: this.sequences
            } = frame);
            frame.tape[frame.call] = {value, end: frame.end};
            this.resumed = frame.tape;
            next = frame.position;
            break;
          }
          case 'end':
            return STATE.END;
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
            this.counters[instruction.slot] = this.apply({}, COMMAND.REPEAT, () => values.passes(count));
            break;
          }
          case 'forStart': {
            //the bounds are read once
            const from = this.evaluate(instruction.from);
            const to = this.evaluate(instruction.to);
            const step = instruction.step ? this.evaluate(instruction.step) : 1;
            const range = this.apply({}, COMMAND.FOR, () => values.bounds(from, to, step));
            this.apply({}, COMMAND.STEP, () => values.nonZero(range[2]));
            this.ranges[instruction.slot] = {from: range[0], to: values.rounded(range[1]), step: range[2], passes: 0};
            break;
          }
          case 'forTest': {
            //each value is counted from the start, so a step like 0.1 doesn't add up errors
            const range = this.ranges[instruction.slot];
            const value = values.rounded(range.from + range.passes * range.step);
            if (range.step > 0 ? value <= range.to : value >= range.to) {
              this.variables.set(instruction.name, value);
              range.passes++;
            } else {
              next = instruction.target;
            }
            break;
          }
          case 'forEachStart': {
            //the items are taken once
            const value = this.evaluate(instruction.expression);
            this.sequences[instruction.slot] = {
              items: this.apply({}, COMMAND.IN, () => values.sequence(value)),
              passes: 0
            };
            break;
          }
          case 'forEachTest': {
            const sequence = this.sequences[instruction.slot];
            if (sequence.passes < sequence.items.length) {
              this.variables.set(instruction.name, sequence.items[sequence.passes++]);
            } else {
              next = instruction.target;
            }
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
      } catch (error) {
        //the function of the call runs next
        if (error === SUSPEND) continue;
        throw error;
      }

      this.position = next;
    }

    return STATE.END;
  }
}

export default Interpreter;
