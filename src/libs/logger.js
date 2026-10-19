/**
 * Prints debugging messages of the core when the DEBUG environment variable is 'true'.
 *
 * @example
 * logger.log('compiler: codeRun', 'begin');
 *
 * @param {...*} messages
 */
exports.log = (...messages) => {
  const isEnabled = typeof process !== 'undefined' && process.env.DEBUG === 'true';
  if (isEnabled) {
    console.log(...messages);
  }
};
