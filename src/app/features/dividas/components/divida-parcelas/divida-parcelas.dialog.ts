import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { DividasService } from '../../dividas.service';
import { StatusBadgeComponent } from '../../../../shared/status-badge/status-badge.component';
import { Tables } from '../../../../core/types/database.types';

export type DividaParcelasDialogData = {
  debtId: string;
  descricao: string;
};

@Component({
  selector: 'app-divida-parcelas-dialog',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, MatDialogModule, MatTableModule, MatButtonModule, StatusBadgeComponent],
  templateUrl: './divida-parcelas.dialog.html',
  styleUrl: './divida-parcelas.dialog.scss',
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

  async pagar(parcela: Tables<'debt_installments'>): Promise<void> {
    await this.service.registrarPagamento(parcela.id, new Date().toISOString().slice(0, 10));
    await this.carregar();
  }
}
