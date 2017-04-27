const fs = require('fs');
const io = require('./io');
const spdy = require('spdy');
const express = require('express');
const logger = require('lingua-logger');
const Router = require('express').Router;
const path = require('path');

const router = new Router();

const app = express();

const port = process.env.PORT = process.env.PORT || '3005';
app.set('port', port);

require('./routes');

const certPath = process.env.CERT_FILE_PATH = process.env.CERT_FILE_PATH || './src/config/keys/';
const privateKeyFilePath = `${certPath}private.key`;

try {
  fs.accessSync(privateKeyFilePath, fs.F_OK);
} catch (e) {
  console.error('SSL certificate file not found.');
  console.error('Generate a openSSL certificate or use Third party certificate.');
  return;
}

const privateKey = fs.readFileSync(`${certPath}private.key`, 'utf8');
const certificate = fs.readFileSync(`${certPath}certificate.crt`, 'utf8');

let certificates = (function () {
  const results = [];
  const certFileList = [
    'ca_bundle.crt',
    'certificate.crt',
  ];
  for (let i = 0, len = certFileList.length; i < len; i++) {
    const certFile = certFileList[i];
    results.push(fs.readFileSync(path.join(certPath, certFile), 'utf8'));
  }
  return results;
})();

const credentials = {
  ca: certificates,
  key: privateKey,
  cert: certificate
};

const server = spdy.createServer(credentials, app);

server.listen(port, () => {
  console.log(`Server: https://localhost:${port} is listen.`);
});

io.attach(server);

server.on('listening', onListening);


app.get('*', (req, res, next) => {
  res.status(200).send(`<pre>  
  Core is running...
 
  ┌─────┐   ┌─────┐
  │     │   │     │
  │     │   │     │
  │     │   └─────┘
  │     │
  │     └─────────┐ 
  │               │ 
  │               │
  └───────────────┘  
     
    LinguaCode.me
 
  </pre>
`);
});

function onListening() {
  const address = server.address();
  const fullAddress = `port ${address.port}`;
  console.llog(`Listening on ${fullAddress}`);
}

module.exports = server;