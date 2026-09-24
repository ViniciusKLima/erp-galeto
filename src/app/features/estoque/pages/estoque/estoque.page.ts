import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EstoqueService } from '../../estoque.service';
import { NovoItemDialog } from '../../components/novo-item/novo-item.dialog';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/empty-state/empty-state.component';
import { Tables } from '../../../../core/types/database.types';

@Component({
  selector: 'app-estoque-page',
  standalone: true,
  imports: [
    CurrencyPipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatDialogModule,
    PageHeaderComponent,
    EmptyStateComponent,
  ],
  templateUrl: './estoque.page.html',
  styleUrl: './estoque.page.scss',
})
export class EstoquePage implements OnInit {
  private readonly service = inject(EstoqueService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly itens = signal<Tables<'inventory_items'>[]>([]);
  readonly fornecedores = signal<Tables<'contacts'>[]>([]);
  readonly colunas = ['name', 'unit', 'compra', 'consumo', 'venda', 'fornecedor', 'active'];

  async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  private async carregar(): Promise<void> {
    const [itens, fornecedores] = await Promise.all([this.service.listar(), this.service.listarFornecedores()]);
    this.itens.set(itens);
    this.fornecedores.set(fornecedores);
  }

  nomeFornecedor(id: string | null): string {
    if (!id) return '—';
    return this.fornecedores().find((f) => f.id === id)?.name ?? '—';
  }

  novoItem(): void {
    const ref = this.dialog.open(NovoItemDialog, { width: '640px', maxWidth: '95vw' });
    ref.afterClosed().subscribe(async (saved) => {
      if (saved) {
        this.snackBar.open('✓ Item de estoque adicionado.', 'OK', { duration: 2500 });
        await this.carregar();
      }
    });
  }

  async alternar(item: Tables<'inventory_items'>): Promise<void> {
    await this.service.atualizar(item.id, { active: !item.active });
    await this.carregar();
  }
}
