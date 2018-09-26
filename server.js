const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('express-jwt');
const helmet = require('helmet');
const https = require('https');
const http = require('http');
const admin = require('firebase-admin');

const config = require('./config');
const log = require('./utils/logger');

const app = express();

/*api.use(cors());
api.use(compression());*/
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// disable spam on some route
require('./utils/limiter')(app);
/*
let cert = fs.readFileSync('public_key.pem');
app.use(
  jwt({
    secret: cert
  }).unless({
    path: [
      '/auth',
      '/auth/signup'
    ]
  })
);*/

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      msg: 'unauthorized'
    });
  }
});

// trim body
/*app.use((req, res, next) => {
  if (!req.body) {
    return next();
  }

  Object.keys(req.body).map(function(key, index) {
    req.body[key] = req.body[key].trim();
  });
  next();
});*/

// add firebase admin sdk
const serviceAccount = require('./' + config.firebase.serviceAccountKeyFile);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://express-starter-firebase.firebaseio.com"
});

// create server depending on protocol
if (config.protocol.toLowerCase() == 'https') {
  var server = https.createServer({
      cert: fs.readFileSync('./server.crt'),
      key: fs.readFileSync('./server.key'),
      requestCert: false,
      rejectUnauthorized: false
    },
    app);
} else {
  var server = http.createServer(app);
}

server.listen(config.port, config.host);

server.on('error', (err) => {
  log.error(err);
  process.exit(1);
});

server.on('listening', () => {
  require('./utils/db');

  fs.readdirSync(path.join(__dirname, 'routes')).map(file => {
    require('./routes/' + file)(app);
  });

  app.get('*', function (req, res) {
    res.status(404).json({
      msg: 'not_found'
    });
  });


  let addr = server.address();
  let bind = typeof addr === 'string' ?
    'pipe ' + addr :
    `adresse ${config.protocol}://${addr.address}:${addr.port}`;

  log.info(
    `API is now running on ${bind} in ${config.env} mode`
  );
});

module.exports = app;