var cors = require('cors');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var express = require('express');
var helmet = require('helmet');

var app = express();

var socketIO = require('socket.io');
global.__io = socketIO();

//routes
var api = require('./routes/api');

app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var corsWhiteList = [
  '127.0.0.1',
  'linguacode.me',
  'localhost'
];

var corsWhiteListRegExp = new RegExp(corsWhiteList.join('|'));

var corsOptions = {
  origin: function (origin, callback) {
    var originIsWhiteListed = corsWhiteListRegExp.test(origin);
    callback(null, originIsWhiteListed);
  }
};
app.use(cors(corsOptions));

app.use(expressValidator());
app.use('/', api);

app.use(function (req, res, next) {
  var err = new Error('Not Found');
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
require('./routes/io');

module.exports = app;