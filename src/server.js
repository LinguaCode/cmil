let app = require('./app');
let fs = require('fs');

let port = process.env.PORT = process.env.PORT || '3005';
let env = process.env.NODE_ENV || 'local';
app.set('port', port);

let server;

const certPath = './src/config/keys/';
let privateKeyFilePath = certPath + 'linguacode_me_private.key';

let isCertFilesExist;
process.env.DEBUG = 'user_api';

try {
  fs.accessSync(privateKeyFilePath, fs.F_OK);
  isCertFilesExist = true;
} catch (e) {
  isCertFilesExist = false;
}

if (env == 'production' && isCertFilesExist) {
  let https = require('https');
  let privateKey = fs.readFileSync(certPath + 'linguacode_me_private.key', 'utf8');
  let certificate = fs.readFileSync(certPath + '3_user_linguacode.me.crt', 'utf8');

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
      results.push(fs.readFileSync(certPath + file, 'utf8'));
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

server.on('listening', onListening);

function onListening() {
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

module.exports = server;