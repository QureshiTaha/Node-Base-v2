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


    const corsOptions = {
      origin: '*',
      credentials: true, // access-control-allow-credentials:true
      optionSuccessStatus: 200
    };
    app.use(cors(corsOptions));

    app.get('/', (req, res) => {
      res.json('Welcome to API!');
    });

    app.post('/api/v1/notification/send', async (req, res) => {
      const { title, body, deviceID } = req.body;
      const message = {
        notification: {
          title,
          body
        },
        data: {
          action: 'open_app',
          update_id: '12345'
        },
        token: deviceID
      };

      try {
        await admin.messaging().send(message);
        console.log('Notification sent successfully');
        res.status(200).send('Notification sent successfully');
      } catch (error) {
        console.log('Error sending notification: ', error);
        res.status(500).send('Error sending notification');
      }
    });

    app.use('/uploads', express.static('uploads'));

    app.use(API_PREFIX, routes);
    var server = http.createServer(app);

    app.listen(port, () => {
      console.log('\x1b[32m%s\x1b[0m', `Node environment started listening on port:${port}`);
    });
  }
};
