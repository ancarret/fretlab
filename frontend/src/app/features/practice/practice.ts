import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { PageHeader } from '../../shared/page-header';

interface ExerciseType {
  readonly topicKey: string;
  readonly nameKey: string;
  readonly exampleKey: string;
  /** When present, the card links to a working trainer instead of just describing the idea. */
  readonly route?: string;
}

@Component({
  selector: 'app-practice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, RouterLink, TranslatePipe],
  template: `
    <app-page-header
      eyebrowKey="practice.header.eyebrow"
      titleKey="practice.header.title"
      leadKey="practice.header.lead"
    />

    <ul class="cards">
      @for (exercise of exercises; track exercise.nameKey) {
        <li class="card" [class.card--live]="exercise.route">
          <div class="card__meta">
            <span class="fl-eyebrow">{{ exercise.topicKey | translate }}</span>
            @if (!exercise.route) {
              <span class="fl-mock">{{ 'placeholder.badge' | translate }}</span>
            }
          </div>
          <h2 class="card__name">{{ exercise.nameKey | translate }}</h2>
          <p class="card__example">"{{ exercise.exampleKey | translate }}"</p>
          @if (exercise.route) {
            <a class="fl-button fl-button--primary card__cta" [routerLink]="exercise.route">
              {{ 'practice.startPractising' | translate }}
            </a>
          }
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--fl-space-7);
    }

    .cards {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: var(--fl-space-4);
    }

    .card {
      display: flex;
      flex-direction: column;
      gap: var(--fl-space-2);
      padding: var(--fl-space-5);
      border: 1px solid var(--fl-border);
      border-radius: var(--fl-radius-lg);
      background: var(--fl-surface);
    }

    .card--live {
      border-color: var(--fl-border-strong);
    }

    .card__meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fl-space-2);
    }

    .card__name {
      font-size: var(--fl-text-lg);
    }

    .card__example {
      margin-top: auto;
      padding-top: var(--fl-space-3);
      color: var(--fl-text-muted);
      font-family: var(--fl-font-display);
      font-style: italic;
      font-size: 1.0625rem;
    }

    .card__cta {
      margin-top: var(--fl-space-2);
      align-self: flex-start;
    }
  `,
})
export class Practice {
  protected readonly exercises: readonly ExerciseType[] = [
    {
      topicKey: 'practice.topic.fretboard',
      nameKey: 'practice.noteLocation.name',
      exampleKey: 'practice.noteLocation.example',
      route: '/practice/fretboard-trainer',
    },
    {
      topicKey: 'practice.topic.fretboard',
      nameKey: 'practice.singleFretNote.name',
      exampleKey: 'practice.singleFretNote.example',
    },
    {
      topicKey: 'practice.topic.intervals',
      nameKey: 'practice.intervalIdentification.name',
      exampleKey: 'practice.intervalIdentification.example',
    },
    {
      topicKey: 'practice.topic.intervals',
      nameKey: 'practice.intervalConstruction.name',
      exampleKey: 'practice.intervalConstruction.example',
      route: '/practice/interval-trainer',
    },
    {
      topicKey: 'practice.topic.chords',
      nameKey: 'practice.chordBuilding.name',
      exampleKey: 'practice.chordBuilding.example',
    },
    {
      topicKey: 'practice.topic.chords',
      nameKey: 'practice.chordRecognition.name',
      exampleKey: 'practice.chordRecognition.example',
    },
    {
      topicKey: 'practice.topic.scales',
      nameKey: 'practice.scaleBuilding.name',
      exampleKey: 'practice.scaleBuilding.example',
    },
  ];
}
