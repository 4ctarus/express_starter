const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('express-jwt');
const helmet = require('helmet');
const https = require('https');
const http = require('http');
const {
  ValidationError
} = require('mongoose');

const config = require('./config');
const log = require('./utils/logger');

const app = express();

/*api.use(cors());
api.use(compression());*/
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// disable spam on some route
require('./utils/limiter')(app);

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
);

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

  app.use(function (err, req, res, next) {
    log.error(err);
    let response = {};
    let status = 500;

    switch (err.name) {
      case 'ValidationError':
        status = 400;
        Object.keys(err.errors).forEach(key => {
          let element = err.errors[key];
          let kind = element.kind;
          let msg = element.path;
          if (element.kind === 'user defined' || element.kind === 'regexp') {
            kind = 'invalid';
            //msg = element.message;
          }
          if (!response[kind]) {
            response[kind] = [];
          }
          response[kind].push(msg);
        });
        break;
      
      case 'MongoError':
        switch (err.code) {
          case 11000:
            status = 400;
            response = { msg: 'already_exist' };
            break;
        
          default:
            break;
        }
        break;

      default:
        response = err;
        break;
    }

    return res.status(status).json(response);
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