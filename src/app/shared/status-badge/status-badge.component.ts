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
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  private readonly statusSignal = signal('');

  @Input() set status(value: string) {
    this.statusSignal.set(value);
  }

  readonly rotulo = computed(() => STATUS_CONFIG[this.statusSignal()]?.label ?? this.statusSignal());
  readonly variante = computed(() => STATUS_CONFIG[this.statusSignal()]?.variant ?? 'neutral');
}
