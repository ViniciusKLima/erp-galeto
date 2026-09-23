import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MovimentacoesService } from '../../movimentacoes.service';
import { StatusBadgeComponent } from '../../../../shared/status-badge/status-badge.component';
import { Tables } from '../../../../core/types/database.types';

export type MovimentacaoDetailDialogData = {
  movimentacao: Tables<'financial_transactions'>;
};

@Component({
  selector: 'app-movimentacao-detail-dialog',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, MatDialogModule, MatButtonModule, MatIconModule, StatusBadgeComponent],
  templateUrl: './movimentacao-detail.dialog.html',
  styleUrl: './movimentacao-detail.dialog.scss',
})
export class MovimentacaoDetailDialog implements OnInit {
  private readonly service = inject(MovimentacoesService);
  private readonly dialogRef = inject(MatDialogRef<MovimentacaoDetailDialog>);
  private readonly data = inject<MovimentacaoDetailDialogData>(MAT_DIALOG_DATA);

  readonly m = this.data.movimentacao;

  private readonly categorias = signal<Tables<'transaction_categories'>[]>([]);
  private readonly subcategorias = signal<Tables<'transaction_subcategories'>[]>([]);
  private readonly formasPagamento = signal<Tables<'payment_methods'>[]>([]);
  private readonly contatos = signal<Tables<'contacts'>[]>([]);
  private readonly ciclos = signal<Tables<'cycles'>[]>([]);

  async ngOnInit(): Promise<void> {
    const [categorias, formasPagamento, contatos, ciclos] = await Promise.all([
      this.service.listarCategorias(),
      this.service.listarFormasPagamento(),
      this.service.listarContatos(),
      this.service.listarCiclos(),
    ]);
    this.categorias.set(categorias);
    this.formasPagamento.set(formasPagamento);
    this.contatos.set(contatos);
    this.ciclos.set(ciclos);
    if (this.m.subcategory_id) {
      this.subcategorias.set(await this.service.listarSubcategorias(this.m.category_id));
    }
  }

  nomeCategoria(): string {
    return this.categorias().find((c) => c.id === this.m.category_id)?.name ?? '—';
  }

  nomeSubcategoria(): string {
    return this.subcategorias().find((s) => s.id === this.m.subcategory_id)?.name ?? '—';
  }

  nomeFormaPagamento(): string {
    return this.formasPagamento().find((f) => f.id === this.m.payment_method_id)?.name ?? '—';
  }

  nomeContato(): string {
    return this.contatos().find((c) => c.id === this.m.counterparty_id)?.name ?? '—';
  }

  nomeCiclo(): string {
    return this.ciclos().find((c) => c.id === this.m.cycle_id)?.label ?? '—';
  }

  editar(): void {
    this.dialogRef.close({ action: 'editar' });
  }
}
