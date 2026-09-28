import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe],
  template: `
    <section class="lost">
      <span class="fl-eyebrow">{{ 'notFound.eyebrow' | translate }}</span>
      <h1 class="fl-page-title">{{ 'notFound.title' | translate }}</h1>
      <p class="fl-page-lead">{{ 'notFound.lead' | translate }}</p>
      <a class="fl-button fl-button--primary" routerLink="/dashboard">
        {{ 'notFound.backToDashboard' | translate }}
      </a>
    </section>
  `,
  styles: `
    .lost {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--fl-space-3);
      padding: var(--fl-space-7) 0;
    }

    .fl-button {
      margin-top: var(--fl-space-4);
    }
  `,
})
export class NotFound {}
