type Quote = {
  symbol: string;
  isOpen: {
    before: boolean;
    after: boolean;
  };
};

type QuoteName = 'es6' | 'single' | 'double' | 'markBegin' | 'markEnd';

const quotationMarks = {
  begin: '«',
  end: '»'
};

const QUOTE_SYMBOLS: Record<QuoteName, string> = {
  es6: '`',
  single: "'",
  double: '"',
  markBegin: '«',
  markEnd: '»'
};

const countBefore = function (input: string, index: number, symbol: string): number {
  let count = 0;
  for (let i = index - 1; i >= 0; i--) {
    if (input[i] === symbol && input[i - 1] !== '\\') {
      count++;
    }
  }

  return count;
};

const countAfter = function (input: string, index: number, symbol: string): number {
  let count = 0;
  for (let i = index + 1; i < input.length; i++) {
    if (input[i] === symbol && input[i - 1] !== '\\') {
      count++;
    }
  }

  return count;
};

const quoteAnalyze = function (input: string, index: number): Record<QuoteName, Quote> {
  const analyze = (symbol: string): Quote => ({
    symbol,
    isOpen: {
      before: countBefore(input, index, symbol) % 2 === 1,
      after: countAfter(input, index, symbol) % 2 === 1
    }
  });

  return {
    es6: analyze(QUOTE_SYMBOLS.es6),
    single: analyze(QUOTE_SYMBOLS.single),
    double: analyze(QUOTE_SYMBOLS.double),
    markBegin: analyze(QUOTE_SYMBOLS.markBegin),
    markEnd: analyze(QUOTE_SYMBOLS.markEnd)
  };
};

/**
 * Checks if the index is between text or comment.
 * @example
 * // returns 'բարեւ'
 * exports.isPartOfCode('var = "var a"', 7);
 * @returns Returns true if index in input is between text or comment else no.
 */
const isNotPartOfText = function (input: string, index: number): boolean {
  const quotes = quoteAnalyze(input, index);

  const currentSymbol = input[index];

  //counter of the <text quotes>
  const quotationMarkIndexes = {
    begin: input.lastIndexOf(quotationMarks.begin, index - 1),
    endOfBefore: input.lastIndexOf(quotationMarks.end, index - 1),
    endOfAfter: input.indexOf(quotationMarks.end, index + 1)
  };

  const isAnyQuotationMarkBegin = quotationMarkIndexes.begin !== -1;
  const isAnyQuotationMarkEnd = quotationMarkIndexes.endOfAfter !== -1;
  const isAnyQuotationMarks = isAnyQuotationMarkBegin && isAnyQuotationMarkEnd;

  if (
    isAnyQuotationMarks &&
    quotationMarkIndexes.begin < quotationMarkIndexes.endOfBefore &&
    !((quotes.es6.isOpen.before && quotes.es6.isOpen.after) || (!quotes.es6.isOpen.before && !quotes.es6.isOpen.after))
  )
    return true;
  if (
    isAnyQuotationMarks &&
    quotationMarkIndexes.begin < quotationMarkIndexes.endOfAfter &&
    !(quotationMarkIndexes.begin < quotationMarkIndexes.endOfBefore) &&
    !quotes.es6.isOpen.before &&
    !quotes.single.isOpen.before &&
    !quotes.double.isOpen.before
  )
    return false;

  //check if the symbol was <text quote>
  if (currentSymbol === quotes.single.symbol) {
    if (quotes.double.isOpen.after && quotes.double.isOpen.before) return false;

    if (
      (quotes.single.isOpen.after && !quotes.single.isOpen.before) ||
      (quotes.es6.isOpen.before && !quotes.single.isOpen.after)
    ) {
      return true;
    }
  } else if (currentSymbol === quotes.double.symbol) {
    if (quotes.es6.isOpen.after && quotes.es6.isOpen.before) return false;

    if (
      (quotes.double.isOpen.after && !quotes.double.isOpen.before) ||
      (quotes.es6.isOpen.before && !quotes.double.isOpen.after)
    )
      return true;
  }

  if (currentSymbol === quotes.es6.symbol) {
    return !quotes.single.isOpen.before || (quotes.single.isOpen.before && !quotes.single.isOpen.after);
  }

  if (currentSymbol === quotationMarks.begin) {
    return !quotes.es6.isOpen.after;
  } else if (currentSymbol === quotationMarks.end) {
    const indexOfNextMarkEnd = input.indexOf(currentSymbol, index + 1);
    const isNextMarkEndExists = indexOfNextMarkEnd !== -1;
    const indexOfNextES6 = input.indexOf(quotes.es6.symbol, index + 1);
    const isIndexOfNextMarkEndLowerThanIndexOfNextES6 = isNextMarkEndExists && indexOfNextMarkEnd < indexOfNextES6;
    return (
      !quotes.es6.isOpen.before ||
      !quotes.es6.isOpen.after ||
      (quotes.es6.isOpen.before &&
        quotes.es6.isOpen.after &&
        isNextMarkEndExists &&
        !isIndexOfNextMarkEndLowerThanIndexOfNextES6)
    );
  }

  if (quotes.es6.isOpen.before || quotes.single.isOpen.before || quotes.double.isOpen.before) return false;

  return true;
};

const isNotPartOfComment = function (line: string, index: number): boolean {
  const NUMBER_SIGN = '#';

  const indexOfNumberSign = line.lastIndexOf(NUMBER_SIGN, index);

  if (indexOfNumberSign === -1) return true;

  return !isNotPartOfText(line, indexOfNumberSign);
};

export const isPartOfCode = function (line: string, index: number): boolean {
  return isNotPartOfText(line, index) && isNotPartOfComment(line, index);
};

export const isPartOfCommand = function (line: string, instance: string, index: number): boolean {
  const previousSymbol = line[index - 1];
  const nextSymbol = line[instance.length + index];
  const regExp = /[^«»()%+\-*/=#'"\s,]/;

  const isAnyPartBefore = !!previousSymbol && regExp.test(previousSymbol);
  const isAnyPartAfter = !!nextSymbol && regExp.test(nextSymbol);

  return isAnyPartBefore || isAnyPartAfter;
};
