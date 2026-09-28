import { Pipe, PipeTransform, inject } from '@angular/core';

import { TranslationService } from './translation.service';

/**
 * `{{ 'dashboard.header.title' | translate }}`, or with placeholders:
 * `{{ 'fretboardTrainer.left' | translate: { n: remaining() } }}` replaces `{n}` in the string.
 *
 * <p>Marked impure so it re-runs when {@link TranslationService}'s language signal changes — a pure
 * pipe only re-evaluates when its own arguments change, and the key argument here does not change
 * when the language does.
 */
@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
