import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { DividasService } from './dividas.service';
import { Tables } from '../../core/types/database.types';

export type DividaParcelasDialogData = {
  debtId: string;
  descricao: string;
};

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  cancelado: 'Cancelado',
};

@Component({
  selector: 'app-divida-parcelas-dialog',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, MatDialogModule, MatTableModule, MatButtonModule, MatChipsModule],
  template: `
    <h2 mat-dialog-title>Parcelas — {{ data.descricao }}</h2>
    <mat-dialog-content>
      <table mat-table [dataSource]="parcelas()" class="full-width">
        <ng-container matColumnDef="numero">
          <th mat-header-cell *matHeaderCellDef>#</th>
          <td mat-cell *matCellDef="let p">{{ p.number }}</td>
        </ng-container>

        <ng-container matColumnDef="vencimento">
          <th mat-header-cell *matHeaderCellDef>Vencimento</th>
          <td mat-cell *matCellDef="let p">{{ p.due_date | date: 'dd/MM/yyyy' }}</td>
        </ng-container>

        <ng-container matColumnDef="valor">
          <th mat-header-cell *matHeaderCellDef>Valor</th>
          <td mat-cell *matCellDef="let p">{{ p.amount | currency: 'BRL' }}</td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let p">
            <mat-chip [class]="'status-' + p.status">{{ statusLabel(p.status) }}</mat-chip>
          </td>
        </ng-container>

        <ng-container matColumnDef="acoes">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let p">
            @if (p.status === 'pendente') {
              <button mat-button (click)="pagar(p)">Marcar como pago hoje</button>
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
    .status-pago {
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
export class DividaParcelasDialog implements OnInit {
  private readonly service = inject(DividasService);
  readonly data = inject<DividaParcelasDialogData>(MAT_DIALOG_DATA);

  readonly parcelas = signal<Tables<'debt_installments'>[]>([]);
  readonly colunas = ['numero', 'vencimento', 'valor', 'status', 'acoes'];

  async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  async carregar(): Promise<void> {
    this.parcelas.set(await this.service.listarParcelas(this.data.debtId));
  }

  statusLabel(status: string): string {
    return STATUS_LABEL[status] ?? status;
  }

  async pagar(parcela: Tables<'debt_installments'>): Promise<void> {
    await this.service.registrarPagamento(parcela.id, new Date().toISOString().slice(0, 10));
    await this.carregar();
  }
}
