process.env.NODE_ENV = 'testing';

var chai = require('chai');
chai.should();

var config = require('../src/config');
require('../src/init')(config);