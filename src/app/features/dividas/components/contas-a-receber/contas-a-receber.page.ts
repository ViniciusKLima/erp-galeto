import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardService } from '../../../dashboard/dashboard.service';
import { MovimentacoesService } from '../../../movimentacoes/movimentacoes.service';
import { LiquidacaoFormDialog } from '../../../movimentacoes/components/liquidacao-form/liquidacao-form.dialog';
import { StatusBadgeComponent } from '../../../../shared/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../../shared/empty-state/empty-state.component';
import { Tables } from '../../../../core/types/database.types';

@Component({
  selector: 'app-contas-a-receber-page',
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
  templateUrl: './contas-a-receber.page.html',
  styleUrl: './contas-a-receber.page.scss',
})
export class ContasAReceberPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly movimentacoesService = inject(MovimentacoesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly itens = signal<Tables<'v_contas_a_receber'>[]>([]);
  readonly contatos = signal<Tables<'contacts'>[]>([]);
  readonly colunas = ['vencimento', 'descricao', 'cliente', 'status', 'valor', 'acoes'];

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
