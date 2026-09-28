import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'fretlab.auth.token';
const EMAIL_KEY = 'fretlab.auth.email';

export interface AuthResponse {
  readonly token: string;
  readonly email: string;
}

interface Credentials {
  readonly email: string;
  readonly password: string;
}

/**
 * Holds the signed-in session and talks to the two endpoints that create one.
 *
 * <p><strong>Where the token lives.</strong> The JWT is kept in {@code localStorage}, not an
 * httpOnly cookie. That trades away one thing for another: a script injected by an XSS bug could
 * read this token, which an httpOnly cookie would prevent — but a cookie sent automatically on
 * every request reopens CSRF, needs `SameSite`/`Secure` flags and a cross-origin credentials dance
 * to work with Angular on :4200 and Spring Boot on :8080 in development. `localStorage` plus an
 * explicit `Authorization` header (added by {@link authInterceptor}) is the simpler mechanism for a
 * pure API client with no server-rendered forms to protect, and the short token lifetime configured
 * on the backend limits how long a stolen token stays useful.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly tokenState = signal<string | null>(readStorage(TOKEN_KEY));
  private readonly emailState = signal<string | null>(readStorage(EMAIL_KEY));

  readonly email = this.emailState.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenState() !== null);

  /** Read synchronously by {@link authInterceptor} on every outgoing request. */
  token(): string | null {
    return this.tokenState();
  }

  register(credentials: Credentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/register`, credentials)
      .pipe(tap((response) => this.startSession(response)));
  }

  login(credentials: Credentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, credentials)
      .pipe(tap((response) => this.startSession(response)));
  }

  logout(): void {
    this.tokenState.set(null);
    this.emailState.set(null);
    writeStorage(TOKEN_KEY, null);
    writeStorage(EMAIL_KEY, null);
  }

  private startSession(response: AuthResponse): void {
    this.tokenState.set(response.token);
    this.emailState.set(response.email);
    writeStorage(TOKEN_KEY, response.token);
    writeStorage(EMAIL_KEY, response.email);
  }
}

/** `localStorage` throws in some private-browsing modes; a failed read just means no session. */
function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // Session still works for the lifetime of this tab; it just will not survive a reload.
  }
}
