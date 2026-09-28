import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TranslatePipe } from '../core/i18n/translate.pipe';

/**
 * Every text input here is a translation key, not display text — this component always renders
 * through {@link TranslatePipe} so a page header never hardcodes one language.
 */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <header class="header">
      <div class="header__meta">
        @if (eyebrowKey()) {
          <span class="fl-eyebrow">{{ eyebrowKey() | translate }}</span>
        }
        @if (placeholder()) {
          <span class="fl-mock">{{ 'placeholder.badge' | translate }}</span>
        }
      </div>
      <h1 class="fl-page-title">{{ titleKey() | translate }}</h1>
      @if (leadKey()) {
        <p class="fl-page-lead">{{ leadKey() | translate }}</p>
      }
    </header>
  `,
  styles: `
    .header__meta {
      display: flex;
      align-items: center;
      gap: var(--fl-space-3);
      flex-wrap: wrap;
      min-height: 1.25rem;
      margin-bottom: var(--fl-space-3);
    }
  `,
})
export class PageHeader {
  readonly titleKey = input.required<string>();
  readonly leadKey = input('');
  /** Small section mark above the title, such as "Explore". */
  readonly eyebrowKey = input('');
  /** Flags a screen whose content is still hardcoded in the frontend. */
  readonly placeholder = input(false);
}
