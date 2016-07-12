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

let quoteAnalize = function (input, index) {
  let quotes = {
    es6: {
      symbol: '`',
      count: {
        before: 0,
        after: 0
      }
    },
    single: {
      symbol: '\'',
      count: {
        before: 0,
        after: 0
      }
    },
    double: {
      symbol: '"',
      count: {
        before: 0,
        after: 0
      }
    },
    markBegin: {
      symbol: '«',
      count: {
        before: 0,
        after: 0
      }
    },
    markEnd: {
      symbol: '»',
      count: {
        before: 0,
        after: 0
      }
    }
  };

  for (let i = index - 1; i >= 0; i--) {
    quotes = counter(quotes, input, 'before', i);
  }

  for (let i = index + 1; i < input.length; i++) {
    quotes = counter(quotes, input, 'after', i);
  }

  for (let key in quotes) {
    let count = quotes[key].count;
    quotes[key].isOpen = {
      before: count.before % 2 === 1,
      after: count.after % 2 === 1
    };

    delete quotes[key].count;
  }

  return quotes;
};


let counter = function (quotes, input, position, index) {


  for (let key in quotes) {
    if (input[index] === quotes[key].symbol && input[index - 1] !== '\\') {
      quotes[key].count[position]++;
    }
  }

  return quotes;
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
  let quotes = quoteAnalize(input, index);

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
  }

  //check if the symbol was <text quote>
  if (currentSymbol === quotes.single.symbol) {
    if (quotes.double.isOpen.after && quotes.double.isOpen.before) {
      return false;
    }

    if ((quotes.single.isOpen.after && !quotes.single.isOpen.before) || (quotes.es6.isOpen.before && !quotes.single.isOpen.after)) {
      return true;
    }
  } else if (currentSymbol === quotes.double.symbol) {
    if (quotes.es6.isOpen.after && quotes.es6.isOpen.before) {
      return false;
    }

    if ((quotes.double.isOpen.after && !quotes.double.isOpen.before) || (quotes.es6.isOpen.before && !quotes.double.isOpen.after)) {
      return true;
    }
  }


  if (currentSymbol === quotes.es6.symbol) {
    return !quotes.single.isOpen.before || (quotes.single.isOpen.before && !quotes.single.isOpen.after);
  }

  if (currentSymbol === quotationMarks.begin) {
    return !quotes.es6.isOpen.after;
  } else if (currentSymbol === quotationMarks.end) {
    let indexOfNextMarkEnd = input.indexOf(currentSymbol, index + 1);
    let isNextMarkEndExists = indexOfNextMarkEnd !== -1;
    let indexOfNextES6 = input.indexOf(quotes.es6.symbol, index + 1);
    let isIndexOfNextMarkEndLowerThanIndexOfNextES6 = isNextMarkEndExists && indexOfNextMarkEnd < indexOfNextES6;
    return !quotes.es6.isOpen.before || !quotes.es6.isOpen.after || (quotes.es6.isOpen.before && quotes.es6.isOpen.after && isNextMarkEndExists && ! isIndexOfNextMarkEndLowerThanIndexOfNextES6);
  }

  for (let key in quotes) {
    if (key !== 'markBegin' && key !== 'markEnd') {
      if (quotes[key].isOpen.before) {
        return false;
      }
    }
  }

  return true;
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
      if (str[i] !== ' ') {
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
      if (levelsTemp !== -1) {
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