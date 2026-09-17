import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovimentacoesService } from './movimentacoes.service';
import { MovimentacaoFormDialog } from './movimentacao-form.dialog';
import { LiquidacaoFormDialog } from './liquidacao-form.dialog';
import { Tables } from '../../core/types/database.types';

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  recebido: 'Recebido',
  cancelado: 'Cancelado',
};

@Component({
  selector: 'app-movimentacoes-list-page',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="header">
      <h1>Movimentações</h1>
      <button mat-flat-button color="primary" (click)="novaMovimentacao()">
        <mat-icon>add</mat-icon>
        Nova movimentação
      </button>
    </div>

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
            @if (m.status === 'pendente' && !m.is_installment) {
              <button mat-button (click)="liquidar(m)">Liquidar</button>
            }
            @if (m.is_installment) {
              <span class="parcelas-info">Parcelado ({{ m.installments_total }}x)</span>
            }
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="colunas"></tr>
        <tr mat-row *matRowDef="let row; columns: colunas"></tr>
      </table>

      @if (movimentacoes().length === 0) {
        <p class="vazio">Nenhuma movimentação registrada ainda.</p>
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
    .full-width {
      width: 100%;
    }
    .vazio {
      color: rgba(0, 0, 0, 0.6);
      margin-top: 16px;
    }
    .parcelas-info {
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.85rem;
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
  private readonly service = inject(MovimentacoesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly movimentacoes = signal<Tables<'financial_transactions'>[]>([]);
  readonly colunas = ['data', 'descricao', 'tipo', 'valor', 'pago', 'status', 'acoes'];

  async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  async carregar(): Promise<void> {
    this.loading.set(true);
    this.movimentacoes.set(await this.service.listar());
    this.loading.set(false);
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
}
