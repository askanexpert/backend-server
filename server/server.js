// Sets up the configuration
require('./config/config.js');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');
//const OSTSDK = require('@ostdotcom/ost-sdk-js');

const Utils = require('./utils/utils');
const {mongoose} = require('./db/mongoose');
const {Lead} = require('./models/lead');
const {User} = require('./models/user');
const {allowOriginWithAuth} = require('./middleware/middleware');

// const apiEndpoint = 'https://sandboxapi.ost.com/v1.1';
// const api_key = '2c48e6cc16716e620138'; // replace with the API Key you obtained earlier
// const api_secret = '5af763facaf8222e93aa1b537af1b12b179d21670fd15f0b7780752d6027189d'; // replace with the API Secret you obtained earlier
// const ostObj = new OSTSDK({apiKey: api_key, apiSecret: api_secret, apiEndpoint: apiEndpoint});

const app = express();
const port = process.env.PORT;

// Middleware for allowing origins [front-end apps]
app.use(allowOriginWithAuth);
// Express middleware to convert request body to json
app.use(bodyParser.json());

// POST /leads to endpoint - Used to add a lead to the database
app.post('/leads', (req, res) => {
  var lead = new Lead({
    email: req.body.email
  });
  lead.save().then((lead) => {
    console.log('Success! Lead received on server')
    console.log('Lead:', lead);
    res.send({
      message: "success",
      lead
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

// POST /users/signup - Used for signups
app.post('/users/signup', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    Utils.logJSONObject('Signed up user successfully', user);
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    console.log(e);
    res.status(400).send();
  });
})

// POST /users/login - Used for login
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      Utils.logJSONObject('Logged in user successfully', user);
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    console.log(e);
    res.status(400).send();
  });
})

app.listen(port, () => {
  console.log(`Started listening on port ${port}`);
})

module.exports = {app}
