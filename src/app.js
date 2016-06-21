let cors = require('cors');
let bodyParser = require('body-parser');
let expressValidator = require('express-validator');
let session = require('express-session');
let express = require('express');
let helmet = require('helmet');

let app = express();

let socketIO = require('socket.io');
global.__io = socketIO();

app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

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

app.use(expressValidator());

app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});
app.use(function (err, req, res) {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: {}
  });
});

if (app.get('env') === 'development') {
  app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: err
    });
  });
}

require('./routes');

module.exports = app;