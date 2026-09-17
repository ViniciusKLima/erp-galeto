import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from './dashboard.service';
import { Tables } from '../../core/types/database.types';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CurrencyPipe, MatCardModule, MatProgressSpinnerModule],
  template: `
    <h1>Dashboard</h1>
    <p class="periodo">Período: este mês ({{ inicioMes }} a {{ hoje }})</p>

    @if (loading()) {
      <mat-spinner diameter="32" />
    } @else {
      <div class="cards-grid">
        <mat-card>
          <mat-card-content>
            <p class="label">Receita (mês)</p>
            <p class="valor positivo">{{ receita() | currency: 'BRL' }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <p class="label">Despesas (mês)</p>
            <p class="valor negativo">{{ despesa() | currency: 'BRL' }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <p class="label">Resultado (mês)</p>
            <p class="valor" [class.positivo]="resultado() >= 0" [class.negativo]="resultado() < 0">
              {{ resultado() | currency: 'BRL' }}
            </p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <p class="label">A receber</p>
            <p class="valor">{{ totalAReceber() | currency: 'BRL' }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <p class="label">A pagar</p>
            <p class="valor">{{ totalAPagar() | currency: 'BRL' }}</p>
          </mat-card-content>
        </mat-card>
      </div>

      <h2>Saldo por conta</h2>
      <div class="cards-grid">
        @for (conta of saldoContas(); track conta.financial_account_id) {
          <mat-card>
            <mat-card-content>
              <p class="label">{{ conta.name }}</p>
              <p class="valor">{{ conta.saldo_atual | currency: 'BRL' }}</p>
            </mat-card-content>
          </mat-card>
        }
      </div>
    }
  `,
  styles: `
    .periodo {
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 16px;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .label {
      font-size: 0.85rem;
      color: rgba(0, 0, 0, 0.6);
      margin: 0 0 4px;
    }
    .valor {
      font-size: 1.4rem;
      font-weight: 600;
      margin: 0;
    }
    .positivo {
      color: #2e7d32;
    }
    .negativo {
      color: #c62828;
    }
  `,
})
export class DashboardPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly loading = signal(true);
  readonly saldoContas = signal<Tables<'v_saldo_contas'>[]>([]);
  readonly resultadoPeriodo = signal<Tables<'v_resultado_periodo'>[]>([]);
  readonly contasAPagar = signal<Tables<'v_contas_a_pagar'>[]>([]);
  readonly contasAReceber = signal<Tables<'v_contas_a_receber'>[]>([]);

  readonly receita = computed(() =>
    this.resultadoPeriodo()
      .filter((r) => r.type === 'income')
      .reduce((sum, r) => sum + (r.amount ?? 0), 0),
  );

  readonly despesa = computed(() =>
    this.resultadoPeriodo()
      .filter((r) => r.type === 'expense')
      .reduce((sum, r) => sum + (r.amount ?? 0), 0),
  );

  readonly resultado = computed(() => this.receita() - this.despesa());

  readonly totalAPagar = computed(() =>
    this.contasAPagar().reduce((sum, r) => sum + (r.valor_pendente ?? 0), 0),
  );

  readonly totalAReceber = computed(() =>
    this.contasAReceber().reduce((sum, r) => sum + (r.valor_pendente ?? 0), 0),
  );

  readonly hoje = new Date().toLocaleDateString('pt-BR');
  readonly inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('pt-BR');

  async ngOnInit(): Promise<void> {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const end = now.toISOString().slice(0, 10);

    const [saldo, resultado, aPagar, aReceber] = await Promise.all([
      this.dashboardService.getSaldoContas(),
      this.dashboardService.getResultadoPeriodo(start, end),
      this.dashboardService.getContasAPagar(),
      this.dashboardService.getContasAReceber(),
    ]);

    this.saldoContas.set(saldo);
    this.resultadoPeriodo.set(resultado);
    this.contasAPagar.set(aPagar);
    this.contasAReceber.set(aReceber);
    this.loading.set(false);
  }
}
