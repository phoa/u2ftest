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

function SetupComponent(props) {
  const { serverAddress, onServerAddressChange } = props;
  return (
    <div className="setup-component">
      <div className="field-wrapper">
        <label htmlFor="hostname-input">Server: </label>
        <input
          id="hostname-input"
          type="text"
          value={serverAddress}
          onChange={onServerAddressChange}
        />
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
    const { serverAddress } = this.props;
    const url = `${serverAddress}/registration`;
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
    const { serverAddress } = this.props;
    const url = `${serverAddress}/registrationVerification`;
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
        <div className="register-button-wrapper">
          <button onClick={this._registerHandler}>Register</button>
        </div>
        <div className="register-response">
          Registration Response:{' '}
          {registerError !== null && (
            <span>
              {registerError
                ? `ERROR - ${JSON.stringify(registerResponse)}`
                : `OK - ${JSON.stringify(registerResponse)}`}
            </span>
          )}
        </div>
        <div className="register-verification-response">
          Registration Verification: {}
          {registrationVerificationError !== null && (
            <span>
              {registrationVerificationError
                ? `ERROR - ${JSON.stringify(registrationVerificationResponse)}`
                : `OK - ${JSON.stringify(registrationVerificationResponse)}`}
            </span>
          )}
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
    const { serverAddress } = this.props;
    const url = `${serverAddress}/auth`;
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
    const { serverAddress } = this.props;
    const url = `${serverAddress}/authVerification`;
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
        <div className="sogm-button-wrapper">
          <button onClick={this._authHandler}>Auth</button>
        </div>
        <div className="auth-response">
          Auth Response:{' '}
          {authError !== null && (
            <span>
              {authError
                ? `ERROR - ${JSON.stringify(authResponse)}`
                : `OK - ${JSON.stringify(authResponse)}`}
            </span>
          )}
        </div>
        <div className="register-verification-response">
          Auth Verification: {}
          {authVerificationError !== null && (
            <span>
              {authVerificationError
                ? `ERROR - ${JSON.stringify(authVerificationResponse)}`
                : `OK - ${JSON.stringify(authVerificationResponse)}`}
            </span>
          )}
        </div>
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    this._onServerAddressChange = this._onServerAddressChange.bind(this);

    this.state = {
      serverAddress: 'https://localhost:6060'
    };
  }

  _onServerAddressChange(event) {
    this.setState({
      serverAddress: event.target.value
    });
  }

  render() {
    const { serverAddress } = this.state;
    return (
      <div className="App">
        <SetupComponent
          serverAddress={serverAddress}
          onServerAddressChange={this._onServerAddressChange}
        />
        <Register serverAddress={serverAddress} />
        <Auth serverAddress={serverAddress} />
      </div>
    );
  }
}

export default App;
