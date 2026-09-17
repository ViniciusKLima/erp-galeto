import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardService } from '../dashboard/dashboard.service';
import { MovimentacoesService } from '../movimentacoes/movimentacoes.service';
import { LiquidacaoFormDialog } from '../movimentacoes/liquidacao-form.dialog';
import { Tables } from '../../core/types/database.types';

@Component({
  selector: 'app-contas-a-receber-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, MatTableModule, MatButtonModule, MatDialogModule, MatProgressSpinnerModule],
  template: `
    <h1>Contas a receber</h1>
    <p class="total">Total pendente: {{ total() | currency: 'BRL' }}</p>

    @if (loading()) {
      <mat-spinner diameter="32" />
    } @else {
      <table mat-table [dataSource]="itens()" class="full-width">
        <ng-container matColumnDef="vencimento">
          <th mat-header-cell *matHeaderCellDef>Vencimento</th>
          <td mat-cell *matCellDef="let i">{{ i.vencimento | date: 'dd/MM/yyyy' }}</td>
        </ng-container>

        <ng-container matColumnDef="descricao">
          <th mat-header-cell *matHeaderCellDef>Descrição</th>
          <td mat-cell *matCellDef="let i">{{ i.description }}</td>
        </ng-container>

        <ng-container matColumnDef="cliente">
          <th mat-header-cell *matHeaderCellDef>Cliente</th>
          <td mat-cell *matCellDef="let i">{{ nomeContato(i.counterparty_id) }}</td>
        </ng-container>

        <ng-container matColumnDef="valor">
          <th mat-header-cell *matHeaderCellDef>Valor pendente</th>
          <td mat-cell *matCellDef="let i">{{ i.valor_pendente | currency: 'BRL' }}</td>
        </ng-container>

        <ng-container matColumnDef="acoes">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let i">
            <button mat-button (click)="liquidar(i)">Registrar recebimento</button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="colunas"></tr>
        <tr mat-row *matRowDef="let row; columns: colunas"></tr>
      </table>

      @if (itens().length === 0) {
        <p class="vazio">Nenhuma conta a receber no momento.</p>
      }
    }
  `,
  styles: `
    .total {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .full-width {
      width: 100%;
    }
    .vazio {
      color: rgba(0, 0, 0, 0.6);
      margin-top: 16px;
    }
  `,
})
export class ContasAReceberPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly movimentacoesService = inject(MovimentacoesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly itens = signal<Tables<'v_contas_a_receber'>[]>([]);
  readonly contatos = signal<Tables<'contacts'>[]>([]);
  readonly colunas = ['vencimento', 'descricao', 'cliente', 'valor', 'acoes'];

  readonly total = () => this.itens().reduce((sum, i) => sum + (i.valor_pendente ?? 0), 0);

  async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  async carregar(): Promise<void> {
    this.loading.set(true);
    const [itens, contatos] = await Promise.all([
      this.dashboardService.getContasAReceber(),
      this.movimentacoesService.listarContatos(),
    ]);
    this.itens.set(itens);
    this.contatos.set(contatos);
    this.loading.set(false);
  }

  nomeContato(id: string | null): string {
    if (!id) return '—';
    return this.contatos().find((c) => c.id === id)?.name ?? '—';
  }

  liquidar(item: Tables<'v_contas_a_receber'>): void {
    const ref = this.dialog.open(LiquidacaoFormDialog, {
      width: '420px',
      data: {
        transactionId: item.transaction_id,
        installmentId: item.installment_id,
        valorPendente: item.valor_pendente,
      },
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackBar.open('Recebimento registrado.', 'OK', { duration: 3000 });
        this.carregar();
      }
    });
  }
}
