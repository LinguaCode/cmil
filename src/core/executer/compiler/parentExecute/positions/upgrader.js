let upgrader = function (sessionId, typeOfObject) {
  console.llog('compiler: upgrader', 'begin');
  
  let positions = require('./');

  setter.upgrade(sessionId, typeOfObject);

  if (typeOfObject == 'toCompile' && checker.needToInput(sessionId)) {
    let evaluated = {
      result: '',
      status: 'success'
    };

    __io.emit(sessionId + '_' + 'evaluated', evaluated);
    console.llog('compiler: Socket.IO: server: output text  has been successfully send! (waits for input text)');
  } else {
    let statusOfPassing = positions[typeOfObject](sessionId);
    if (statusOfPassing === false) {
      console.llog('compiler: upgrader', 'end');
      return false;
    }
  }

  console.llog('compiler: upgrader', 'end');
};

module.exports = upgrader;

let setter = require('../../../setter');

let checker = require('../../../checker');