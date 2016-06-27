/**
 * This is a lib of some useful scripts which can be used in other projects.
 * @requires errorHandler/levels:spaces
 */

let errorHandler = require('./errorHandler');

/**
 * jQuery trim clone.
 * @example
 * // returns 'Hello'
 * exports.trim('   Hello       ');
 * @param {String} text
 * @returns {String} Returns the result as jQuery.trim(text)
 */
exports.trim = function (text) {
  let rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
  return text == null ?
    "" :
    ( text + "" ).replace(rtrim, "");
};

/**
 * Converts the text into unicode escaped format.
 * @example
 * // returns '\u0562\u0561\u0580\u0565\u0582'
 * exports.unicodeEscape('բարեւ');
 * @param {String} input
 * @returns {String} Returns the unicode escaped text.
 */
exports.unicodeEscape = function (input) {
  return input.replace(/[\s\S]/g, function (character) {
    let escape = character.charCodeAt(0).toString(16),
      longhand = escape.length > 2;
    return '\\' + (longhand ? 'u' : 'x') + ('0000' + escape).slice(longhand ? -4 : -2);
  });
};

/**
 * Checks if the index is between text or comment.
 * @example
 * // returns '\u0562\u0561\u0580\u0565\u0582'
 * exports.isPartOfCode('let = "let a"', 7);
 * @param {String} input
 * @param {Number} index
 * @returns {Boolean} Returns true if index in input is between text or comment else no.
 */
exports.isPartOfCode = function (input, index) {
  const ch = ['\"', '\''];
  const quotationMarks = ['«', '»'];
  let counter = [0, 0];

  let currentSymbol = input[index];
  if (ch.indexOf(currentSymbol) != -1 || quotationMarks.indexOf(currentSymbol) != -1) {
    return true;
  }

  for (let i = index - 1; i >= 0; i--) {
    if (input[i] == ch[0]) {
      counter[0]++;
    }
    if (input[i] == ch[1]) {
      counter[1]++;
    }
  }

  if (input[index] == ch[0]) {
    return (counter[0] === 0 || counter[0] % 2 === 1);
  }

  if (input[index] == ch[1]) {
    return (counter[1] === 0 || counter[1] % 2 === 1);
  }

  let quotationMarkIndexes = [
    input.lastIndexOf(quotationMarks[0], index - 1),
    input.lastIndexOf(quotationMarks[1], index - 1),
    input.indexOf(quotationMarks[1], index + 1)
  ];
  if (quotationMarkIndexes[0] !== -1 && quotationMarkIndexes[2] !== -1) {
    if (quotationMarkIndexes[0] < quotationMarkIndexes[1]) {
      return true;
    } else if (quotationMarkIndexes[0] < quotationMarkIndexes[2]) {
      return false;
    }
  } else if (input.lastIndexOf(quotationMarks[0], index - 1) !== -1 && input.indexOf(quotationMarks[1], index + 1) != -1) {
    return true;
  }

  return (counter[0] % 2 === 0 && counter[1] % 2 === 0);
};

/**
 * Analyzing sourceCode for depth of code levels.
 * @example
 * // returns [0, 0, 0, 1, 0, 1]
 * exports.codeDepthLevels.all('
 * input a\
 * input b\
 * if a > b\
 *     output a\
 * else\
 *     output b\
 * ');
 * @param {String} input
 * @returns {Array.<Number>} Returns Array of code depth levels of the sourceCode.
 */
exports.codeDepthLevels = {

  line: function (str) {
    let spaces, level;
    spaces = 0;
    for (let i = 0; i < str.length; i++) {
      if (str[i] != ' ') {
        break;
      }
      spaces++;
    }
    if (spaces % 4 !== 0) {
      return -1;
    }
    level = spaces / 4;
    return level;
  },

  all: function (listOfCommands) {
    let levels = [];
    for (let i = 0, levelsTemp; i < listOfCommands.length; i++) {
      levelsTemp = this.line(listOfCommands[i]);
      if (levelsTemp == -1) {
        errorHandler.levels.spaces(i);
      } else {
        levels.push(levelsTemp);
      }
    }
    return levels;
  }

};

/**
 * Checks is the input value is a valid number or not.
 * @example
 * exports.isNumeric(NaN);
 * // returns false
 * @example
 * exports.isNumeric('321');
 * // returns true
 * @param {Infinity|NaN|String|Number} number
 * @returns {Boolean} Returns true if the input value is valid number.
 */
exports.isNumeric = function (number) {
  return !isNaN(parseFloat(number)) && isFinite(number);
};

/**
 * Returns logical possible number type value else as string.
 * @example
 * exports.valueRender('-25');
 * // returns -25
 * @example
 * exports.valueRender('_123');
 * // returns '_123'
 * @param {String} inputText
 * @returns {String|Number} Checks if the input string is a valid number then convert it to Number type else return the input value in scopes.
 */
exports.valueRender = function (inputText) {
  if (this.isNumeric(inputText)) {
    return parseFloat(inputText);
  }
  return '\'' + inputText + '\'';
};