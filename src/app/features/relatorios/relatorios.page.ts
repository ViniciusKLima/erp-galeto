import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RelatoriosService } from './relatorios.service';
import { MovimentacoesService } from '../movimentacoes/movimentacoes.service';
import { Tables } from '../../core/types/database.types';

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

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-relatorios-page',
  standalone: true,
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h1>Relatórios</h1>

    <form [formGroup]="periodoForm" class="periodo-form" (ngSubmit)="carregar()">
      <mat-form-field appearance="outline">
        <mat-label>De</mat-label>
        <input matInput [matDatepicker]="pickerDe" formControlName="dataInicio" />
        <mat-datepicker-toggle matSuffix [for]="pickerDe" />
        <mat-datepicker #pickerDe />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Até</mat-label>
        <input matInput [matDatepicker]="pickerAte" formControlName="dataFim" />
        <mat-datepicker-toggle matSuffix [for]="pickerAte" />
        <mat-datepicker #pickerAte />
      </mat-form-field>

      <button mat-flat-button color="primary" type="submit">Atualizar</button>
    </form>

    @if (loading()) {
      <mat-spinner diameter="32" />
    } @else {
      <div class="resumo">
        <span>Receita: <strong>{{ totalReceita() | currency: 'BRL' }}</strong></span>
        <span>Despesa: <strong>{{ totalDespesa() | currency: 'BRL' }}</strong></span>
        <span>Resultado: <strong>{{ totalResultado() | currency: 'BRL' }}</strong></span>
      </div>

      <h2>Por categoria</h2>
      <table mat-table [dataSource]="porCategoria()" class="full-width">
        <ng-container matColumnDef="nome">
          <th mat-header-cell *matHeaderCellDef>Categoria</th>
          <td mat-cell *matCellDef="let l">{{ l.nome }}</td>
        </ng-container>
        <ng-container matColumnDef="receita">
          <th mat-header-cell *matHeaderCellDef>Receita</th>
          <td mat-cell *matCellDef="let l">{{ l.receita | currency: 'BRL' }}</td>
        </ng-container>
        <ng-container matColumnDef="despesa">
          <th mat-header-cell *matHeaderCellDef>Despesa</th>
          <td mat-cell *matCellDef="let l">{{ l.despesa | currency: 'BRL' }}</td>
        </ng-container>
        <ng-container matColumnDef="resultado">
          <th mat-header-cell *matHeaderCellDef>Resultado</th>
          <td mat-cell *matCellDef="let l">{{ l.resultado | currency: 'BRL' }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="colunas"></tr>
        <tr mat-row *matRowDef="let row; columns: colunas"></tr>
      </table>

      <h2>Por forma de pagamento</h2>
      <table mat-table [dataSource]="porFormaPagamento()" class="full-width">
        <ng-container matColumnDef="nome">
          <th mat-header-cell *matHeaderCellDef>Forma de pagamento</th>
          <td mat-cell *matCellDef="let l">{{ l.nome }}</td>
        </ng-container>
        <ng-container matColumnDef="receita">
          <th mat-header-cell *matHeaderCellDef>Receita</th>
          <td mat-cell *matCellDef="let l">{{ l.receita | currency: 'BRL' }}</td>
        </ng-container>
        <ng-container matColumnDef="despesa">
          <th mat-header-cell *matHeaderCellDef>Despesa</th>
          <td mat-cell *matCellDef="let l">{{ l.despesa | currency: 'BRL' }}</td>
        </ng-container>
        <ng-container matColumnDef="resultado">
          <th mat-header-cell *matHeaderCellDef>Resultado</th>
          <td mat-cell *matCellDef="let l">{{ l.resultado | currency: 'BRL' }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="colunas"></tr>
        <tr mat-row *matRowDef="let row; columns: colunas"></tr>
      </table>

      <h2>Por ciclo</h2>
      @if (porCiclo().length > 0) {
        <table mat-table [dataSource]="porCiclo()" class="full-width">
          <ng-container matColumnDef="nome">
            <th mat-header-cell *matHeaderCellDef>Ciclo</th>
            <td mat-cell *matCellDef="let l">{{ l.nome }}</td>
          </ng-container>
          <ng-container matColumnDef="receita">
            <th mat-header-cell *matHeaderCellDef>Receita</th>
            <td mat-cell *matCellDef="let l">{{ l.receita | currency: 'BRL' }}</td>
          </ng-container>
          <ng-container matColumnDef="despesa">
            <th mat-header-cell *matHeaderCellDef>Despesa</th>
            <td mat-cell *matCellDef="let l">{{ l.despesa | currency: 'BRL' }}</td>
          </ng-container>
          <ng-container matColumnDef="resultado">
            <th mat-header-cell *matHeaderCellDef>Resultado</th>
            <td mat-cell *matCellDef="let l">{{ l.resultado | currency: 'BRL' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="colunas"></tr>
          <tr mat-row *matRowDef="let row; columns: colunas"></tr>
        </table>
      } @else {
        <p class="vazio">Nenhuma movimentação do período está associada a um ciclo.</p>
      }
    }
  `,
  styles: `
    .periodo-form {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .resumo {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
      font-size: 1rem;
    }
    .full-width {
      width: 100%;
      margin-bottom: 24px;
    }
    .vazio {
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 24px;
    }
  `,
})
export class RelatoriosPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly relatoriosService = inject(RelatoriosService);
  private readonly movimentacoesService = inject(MovimentacoesService);

  readonly loading = signal(true);
  readonly movimentacoes = signal<Tables<'financial_transactions'>[]>([]);
  readonly categorias = signal<Tables<'transaction_categories'>[]>([]);
  readonly formasPagamento = signal<Tables<'payment_methods'>[]>([]);
  readonly ciclos = signal<Tables<'cycles'>[]>([]);
  readonly colunas = ['nome', 'receita', 'despesa', 'resultado'];

  readonly periodoForm = this.fb.nonNullable.group({
    dataInicio: [new Date(new Date().getFullYear(), new Date().getMonth(), 1)],
    dataFim: [new Date()],
  });

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
    await this.carregar();
  }

  async carregar(): Promise<void> {
    this.loading.set(true);
    const { dataInicio, dataFim } = this.periodoForm.getRawValue();
    this.movimentacoes.set(await this.relatoriosService.getMovimentacoesPeriodo(toIsoDate(dataInicio), toIsoDate(dataFim)));
    this.loading.set(false);
  }
}
