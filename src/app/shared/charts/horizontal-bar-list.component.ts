import { Component, Input, computed, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

export type BarItem = {
  label: string;
  valor: number;
};

@Component({
  selector: 'app-horizontal-bar-list',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    @if (itensSignal().length === 0) {
      <p class="vazio">Sem dados para o período selecionado.</p>
    } @else {
      <div class="lista">
        @for (item of itensSignal(); track item.label) {
          <div class="linha">
            <span class="rotulo">{{ item.label }}</span>
            <div class="trilho">
              <div class="barra" [style.width.%]="percentual(item.valor)"></div>
            </div>
            <span class="valor">{{ item.valor | currency: 'BRL' }}</span>
          </div>
        }
      </div>
    }
  `,
  styles: `
    .lista {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .linha {
      display: grid;
      grid-template-columns: minmax(90px, 140px) 1fr auto;
      align-items: center;
      gap: 12px;
    }
    .rotulo {
      font-size: 0.85rem;
      color: var(--brand-ink);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .trilho {
      height: 8px;
      border-radius: 999px;
      background: var(--brand-background);
      overflow: hidden;
    }
    .barra {
      height: 100%;
      border-radius: 999px;
      background: var(--brand-primary);
    }
    .valor {
      font-size: 0.85rem;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
    .vazio {
      color: var(--brand-ink-muted);
      font-size: 0.9rem;
    }
  `,
})
export class HorizontalBarListComponent {
  readonly itensSignal = signal<BarItem[]>([]);

  @Input() set itens(value: BarItem[]) {
    this.itensSignal.set(value ?? []);
  }

  readonly maximo = computed(() => Math.max(1, ...this.itensSignal().map((i) => i.valor)));

  percentual(valor: number): number {
    return Math.max(2, Math.round((valor / this.maximo()) * 100));
  }
}
