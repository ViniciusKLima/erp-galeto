import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MovimentacoesService } from '../../movimentacoes.service';
import { LiquidacaoFormDialog } from '../liquidacao-form/liquidacao-form.dialog';
import { StatusBadgeComponent } from '../../../../shared/status-badge/status-badge.component';
import { Tables } from '../../../../core/types/database.types';

export type ParcelasDialogData = {
  transactionId: string;
  descricao: string;
};

@Component({
  selector: 'app-parcelas-dialog',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, MatDialogModule, MatTableModule, MatButtonModule, StatusBadgeComponent],
  templateUrl: './parcelas.dialog.html',
  styleUrl: './parcelas.dialog.scss',
})
export class ParcelasDialog implements OnInit {
  private readonly service = inject(MovimentacoesService);
  private readonly dialog = inject(MatDialog);
  readonly data = inject<ParcelasDialogData>(MAT_DIALOG_DATA);

  readonly parcelas = signal<Tables<'installments'>[]>([]);
  readonly colunas = ['numero', 'vencimento', 'valor', 'pago', 'status', 'acoes'];

  async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  async carregar(): Promise<void> {
    this.parcelas.set(await this.service.listarParcelas(this.data.transactionId));
  }

  liquidar(parcela: Tables<'installments'>): void {
    const ref = this.dialog.open(LiquidacaoFormDialog, {
      width: '420px',
      data: {
        transactionId: this.data.transactionId,
        installmentId: parcela.id,
        valorPendente: parcela.amount - parcela.paid_amount,
      },
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.carregar();
      }
    });
  }
}
