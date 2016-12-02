exports.concat = sourceCode => ` ${sourceCode} `;

exports.cut = sourceCode => sourceCode.replace(/^\s/, '').replace(/\s$/, '');