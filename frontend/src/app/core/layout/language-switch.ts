import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { TranslationService } from '../i18n/translation.service';
import { TranslatePipe } from '../i18n/translate.pipe';

/** A single button that flips the whole app between English and Spanish. */
@Component({
  selector: 'app-language-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <button
      type="button"
      class="lang-switch"
      (click)="i18n.toggle()"
      [attr.aria-label]="'lang.toggleTo' | translate"
    >
      {{ 'lang.toggleTo' | translate }}
    </button>
  `,
  styles: `
    .lang-switch {
      padding: var(--fl-space-1) var(--fl-space-3);
      border: 1px solid var(--fl-border);
      border-radius: var(--fl-radius-pill);
      background: none;
      color: var(--fl-text-muted);
      font-family: var(--fl-font-mono);
      font-size: var(--fl-text-xs);
      font-weight: 600;
      letter-spacing: 0.04em;
      cursor: pointer;
      transition: color 0.15s ease, border-color 0.15s ease;

      &:hover {
        color: var(--fl-text);
        border-color: var(--fl-text-muted);
      }
    }
  `,
})
export class LanguageSwitch {
  protected readonly i18n = inject(TranslationService);
}
