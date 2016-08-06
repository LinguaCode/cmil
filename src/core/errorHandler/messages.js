exports.hackAttempted = params => `Hack attempt. Your "${params.ipAddress}" ip address was saved in the our database.`;

exports.indentFailure = params => `Space error in ${params.lineNumber} line.`;

exports.brokenVariable = (variableName) => `The ${variableName} variable didn't defined.`;