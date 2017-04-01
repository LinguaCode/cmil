const fs = require('fs');
const io = require('./io');
const https = require('https');
const express = require('express');
const logger = require('lingua-logger');
const ENVIRONMENT = require('linguacode-constants').ENVIRONMENT;

let app = express();

const port = process.env.PORT = process.env.PORT || '3005';
const environment = process.env.NODE_ENV || 'local';
app.set('port', port);

require('./routes');

let server;

const certPath = process.env.CERT_FILE_PATH = process.env.CERT_FILE_PATH || './src/config/keys/';
const privateKeyFilePath = `${certPath}linguacode_me_private.key`;

let isCertFilesExist;
try {
  fs.accessSync(privateKeyFilePath, fs.F_OK);
  isCertFilesExist = true;
} catch (e) {
  isCertFilesExist = false;
}

if (environment == ENVIRONMENT.PRODUCTION && isCertFilesExist) {
  const privateKey = fs.readFileSync(`${certPath}linguacode_me_private.key`, 'utf8');
  const certificate = fs.readFileSync(`${certPath}3_user_linguacode.me.crt`, 'utf8');

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
    console.log(`Server: https://localhost:${port} is listen.`);
  });
} else {
  let http = require('http');
  server = http.createServer(app);

  server.listen(port, function () {
    console.llog(`Server: http://localhost:${port} is listen.`);
  });
}

io.attach(server);

server.on('listening', onListening);

function onListening() {
  const address = server.address();
  const fullAddress = `port ${address.port}`;
  console.llog(`Listening on ${fullAddress}`);
}

module.exports = server;