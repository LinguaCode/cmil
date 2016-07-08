let cors = require('cors');
let express = require('express');
let helmet = require('helmet');
require('linguacode-logger');

let app = express();

let socketIO = require('socket.io');
global.__io = socketIO();

app.use(helmet());

let corsWhiteList = [
  '127.0.0.1',
  'linguacode.me',
  'localhost'
];

let corsWhiteListRegExp = new RegExp(corsWhiteList.join('|'));

let corsOptions = {
  origin: function (origin, callback) {
    let originIsWhiteListed = corsWhiteListRegExp.test(origin);
    callback(null, originIsWhiteListed);
  }
};

app.use(cors(corsOptions));

require('./routes');

module.exports = app;