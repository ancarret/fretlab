import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { HealthService } from '../api/health.service';
import { TranslatePipe } from '../i18n/translate.pipe';

/**
 * Live indicator of backend reachability, shown in the application header.
 */
@Component({
  selector: 'app-api-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    @let status = health.status();
    <span class="status" [class]="'status--' + status.kind" role="status">
      <span class="status__dot" aria-hidden="true"></span>
      @switch (status.kind) {
        @case ('loading') {
          <span>{{ 'apiStatus.connecting' | translate }}</span>
        }
        @case ('up') {
          <span>{{ 'apiStatus.online' | translate }} <span class="status__version">v{{ status.version }}</span></span>
        }
        @case ('down') {
          <span>{{ 'apiStatus.down' | translate }}</span>
          <button type="button" class="status__retry" (click)="health.refresh()">
            {{ 'apiStatus.retry' | translate }}
          </button>
        }
      }
    </span>
  `,
  styles: `
    .status {
      display: inline-flex;
      align-items: center;
      gap: var(--fl-space-2);
      font-family: var(--fl-font-mono);
      font-size: var(--fl-text-xs);
      color: var(--fl-text-faint);
      white-space: nowrap;
    }

    .status__dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--fl-text-faint);
      flex: none;
    }

    .status--up .status__dot {
      background: var(--fl-success);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--fl-success) 20%, transparent);
    }

    .status--down {
      color: var(--fl-danger);
    }

    .status--down .status__dot {
      background: var(--fl-danger);
    }

    .status__version {
      color: var(--fl-text-faint);
      opacity: 0.8;
    }

    @media (max-width: 560px) {
      .status__version {
        display: none;
      }
    }

    .status__retry {
      background: none;
      border: none;
      padding: 0;
      color: inherit;
      font: inherit;
      font-weight: 600;
      text-decoration: underline;
      cursor: pointer;
    }
  `,
})
export class ApiStatus {
  protected readonly health = inject(HealthService);
}
