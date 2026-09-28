/**
 * Local development: Angular serves on :4200 and Spring Boot on :8080, so requests are
 * cross-origin and rely on the allowed origins configured in the backend.
 */
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api',
};
