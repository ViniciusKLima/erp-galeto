import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DividasService } from '../../dividas.service';
import { DividaParcelasDialog } from '../divida-parcelas/divida-parcelas.dialog';
import { NovaDividaDialog } from '../nova-divida/nova-divida.dialog';
import { StatusBadgeComponent } from '../../../../shared/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../../shared/empty-state/empty-state.component';
import { Tables } from '../../../../core/types/database.types';

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
  templateUrl: './dividas.page.html',
  styleUrl: './dividas.page.scss',
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
