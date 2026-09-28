import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

import { environment } from '../../../environments/environment';

/** Mirrors the backend `HealthResponse` record. */
interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
}

export type ApiStatus =
  | { readonly kind: 'loading' }
  | { readonly kind: 'up'; readonly version: string }
  | { readonly kind: 'down' };

/**
 * Tracks whether the Spring Boot API is reachable.
 *
 * <p>State lives in a signal held by this root-scoped service so that several components can
 * render the same result without each triggering its own request.
 */
@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);
  private readonly state = signal<ApiStatus>({ kind: 'loading' });

  readonly status = this.state.asReadonly();

  refresh(): void {
    this.state.set({ kind: 'loading' });
    this.http.get<HealthResponse>(`${environment.apiBaseUrl}/health`).subscribe({
      next: (health) => this.state.set({ kind: 'up', version: health.version }),
      error: () => this.state.set({ kind: 'down' }),
    });
  }
}
