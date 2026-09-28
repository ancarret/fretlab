import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/api/auth.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { PageHeader } from '../../../shared/page-header';

/**
 * Client-side validation here is purely for a responsive form — catching an obviously-too-short
 * password before a round trip. The backend's own `@Valid` constraints on `RegisterRequest` remain
 * the actual authority: nothing this form allows through is trusted just because it passed here.
 */
@Component({
  selector: 'app-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.html',
  styleUrl: '../auth-form.scss',
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected readonly submitting = signal(false);
  protected readonly errorKey = signal<string | null>(null);

  protected submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorKey.set(null);

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errorKey.set(error.status === 409 ? 'auth.register.conflict' : 'auth.register.genericError');
      },
    });
  }
}
