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
  templateUrl: './horizontal-bar-list.component.html',
  styleUrl: './horizontal-bar-list.component.scss',
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
