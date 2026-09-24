import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RelatoriosService } from '../../relatorios.service';
import { MovimentacoesService } from '../../../movimentacoes/movimentacoes.service';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/empty-state/empty-state.component';
import { PeriodFilterComponent, PeriodoSelecionado } from '../../../../shared/period-filter/period-filter.component';
import { Tables } from '../../../../core/types/database.types';

type LinhaAgrupada = {
  chave: string;
  nome: string;
  receita: number;
  despesa: number;
  resultado: number;
};

function agrupar(
  movimentacoes: Tables<'financial_transactions'>[],
  chaveDe: (m: Tables<'financial_transactions'>) => string | null,
  nomeDe: (chave: string) => string,
): LinhaAgrupada[] {
  const mapa = new Map<string, { receita: number; despesa: number }>();

  for (const m of movimentacoes) {
    const chave = chaveDe(m);
    if (!chave) continue;
    const atual = mapa.get(chave) ?? { receita: 0, despesa: 0 };
    if (m.type === 'income') {
      atual.receita += m.amount;
    } else {
      atual.despesa += m.amount;
    }
    mapa.set(chave, atual);
  }

  return Array.from(mapa.entries())
    .map(([chave, valores]) => ({
      chave,
      nome: nomeDe(chave),
      receita: valores.receita,
      despesa: valores.despesa,
      resultado: valores.receita - valores.despesa,
    }))
    .sort((a, b) => b.resultado - a.resultado);
}

@Component({
  selector: 'app-relatorios-page',
  standalone: true,
  imports: [
    CurrencyPipe,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    EmptyStateComponent,
    PeriodFilterComponent,
  ],
  templateUrl: './relatorios.page.html',
  styleUrl: './relatorios.page.scss',
})
export class RelatoriosPage implements OnInit {
  private readonly relatoriosService = inject(RelatoriosService);
  private readonly movimentacoesService = inject(MovimentacoesService);

  readonly loading = signal(true);
  readonly movimentacoes = signal<Tables<'financial_transactions'>[]>([]);
  readonly categorias = signal<Tables<'transaction_categories'>[]>([]);
  readonly formasPagamento = signal<Tables<'payment_methods'>[]>([]);
  readonly ciclos = signal<Tables<'cycles'>[]>([]);
  readonly colunas = ['nome', 'receita', 'despesa', 'resultado'];

  readonly totalReceita = computed(() =>
    this.movimentacoes()
      .filter((m) => m.type === 'income')
      .reduce((sum, m) => sum + m.amount, 0),
  );
  readonly totalDespesa = computed(() =>
    this.movimentacoes()
      .filter((m) => m.type === 'expense')
      .reduce((sum, m) => sum + m.amount, 0),
  );
  readonly totalResultado = computed(() => this.totalReceita() - this.totalDespesa());

  readonly porCategoria = computed(() =>
    agrupar(
      this.movimentacoes(),
      (m) => m.category_id,
      (id) => this.categorias().find((c) => c.id === id)?.name ?? id,
    ),
  );

  readonly porFormaPagamento = computed(() =>
    agrupar(
      this.movimentacoes(),
      (m) => m.payment_method_id,
      (id) => this.formasPagamento().find((f) => f.id === id)?.name ?? id,
    ),
  );

  readonly porCiclo = computed(() =>
    agrupar(
      this.movimentacoes(),
      (m) => m.cycle_id,
      (id) => this.ciclos().find((c) => c.id === id)?.label ?? id,
    ),
  );

  async ngOnInit(): Promise<void> {
    const [categorias, formasPagamento, ciclos] = await Promise.all([
      this.movimentacoesService.listarCategorias(),
      this.movimentacoesService.listarFormasPagamento(),
      this.movimentacoesService.listarCiclos(),
    ]);
    this.categorias.set(categorias);
    this.formasPagamento.set(formasPagamento);
    this.ciclos.set(ciclos);
  }

  async onPeriodoAlterado(periodo: PeriodoSelecionado): Promise<void> {
    this.loading.set(true);
    this.movimentacoes.set(await this.relatoriosService.getMovimentacoesPeriodo(periodo.inicio, periodo.fim));
    this.loading.set(false);
  }
}
