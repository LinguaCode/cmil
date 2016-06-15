/**
 * This is the store and initializes where will be saved all dynamic information such as:
 * - old and new changed language types,
 * - translation texts,
 * - structured sourceCode and the structure's dynamic operation path.
 */

/**
 * Initialize the all initializers.
 *
 * @example
 * exports.store('_pyr9_NmyEOAL7manAAAE_0')
 *
 * @param {String} sessionId - session id.
 */
module.exports = function (sessionId) {
  globals(sessionId);
  translator(sessionId);
  store(sessionId);
  language(sessionId);
};

/**
 * Global variable initialize.
 */
var globals = function () {
  /**
   * @param {Object} __language - get and set the language.
   * @param {Object} __store - sourceCode controlling.
   * @param {Object} __translator - translation globals controlling.
   */
  global.__store = {};
  global.__language = {};
  global.__translator = {};

};

/**
 * Initialize a storage to save the translations texts of comments and string values of the common sourceCode.
 *
 * @example
 * exports.store('_pyr9_NmyEOAL7manAAAE_0');
 *
 * @param {String} sessionId - session id.
 */
var translator = function (sessionId) {
  /**
   * @param {Number} __translator[sessionId].structure - structure of the LinguaCode's sourceCode.
   * @param {Array} __translator[sessionId].from - list of the translation texts.
   * @param {String} __translator[sessionId].input - //TODO: write there the signification of this field.
   */
  __translator[sessionId] = {
    index: 0,
    from: [],
    input: ''
  };
};

/**
 * Initialize a storage to save the structure of LinguaCode's sourceCode and the path of operation.
 *
 * @example
 * exports.store('_pyr9_NmyEOAL7manAAAE_0');
 *
 * @param {String} sessionId - session id.
 */
var store = function (sessionId) {
  /**
   * @param {Object} __store[sessionId].structure - structure of the LinguaCode's sourceCode.
   * @param {String} __store[sessionId].pathOfLocation - dynamic path of the operation.
   */
  __store[sessionId] = {
    structure: {},
    pathOfLocation: '',
    output: ''
  };
};

/**
 * Initialize and save a new and old properties for the current session.
 *
 * @example
 * exports.language('_pyr9_NmyEOAL7manAAAE_0');
 *
 * @param {String} sessionId - session id.
 */
var language = function (sessionId) {
  /**
   * @param {String} __language[sessionId].new - the Changed language, type: ISO 639-1.
   * @param {String} __language[sessionId].old - the old language which is changed, type: ISO 639-1.
   */
  __language[sessionId] = {
    new: 'hy',
    old: 'hy'
  };
};