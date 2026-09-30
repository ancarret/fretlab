import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { PageHeader } from '../../shared/page-header';

interface CurriculumModule {
  readonly order: number;
  readonly nameKey: string;
  readonly summaryKey: string;
  /** Only a module with real content has a route; everything else is still "coming soon". */
  readonly route?: string;
}

@Component({
  selector: 'app-learn',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, TranslatePipe, RouterLink],
  template: `
    <app-page-header
      eyebrowKey="learn.header.eyebrow"
      titleKey="learn.header.title"
      leadKey="learn.header.lead"
    />

    <ol class="toc">
      @for (module of modules; track module.order) {
        <li class="toc__item">
          <span class="toc__order" aria-hidden="true">{{ module.order }}</span>
          <div class="toc__body">
            <h2 class="toc__name">
              <span class="visually-hidden">{{ 'learn.module' | translate: { n: module.order } }}</span>
              @if (module.route) {
                <a [routerLink]="module.route">{{ module.nameKey | translate }}</a>
              } @else {
                {{ module.nameKey | translate }}
              }
            </h2>
            <p class="fl-muted">{{ module.summaryKey | translate }}</p>
          </div>
          @if (module.route) {
            <a class="toc__status toc__status--ready" [routerLink]="module.route">
              {{ 'learn.startLesson' | translate }}
            </a>
          } @else {
            <span class="toc__status">{{ 'learn.comingSoon' | translate }}</span>
          }
        </li>
      }
    </ol>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--fl-space-7);
    }

    .toc {
      list-style: none;
      margin: 0;
      padding: 0;
      border-top: 1px solid var(--fl-rule);
    }

    .toc__item {
      display: grid;
      grid-template-columns: 4.5rem minmax(0, 1fr) auto;
      align-items: baseline;
      gap: var(--fl-space-5);
      padding: var(--fl-space-5) 0;
      border-bottom: 1px solid var(--fl-border);
    }

    .toc__order {
      font-family: var(--fl-font-display);
      font-size: var(--fl-text-2xl);
      font-weight: 300;
      font-variation-settings: 'opsz' 144;
      line-height: 1;
      color: var(--fl-text-faint);
    }

    .toc__item:first-child .toc__order {
      color: var(--fl-accent);
    }

    .toc__name {
      font-size: var(--fl-text-lg);
      margin-bottom: var(--fl-space-1);
    }

    .toc__name a {
      color: inherit;
      text-decoration-color: var(--fl-border-strong);
    }

    .toc__status {
      color: var(--fl-text-faint);
      font-family: var(--fl-font-mono);
      font-size: var(--fl-text-xs);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .toc__status--ready {
      color: var(--fl-accent);
      font-weight: 700;
      text-decoration: none;
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    @media (max-width: 600px) {
      .toc__item {
        grid-template-columns: 2.75rem minmax(0, 1fr);
        gap: var(--fl-space-3);
      }

      .toc__status {
        grid-column: 2;
      }
    }
  `,
})
export class Learn {
  protected readonly modules: readonly CurriculumModule[] = [
    {
      order: 1,
      nameKey: 'learn.module1.name',
      summaryKey: 'learn.module1.summary',
      route: '/learn/foundations',
    },
    {
      order: 2,
      nameKey: 'learn.module2.name',
      summaryKey: 'learn.module2.summary',
      route: '/learn/guitar-basics',
    },
    {
      order: 3,
      nameKey: 'learn.module3.name',
      summaryKey: 'learn.module3.summary',
      route: '/learn/fretboard-mastery',
    },
    {
      order: 4,
      nameKey: 'learn.module4.name',
      summaryKey: 'learn.module4.summary',
      route: '/learn/intervals',
    },
    {
      order: 5,
      nameKey: 'learn.module5.name',
      summaryKey: 'learn.module5.summary',
      route: '/learn/triads',
    },
    {
      order: 6,
      nameKey: 'learn.module6.name',
      summaryKey: 'learn.module6.summary',
      route: '/learn/chords',
    },
    {
      order: 7,
      nameKey: 'learn.module7.name',
      summaryKey: 'learn.module7.summary',
      route: '/learn/scales-and-keys',
    },
    {
      order: 8,
      nameKey: 'learn.module8.name',
      summaryKey: 'learn.module8.summary',
      route: '/learn/harmony',
    },
    { order: 9, nameKey: 'learn.module9.name', summaryKey: 'learn.module9.summary' },
  ];
}
