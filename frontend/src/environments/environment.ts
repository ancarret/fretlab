/**
 * Production defaults: the API is expected to be served from the same origin as the app,
 * behind a reverse proxy, which removes the need for CORS entirely.
 */
export const environment = {
  production: true,
  apiBaseUrl: '/api',
};
