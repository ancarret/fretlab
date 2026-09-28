import { typesetNoteName } from './note-name.pipe';

describe('typesetNoteName', () => {
  it('swaps ASCII accidentals for real glyphs', () => {
    expect(typesetNoteName('F#')).toBe('F♯');
    expect(typesetNoteName('Bb')).toBe('B♭');
    expect(typesetNoteName('Ebb')).toBe('E♭♭');
  });

  it('leaves the note B and chord suffixes alone', () => {
    expect(typesetNoteName('B')).toBe('B');
    expect(typesetNoteName('Bbdim')).toBe('B♭dim');
    expect(typesetNoteName('Cm7b5')).toBe('Cm7b5');
  });
});
