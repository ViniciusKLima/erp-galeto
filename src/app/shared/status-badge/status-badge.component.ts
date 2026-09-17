import { Component, Input, computed, signal } from '@angular/core';

type Variant = 'success' | 'danger' | 'warning' | 'neutral';

const STATUS_CONFIG: Record<string, { label: string; variant: Variant }> = {
  pendente: { label: 'Pendente', variant: 'warning' },
  pago: { label: 'Pago', variant: 'success' },
  recebido: { label: 'Recebido', variant: 'success' },
  cancelado: { label: 'Cancelado', variant: 'neutral' },
  aberta: { label: 'Aberta', variant: 'warning' },
  quitada: { label: 'Quitada', variant: 'success' },
  cancelada: { label: 'Cancelada', variant: 'neutral' },
  aberto: { label: 'Aberto', variant: 'warning' },
  em_andamento: { label: 'Em andamento', variant: 'warning' },
  fechamento: { label: 'Em fechamento', variant: 'neutral' },
  fechado: { label: 'Fechado', variant: 'neutral' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [class]="'badge-' + variante()">{{ rotulo() }}</span>`,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .badge-success {
      background: var(--color-success-bg);
      color: var(--color-success);
    }
    .badge-danger {
      background: var(--color-danger-bg);
      color: var(--color-danger);
    }
    .badge-warning {
      background: var(--color-warning-bg);
      color: var(--color-warning);
    }
    .badge-neutral {
      background: var(--color-neutral-bg);
      color: var(--color-neutral);
      text-decoration: line-through;
    }
  `,
})
export class StatusBadgeComponent {
  private readonly statusSignal = signal('');

  @Input() set status(value: string) {
    this.statusSignal.set(value);
  }

  readonly rotulo = computed(() => STATUS_CONFIG[this.statusSignal()]?.label ?? this.statusSignal());
  readonly variante = computed(() => STATUS_CONFIG[this.statusSignal()]?.variant ?? 'neutral');
}
