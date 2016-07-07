let upgrader = function (sessionId, typeOfObject) {
  console.llog('compiler: upgrader', 'begin');
  
  let positions = require('./');

  setter.upgrade(sessionId, typeOfObject);


  if (!checker.needToInput(sessionId, typeOfObject)) {
    let statusOfPassing = positions[typeOfObject](sessionId);
    if (statusOfPassing === false) {
      console.llog('compiler: upgrader', 'end');
      return false;
    }
  }

  if (checker.needToInput(sessionId, typeOfObject)) {
    let evaluated = {
      result: '',
      status: 'success'
    };

    __io.emit(sessionId + '_' + 'evaluated', evaluated);
    //trig if there is nothing to evaluate
    console.llog('compiler: Socket.IO: server: waiting for client input (ping: upgrader)');
  }

  console.llog('compiler: upgrader', 'end');
};

module.exports = upgrader;

let setter = require('../../../setter');

let checker = require('../../../checker');