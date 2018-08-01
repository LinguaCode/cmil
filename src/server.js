require('./core/errorHandler/reporter');

const fs = require('fs');
const io = require('./io');
const spdy = require('spdy');
const express = require('express');
const logger = require('lingua-logger');
const path = require('path');
const userAgent = require('express-useragent');
const helmet = require('helmet');

const cors = require('cors');
const http = require('http');

//constants
const ONE_YEAR = 31536000000;

const app = express();

const port = process.env.PORT || '3005';
app.set('port', port);

require('./routes');

//TODO: do not delete: https
/*const PRIVATE_KEY_NAME = 'private.key';
const CERTIFICATE_NAME = 'certificate.crt';*/

/*const certPath = process.env.CERT_FILE_PATH || './src/config/keys/';*/

/*const privateKeyFilePath = path.join(certPath, PRIVATE_KEY_NAME);
const certificateFilePath = path.join(certPath, CERTIFICATE_NAME);*/

/*try {
  fs.accessSync(privateKeyFilePath, fs.F_OK);
} catch (e) {
  console.error('SSL certificate file not found.');
  console.error('Generate a openSSL certificate or use Third party certificate.');
  return;
}*/

/*const privateKey = fs.readFileSync(privateKeyFilePath, 'utf8');
const certificate = fs.readFileSync(certificateFilePath, 'utf8');*/

/*const certificates = (() => {
  const certFileList = [
    'ca_bundle.crt',
    'certificate.crt',
  ];

  return certFileList.map((certFile) => {
    return fs.readFileSync(path.join(certPath, certFile), 'utf8');
  });
})();*/

/*const credentials = {
  ca: certificates,
  key: privateKey,
  cert: certificate
};*/

/*const server = spdy.createServer(credentials, app);*/

// use it before all route definitions
const whitelist = ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:3005'];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(helmet({
  hsts: {
    maxAge: ONE_YEAR,
    includeSubdomains: true,
    force: true,
  }
}));
app.use(userAgent.express());

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server: http://localhost:${port} is listen.`);
});

io.attach(server);

server.on('listening', () => {
  const address = app.address();
  const fullAddress = `port ${address.port}`;
  console.llog(`Listening on ${fullAddress}`);
});

app.get('*', (req, res, next) => {
  res.status(200).sendFile(path.join(__dirname, '/index.html'));
});

module.exports = app;