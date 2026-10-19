import type {ErrorParam} from './types.ts';

/**
 * An error of a CMIL program, reported to onSessionEnd as {errorId, param}.
 */
class CmilError extends Error {
  errorId: string;
  param: ErrorParam;

  constructor(errorId: string, param: ErrorParam = {}) {
    super(errorId);
    this.errorId = errorId;
    this.param = param;
  }
}

export default CmilError;
