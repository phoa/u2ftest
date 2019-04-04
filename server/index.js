const u2f = require('u2f');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const https = require('https');
const http = require('http');
const fs = require('fs');
const httpPort = 6080;
const httpsPort = 443;

// const options = {
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem')
// };

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: 'hello/u2f',
    resave: false,
    saveUninitialized: false
  })
);
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

// U2F server is based on https://www.npmjs.com/package/u2f

// The app ID is a string used to uniquely identify your U2F app, for both registration requests and
// authentication requests. It is usually the fully qualified URL of your website. The website MUST
// be HTTPS, otherwise the registration will fail client-side.
// const APP_ID = 'https://localhost:' + httpsPort;
const APP_ID = 'https://agile-meadow-14174.herokuapp.com';

console.log('APP_ID: ' + APP_ID);

const USER_DATA = {};

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/registration', registrationChallengeHandler);

app.get('/registrationVerification', registrationVerificationHandler);

app.post('/registrationVerification', registrationVerificationHandler);

app.get('/auth', authenticationChallengeHandler);

app.post('/authVerification', authenticationVerificationHandler);

// Create an HTTP service.
// http.createServer(app).listen(httpPort, () => {
//   console.log(`Example app listening on http port ${httpPort}!`);
// });

// Create an HTTPS service identical to the HTTP service.
https.createServer(app).listen(httpsPort, () => {
  console.log(`Example app listening on https port ${httpsPort}!`);
});

function registrationChallengeHandler(req, res) {
  console.log('↘️  Incoming request url: ' + req.originalUrl);
  // 1. Check that the user is logged in.

  // 2. Generate a registration request and save it in the session.
  const registrationRequest = u2f.request(APP_ID);

  req.session.registrationRequest = registrationRequest;

  // 3. Send the registration request to the client, who will use the Javascript U2F API to sign
  // the registration request, and send it back to the server for verification. The registration
  // request is a JSON object containing properties used by the client to sign the request.

  console.log(
    '↗️  Outgoing response: ',
    JSON.stringify(registrationRequest, null, 4)
  );

  return res.send(registrationRequest);
}

function registrationVerificationHandler(req, res) {
  console.log('↘️  Incoming request url: ' + req.originalUrl);
  console.log(
    'req.body.registrationResponse: ',
    JSON.stringify(req.body.registrationResponse, null, 4)
  );

  // 4. Verify the registration response from the client against the registration request saved
  // in the server-side session.
  const result = u2f.checkRegistration(
    req.session.registrationRequest,
    req.body.registrationResponse
  );

  console.log('result: ', JSON.stringify(result, null, 4));

  if (result.successful) {
    // Success!
    // Save result.publicKey and result.keyHandle to the server-side datastore, associated with
    // this user.
    USER_DATA.publicKey = result.publicKey;
    USER_DATA.keyHandle = result.keyHandle;
    return res.sendStatus(200);
  }

  // result.errorMessage is defined with an English-language description of the error.
  return res.send({ result });
}

function authenticationChallengeHandler(req, res) {
  console.log('↘️  Incoming request url: ' + req.originalUrl);
  // 1. Check that the user is logged in using password authentication.

  // 2. Fetch the user's key handle from the server-side datastore. This field should have been
  // saved after the registration procedure.
  const keyHandle = USER_DATA.keyHandle;
  console.log('keyHandle: ', keyHandle);

  // 3. Generate an authentication request and save it in the session. Use the same app ID that
  // was used in registration!
  const authRequest = u2f.request(APP_ID, keyHandle);
  req.session.authRequest = authRequest;

  // 4. Send the authentication request to the client, who will use the Javascript U2F API to sign
  // the authentication request, and send it back to the server for verification.
  return res.send(authRequest);
}

function authenticationVerificationHandler(req, res) {
  // 5. Fetch the user's public key from the server-side datastore. This field should have been
  // saved after the registration procedure.
  const publicKey = USER_DATA.publicKey;
  console.log('publicKey: ', publicKey);

  // 6. Verify the authentication response from the client against the authentication request saved
  // in the server-side session.
  const result = u2f.checkSignature(
    req.session.authRequest,
    req.body.authResponse,
    publicKey
  );

  if (result.successful) {
    // Success!
    // User is authenticated.
    return res.sendStatus(200);
  }

  // result.errorMessage is defined with an English-language description of the error.
  return res.send({ result });
}
