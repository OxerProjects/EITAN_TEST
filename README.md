# EITAN_TEST Alert Map

This project displays real-time `Tzeva Adom` alerts on a Leaflet map.
Because of CORS and tracking prevention, the client must fetch data from a local proxy.

## Setup

1. Ensure you have Node.js installed (v14+ recommended).
2. From the project root (`c:\PROJECTS\EITAN_TEST`), install dependencies:

```sh
npm install
```

3. Start the server:

```sh
npm start
```

The server will listen on `http://localhost:3000` by default. It serves:

- `index.html` (map UI)
- `/cities.json` (list of cities, downloaded from TzevaAdom)
- `/notifications` (proxy to `https://api.tzevaadom.co.il/notifications` with CORS headers)

## Usage

- Open `http://localhost:3000` in your browser.
- The page will automatically load the full cities list and poll for live notifications.
- If the proxy fails repeatedly (e.g. no network), the client will switch to a simulation mode that generates random alerts every 10 seconds.
- You can also manually trigger test alerts via the browser console:

```js
simulateAlert();       // single random city
simulateMultiAlert();  // up to 5 random cities
```

## Development Notes

- The `cities.json` file is included in the repo. Run the `server.js` script periodically to refresh it if necessary.
- You can add additional cities manually if needed.
- To deploy on another host, update `server.js` or set the `PORT` environment variable.
