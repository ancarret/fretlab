import { Pipe, PipeTransform } from '@angular/core';

/**
 * Typesets a note or chord name with real accidental glyphs — B♭ and F♯ rather than the ASCII
 * "Bb" and "F#" the API speaks.
 *
 * <p>This is presentation only: the spelling itself (whether the note is F♯ or G♭) was decided by
 * the backend. Only the accidentals directly after the letter are touched, so the note B and the
 * "b" of a suffix such as "m7b5" are left alone.
 */
export function typesetNoteName(name: string | null | undefined): string {
  if (!name) {
    return '';
  }
  const match = /^([A-G])([#b]*)(.*)$/.exec(name);
  if (!match) {
    return name;
  }
  const [, letter, accidentals, suffix] = match;
  return letter + accidentals.replace(/#/g, '♯').replace(/b/g, '♭') + suffix;
}

/** Template form of {@link typesetNoteName}. */
@Pipe({ name: 'noteName' })
export class NoteNamePipe implements PipeTransform {
  transform(name: string | null | undefined): string {
    return typesetNoteName(name);
  }
}
