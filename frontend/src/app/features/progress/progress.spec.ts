import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../core/api/auth.service';
import { ProgressSummary } from '../../core/api/progress.service';
import { Progress } from './progress';

describe('Progress', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    try {
      localStorage.clear();
    } catch {
      // Not available in this environment.
    }

    await TestBed.configureTestingModule({
      imports: [Progress],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('prompts a signed-out visitor to sign in, without calling the summary endpoint', async () => {
    const fixture = TestBed.createComponent(Progress);
    fixture.detectChanges();
    await fixture.whenStable();

    httpMock.expectNone((r) => r.url.endsWith('/progress/summary'));
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Sign in');
  });

  it('shows real mastery once signed in with recorded attempts', async () => {
    TestBed.inject(AuthService).login({ email: 'a@b.com', password: 'secret123' }).subscribe();
    httpMock.expectOne((r) => r.url.endsWith('/auth/login')).flush({ token: 't', email: 'a@b.com' });

    const fixture = TestBed.createComponent(Progress);
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url.endsWith('/progress/summary')).flush(summary());
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('75%');
    expect(text).toContain('4 exercises attempted in total.');
  });

  function summary(): ProgressSummary {
    return {
      totalAttempts: 4,
      mastery: [
        { exerciseType: 'FRETBOARD_NOTE', attempts: 4, correct: 3, accuracyPercent: 75 },
        { exerciseType: 'INTERVAL', attempts: 0, correct: 0, accuracyPercent: 0 },
      ],
    };
  }
});
