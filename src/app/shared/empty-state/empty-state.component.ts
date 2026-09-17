import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="empty-state">
      <mat-icon>{{ icon }}</mat-icon>
      <h3>{{ title }}</h3>
      @if (description) {
        <p>{{ description }}</p>
      }
      <ng-content select="[action]" />
    </div>
  `,
  styles: `
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 48px 24px;
      color: var(--brand-ink-muted);
    }
    mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: var(--brand-border);
      margin-bottom: 12px;
    }
    h3 {
      margin: 0 0 4px;
      color: var(--brand-ink);
      font-size: 1rem;
      font-weight: 600;
    }
    p {
      margin: 0 0 16px;
      font-size: 0.9rem;
      max-width: 360px;
    }
  `,
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nada por aqui ainda';
  @Input() description?: string;
}
