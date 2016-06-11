/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license Apache-2.0
 */

module.exports = function () {
  return {
    replace: [{
      which: '։',
      toWhat: ':'
    }, {
      which: '"',
      toWhat: '\''
    }, {
      which: '«',
      toWhat: '\''
    }, {
      which: '»',
      toWhat: '\''
    }, {
      which: '․',
      toWhat: '.'
    }]
  };
};
