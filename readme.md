# Test U2F

## Setup

NodeJS is needed to run this project.

Assuming NodeJS has been setup, install `yarn` if it is not installed.

```bash
npm install -g yarn
```

To install project dependencies, run the following from project root folder.

```bash
yarn run setup
```

You should see `node_modules` in three locations:

- project root directory
- `client` directory
- `server` directory

### Setup Web Only

To setup only the front-end part of this project, run the following command from project root folder.

```bash
yarn run setup:client
```

## Run Development Server (Both Web Server and NodeJS Backend Server)

The command below will run two servers, local web server and u2f nodejs server.

```bash
# on windows
yarn run dev:windows

# on mac
yarn run dev
```

By default local web server will be running with HTTPS enabled on port `3000`. HTTPS is needed for u2f.

u2f nodejs server will be running on port `6060`.

Open your chrome browser and go to `https://localhost:3000`.

In case you need to use another u2f server, update the `Server` address.

### Run Web Dev Server Only

To run only the front end server, run the following command from project root folder.

```bash

# on windows
yarn run dev:webwindows

# on mac
yarn run dev:web
```

## URL Points

https://localhost:6060/registration - initial request from client to get `version`, `appId`, `challenge`.

https://localhost:6060/registrationVerification - request from client to register device.

https://localhost:6060/auth - initial request from client to get `version`, `appId`, `challenge`.

https://localhost:6060/authVerification - request from client to authenticate device

## Update `AppId`

`AppId` by default is set to `https://localhost:6060`.

If using the included u2f nodejs server, AppId is set in `server/index.js` with variable name `APP_ID`.
