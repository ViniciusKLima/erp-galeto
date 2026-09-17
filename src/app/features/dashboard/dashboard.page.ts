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
import { DashboardService } from './dashboard.service';
import { MovimentacoesService } from '../movimentacoes/movimentacoes.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { PeriodFilterComponent, PeriodoSelecionado } from '../../shared/period-filter/period-filter.component';
import { HorizontalBarListComponent, BarItem } from '../../shared/charts/horizontal-bar-list.component';
import { TimeSeriesBarsComponent, BucketSerie } from '../../shared/charts/time-series-bars.component';
import { Tables } from '../../core/types/database.types';

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
  template: `
    <div class="page-shell">
      <app-page-header title="Dashboard" subtitle="Visão geral da operação financeira." />

      <div class="surface-card filtros-card">
        <app-period-filter (periodoAlterado)="onPeriodoAlterado($event)" />

        <mat-form-field appearance="outline" class="filtro-curto">
          <mat-label>Ciclo</mat-label>
          <mat-select [formControl]="filtroCiclo">
            <mat-option [value]="null">Todos</mat-option>
            @for (ciclo of ciclos(); track ciclo.id) {
              <mat-option [value]="ciclo.id">{{ ciclo.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filtro-curto">
          <mat-label>Conta</mat-label>
          <mat-select [formControl]="filtroConta" (selectionChange)="onContaChange()">
            <mat-option [value]="null">Todas</mat-option>
            @for (conta of contas(); track conta.id) {
              <mat-option [value]="conta.id">{{ conta.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-expansion-panel class="filtros-avancados">
          <mat-expansion-panel-header>
            <mat-panel-title>Filtros avançados</mat-panel-title>
          </mat-expansion-panel-header>
          <div class="filtros-avancados-conteudo">
            <mat-form-field appearance="outline">
              <mat-label>Categoria</mat-label>
              <mat-select [formControl]="filtroCategoria">
                <mat-option [value]="null">Todas</mat-option>
                @for (categoria of categorias(); track categoria.id) {
                  <mat-option [value]="categoria.id">{{ categoria.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
        </mat-expansion-panel>

        @if (filtroCiclo.value || filtroConta.value || filtroCategoria.value) {
          <button mat-button (click)="limparFiltrosAdicionais()">
            <mat-icon>close</mat-icon>
            Limpar filtros
          </button>
        }
      </div>

      @if (loading()) {
        <mat-spinner diameter="32" />
      } @else {
        <div class="cards-grid">
          <mat-card class="stat-card">
            <p class="label">Receita</p>
            <p class="valor text-success">{{ receita() | currency: 'BRL' }}</p>
            <p class="hint">Reconhecida no período</p>
          </mat-card>
          <mat-card class="stat-card">
            <p class="label">Despesas</p>
            <p class="valor text-danger">{{ despesa() | currency: 'BRL' }}</p>
            <p class="hint">Reconhecidas no período</p>
          </mat-card>
          <mat-card class="stat-card">
            <p class="label">Resultado</p>
            <p class="valor" [class.text-success]="resultado() >= 0" [class.text-danger]="resultado() < 0">
              {{ resultado() | currency: 'BRL' }}
            </p>
            <p class="hint">Receita − despesas reconhecidas</p>
          </mat-card>
          <mat-card class="stat-card destaque">
            <p class="label">Saldo disponível</p>
            <p class="valor">{{ saldoDisponivel() | currency: 'BRL' }}</p>
            <p class="hint">{{ filtroConta.value ? 'Nesta conta' : 'Soma de todas as contas' }}</p>
          </mat-card>
        </div>

        <div class="cards-grid">
          <mat-card class="stat-card compact">
            <p class="label">Entradas efetivas</p>
            <p class="valor-sm text-success">{{ entradas() | currency: 'BRL' }}</p>
          </mat-card>
          <mat-card class="stat-card compact">
            <p class="label">Saídas efetivas</p>
            <p class="valor-sm text-danger">{{ saidas() | currency: 'BRL' }}</p>
          </mat-card>
          <mat-card class="stat-card compact clicavel" routerLink="/dividas">
            <p class="label">A receber</p>
            <p class="valor-sm">{{ totalAReceber() | currency: 'BRL' }}</p>
          </mat-card>
          <mat-card class="stat-card compact clicavel" routerLink="/dividas">
            <p class="label">A pagar</p>
            <p class="valor-sm">{{ totalAPagar() | currency: 'BRL' }}</p>
          </mat-card>
        </div>

        <div class="surface-card">
          <p class="section-title">Receita x Despesas</p>
          <app-time-series-bars [buckets]="bucketsGrafico()" />
        </div>

        <div class="grid-2">
          <div class="surface-card">
            <p class="section-title">Despesas por categoria</p>
            <app-horizontal-bar-list [itens]="despesasPorCategoria()" />
          </div>
          <div class="surface-card">
            <p class="section-title">Receitas por categoria</p>
            <app-horizontal-bar-list [itens]="receitasPorCategoria()" />
          </div>
        </div>

        <div class="surface-card">
          <p class="section-title">Resultado por ciclo</p>
          @if (ultimosCiclos().length === 0) {
            <app-empty-state
              icon="calendar_view_week"
              title="Nenhum ciclo cadastrado"
              description="Cadastre ciclos semanais em Configurações para comparar o desempenho entre eles."
            />
          } @else {
            <table mat-table [dataSource]="ultimosCiclos()" class="full-width">
              <ng-container matColumnDef="ciclo">
                <th mat-header-cell *matHeaderCellDef>Ciclo</th>
                <td mat-cell *matCellDef="let c">{{ c.ciclo.label }}</td>
              </ng-container>
              <ng-container matColumnDef="receita">
                <th mat-header-cell *matHeaderCellDef>Receita</th>
                <td mat-cell *matCellDef="let c" class="text-success">{{ c.receita | currency: 'BRL' }}</td>
              </ng-container>
              <ng-container matColumnDef="despesa">
                <th mat-header-cell *matHeaderCellDef>Despesa</th>
                <td mat-cell *matCellDef="let c" class="text-danger">{{ c.despesa | currency: 'BRL' }}</td>
              </ng-container>
              <ng-container matColumnDef="resultado">
                <th mat-header-cell *matHeaderCellDef>Resultado</th>
                <td mat-cell *matCellDef="let c" [class.text-success]="c.receita - c.despesa >= 0" [class.text-danger]="c.receita - c.despesa < 0">
                  {{ c.receita - c.despesa | currency: 'BRL' }}
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['ciclo', 'receita', 'despesa', 'resultado']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['ciclo', 'receita', 'despesa', 'resultado']"></tr>
            </table>
          }
        </div>

        <div class="surface-card">
          <div class="section-header-row">
            <p class="section-title">Movimentações recentes</p>
            <a mat-button routerLink="/movimentacoes">Ver todas</a>
          </div>
          @if (recentes().length === 0) {
            <app-empty-state icon="receipt_long" title="Nenhuma movimentação ainda" />
          } @else {
            <table mat-table [dataSource]="recentes()" class="full-width">
              <ng-container matColumnDef="data">
                <th mat-header-cell *matHeaderCellDef>Data</th>
                <td mat-cell *matCellDef="let m">{{ m.transaction_date | date: 'dd/MM' }}</td>
              </ng-container>
              <ng-container matColumnDef="tipo">
                <th mat-header-cell *matHeaderCellDef>Tipo</th>
                <td mat-cell *matCellDef="let m">{{ m.type === 'income' ? 'Receita' : 'Despesa' }}</td>
              </ng-container>
              <ng-container matColumnDef="descricao">
                <th mat-header-cell *matHeaderCellDef>Descrição</th>
                <td mat-cell *matCellDef="let m">{{ m.description }}</td>
              </ng-container>
              <ng-container matColumnDef="valor">
                <th mat-header-cell *matHeaderCellDef>Valor</th>
                <td mat-cell *matCellDef="let m" [class.text-success]="m.type === 'income'" [class.text-danger]="m.type === 'expense'">
                  {{ m.amount | currency: 'BRL' }}
                </td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let m"><app-status-badge [status]="m.status" /></td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['data', 'tipo', 'descricao', 'valor', 'status']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['data', 'tipo', 'descricao', 'valor', 'status']"></tr>
            </table>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .filtros-card {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 20px;
    }
    .filtro-curto {
      min-width: 160px;
    }
    .filtros-avancados {
      box-shadow: none !important;
      background: transparent;
      flex: 1 1 200px;
    }
    .filtros-avancados-conteudo {
      display: flex;
      gap: 12px;
      padding-top: 8px;
      flex-wrap: wrap;
    }
    .stat-card {
      padding: 16px 20px;
      border-radius: 16px;
      box-shadow: none;
      border: 1px solid var(--brand-border);
      background: var(--brand-surface);
    }
    .stat-card.destaque {
      background: var(--brand-primary-light);
      border-color: var(--brand-primary);
    }
    .stat-card.clicavel {
      cursor: pointer;
    }
    .stat-card.compact {
      padding: 12px 16px;
    }
    .label {
      font-size: 0.8rem;
      color: var(--brand-ink-muted);
      margin: 0 0 6px;
    }
    .valor {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      color: var(--brand-ink);
    }
    .valor-sm {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0;
      color: var(--brand-ink);
    }
    .hint {
      font-size: 0.72rem;
      color: var(--brand-ink-muted);
      margin: 4px 0 0;
    }
    .section-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .section-header-row .section-title {
      margin: 0;
    }
    .full-width {
      width: 100%;
    }
  `,
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
