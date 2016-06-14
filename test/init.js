process.env.NODE_ENV = 'testing';

var chai = require('chai');
chai.should();

require('../src/server');
