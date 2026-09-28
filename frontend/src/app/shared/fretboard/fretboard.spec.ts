import { TestBed } from '@angular/core/testing';

import { FretPosition, Fretboard } from './fretboard';

describe('Fretboard', () => {
  it('draws six strings and one hit target per playable position', async () => {
    const fixture = TestBed.createComponent(Fretboard);
    fixture.componentRef.setInput('fretCount', 12);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.board__string').length).toBe(6);
    expect(element.querySelectorAll('.board__fret').length).toBe(12);
    // Twelve frets plus the open string, on each of the six strings.
    expect(element.querySelectorAll('.cell').length).toBe(6 * 13);
  });

  it('reports which position was activated', async () => {
    const fixture = TestBed.createComponent(Fretboard);
    await fixture.whenStable();

    const emitted: FretPosition[] = [];
    fixture.componentInstance.positionSelected.subscribe((position) => emitted.push(position));

    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<SVGRectElement>('[aria-label="String 5, fret 3"]')?.dispatchEvent(
      new MouseEvent('click'),
    );
    await fixture.whenStable();

    expect(emitted).toEqual([{ string: 5, fret: 3 }]);
  });

  it('renders a marker with its musical role and label', async () => {
    const fixture = TestBed.createComponent(Fretboard);
    fixture.componentRef.setInput('markers', [
      { position: { string: 5, fret: 3 }, label: 'C', role: 'root' },
    ]);
    await fixture.whenStable();

    const marker = (fixture.nativeElement as HTMLElement).querySelector('.marker');

    expect(marker?.classList.contains('marker--root')).toBe(true);
    expect(marker?.querySelector('text')?.textContent?.trim()).toBe('C');
  });

  it('stays read-only when interaction is disabled', async () => {
    const fixture = TestBed.createComponent(Fretboard);
    fixture.componentRef.setInput('interactive', false);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.cell').length).toBe(0);
  });
});
