import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/** String 1 is the thinnest (high E); string 6 is the thickest (low E). Fret 0 means open. */
export interface FretPosition {
  readonly string: number;
  readonly fret: number;
}

/**
 * Musical role of a rendered note, driving its colour. Kept as a closed union so that the
 * meaning of a colour is identical on every screen.
 */
export type NoteRole = 'root' | 'third' | 'fifth' | 'seventh' | 'other';

/**
 * How prominent a marker is. `secondary` is the reference layer — every other note on the neck,
 * present for context but visually receding behind whatever is being taught.
 */
export type MarkerEmphasis = 'primary' | 'secondary';

export interface FretMarker {
  readonly position: FretPosition;
  /** Short caption drawn inside the circle, such as a note name or scale degree. */
  readonly label?: string;
  readonly role?: NoteRole;
  readonly emphasis?: MarkerEmphasis;
}

const STRING_COUNT = 6;
const STRING_GAP = 30;
const FRET_WIDTH = 64;
const OPEN_WIDTH = 46;
const PAD_TOP = 26;
const PAD_BOTTOM = 34;
const PAD_LEFT = 12;
const PAD_RIGHT = 16;
const MARKER_RADIUS = 11;

const BOARD_X = PAD_LEFT + OPEN_WIDTH;
const SINGLE_INLAY_FRETS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_INLAY_FRETS = [12, 24];
/** Strings 4–6 are wound on a real set, which reads as a warmer, darker line. */
const FIRST_WOUND_STRING = 4;

/** SVG gradient ids are document-global, so each instance needs its own. */
let nextInstanceId = 0;

/**
 * Reusable guitar neck rendered as SVG.
 *
 * <p>This component knows geometry, not music: it draws whatever markers it is handed and reports
 * which position was clicked. Deciding that fret 3 of string 5 is a C is the backend's job, which
 * keeps one fretboard usable for scales, chords, exercises and free exploration alike.
 *
 * <p>Fret spacing is uniform rather than proportional to a real neck. Diagrams read better that
 * way, and every fret gets an equally large click target.
 */
@Component({
  selector: 'app-fretboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fretboard.html',
  styleUrl: './fretboard.scss',
})
export class Fretboard {
  readonly fretCount = input(12);
  readonly markers = input<readonly FretMarker[]>([]);
  readonly interactive = input(true);

  readonly positionSelected = output<FretPosition>();

  protected readonly width = computed(
    () => BOARD_X + this.fretCount() * FRET_WIDTH + PAD_RIGHT,
  );
  protected readonly height = PAD_TOP + (STRING_COUNT - 1) * STRING_GAP + PAD_BOTTOM;
  protected readonly boardX = BOARD_X;
  protected readonly markerRadius = MARKER_RADIUS;
  protected readonly woodGradientId = `fl-wood-${nextInstanceId++}`;

  protected readonly viewBox = computed(() => `0 0 ${this.width()} ${this.height}`);

  protected readonly boardEndX = computed(() => BOARD_X + this.fretCount() * FRET_WIDTH);

  protected readonly stringStartX = PAD_LEFT;
  protected readonly openLabelX = PAD_LEFT + OPEN_WIDTH / 2;
  protected readonly fretLabelY = PAD_TOP + (STRING_COUNT - 1) * STRING_GAP + 24;

  protected readonly surface = computed(() => ({
    x: BOARD_X,
    y: PAD_TOP - STRING_GAP / 2,
    width: this.fretCount() * FRET_WIDTH,
    height: STRING_COUNT * STRING_GAP,
  }));

  protected readonly strings = computed(() =>
    Array.from({ length: STRING_COUNT }, (_, index) => {
      const number = index + 1;
      return {
        number,
        y: stringY(number),
        // Thicker lines towards the bass strings, mirroring a real set of strings.
        thickness: 0.9 + index * 0.32,
        wound: number >= FIRST_WOUND_STRING,
      };
    }),
  );

  protected readonly frets = computed(() =>
    Array.from({ length: this.fretCount() }, (_, index) => {
      const number = index + 1;
      return {
        number,
        x: BOARD_X + number * FRET_WIDTH,
        labelX: fretX(number),
        marked: SINGLE_INLAY_FRETS.includes(number) || DOUBLE_INLAY_FRETS.includes(number),
      };
    }),
  );

  protected readonly inlays = computed(() => {
    const middleY = PAD_TOP + ((STRING_COUNT - 1) * STRING_GAP) / 2;
    const total = this.fretCount();

    const singles = SINGLE_INLAY_FRETS.filter((fret) => fret <= total).map((fret) => ({
      id: `single-${fret}`,
      x: fretX(fret),
      y: middleY,
    }));

    const doubles = DOUBLE_INLAY_FRETS.filter((fret) => fret <= total).flatMap((fret) => [
      { id: `double-${fret}-upper`, x: fretX(fret), y: middleY - STRING_GAP },
      { id: `double-${fret}-lower`, x: fretX(fret), y: middleY + STRING_GAP },
    ]);

    return [...singles, ...doubles];
  });

  protected readonly placedMarkers = computed(() =>
    this.markers().map((marker) => ({
      id: positionId(marker.position),
      x: fretX(marker.position.fret),
      y: stringY(marker.position.string),
      label: marker.label ?? '',
      role: marker.role ?? 'other',
      emphasis: marker.emphasis ?? 'primary',
    })),
  );

  /** One keyboard-reachable hit target per string/fret intersection. */
  protected readonly cells = computed(() =>
    this.strings().flatMap((string) =>
      Array.from({ length: this.fretCount() + 1 }, (_, fret) => ({
        id: positionId({ string: string.number, fret }),
        position: { string: string.number, fret } as FretPosition,
        x: fret === 0 ? PAD_LEFT : BOARD_X + (fret - 1) * FRET_WIDTH,
        y: string.y - STRING_GAP / 2,
        width: fret === 0 ? OPEN_WIDTH : FRET_WIDTH,
        height: STRING_GAP,
        label: fret === 0 ? `String ${string.number}, open` : `String ${string.number}, fret ${fret}`,
      })),
    ),
  );

  protected select(position: FretPosition): void {
    if (this.interactive()) {
      this.positionSelected.emit(position);
    }
  }
}

function stringY(stringNumber: number): number {
  return PAD_TOP + (stringNumber - 1) * STRING_GAP;
}

function fretX(fret: number): number {
  return fret === 0 ? PAD_LEFT + OPEN_WIDTH / 2 : BOARD_X + (fret - 0.5) * FRET_WIDTH;
}

function positionId(position: FretPosition): string {
  return `s${position.string}f${position.fret}`;
}
