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
  templateUrl: './time-series-bars.component.html',
  styleUrl: './time-series-bars.component.scss',
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
