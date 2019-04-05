/**
 * Reference
 * https://www.npmjs.com/package/u2f-api
 * https://www.npmjs.com/package/u2f
 * https://developers.yubico.com/U2F/Libraries/Using_a_library.html
 */

import React, { Component } from 'react';
import axios from 'axios';
import u2fApi from 'u2f-api';
import './App.css';

function urlGen(server, endPoint) {
  if (server && endPoint) {
    if (endPoint.indexOf('https://') > -1) {
      return endPoint;
    }
    return [server, endPoint].join('/');
  }
  return null;
}

function SetupComponent(props) {
  const {
    serverAddress,
    registrationUrl,
    registrationVerificationUrl,
    authUrl,
    authVerificationUrl,
    onServerAddressChange,
    onRegistrationUrlChange,
    onRegistrationVerificationUrlChange,
    onAuthUrlChange,
    onAuthVerificationUrlChange
  } = props;
  return (
    <div className="setup-component">
      <div className="section-title">Endpoints Setup</div>
      <div className="field-wrapper">
        <div className="label-wrapper">
          <label htmlFor="hostname-input">Server: </label>
        </div>
        <div className="input-wrapper">
          <input
            id="hostname-input"
            type="text"
            value={serverAddress}
            onChange={onServerAddressChange}
          />
        </div>
      </div>
      <div className="field-wrapper">
        <div className="label-wrapper">
          <label htmlFor="registration-url-input">Registration Url:</label>
        </div>
        <div className="input-wrapper">
          <input
            id="registration-url-input"
            type="text"
            value={registrationUrl}
            onChange={onRegistrationUrlChange}
          />
        </div>
      </div>
      <div className="field-wrapper">
        <div className="label-wrapper">
          <label htmlFor="registration-verification-url-input">
            Registration Verification Url:
          </label>
        </div>
        <div className="input-wrapper">
          <input
            id="registration-verification-url-input"
            type="text"
            value={registrationVerificationUrl}
            onChange={onRegistrationVerificationUrlChange}
          />
        </div>
      </div>
      <div className="field-wrapper">
        <div className="label-wrapper">
          <label htmlFor="auth-url-input">Auth Url: </label>
        </div>
        <div className="input-wrapper">
          <input
            id="auth-url-input"
            type="text"
            value={authUrl}
            onChange={onAuthUrlChange}
          />
        </div>
      </div>
      <div className="field-wrapper">
        <div className="label-wrapper">
          <label htmlFor="auth-verification-url-input">
            Auth Verification Url:{' '}
          </label>
        </div>
        <div className="input-wrapper">
          <input
            id="auth-verification-url-input"
            type="text"
            value={authVerificationUrl}
            onChange={onAuthVerificationUrlChange}
          />
        </div>
      </div>
    </div>
  );
}

class Register extends Component {
  constructor(props) {
    super(props);

    this._registerHandler = this._registerHandler.bind(this);
    this._u2fRegister = this._u2fRegister.bind(this);

    this.state = {
      registerError: null,
      registerResponse: null,
      registrationVerificationError: null,
      registrationVerificationResponse: null
    };
  }

  _registerHandler() {
    const { serverAddress, registrationUrl } = this.props;
    const url = urlGen(serverAddress, registrationUrl);

    axios
      .get(url)
      .then(response => {
        console.log('registration response: ', response);
        this.setState(
          {
            registerError: false,
            registerResponse: response.data
          },
          () => {
            this._u2fRegister();
          }
        );
      })
      .catch(error => {
        console.error('_registerHandler error: ', error);
        this.setState({
          registerError: true,
          registerResponse: error
        });
      });
  }

  _u2fRegister() {
    const { registerResponse } = this.state;
    const { serverAddress, registrationVerificationUrl } = this.props;
    const url = urlGen(serverAddress, registrationVerificationUrl);

    console.log('_u2fRegister registerResponse: ', registerResponse);

    u2fApi
      .register(registerResponse)
      .then(deviceResponse => {
        console.log('_u2fRegister deviceResponse: ', deviceResponse);
        axios({
          method: 'post',
          url: url,
          data: deviceResponse
        })
          .then(response => {
            console.log('registrationVerification response: ', response);
            this.setState({
              registrationVerificationError: false,
              registrationVerificationResponse: response
            });
          })
          .catch(error => {
            console.error('registrationVerification error: ', error);
            this.setState({
              registrationVerificationError: true,
              registrationVerificationResponse: error
            });
          });
      })
      .catch(error => {
        console.error('_u2fRegister error: ', error);
        this.setState({
          registrationVerificationError: true,
          registrationVerificationResponse: error
        });
      });
  }

  render() {
    const {
      registerError,
      registerResponse,
      registrationVerificationError,
      registrationVerificationResponse
    } = this.state;
    return (
      <div className="register-block">
        <div className="button-wrapper">
          <button onClick={this._registerHandler}>Register</button>
        </div>
        <div className="response-section">
          <div className="response-label">Registration Response:</div>
          <div className="response-value">
            {registerError !== null
              ? registerError
                ? `ERROR - ${JSON.stringify(registerResponse)}`
                : `OK - ${JSON.stringify(registerResponse)}`
              : null}
          </div>
        </div>
        <div className="response-section">
          <div className="response-label">Registration Verification:</div>
          <div className="response-value">
            {registrationVerificationError !== null
              ? registrationVerificationError
                ? `ERROR - ${JSON.stringify(registrationVerificationResponse)}`
                : `OK - ${JSON.stringify(registrationVerificationResponse)}`
              : null}
          </div>
        </div>
      </div>
    );
  }
}

