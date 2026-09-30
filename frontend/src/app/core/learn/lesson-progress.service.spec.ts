import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { LessonProgressService } from './lesson-progress.service';

describe('LessonProgressService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'learn/foundations', children: [] },
          { path: 'learn/intervals', children: [] },
          { path: 'practice', children: [] },
        ]),
      ],
    });
  });

  it('offers the first lesson until anything has been opened', () => {
    const service = TestBed.inject(LessonProgressService);

    expect(service.next()?.route).toBe('/learn/foundations');
  });

  it('marks a lesson visited on navigation and moves on to the next unvisited one', async () => {
    const service = TestBed.inject(LessonProgressService);

    await TestBed.inject(Router).navigateByUrl('/learn/foundations');

    expect(service.visited().has('/learn/foundations')).toBe(true);
    expect(service.next()?.route).toBe('/learn/guitar-basics');
  });

  it('ignores pages that are not lessons', async () => {
    const service = TestBed.inject(LessonProgressService);

    await TestBed.inject(Router).navigateByUrl('/practice');

    expect(service.visited().size).toBe(0);
  });

  it('persists visited lessons across service instances', async () => {
    TestBed.inject(LessonProgressService);
    await TestBed.inject(Router).navigateByUrl('/learn/intervals');

    expect(JSON.parse(localStorage.getItem('fretlab.lessons.visited') ?? '[]')).toEqual(['/learn/intervals']);
  });
});
