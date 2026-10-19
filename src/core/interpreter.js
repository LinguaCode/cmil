/**
 * Runs the instructions of one program. All the state of the program belongs to its session.
 */
const CmilError = require('./error');
const values = require('./values');
const {COMMAND, STATUS, TIMEOUT_TIME, MAX_STEPS, MAX_TEXT_LENGTH, MAX_OUTPUT_LENGTH} = require('../constants');

const isTimeoutIgnored = () => typeof process !== 'undefined' && !!process.env.TIMEOUT_IGNORE;

//a condition fails only on false
const isPassed = value => value !== false;

class Session {
  constructor({instructions, slots}) {
    this.instructions = instructions;
    this.counters = new Array(slots).fill(0);
    this.variables = new Map();
    this.position = 0;
    this.line = 0;
    this.input = undefined;
    this.output = [];
    this.outputLength = 0;
  }

  /**
   * Gives the value for the input the program waits for.
   * @param {String|Number} input
   */
  setInput(input) {
    this.input = values.fromInput(input);
    this.checkText(this.input);
  }

  /**
   * Returns and clears the lines printed since the last call.
   * @returns {Array.<String>}
   */
  takeOutput() {
    const output = this.output;
    this.output = [];
    this.outputLength = 0;
    return output;
  }

  checkText(value) {
    if (typeof value === 'string' && value.length > MAX_TEXT_LENGTH) {
      throw new CmilError(STATUS.MEMORY_LIMIT, {line: this.line});
    }
    return value;
  }

  evaluate(node) {
    switch (node.type) {
      case 'value':
        return node.value;
      case 'variable':
        if (!this.variables.has(node.name)) {
          throw new CmilError(STATUS.UNDEFINED_VARIABLE, {variable: node.name, line: this.line});
        }
        return this.variables.get(node.name);
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
   *
   * @returns {String} STATUS.SESSION_END or STATUS.WAITS_FOR_INPUT.
   */
  run() {
    const startTime = Date.now();
    let steps = 0;

    while (this.position < this.instructions.length) {
      if (++steps > MAX_STEPS || (!isTimeoutIgnored() && Date.now() - startTime > TIMEOUT_TIME)) {
        throw new CmilError(STATUS.TIMEOUT);
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
              throw new CmilError(STATUS.MEMORY_LIMIT, {line: this.line});
            }
            this.output.push(text);
          }
          break;
        }
        case 'input':
          if (this.input === undefined) return STATUS.WAITS_FOR_INPUT;
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
          if (this.counters[instruction.slot] < this.evaluate(instruction.expression)) {
            this.counters[instruction.slot]++;
          } else {
            next = instruction.target;
          }
          break;
      }

      this.position = next;
    }

    return STATUS.SESSION_END;
  }
}

module.exports = Session;
