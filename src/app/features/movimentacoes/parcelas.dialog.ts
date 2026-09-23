import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MovimentacoesService } from './movimentacoes.service';
import { LiquidacaoFormDialog } from './liquidacao-form.dialog';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { Tables } from '../../core/types/database.types';

export type ParcelasDialogData = {
  transactionId: string;
  descricao: string;
};

@Component({
  selector: 'app-parcelas-dialog',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, MatDialogModule, MatTableModule, MatButtonModule, StatusBadgeComponent],
  template: `
    <h2 mat-dialog-title>Parcelas — {{ data.descricao }}</h2>
    <mat-dialog-content>
      <table mat-table [dataSource]="parcelas()" class="full-width">
        <ng-container matColumnDef="numero">
          <th mat-header-cell *matHeaderCellDef>#</th>
          <td mat-cell *matCellDef="let p">{{ p.installment_number }}/{{ p.total_installments }}</td>
        </ng-container>

        <ng-container matColumnDef="vencimento">
          <th mat-header-cell *matHeaderCellDef>Vencimento</th>
          <td mat-cell *matCellDef="let p">{{ p.due_date | date: 'dd/MM/yyyy' }}</td>
        </ng-container>

        <ng-container matColumnDef="valor">
          <th mat-header-cell *matHeaderCellDef>Valor</th>
          <td mat-cell *matCellDef="let p">{{ p.amount | currency: 'BRL' }}</td>
        </ng-container>

        <ng-container matColumnDef="pago">
          <th mat-header-cell *matHeaderCellDef>Pago/Recebido</th>
          <td mat-cell *matCellDef="let p">{{ p.paid_amount | currency: 'BRL' }}</td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let p">
            <app-status-badge [status]="p.status" />
          </td>
        </ng-container>

        <ng-container matColumnDef="acoes">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let p">
            @if (p.status === 'pendente') {
              <button mat-button (click)="liquidar(p)">Liquidar</button>
            }
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="colunas"></tr>
        <tr mat-row *matRowDef="let row; columns: colunas"></tr>
      </table>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `,
  styles: `
    .full-width {
      width: 100%;
    }
  `,
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
