let app = require('./app');
let debug = require('debug')('user_api:server');
let fs = require('fs');

let port = normalizePort(process.env.PORT || '3005');
let env = process.env.NODE_ENV || 'local';
app.set('port', port);

let server;
if (env == 'production') {
  let https = require('https');
  let privateKey = fs.readFileSync('./src/config/keys/linguacode_me_private.key', 'utf8');
  let certificate = fs.readFileSync('./src/config/keys/3_user_linguacode.me.crt', 'utf8');

  let certificates = (function () {
    let i, len, results;
    results = [];
    let certFileList = [
      'root.crt',
      '1_cross_Intermediate.crt',
      '2_issuer_Intermediate.crt',
      '3_user_linguacode.me.crt'
    ];
    for (i = 0, len = certFileList.length; i < len; i++) {
      let file = certFileList[i];
      results.push(fs.readFileSync('./src/config/keys/' + file, 'utf8'));
    }
    return results;
  })();

  let credentials = {
    ca: certificates,
    key: privateKey,
    cert: certificate
  };

  server = https.createServer(credentials, app);

  server.listen(port, function () {
    console.info('Server: https://localhost:%s is listen.', port);
  });
} else {
  let http = require('http');
  server = http.createServer(app);

  server.listen(port, function () {
    console.info('Server: http://localhost:%s is listen.', port);
  });
}

__io.attach(server);

server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  let port = parseInt(val, 10);

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
  let bind = typeof port === 'string'
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
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


