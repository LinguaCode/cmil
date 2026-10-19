/**
 * Prints debugging messages of the core when the DEBUG environment variable is 'true'.
 *
 * @example
 * logger.log('CMIL: input received');
 */
export const log = (...messages: unknown[]): void => {
  const isEnabled = typeof process !== 'undefined' && process.env.DEBUG === 'true';
  if (isEnabled) {
    console.log(...messages);
  }
};
