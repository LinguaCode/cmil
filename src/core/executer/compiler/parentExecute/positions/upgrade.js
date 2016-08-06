const setter = require('../../../setter');

const checker = require('../../../checker');

const controllers = require('../controllers');

module.exports = (sessionId, typeOfObject) => {
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