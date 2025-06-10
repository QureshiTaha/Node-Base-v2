const express = require('express');
const bodyParser = require('body-parser');
require('https').globalAgent.options.ca = require('ssl-root-cas').create();

const fs = require('fs');
const cors = require('cors');
const app = express();
const port = process.env.NODE_PORT || 5000;
const database = require('./Modules/config');
const routes = require('./routes');
var logger = require('morgan');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
API_PREFIX = process.env.API_PREFIX;
const http = require('http');
var admin = require('firebase-admin');
var serviceAccount = require('../taskmanagement-iceweb-firebase-adminsdk-fbsvc-d1d1672345.json');
const Mail = require('./Modules/email');
const { initializeSocket } = require('./Modules/socketManager');
const { initializeCron } = require('./Modules/crons');

module.exports = {
  start: async () => {
    if (process.env.ACCESS_LOGGING === 'false') {
      // check if file exists
      if (!fs.existsSync('./logs')) {
        fs.mkdirSync('./logs');
      }
      app.use(logger('dev'));
      app.use(logger('combined', { stream: fs.createWriteStream('./logs/access.log', { flags: 'a' }) }));
      console.log('Logging enabled');
    } else {
      console.log('Logging disabled');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    initializeCron();

    const corsOptions = {
      origin: '*',  // You can restrict this based on your frontend origin for production
      credentials: true, // access-control-allow-credentials:true
      optionSuccessStatus: 200
    };
    app.use(cors(corsOptions));

    app.get('/', (req, res) => {
      res.json('Welcome to API!');
    });

    app.post('/api/v1/mail/send', async (req, res) => {
      const { subject, body, userEmail, mailerType } = req.body;
      // mailerType 1 is gmail, 2 is iceweb
      try {
        Mail.send({ subject, body, userEmail, mailerType });
        console.log('Mail sent successfully');
        res.status(200).send('Mail sent successfully');
      } catch (error) {
        console.log('Error sending Mail: ', error);
        res.status(500).send('Error sending Mail');
      }
    });

    app.use('/uploads', express.static('uploads'));

    app.use(API_PREFIX, routes);
    const server = http.createServer(app);
    initializeSocket(server);

    server.listen(port, () => {
      console.log('\x1b[32m%s\x1b[0m', `Node environment started listening on port:${port}`);
    });
    // app.listen(port, () => {
    //   console.log('\x1b[32m%s\x1b[0m', `Node environment started listening on port:${port}`);
    // });
  }
};
