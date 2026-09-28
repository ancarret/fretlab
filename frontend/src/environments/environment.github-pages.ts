/**
 * GitHub Pages serves static files only — there is no reverse proxy to reach the backend at the
 * same origin, unlike the Docker Compose deployment. The API therefore needs an absolute URL,
 * and the backend needs `FRETLAB_CORS_ALLOWED_ORIGINS` set to this app's github.io origin.
 *
 * If the "fretlab-backend" service name is already taken on Render, update this URL to whatever
 * Render actually assigned before rebuilding.
 */
export const environment = {
  production: true,
  apiBaseUrl: 'https://fretlab-backend.onrender.com/api',
};
