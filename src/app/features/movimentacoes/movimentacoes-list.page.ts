import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MovimentacoesService } from './movimentacoes.service';
import { MovimentacaoFormDialog } from './movimentacao-form.dialog';
import { LiquidacaoFormDialog } from './liquidacao-form.dialog';
import { CancelarMovimentacaoDialog } from './cancelar-movimentacao.dialog';
import { ParcelasDialog } from './parcelas.dialog';
import { Tables } from '../../core/types/database.types';

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  recebido: 'Recebido',
  cancelado: 'Cancelado',
};

function toIsoDate(value: Date | null): string | undefined {
  return value ? value.toISOString().slice(0, 10) : undefined;
}

@Component({
  selector: 'app-movimentacoes-list-page',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <div class="header">
      <h1>Movimentações</h1>
      <button mat-flat-button color="primary" (click)="novaMovimentacao()">
        <mat-icon>add</mat-icon>
        Nova movimentação
      </button>
    </div>

    <form [formGroup]="filtroForm" class="filtros" (ngSubmit)="aplicarFiltro()">
      <mat-form-field appearance="outline">
        <mat-label>Tipo</mat-label>
        <mat-select formControlName="tipo">
          <mat-option [value]="null">Todos</mat-option>
          <mat-option value="income">Receita</mat-option>
          <mat-option value="expense">Despesa</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Status</mat-label>
        <mat-select formControlName="status">
          <mat-option [value]="null">Todos</mat-option>
          <mat-option value="pendente">Pendente</mat-option>
          <mat-option value="pago">Pago</mat-option>
          <mat-option value="recebido">Recebido</mat-option>
          <mat-option value="cancelado">Cancelado</mat-option>
        </mat-select>
      </mat-form-field>

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

      <button mat-stroked-button type="submit">Filtrar</button>
      <button mat-button type="button" (click)="limparFiltro()">Limpar</button>
    </form>

    @if (loading()) {
      <mat-spinner diameter="32" />
    } @else {
      <table mat-table [dataSource]="movimentacoes()" class="full-width">
        <ng-container matColumnDef="data">
          <th mat-header-cell *matHeaderCellDef>Data</th>
          <td mat-cell *matCellDef="let m">{{ m.transaction_date | date: 'dd/MM/yyyy' }}</td>
        </ng-container>

        <ng-container matColumnDef="descricao">
          <th mat-header-cell *matHeaderCellDef>Descrição</th>
          <td mat-cell *matCellDef="let m">{{ m.description }}</td>
        </ng-container>

        <ng-container matColumnDef="tipo">
          <th mat-header-cell *matHeaderCellDef>Tipo</th>
          <td mat-cell *matCellDef="let m">{{ m.type === 'income' ? 'Receita' : 'Despesa' }}</td>
        </ng-container>

        <ng-container matColumnDef="valor">
          <th mat-header-cell *matHeaderCellDef>Valor</th>
          <td mat-cell *matCellDef="let m">{{ m.amount | currency: 'BRL' }}</td>
        </ng-container>

        <ng-container matColumnDef="pago">
          <th mat-header-cell *matHeaderCellDef>Pago/Recebido</th>
          <td mat-cell *matCellDef="let m">{{ m.paid_amount | currency: 'BRL' }}</td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let m">
            <mat-chip [class]="'status-' + m.status">{{ statusLabel(m.status) }}</mat-chip>
          </td>
        </ng-container>

        <ng-container matColumnDef="acoes">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let m">
            @if (m.is_installment) {
              <button mat-button (click)="verParcelas(m)">Ver parcelas ({{ m.installments_total }}x)</button>
            } @else if (m.status === 'pendente') {
              <button mat-button (click)="liquidar(m)">Liquidar</button>
              <button mat-icon-button (click)="editar(m)" aria-label="Editar" title="Editar">
                <mat-icon>edit</mat-icon>
              </button>
            }
            @if (m.status === 'pendente') {
              <button mat-icon-button (click)="cancelar(m)" aria-label="Cancelar" title="Cancelar">
                <mat-icon>close</mat-icon>
              </button>
            }
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="colunas"></tr>
        <tr mat-row *matRowDef="let row; columns: colunas"></tr>
      </table>

      @if (movimentacoes().length === 0) {
        <p class="vazio">Nenhuma movimentação encontrada para esse filtro.</p>
      }
    }
  `,
  styles: `
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .filtros {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .full-width {
      width: 100%;
    }
    .vazio {
      color: rgba(0, 0, 0, 0.6);
      margin-top: 16px;
    }
    .status-pago,
    .status-recebido {
      background: #c8e6c9;
    }
    .status-pendente {
      background: #fff3cd;
    }
    .status-cancelado {
      background: #eeeeee;
      text-decoration: line-through;
    }
  `,
})
export class MovimentacoesListPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MovimentacoesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly movimentacoes = signal<Tables<'financial_transactions'>[]>([]);
  readonly colunas = ['data', 'descricao', 'tipo', 'valor', 'pago', 'status', 'acoes'];

  readonly filtroForm = this.fb.group({
    tipo: this.fb.control<'income' | 'expense' | null>(null),
    status: this.fb.control<string | null>(null),
    dataInicio: this.fb.control<Date | null>(null),
    dataFim: this.fb.control<Date | null>(null),
  });

  async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  async carregar(): Promise<void> {
    this.loading.set(true);
    const valores = this.filtroForm.getRawValue();
    this.movimentacoes.set(
      await this.service.listar({
        tipo: valores.tipo ?? undefined,
        status: valores.status ?? undefined,
        dataInicio: toIsoDate(valores.dataInicio),
        dataFim: toIsoDate(valores.dataFim),
      }),
    );
    this.loading.set(false);
  }

  async aplicarFiltro(): Promise<void> {
    await this.carregar();
  }

  async limparFiltro(): Promise<void> {
    this.filtroForm.reset({ tipo: null, status: null, dataInicio: null, dataFim: null });
    await this.carregar();
  }

  statusLabel(status: string): string {
    return STATUS_LABEL[status] ?? status;
  }

  novaMovimentacao(): void {
    const ref = this.dialog.open(MovimentacaoFormDialog, { width: '480px' });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackBar.open('Movimentação registrada.', 'OK', { duration: 3000 });
        this.carregar();
      }
    });
  }

  editar(movimentacao: Tables<'financial_transactions'>): void {
    const ref = this.dialog.open(MovimentacaoFormDialog, {
      width: '480px',
      data: { existing: movimentacao },
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackBar.open('Movimentação atualizada.', 'OK', { duration: 3000 });
        this.carregar();
      }
    });
  }

  liquidar(movimentacao: Tables<'financial_transactions'>): void {
    const ref = this.dialog.open(LiquidacaoFormDialog, {
      width: '420px',
      data: {
        transactionId: movimentacao.id,
        installmentId: null,
        valorPendente: movimentacao.amount - movimentacao.paid_amount,
      },
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackBar.open('Liquidação registrada.', 'OK', { duration: 3000 });
        this.carregar();
      }
    });
  }

  cancelar(movimentacao: Tables<'financial_transactions'>): void {
    const ref = this.dialog.open(CancelarMovimentacaoDialog, {
      width: '420px',
      data: { transactionId: movimentacao.id, descricao: movimentacao.description },
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackBar.open('Movimentação cancelada.', 'OK', { duration: 3000 });
        this.carregar();
      }
    });
  }

  verParcelas(movimentacao: Tables<'financial_transactions'>): void {
    const ref = this.dialog.open(ParcelasDialog, {
      width: '640px',
      data: { transactionId: movimentacao.id, descricao: movimentacao.description },
    });
    ref.afterClosed().subscribe(() => this.carregar());
  }
}
