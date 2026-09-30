import { Routes } from '@angular/router';

/**
 * Every feature is lazily loaded, so a first visit downloads only the shell plus the page
 * actually requested. The fretboard in particular will grow heavy, and keeping it in its own
 * chunk stops it from slowing down the dashboard.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'Dashboard · FretLab',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'learn',
    title: 'Learn · FretLab',
    loadComponent: () => import('./features/learn/learn').then((m) => m.Learn),
  },
  {
    path: 'learn/foundations',
    title: 'Music Foundations · FretLab',
    loadComponent: () =>
      import('./features/learn/foundations/foundations').then((m) => m.LessonFoundations),
  },
  {
    path: 'learn/guitar-basics',
    title: 'The Guitar · FretLab',
    loadComponent: () =>
      import('./features/learn/guitar-basics/guitar-basics').then((m) => m.GuitarBasics),
  },
  {
    path: 'fretboard',
    title: 'Fretboard Lab · FretLab',
    loadComponent: () => import('./features/fretboard/fretboard-lab').then((m) => m.FretboardLab),
  },
  {
    path: 'practice',
    title: 'Practice · FretLab',
    loadComponent: () => import('./features/practice/practice').then((m) => m.Practice),
  },
  {
    path: 'practice/fretboard-trainer',
    title: 'Find the Note · FretLab',
    loadComponent: () =>
      import('./features/practice/fretboard-trainer/fretboard-trainer').then(
        (m) => m.FretboardTrainer,
      ),
  },
  {
    path: 'practice/interval-trainer',
    title: 'Find the Interval · FretLab',
    loadComponent: () =>
      import('./features/practice/interval-trainer/interval-trainer').then(
        (m) => m.IntervalTrainer,
      ),
  },
  {
    path: 'progress',
    title: 'Progress · FretLab',
    loadComponent: () => import('./features/progress/progress').then((m) => m.Progress),
  },
  {
    path: 'login',
    title: 'Sign in · FretLab',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    title: 'Create an account · FretLab',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: '**',
    title: 'Not found · FretLab',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
