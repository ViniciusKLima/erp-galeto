import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '../../dashboard.service';
import { MovimentacoesService } from '../../../movimentacoes/movimentacoes.service';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../../shared/empty-state/empty-state.component';
import { PeriodFilterComponent, PeriodoSelecionado } from '../../../../shared/period-filter/period-filter.component';
import { HorizontalBarListComponent, BarItem } from '../../../../shared/charts/horizontal-bar-list/horizontal-bar-list.component';
import { TimeSeriesBarsComponent, BucketSerie } from '../../../../shared/charts/time-series-bars/time-series-bars.component';
import { Tables } from '../../../../core/types/database.types';

function diasEntre(inicioIso: string, fimIso: string): number {
  const ms = new Date(fimIso).getTime() - new Date(inicioIso).getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

function chaveBucket(dataIso: string, granularidade: 'dia' | 'semana' | 'mes'): { chave: string; rotulo: string } {
  const d = new Date(dataIso + 'T00:00:00');
  if (granularidade === 'dia') {
    const rotulo = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    return { chave: dataIso, rotulo };
  }
  if (granularidade === 'semana') {
    const inicioSemana = new Date(d);
    inicioSemana.setDate(d.getDate() - d.getDay());
    const chave = inicioSemana.toISOString().slice(0, 10);
    const rotulo = inicioSemana.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    return { chave, rotulo };
  }
  const chave = `${d.getFullYear()}-${d.getMonth()}`;
  const rotulo = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
  return { chave, rotulo };
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatTableModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    PeriodFilterComponent,
    HorizontalBarListComponent,
    TimeSeriesBarsComponent,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly movimentacoesService = inject(MovimentacoesService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saldoContas = signal<Tables<'v_saldo_contas'>[]>([]);
  readonly movimentacoesPeriodo = signal<Tables<'financial_transactions'>[]>([]);
  readonly fluxoCaixa = signal<Tables<'v_fluxo_caixa'>[]>([]);
  readonly contasAPagar = signal<Tables<'v_contas_a_pagar'>[]>([]);
  readonly contasAReceber = signal<Tables<'v_contas_a_receber'>[]>([]);
  readonly ultimosCiclos = signal<{ ciclo: Tables<'cycles'>; receita: number; despesa: number }[]>([]);
  readonly recentes = signal<Tables<'financial_transactions'>[]>([]);
  readonly categorias = signal<Tables<'transaction_categories'>[]>([]);
  readonly contas = signal<Tables<'financial_accounts'>[]>([]);
  readonly ciclos = signal<Tables<'cycles'>[]>([]);

  readonly filtroCiclo = this.fb.control<string | null>(null);
  readonly filtroConta = this.fb.control<string | null>(null);
  readonly filtroCategoria = this.fb.control<string | null>(null);

  private periodo: PeriodoSelecionado = { inicio: '', fim: '', rotulo: '' };

  readonly movimentacoesFiltradas = computed(() => {
    const ciclo = this.filtroCiclo.value;
    const categoria = this.filtroCategoria.value;
    return this.movimentacoesPeriodo().filter(
      (m) => (!ciclo || m.cycle_id === ciclo) && (!categoria || m.category_id === categoria),
    );
  });

  readonly receita = computed(() =>
    this.movimentacoesFiltradas()
      .filter((m) => m.type === 'income')
      .reduce((s, m) => s + m.amount, 0),
  );
  readonly despesa = computed(() =>
    this.movimentacoesFiltradas()
      .filter((m) => m.type === 'expense')
      .reduce((s, m) => s + m.amount, 0),
  );
  readonly resultado = computed(() => this.receita() - this.despesa());

  readonly saldoDisponivel = computed(() => {
    const contaId = this.filtroConta.value;
    const lista = contaId ? this.saldoContas().filter((c) => c.financial_account_id === contaId) : this.saldoContas();
    return lista.reduce((s, c) => s + (c.saldo_atual ?? 0), 0);
  });

  readonly entradas = computed(() =>
    this.fluxoCaixa()
      .filter((f) => f.direcao === 'in')
      .reduce((s, f) => s + (f.valor ?? 0), 0),
  );
  readonly saidas = computed(() =>
    this.fluxoCaixa()
      .filter((f) => f.direcao === 'out')
      .reduce((s, f) => s + (f.valor ?? 0), 0),
  );

  readonly totalAPagar = computed(() => this.contasAPagar().reduce((s, r) => s + (r.valor_pendente ?? 0), 0));
  readonly totalAReceber = computed(() => this.contasAReceber().reduce((s, r) => s + (r.valor_pendente ?? 0), 0));

  readonly despesasPorCategoria = computed<BarItem[]>(() => this.agruparPorCategoria('expense'));
  readonly receitasPorCategoria = computed<BarItem[]>(() => this.agruparPorCategoria('income'));

  readonly bucketsGrafico = computed<BucketSerie[]>(() => {
    if (!this.periodo.inicio) return [];
    const dias = diasEntre(this.periodo.inicio, this.periodo.fim);
    const granularidade = dias <= 14 ? 'dia' : dias <= 120 ? 'semana' : 'mes';
    const mapa = new Map<string, { rotulo: string; receita: number; despesa: number }>();

    for (const m of this.movimentacoesFiltradas()) {
      const { chave, rotulo } = chaveBucket(m.transaction_date, granularidade);
      const atual = mapa.get(chave) ?? { rotulo, receita: 0, despesa: 0 };
      if (m.type === 'income') atual.receita += m.amount;
      else atual.despesa += m.amount;
      mapa.set(chave, atual);
    }

    return Array.from(mapa.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({ label: v.rotulo, receita: v.receita, despesa: v.despesa }));
  });

  async ngOnInit(): Promise<void> {
    const [categorias, contas, ciclos] = await Promise.all([
      this.movimentacoesService.listarCategorias(),
      this.movimentacoesService.listarContasFinanceiras(),
      this.movimentacoesService.listarCiclos(),
    ]);
    this.categorias.set(categorias);
    this.contas.set(contas);
    this.ciclos.set(ciclos);

    const [saldo, aPagar, aReceber, ultimosCiclos, recentes] = await Promise.all([
      this.dashboardService.getSaldoContas(),
      this.dashboardService.getContasAPagar(),
      this.dashboardService.getContasAReceber(),
      this.dashboardService.getUltimosCiclosComResultado(),
      this.dashboardService.getMovimentacoesRecentes(),
    ]);
    this.saldoContas.set(saldo);
    this.contasAPagar.set(aPagar);
    this.contasAReceber.set(aReceber);
    this.ultimosCiclos.set(ultimosCiclos);
    this.recentes.set(recentes);
  }

  async onPeriodoAlterado(periodo: PeriodoSelecionado): Promise<void> {
    this.periodo = periodo;
    this.loading.set(true);
    const [movimentacoes, fluxo] = await Promise.all([
      this.dashboardService.getMovimentacoesPeriodo(periodo.inicio, periodo.fim),
      this.dashboardService.getFluxoCaixaPeriodo(periodo.inicio, periodo.fim, this.filtroConta.value),
    ]);
    this.movimentacoesPeriodo.set(movimentacoes);
    this.fluxoCaixa.set(fluxo);
    this.loading.set(false);
  }

  async onContaChange(): Promise<void> {
    if (!this.periodo.inicio) return;
    this.fluxoCaixa.set(
      await this.dashboardService.getFluxoCaixaPeriodo(this.periodo.inicio, this.periodo.fim, this.filtroConta.value),
    );
  }

  limparFiltrosAdicionais(): void {
    this.filtroCiclo.setValue(null);
    this.filtroConta.setValue(null);
    this.filtroCategoria.setValue(null);
    this.onPeriodoAlterado(this.periodo);
  }

  private agruparPorCategoria(tipo: 'income' | 'expense'): BarItem[] {
    const mapa = new Map<string, number>();
    for (const m of this.movimentacoesFiltradas()) {
      if (m.type !== tipo) continue;
      mapa.set(m.category_id, (mapa.get(m.category_id) ?? 0) + m.amount);
    }
    return Array.from(mapa.entries())
      .map(([id, valor]) => ({
        label: this.categorias().find((c) => c.id === id)?.name ?? id,
        valor,
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 8);
  }
}
