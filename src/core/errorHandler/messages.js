module.exports = {
  
  hackAttempted: function (params) {
    let ipAddress = params.ipAddress;
    return 'Hack attempt. Your "' + ipAddress + '" ip address was saved in the our database.';
  },

  indentFailure: function (params) {
    let lineNumber = params.lineNumber;
    return 'Space error in ' + lineNumber + ' line.';
  },

  brokenVariable: function (variableName) {
    return `The ${variableName} variable didn't defined.`;
  }
  
};