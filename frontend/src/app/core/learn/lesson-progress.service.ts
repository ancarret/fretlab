import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

const STORAGE_KEY = 'fretlab.lessons.visited';

/** The curriculum in teaching order; `order` doubles as the `learn.module{order}.*` key suffix. */
export const LESSONS: readonly { readonly order: number; readonly route: string }[] = [
  { order: 1, route: '/learn/foundations' },
  { order: 2, route: '/learn/guitar-basics' },
  { order: 3, route: '/learn/fretboard-mastery' },
  { order: 4, route: '/learn/intervals' },
  { order: 5, route: '/learn/triads' },
  { order: 6, route: '/learn/chords' },
  { order: 7, route: '/learn/scales-and-keys' },
  { order: 8, route: '/learn/harmony' },
  { order: 9, route: '/learn/pentatonic-scales' },
];

/**
 * Remembers which lessons this browser has opened.
 *
 * <p>Deliberately client-side: a lesson is reading, not a graded exercise, so there is nothing
 * for the server to verify and no reason to require an account just to see a checkmark. Practice
 * attempts — the things that do need an account — stay in the backend's progress module.
 * The trade-off is that progress is per browser, not per account.
 */
@Injectable({ providedIn: 'root' })
export class LessonProgressService {
  private readonly visitedState = signal<ReadonlySet<string>>(read());

  readonly visited = this.visitedState.asReadonly();

  /** The first lesson not yet opened, or `null` once the whole curriculum has been visited. */
  readonly next = computed(() => LESSONS.find((lesson) => !this.visitedState().has(lesson.route)) ?? null);

  constructor() {
    inject(Router)
      .events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.markVisited(event.urlAfterRedirects.split(/[?#]/)[0]));
  }

  private markVisited(path: string): void {
    if (!LESSONS.some((lesson) => lesson.route === path) || this.visitedState().has(path)) {
      return;
    }
    const updated = new Set(this.visitedState()).add(path);
    this.visitedState.set(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...updated]));
    } catch {
      // Private browsing — progress just will not survive a reload.
    }
  }
}

function read(): ReadonlySet<string> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return new Set(Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []);
  } catch {
    return new Set();
  }
}
