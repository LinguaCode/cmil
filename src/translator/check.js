var quotationMarks = {
  begin: '«',
  end: '»'
};

var countBefore = function (input, index, symbol) {
  var count = 0;
  for (var i = index - 1; i >= 0; i--) {
    if (input[i] === symbol && input[i - 1] !== '\\') {
      count++;
    }
  }

  return count;
};

var countAfter = function (input, index, symbol) {
  var count = 0;
  for (var i = index + 1; i < input.length; i++) {
    if (input[i] === symbol && input[i - 1] !== '\\') {
      count++;
    }
  }

  return count;
};

var quoteAnalyze = function (input, index) {
  var quotes = {
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


  for (var key in quotes) {
    var quote = quotes[key];
    var symbol = quote.symbol;
    var count = quote.count;

    count.before = countBefore(input, index, symbol);
    count.after = countAfter(input, index, symbol);
    quote.isOpen = {
      before: count.before % 2 === 1,
      after: count.after % 2 === 1
    };

    delete quotes[key].count;
  }

  return quotes;
};

/**
 * Checks if the index is between text or comment.
 * @example
 * // returns '\u0562\u0561\u0580\u0565\u0582'
 * exports.isPartOfCode('var = "var a"', 7);
 * @param {String} input
 * @param {Number} index
 * @returns {Boolean} Returns true if index in input is between text or comment else no.
 */
var isNotPartOfText = function (input, index) {
  var quotes = quoteAnalyze(input, index);

  var currentSymbol = input[index];

  //counter of the <text quotes>
  var quotationMarkIndexes = {
    begin: input.lastIndexOf(quotationMarks.begin, index - 1),
    endOfBefore: input.lastIndexOf(quotationMarks.end, index - 1),
    endOfAfter: input.indexOf(quotationMarks.end, index + 1)
  };

  var isAnyQuotationMarkBegin = quotationMarkIndexes.begin !== -1;
  var isAnyQuotationMarkEnd = quotationMarkIndexes.endOfAfter !== -1;
  var isAnyQuotationMarks = isAnyQuotationMarkBegin && isAnyQuotationMarkEnd;

  if (isAnyQuotationMarks && quotationMarkIndexes.begin < quotationMarkIndexes.endOfBefore && !((quotes.es6.isOpen.before && quotes.es6.isOpen.after) || (!quotes.es6.isOpen.before && !quotes.es6.isOpen.after))) return true;
  if (isAnyQuotationMarks && quotationMarkIndexes.begin < quotationMarkIndexes.endOfAfter && !(quotationMarkIndexes.begin < quotationMarkIndexes.endOfBefore) && !quotes.es6.isOpen.before && !quotes.single.isOpen.before && !quotes.double.isOpen.before) return false;

  //check if the symbol was <text quote>
  if (currentSymbol === quotes.single.symbol) {
    if (quotes.double.isOpen.after && quotes.double.isOpen.before) return false;

    if ((quotes.single.isOpen.after && !quotes.single.isOpen.before) || (quotes.es6.isOpen.before && !quotes.single.isOpen.after)) {
      return true;
    }
  } else if (currentSymbol === quotes.double.symbol) {
    if (quotes.es6.isOpen.after && quotes.es6.isOpen.before) return false;

    if (
      (quotes.double.isOpen.after && !quotes.double.isOpen.before) ||
      (quotes.es6.isOpen.before && !quotes.double.isOpen.after)
    ) return true;
  }


  if (currentSymbol === quotes.es6.symbol) {
    return !quotes.single.isOpen.before || (quotes.single.isOpen.before && !quotes.single.isOpen.after);
  }


  if (currentSymbol === quotationMarks.begin) {
    return !quotes.es6.isOpen.after;
  } else if (currentSymbol === quotationMarks.end) {
    var indexOfNextMarkEnd = input.indexOf(currentSymbol, index + 1);
    var isNextMarkEndExists = indexOfNextMarkEnd !== -1;
    var indexOfNextES6 = input.indexOf(quotes.es6.symbol, index + 1);
    var isIndexOfNextMarkEndLowerThanIndexOfNextES6 = isNextMarkEndExists && indexOfNextMarkEnd < indexOfNextES6;
    return (
      !quotes.es6.isOpen.before || !quotes.es6.isOpen.after || (
        quotes.es6.isOpen.before && quotes.es6.isOpen.after && isNextMarkEndExists && !isIndexOfNextMarkEndLowerThanIndexOfNextES6
      )
    );
  }

  for (var key in quotes) {
    if (key !== 'markBegin' && key !== 'markEnd' && quotes[key].isOpen.before) return false;
  }

  return true;
};

var isNotPartOfComment = function (line, index) {
  const NUMBER_SIGN = '#';

  const indexOfNumberSign = line.lastIndexOf(NUMBER_SIGN, index);

  if (indexOfNumberSign === -1) return true;

  return !isNotPartOfText(line, indexOfNumberSign);
};

exports.isPartOfCode = function (line, index) {
  return isNotPartOfText(line, index) && isNotPartOfComment(line, index);
};

exports.isPartOfCommand = function (line, instance, index) {
  var previousSymbol = line[index - 1];
  var nextSymbol = line[instance.length + index];
  var regExp = /[^\u00AB\u00BB()%+\-*\/=#'"\s,]/;

  var isAnyPartBefore = previousSymbol && regExp.test(previousSymbol);
  var isAnyPartAfter = nextSymbol && regExp.test(nextSymbol);

  return isAnyPartBefore || isAnyPartAfter;
};
