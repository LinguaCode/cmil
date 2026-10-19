const logger = require('../../../../../libs/logger');
const setter = require('../../../setter');

const checker = require('../../../checker');

const controllers = require('../controllers');

module.exports = (sessionId, typeOfObject) => {
  logger.log('compiler: upgrade', 'begin');

  let positions = require('./');

  setter.upgrade(sessionId, typeOfObject);

  positions[typeOfObject](sessionId);

  logger.log('compiler: upgrade', 'end');
};