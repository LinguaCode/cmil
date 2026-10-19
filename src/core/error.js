/**
 * An error of a CMIL program, reported to onSessionEnd as {errorId, param}.
 */
class CmilError extends Error {
  constructor(errorId, param = {}) {
    super(errorId);
    this.errorId = errorId;
    this.param = param;
  }
}

module.exports = CmilError;
