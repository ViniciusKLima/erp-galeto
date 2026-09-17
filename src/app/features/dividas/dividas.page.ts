import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DividasService } from './dividas.service';
import { DividaParcelasDialog } from './divida-parcelas.dialog';
import { NovaDividaDialog } from './nova-divida.dialog';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { Tables } from '../../core/types/database.types';

@Component({
  selector: 'app-dividas-page',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    StatusBadgeComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="tab-actions">
      <button mat-flat-button color="primary" (click)="novaDivida()">
        <mat-icon>add</mat-icon>
        Nova dívida
      </button>
    </div>

    @if (dividas().length === 0) {
      <app-empty-state
        icon="account_balance_wallet"
        title="Nenhuma dívida registrada"
        description="Registre dívidas com fornecedores e outros credores para acompanhar o que ainda precisa ser pago."
      >
        <button mat-flat-button color="primary" action (click)="novaDivida()">+ Nova dívida</button>
      </app-empty-state>
    } @else {
      <table mat-table [dataSource]="dividas()" class="full-width">
        <ng-container matColumnDef="descricao">
          <th mat-header-cell *matHeaderCellDef>Descrição</th>
          <td mat-cell *matCellDef="let d">{{ d.description }}</td>
        </ng-container>

        <ng-container matColumnDef="credor">
          <th mat-header-cell *matHeaderCellDef>Credor</th>
          <td mat-cell *matCellDef="let d">{{ nomeCredor(d.creditor_id) }}</td>
        </ng-container>

        <ng-container matColumnDef="valor">
          <th mat-header-cell *matHeaderCellDef>Valor total</th>
          <td mat-cell *matCellDef="let d">{{ d.total_amount | currency: 'BRL' }}</td>
        </ng-container>

        <ng-container matColumnDef="inicio">
          <th mat-header-cell *matHeaderCellDef>Início</th>
          <td mat-cell *matCellDef="let d">{{ d.start_date | date: 'dd/MM/yyyy' }}</td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let d"><app-status-badge [status]="statusChave(d.status)" /></td>
        </ng-container>

        <ng-container matColumnDef="acoes">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let d">
            <button mat-button (click)="verParcelas(d)">Ver parcelas</button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="colunas"></tr>
        <tr mat-row *matRowDef="let row; columns: colunas"></tr>
      </table>
    }
  `,
  styles: `
    .tab-actions {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;
    }
    .full-width {
      width: 100%;
    }
  `,
})
export class DividasPage implements OnInit {
  private readonly service = inject(DividasService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly dividas = signal<Tables<'debts'>[]>([]);
  readonly credores = signal<Tables<'contacts'>[]>([]);
  readonly colunas = ['descricao', 'credor', 'valor', 'inicio', 'status', 'acoes'];

  async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  private async carregar(): Promise<void> {
    const [dividas, credores] = await Promise.all([this.service.listar(), this.service.listarCredores()]);
    this.dividas.set(dividas);
    this.credores.set(credores);
  }

  statusChave(status: string): string {
    // "aberta" reaproveita o visual de "pendente" do badge compartilhado
    return status === 'aberta' ? 'pendente' : status;
  }

  nomeCredor(id: string): string {
    return this.credores().find((c) => c.id === id)?.name ?? '—';
  }

  novaDivida(): void {
    const ref = this.dialog.open(NovaDividaDialog, { width: '560px' });
    ref.afterClosed().subscribe(async (saved) => {
      if (saved) {
        this.snackBar.open('Dívida registrada.', 'OK', { duration: 2500 });
        await this.carregar();
      }
    });
  }

  verParcelas(divida: Tables<'debts'>): void {
    const ref = this.dialog.open(DividaParcelasDialog, {
      width: '560px',
      data: { debtId: divida.id, descricao: divida.description },
    });
    ref.afterClosed().subscribe(async () => {
      await this.carregar();
    });
  }
}
