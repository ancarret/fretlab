import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { MarkerEmphasis, NoteRole } from '../fretboard/fretboard';

export interface KeyMarker {
  readonly pitchClass: number;
  readonly label?: string;
  readonly role?: NoteRole;
  readonly emphasis?: MarkerEmphasis;
}

const WHITE_WIDTH = 48;
const WHITE_HEIGHT = 160;
const BLACK_WIDTH = 28;
const BLACK_HEIGHT = 100;
const PAD = 4;

/** Pitch classes of the seven white keys, left to right: C D E F G A B. */
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];

/**
 * A black key sits at the boundary right after this white key's index — and there is deliberately
 * no entry after index 2 (E) or index 6 (B), which is the whole point of this component: those are
 * the two places a semitone separates two white keys with nothing in between.
 */
const BLACK_KEYS = [
  { pitchClass: 1, afterWhiteIndex: 0 },
  { pitchClass: 3, afterWhiteIndex: 1 },
  { pitchClass: 6, afterWhiteIndex: 3 },
  { pitchClass: 8, afterWhiteIndex: 4 },
  { pitchClass: 10, afterWhiteIndex: 5 },
];

/**
 * One octave of a piano keyboard, rendered as SVG.
 *
 * <p>Like {@link Fretboard}, this component knows geometry, not music: it draws whichever pitch
 * classes it is handed as markers and reports which key was pressed. It exists because the gap
 * between two white keys is the clearest possible picture of "a semitone" — there is no black key
 * between B and C, or between E and F, and seeing that gap does more than any sentence explaining
 * it.
 */
@Component({
  selector: 'app-piano',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './piano.html',
  styleUrl: './piano.scss',
})
export class Piano {
  readonly markers = input<readonly KeyMarker[]>([]);
  readonly interactive = input(true);

  readonly keySelected = output<number>();

  protected readonly width = WHITE_KEYS.length * WHITE_WIDTH + PAD * 2;
  protected readonly height = WHITE_HEIGHT + PAD * 2;
  protected readonly viewBox = `0 0 ${this.width} ${this.height}`;

  private readonly markerByPitchClass = computed(() => {
    const map = new Map<number, KeyMarker>();
    for (const marker of this.markers()) {
      map.set(marker.pitchClass, marker);
    }
    return map;
  });

  protected readonly whiteKeys = computed(() =>
    WHITE_KEYS.map((pitchClass, index) => {
      const marker = this.markerByPitchClass().get(pitchClass);
      return {
        pitchClass,
        x: PAD + index * WHITE_WIDTH,
        width: WHITE_WIDTH,
        height: WHITE_HEIGHT,
        label: marker?.label ?? '',
        role: marker?.role,
      };
    }),
  );

  protected readonly blackKeys = computed(() =>
    BLACK_KEYS.map(({ pitchClass, afterWhiteIndex }) => {
      const marker = this.markerByPitchClass().get(pitchClass);
      return {
        pitchClass,
        x: PAD + (afterWhiteIndex + 1) * WHITE_WIDTH - BLACK_WIDTH / 2,
        width: BLACK_WIDTH,
        height: BLACK_HEIGHT,
        label: marker?.label ?? '',
        role: marker?.role,
      };
    }),
  );

  protected readonly y = PAD;

  protected select(pitchClass: number): void {
    if (this.interactive()) {
      this.keySelected.emit(pitchClass);
    }
  }
}
