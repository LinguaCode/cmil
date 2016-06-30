const quotationMarks = {
  begin: '«',
  end: '»'
};

/**
 * This is a lib of some useful scripts which can be used in other projects.
 * @requires errorHandler/levels:spaces
 */

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
  return text.replace(rtrim, "");
};

let qouteAnalize = function (input, index) {
  let quotes = [{
    symbol: '`',
    count: {
      before: 0,
      after: 0
    }
  }, {
    symbol: '\'',
    count: {
      before: 0,
      after: 0
    }
  }, {
    symbol: '"',
    count: {
      before: 0,
      after: 0
    }
  }];

  for (let i = index - 1; i >= 0; i--) {
    for (let j = 0; j < quotes.length; j++) {
      if (input[i] == quotes[j].symbol && input[i - 1] !== '\\') {
        quotes[j].count.before++;
      }
    }
  }
  for (let i = index + 1; i < input.length; i++) {
    for (let j = 0; j < quotes.length; j++) {
      if (input[i] == quotes[j].symbol && input[i - 1] !== '\\') {
        quotes[j].count.after++;
      }
    }
  }

  return quotes.map(function (quote) {
    let count = quote.count;
    quote.isOpen = {
      before: count.before,
      after: count.after
    };

    delete quote.count;

    return quote;
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
  let quotes = qouteAnalize(input, index);

  let currentSymbol = input[index];

  //counter of the <text quotes>
  let quotationMarkIndexes = [
    input.lastIndexOf(quotationMarks.begin, index - 1),
    input.lastIndexOf(quotationMarks.end, index - 1),
    input.indexOf(quotationMarks.end, index + 1)
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

  //check if the symbol was <text quote>
  for (let i = 1; i < quotes.length; i++) {
    if (currentSymbol == quotes[i].symbol) {
      if ((quotes[i].isOpen.after && !quotes[i].isOpen.before) || (quotes[i].isOpen.after || !quotes[i].isOpen.before)) {
        return true;
      }
    }
  }

  if (currentSymbol == quotes[0].symbol) {
    return !quotes[1].isOpen.before || (quotes[1].isOpen.before && !quotes[1].isOpen.after);
  }

  if (currentSymbol == quotationMarks.begin) {
    return input.lastIndexOf(quotes[0].symbol, index - 1) == -1;
  } else if (currentSymbol == quotationMarks.end) {
    return input.lastIndexOf(quotes[0].symbol, index - 1) != -1 && quotes[0].count.after % 2 == 0;
  }

  for (var i = 0; i < quotes.length; i++) {
    if (quotes[i].isOpen.before) {
      break;
    }
  }

  return i == quotes.length;
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
      if (levelsTemp != -1) {
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