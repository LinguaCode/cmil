import type {ProgramError} from './types.ts';

/**
 * An error of a CMIL program, thrown inside the core; Session and check() return its error.
 */
class CmilError extends Error {
  error: ProgramError;

  constructor(error: ProgramError) {
    super(error.id);
    this.error = error;
  }
}

export default CmilError;
