/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license GPLv3
 */

var upgrader = function (sessionId, typeOfObject) {
  var positions = require('./');

  setter.upgrade(sessionId, typeOfObject);

  if (typeOfObject == 'toCompile' && checker.needToInput(sessionId)) {
    var evaluated = {
      result: '',
      status: 'success'
    };

    __io.emit(sessionId + '_' + 'evaluated', evaluated);
    console.info('Socket.IO: output text  has been successfully send! (waits for input text)');
  } else {
    positions[typeOfObject](sessionId);
  }
};

module.exports = upgrader;

var setter = require('../../../setter');

var checker = require('../../../checker');