var app = require('./app');
var debug = require('debug')('user_api:server');
var fs = require('fs');

var port = normalizePort(process.env.PORT || '3005');
var env = process.env.NODE_ENV || 'local';
app.set('port', port);

var server;
if (env == 'production') {
  var https = require('https');
  var privateKey = fs.readFileSync('./src/config/keys/linguacode_me_private.key', 'utf8');
  var certificate = fs.readFileSync('./src/config/keys/3_user_linguacode.me.crt', 'utf8');

  var certificates = (function () {
    var i, len, results;
    results = [];
    var certFileList = [
      'root.crt',
      '1_cross_Intermediate.crt',
      '2_issuer_Intermediate.crt',
      '3_user_linguacode.me.crt'
    ];
    for (i = 0, len = certFileList.length; i < len; i++) {
      var file = certFileList[i];
      results.push(fs.readFileSync('./src/config/keys/' + file, 'utf8'));
    }
    return results;
  })();

  var credentials = {
    ca: certificates,
    key: privateKey,
    cert: certificate
  };

  server = https.createServer(credentials, app);

  server.listen(port, function () {
    console.info('Server: https://localhost:%s is listen.', port);
  });
} else {
  var http = require('http');
  server = http.createServer(app);

  server.listen(port, function () {
    console.info('Server: http://localhost:%s is listen.', port);
  });
}

__io.attach(server);

server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


