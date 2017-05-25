const crash = require('./crash');

const fs = require('fs');
const io = require('./io');
const spdy = require('spdy');
const express = require('express');
const logger = require('lingua-logger');
const path = require('path');

const app = express();

const port = process.env.PORT || '3005';
app.set('port', port);

require('./routes');

const PRIVATE_KEY_NAME = 'private.key';
const CERTIFICATE_NAME = 'certificate.crt';

const certPath = process.env.CERT_FILE_PATH || './src/config/keys/';

const privateKeyFilePath = path.join(certPath, PRIVATE_KEY_NAME);
const certificateFilePath = path.join(certPath, CERTIFICATE_NAME);

try {
  fs.accessSync(privateKeyFilePath, fs.F_OK);
} catch (e) {
  console.error('SSL certificate file not found.');
  console.error('Generate a openSSL certificate or use Third party certificate.');
  return;
}

const privateKey = fs.readFileSync(privateKeyFilePath, 'utf8');
const certificate = fs.readFileSync(certificateFilePath, 'utf8');

const certificates = (() => {
  const certFileList = [
    'ca_bundle.crt',
    'certificate.crt',
  ];

  return certFileList.map((certFile) => {
    return fs.readFileSync(path.join(certPath, certFile), 'utf8');
  });
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

server.on('listening', () => {
  const address = server.address();
  const fullAddress = `port ${address.port}`;
  console.llog(`Listening on ${fullAddress}`);
});

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

module.exports = server;