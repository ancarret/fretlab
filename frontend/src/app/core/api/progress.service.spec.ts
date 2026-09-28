import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  let service: ProgressService;
  let auth: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {
      // Not available in this environment.
    }

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProgressService);
    auth = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('does not call the API when signed out', () => {
    service.recordAttempt('FRETBOARD_NOTE', true);

    httpMock.expectNone((r) => r.url.endsWith('/progress/attempts'));
  });

  it('posts the attempt once signed in', () => {
    auth.login({ email: 'a@b.com', password: 'secret123' }).subscribe();
    httpMock.expectOne((r) => r.url.endsWith('/auth/login')).flush({ token: 't', email: 'a@b.com' });

    service.recordAttempt('INTERVAL', false);

    const request = httpMock.expectOne((r) => r.url.endsWith('/progress/attempts'));
    expect(request.request.body).toEqual({ exerciseType: 'INTERVAL', correct: false });
    request.flush(null);
  });
});
