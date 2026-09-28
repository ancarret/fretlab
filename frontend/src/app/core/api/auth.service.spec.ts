import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {
      // Not available in this environment; the service already tolerates that.
    }

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('starts signed out', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
  });

  it('becomes authenticated once login resolves', () => {
    service.login({ email: 'a@b.com', password: 'secret123' }).subscribe();

    httpMock
      .expectOne((r) => r.url.endsWith('/auth/login'))
      .flush({ token: 'a.jwt.token', email: 'a@b.com' });

    expect(service.isAuthenticated()).toBe(true);
    expect(service.token()).toBe('a.jwt.token');
    expect(service.email()).toBe('a@b.com');
  });

  it('becomes authenticated once register resolves', () => {
    service.register({ email: 'new@b.com', password: 'secret123' }).subscribe();

    httpMock
      .expectOne((r) => r.url.endsWith('/auth/register'))
      .flush({ token: 'new.jwt.token', email: 'new@b.com' });

    expect(service.isAuthenticated()).toBe(true);
  });

  it('clears the session on logout', () => {
    service.login({ email: 'a@b.com', password: 'secret123' }).subscribe();
    httpMock.expectOne((r) => r.url.endsWith('/auth/login')).flush({ token: 't', email: 'a@b.com' });

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
    expect(service.email()).toBeNull();
  });
});
