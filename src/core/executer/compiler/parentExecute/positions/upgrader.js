let upgrader = function (sessionId, typeOfObject) {
  let positions = require('./');

  setter.upgrade(sessionId, typeOfObject);

  if (typeOfObject == 'toCompile' && checker.needToInput(sessionId)) {
    let evaluated = {
      result: '',
      status: 'success'
    };

    __io.emit(sessionId + '_' + 'evaluated', evaluated);
    console.info('Socket.IO: server: output text  has been successfully send! (waits for input text)');
  } else {
    let statusOfPassing = positions[typeOfObject](sessionId);
    if (statusOfPassing === false) {
      return false;
    }
  }
  
  //goto: parent|child
};

module.exports = upgrader;

let setter = require('../../../setter');

let checker = require('../../../checker');