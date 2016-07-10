let upgrade = function (sessionId, typeOfObject) {
  console.llog('compiler: upgrade', 'begin');

  let positions = require('./');

  setter.upgrade(sessionId, typeOfObject);
  
  let statusOfPassing = positions[typeOfObject](sessionId);
  if (statusOfPassing === false) {
    console.llog('compiler: upgrade', 'end');
    return false;
  }
  
  console.llog('compiler: upgrade', 'end');
};

module.exports = upgrade;

let setter = require('../../../setter');

let checker = require('../../../checker');

let controllers = require('../controllers');