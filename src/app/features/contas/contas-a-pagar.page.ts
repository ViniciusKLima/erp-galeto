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
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { Tables } from '../../core/types/database.types';

@Component({
  selector: 'app-contas-a-pagar-page',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    StatusBadgeComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="total-bar">
      <span class="total-label">Total pendente</span>
      <span class="total-valor text-danger">{{ total() | currency: 'BRL' }}</span>
    </div>

    @if (loading()) {
      <mat-spinner diameter="32" />
    } @else if (itens().length === 0) {
      <app-empty-state icon="task_alt" title="Nenhuma conta a pagar" description="Tudo em dia por aqui." />
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

        <ng-container matColumnDef="fornecedor">
          <th mat-header-cell *matHeaderCellDef>Fornecedor/Credor</th>
          <td mat-cell *matCellDef="let i">{{ nomeContato(i.counterparty_id) }}</td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let i"><app-status-badge [status]="i.status" /></td>
        </ng-container>

        <ng-container matColumnDef="valor">
          <th mat-header-cell *matHeaderCellDef>Valor pendente</th>
          <td mat-cell *matCellDef="let i" class="valor-cell text-danger">{{ i.valor_pendente | currency: 'BRL' }}</td>
        </ng-container>

        <ng-container matColumnDef="acoes">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let i">
            <button mat-button (click)="liquidar(i)">Registrar pagamento</button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="colunas"></tr>
        <tr mat-row *matRowDef="let row; columns: colunas"></tr>
      </table>
    }
  `,
  styles: `
    .total-bar {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 16px;
    }
    .total-label {
      color: var(--brand-ink-muted);
      font-size: 0.9rem;
    }
    .total-valor {
      font-size: 1.25rem;
      font-weight: 700;
    }
    .full-width {
      width: 100%;
    }
    .valor-cell {
      font-weight: 600;
    }
  `,
})
export class ContasAPagarPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly movimentacoesService = inject(MovimentacoesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly itens = signal<Tables<'v_contas_a_pagar'>[]>([]);
  readonly contatos = signal<Tables<'contacts'>[]>([]);
  readonly colunas = ['vencimento', 'descricao', 'fornecedor', 'status', 'valor', 'acoes'];

  readonly total = () => this.itens().reduce((sum, i) => sum + (i.valor_pendente ?? 0), 0);

  async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  async carregar(): Promise<void> {
    this.loading.set(true);
    const [itens, contatos] = await Promise.all([
      this.dashboardService.getContasAPagar(),
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

  liquidar(item: Tables<'v_contas_a_pagar'>): void {
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
        this.snackBar.open('Pagamento registrado.', 'OK', { duration: 3000 });
        this.carregar();
      }
    });
  }
}
