/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license GPLv3
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
