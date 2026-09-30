import { LessonProgressService } from './core/learn/lesson-progress.service';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from './core/api/auth.service';
import { HealthService } from './core/api/health.service';
import { TranslatePipe } from './core/i18n/translate.pipe';
import { ApiStatus } from './core/layout/api-status';
import { LanguageSwitch } from './core/layout/language-switch';

interface NavItem {
  readonly path: string;
  readonly labelKey: string;
}

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ApiStatus, LanguageSwitch, TranslatePipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly health = inject(HealthService);
  /** Injected only so it starts listening to navigation from the first page load. */
  protected readonly lessonProgress = inject(LessonProgressService);
  protected readonly auth = inject(AuthService);

  protected readonly navItems: readonly NavItem[] = [
    { path: '/dashboard', labelKey: 'nav.dashboard' },
    { path: '/learn', labelKey: 'nav.learn' },
    { path: '/fretboard', labelKey: 'nav.fretboard' },
    { path: '/practice', labelKey: 'nav.practice' },
    { path: '/progress', labelKey: 'nav.progress' },
  ];

  ngOnInit(): void {
    this.health.refresh();
  }
}
