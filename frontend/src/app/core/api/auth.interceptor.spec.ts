import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {
      // Not available in this environment; the service already tolerates that.
    }

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => httpMock.verify());

  it('adds no Authorization header when signed out', () => {
    http.get(`${environment.apiBaseUrl}/theory/notes`).subscribe();

    const request = httpMock.expectOne(`${environment.apiBaseUrl}/theory/notes`);
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush([]);
  });

  it('attaches the bearer token to FretLab API calls once signed in', () => {
    auth.login({ email: 'a@b.com', password: 'secret123' }).subscribe();
    httpMock.expectOne((r) => r.url.endsWith('/auth/login')).flush({ token: 'my-jwt', email: 'a@b.com' });

    http.get(`${environment.apiBaseUrl}/theory/notes`).subscribe();

    const request = httpMock.expectOne(`${environment.apiBaseUrl}/theory/notes`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer my-jwt');
    request.flush([]);
  });

  it('never attaches the token to a request outside the API base URL', () => {
    auth.login({ email: 'a@b.com', password: 'secret123' }).subscribe();
    httpMock.expectOne((r) => r.url.endsWith('/auth/login')).flush({ token: 'my-jwt', email: 'a@b.com' });

    http.get('https://fonts.googleapis.com/css').subscribe();

    const request = httpMock.expectOne('https://fonts.googleapis.com/css');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush('');
  });
});
