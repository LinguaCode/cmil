/*
exports.hackAttempted = params => `Hack attempt. Your "${params.ipAddress}" ip address was saved in the our database.`;

exports.indentFailure = params => `Space error in ${params.lineNumber} line.`;

exports.brokenVariable = (variableName) => `The "${variableName}" variable didn't defined.`;

*/

exports.hackAttempted = params => `Հաքերային հարձակման հայտնաբերում. Ձեր «${params.ipAddress}» ip հասցեն պահպանված է հետագա հետաքննության համար։`;

exports.indentFailure = params => `Բացատի սխալ ${params.lineNumber} տողում։`;

exports.brokenVariable = (variableName) => `«${variableName}» փոփոխականը հայտարարված չէ։`;