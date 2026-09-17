import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <div class="login-card">
        <img src="logo.png" alt="Galeto do Fofão" class="logo" />
        <p class="tagline">Gestão financeira e operacional</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>E-mail</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="username" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Senha</mat-label>
            <input matInput type="password" formControlName="password" autocomplete="current-password" />
          </mat-form-field>

          @if (errorMessage()) {
            <p class="error">{{ errorMessage() }}</p>
          }

          <button mat-flat-button color="primary" class="full-width" type="submit" [disabled]="form.invalid || loading()">
            @if (loading()) {
              <mat-spinner diameter="20" />
            } @else {
              Entrar
            }
          </button>
        </form>
      </div>
    </div>
  `,
  styles: `
    .login-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--brand-background);
    }
    .login-card {
      width: 100%;
      max-width: 380px;
      background: var(--brand-surface);
      border: 1px solid var(--brand-border);
      border-radius: 20px;
      padding: 40px 32px;
      box-sizing: border-box;
      text-align: center;
    }
    .logo {
      height: 56px;
      margin-bottom: 8px;
    }
    .tagline {
      margin: 0 0 28px;
      color: var(--brand-ink-muted);
      font-size: 0.9rem;
    }
    form {
      text-align: left;
    }
    .full-width {
      width: 100%;
      margin-bottom: 8px;
    }
    .error {
      color: var(--color-danger);
      font-size: 0.85rem;
      margin: 0 0 8px;
    }
  `,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();
    const { error } = await this.auth.signIn(email, password);

    this.loading.set(false);

    if (error) {
      this.errorMessage.set('E-mail ou senha inválidos.');
      return;
    }

    this.router.navigateByUrl('/dashboard');
  }
}