class Auth extends Component {
  constructor(props) {
    super(props);

    this._authHandler = this._authHandler.bind(this);
    this._u2fAuth = this._u2fAuth.bind(this);

    this.state = {
      authError: null,
      authResponse: null,
      authVerificationError: null,
      authVerificationResponse: null
    };
  }

  _authHandler() {
    const { serverAddress, authUrl } = this.props;
    const url = urlGen(serverAddress, authUrl);

    axios
      .get(url)
      .then(response => {
        console.log('response: ', response);
        this.setState(
          {
            authError: false,
            authResponse: response.data
          },
          () => {
            this._u2fAuth();
          }
        );
      })
      .catch(error => {
        console.error('_authHandler error: ', error);
        this.setState({
          authError: true,
          authResponse: error
        });
      });
  }

  _u2fAuth() {
    const { authResponse } = this.state;
    const { serverAddress, authVerificationUrl } = this.props;
    const url = urlGen(serverAddress, authVerificationUrl);

    console.log('_u2fRegister authResponse: ', authResponse);

    u2fApi
      .sign(authResponse)
      .then(deviceResponse => {
        console.log('_u2fAuth deviceResponse: ', deviceResponse);
        axios({
          method: 'post',
          url: url,
          data: deviceResponse
        })
          .then(response => {
            console.log('authVerification response: ', response);
            this.setState({
              authVerificationError: false,
              authVerificationResponse: response
            });
          })
          .catch(error => {
            console.error('authVerification error: ', error);
            this.setState({
              authVerificationError: true,
              authVerificationResponse: error
            });
          });
      })
      .catch(error => {
        console.error('_u2fAuth error: ', error);
        this.setState({
          authVerificationError: true,
          authVerificationResponse: error
        });
      });
  }

  render() {
    const {
      authError,
      authResponse,
      authVerificationError,
      authVerificationResponse
    } = this.state;
    return (
      <div className="auth-block">
        <div className="button-wrapper">
          <button onClick={this._authHandler}>Auth</button>
        </div>
        <div className="response-section">
          <div className="response-label">Auth Response:</div>
          <div className="response-value">
            {authError !== null
              ? authError
                ? `ERROR - ${JSON.stringify(authResponse)}`
                : `OK - ${JSON.stringify(authResponse)}`
              : null}
          </div>
        </div>
        <div className="response-section">
          <div className="response-label">Auth Verification:</div>
          <div className="response-value">
            {authVerificationError !== null
              ? authVerificationError
                ? `ERROR - ${JSON.stringify(authVerificationResponse)}`
                : `OK - ${JSON.stringify(authVerificationResponse)}`
              : null}
          </div>
        </div>
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    this._onServerAddressChange = this._onServerAddressChange.bind(this);
    this._onRegistrationUrlChange = this._onRegistrationUrlChange.bind(this);
    this._onRegistrationVerificationUrlChange = this._onRegistrationVerificationUrlChange.bind(
      this
    );
    this._onAuthUrlChange = this._onAuthUrlChange.bind(this);
    this._onAuthVerificationUrlChange = this._onAuthVerificationUrlChange.bind(
      this
    );

    this.state = {
      serverAddress: 'https://localhost:6060',
      registrationUrl: 'https://localhost:6060/registration',
      registrationVerificationUrl: 'https://localhost:6060/registration',
      authUrl: 'https://localhost:6060/auth',
      authVerificationUrl: 'https://localhost:6060/authVerification'
    };
  }

  _onServerAddressChange(event) {
    this.setState({
      serverAddress: event.target.value
    });
  }

  _onRegistrationUrlChange(event) {
    this.setState({
      registrationUrl: event.target.value
    });
  }

  _onRegistrationVerificationUrlChange(event) {
    this.setState({
      registrationVerificationUrl: event.target.value
    });
  }

  _onAuthUrlChange(event) {
    this.setState({
      authUrl: event.target.value
    });
  }

  _onAuthVerificationUrlChange(event) {
    this.setState({
      authVerificationUrl: event.target.value
    });
  }

  render() {
    const {
      serverAddress,
      registrationUrl,
      registrationVerificationUrl,
      authUrl,
      authVerificationUrl
    } = this.state;
    return (
      <div className="App">
        <SetupComponent
          serverAddress={serverAddress}
          registrationUrl={registrationUrl}
          registrationVerificationUrl={registrationVerificationUrl}
          authUrl={authUrl}
          authVerificationUrl={authVerificationUrl}
          onServerAddressChange={this._onServerAddressChange}
          onRegistrationUrlChange={this._onRegistrationUrlChange}
          onRegistrationVerificationUrlChange={
            this._onRegistrationVerificationUrlChange
          }
          onAuthUrlChange={this._onAuthUrlChange}
          onAuthVerificationUrlChange={this._onAuthVerificationUrlChange}
        />
        <Register
          serverAddress={serverAddress}
          registrationUrl={registrationUrl}
          registrationVerificationUrl={registrationVerificationUrl}
        />
        <Auth
          serverAddress={serverAddress}
          authUrl={authUrl}
          authVerificationUrl={authVerificationUrl}
        />
      </div>
    );
  }
}

export default App;
