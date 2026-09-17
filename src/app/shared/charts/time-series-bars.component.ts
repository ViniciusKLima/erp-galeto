import { Component, Input, computed, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

export type BucketSerie = {
  label: string;
  receita: number;
  despesa: number;
};

@Component({
  selector: 'app-time-series-bars',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="legenda">
      <span><i class="dot dot-receita"></i> Receita</span>
      <span><i class="dot dot-despesa"></i> Despesa</span>
    </div>

    @if (bucketsSignal().length === 0) {
      <p class="vazio">Sem dados para o período selecionado.</p>
    } @else {
      <div class="chart">
        @for (b of bucketsSignal(); track b.label) {
          <div class="bucket" [title]="b.label + ': ' + (b.receita | currency: 'BRL') + ' / ' + (b.despesa | currency: 'BRL')">
            <div class="bars">
              <div class="bar bar-receita" [style.height.%]="percentual(b.receita)"></div>
              <div class="bar bar-despesa" [style.height.%]="percentual(b.despesa)"></div>
            </div>
            <span class="bucket-label">{{ b.label }}</span>
          </div>
        }
      </div>
    }
  `,
  styles: `
    .legenda {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      font-size: 0.8rem;
      color: var(--brand-ink-muted);
    }
    .dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 4px;
    }
    .dot-receita {
      background: var(--color-success);
    }
    .dot-despesa {
      background: var(--color-danger);
    }
    .chart {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      height: 200px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .bucket {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 36px;
      flex: 1 0 auto;
      height: 100%;
    }
    .bars {
      display: flex;
      align-items: flex-end;
      gap: 3px;
      height: 168px;
      width: 100%;
      justify-content: center;
    }
    .bar {
      width: 10px;
      border-radius: 4px 4px 0 0;
      min-height: 2px;
      transition: height 0.2s ease;
    }
    .bar-receita {
      background: var(--color-success);
    }
    .bar-despesa {
      background: var(--color-danger);
    }
    .bucket-label {
      margin-top: 8px;
      font-size: 0.7rem;
      color: var(--brand-ink-muted);
      white-space: nowrap;
    }
    .vazio {
      color: var(--brand-ink-muted);
      font-size: 0.9rem;
    }
  `,
})
export class TimeSeriesBarsComponent {
  readonly bucketsSignal = signal<BucketSerie[]>([]);

  @Input() set buckets(value: BucketSerie[]) {
    this.bucketsSignal.set(value ?? []);
  }

  readonly maximo = computed(() =>
    Math.max(1, ...this.bucketsSignal().flatMap((b) => [b.receita, b.despesa])),
  );

  percentual(valor: number): number {
    if (valor <= 0) return 0;
    return Math.max(2, Math.round((valor / this.maximo()) * 100));
  }
}
