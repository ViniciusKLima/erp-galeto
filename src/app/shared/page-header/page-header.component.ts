import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="page-header">
      <div>
        <h1>{{ title }}</h1>
        @if (subtitle) {
          <p class="subtitle">{{ subtitle }}</p>
        }
      </div>
      <div class="actions">
        <ng-content select="[actions]" />
      </div>
    </div>
  `,
  styles: `
    .page-header {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      justify-content: space-between;
      align-items: flex-start;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
      color: var(--brand-ink);
    }
    .subtitle {
      margin: 4px 0 0;
      color: var(--brand-ink-muted);
      font-size: 0.9rem;
    }
    .actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  `,
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle?: string;
}
