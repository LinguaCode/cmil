const path = require('./');
const value = require('../value');

const OPERATIONS = 'operations';
const INPUT_COMMAND = 'inputVariable';

let conditionParse = (sessionId, parseType) => `${path.location(sessionId)}.${parseType}`;

exports.condition = sessionId => conditionParse(sessionId, 'condition');

exports.conditionType = sessionId => conditionParse(sessionId, 'type');

exports.operations = sessionId => `${path.location(sessionId)}.${OPERATIONS}`;

exports.inputVariable = sessionId => `${path.location(sessionId)}.${INPUT_COMMAND}`;