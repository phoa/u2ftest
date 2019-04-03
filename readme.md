# Test U2F

## Setup

To install dependencies, run the following from project root folder.

```bash
yarn run setup
```

You should see `node_modules` in three locations:

- project root directory
- `client` directory
- `server` directory

## Run Development Server

The command below will run two servers, local web server and u2f nodejs server.

```bash
yarn run dev
```

By default local web server will be running with HTTPS enabled on port `3000`. HTTPS is needed for u2f.

u2f nodejs server will be running on port `6060`.

Open your chrome browser and go to `https://localhost:3000`.

In case you need to use another u2f server, update the `Server` address.

## Update `AppId`

`AppId` by default is set to `https://localhost:6060`.

If using the included u2f nodejs server, AppId is set in `server/index.js` with variable name `APP_ID`.
