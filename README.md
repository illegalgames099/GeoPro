# GeoPro

GeoPro is a 3D map and navigation application built entirely as a static HTML/JS web app. It serves as an open-stack alternative for maps, combining multiple free and open APIs to deliver a premium mapping experience directly in the browser.

## Features

- **3D Maps & Rendering:** Powered by MapLibre GL JS, featuring smooth 3D rendering and camera controls.
- **Basemap:** Uses OpenFreeMap "Liberty" vector tiles for high-quality, keyless basemaps.
- **3D Buildings:** Renders Overture Maps building data directly via PMTiles, with automatic fallback to OpenStreetMap heights.
- **Search & Geocoding:** Integrates Photon (Komoot) for fast typeahead search and Nominatim for reverse geocoding.
- **Turn-by-Turn Routing:** Utilizes OSRM for dynamic, lane-level routing (driving, biking, walking) and navigation.
- **Terrain & Imagery:** Optional 3D terrain via Mapzen/AWS terrarium DEM tiles and satellite imagery via Esri World Imagery.
- **Offline & PWA Support:** Includes a Service Worker for offline caching of core assets.
- **No Build Step:** A primarily single-file static HTML/JS setup (`index.html`), making it exceptionally easy to host and modify.

## Development

The project doesn't require a complex build process. You can run it locally using any static file server.

For example, using Node.js `serve` or Python:
```bash
python3 -m http.server 3000
```
Then navigate to `http://localhost:3000/`.

**Note:** The application determines the development environment by checking if `location.hostname` is `localhost` or `127.0.0.1`.

## Testing

Testing is implemented using Node's built-in `node:test` runner and native `assert`. Client-side pure functions are extracted into `assets/utils.js` (and similar files) to make them testable in Node.

To run the test suite:
```bash
npm install
npm test
```

Service Worker testing is done via Jest.

## Important Notes

*   **APIs & Traffic:** GeoPro relies on public demo services (like routing.openstreetmap.de and photon.komoot.io). These are fine for personal use, but if you plan on deploying this for real traffic, you must self-host these services or buy capacity.
*   **Security:** The application enforces a strict Content Security Policy (CSP). If you add new external resources (APIs, tiles, scripts), you must explicitly whitelist them in the CSP meta tag in `index.html`.
*   **Asset Management:** Any new JavaScript files or assets must be added to the `CORE_ASSETS` array in `service-worker.js` to ensure they are properly cached for offline use.
*   **Geolocation:** Geolocation uses the browser's native API. Note that `navigator.geolocation` typically requires a secure context (HTTPS) to function in modern browsers.

## License

This project is licensed under the ISC License.
