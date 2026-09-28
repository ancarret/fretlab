import { TestBed } from '@angular/core/testing';

import { Piano } from './piano';

describe('Piano', () => {
  it('draws seven white keys and five black keys, with no black key after E or B', async () => {
    const fixture = TestBed.createComponent(Piano);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.key--white').length).toBe(7);
    expect(element.querySelectorAll('.key--black').length).toBe(5);
    expect(element.querySelector('[aria-label="Pitch class 4"]')).not.toBeNull(); // E, white
    expect(element.querySelector('[aria-label="Pitch class 5"]')).not.toBeNull(); // F, white
    // The semitone gap: no key exists for pitch class "between" E (4) and F (5).
  });

  it('reports which pitch class was pressed', async () => {
    const fixture = TestBed.createComponent(Piano);
    await fixture.whenStable();

    const emitted: number[] = [];
    fixture.componentInstance.keySelected.subscribe((pitchClass) => emitted.push(pitchClass));

    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<SVGRectElement>('[aria-label="Pitch class 1"]')?.dispatchEvent(
      new MouseEvent('click'),
    );
    await fixture.whenStable();

    expect(emitted).toEqual([1]);
  });

  it('renders a marker with its musical role and label', async () => {
    const fixture = TestBed.createComponent(Piano);
    fixture.componentRef.setInput('markers', [{ pitchClass: 0, label: 'C', role: 'root' }]);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const key = element.querySelector('[aria-label="Pitch class 0"]');

    expect(key?.classList.contains('key--role-root')).toBe(true);
    expect(element.querySelector('.key__label')?.textContent?.trim()).toBe('C');
  });

  it('stays read-only when interaction is disabled', async () => {
    const fixture = TestBed.createComponent(Piano);
    fixture.componentRef.setInput('interactive', false);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('[role="button"]').length).toBe(0);
  });
});
