import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EstoqueService } from './estoque.service';
import { NovoItemDialog } from './novo-item.dialog';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { Tables } from '../../core/types/database.types';

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
  template: `
    <div class="page-shell">
      <app-page-header
        title="Estoque e Insumos"
        subtitle="Primeira versão informacional — entender o comportamento real do negócio."
      >
        <button actions mat-flat-button color="primary" (click)="novoItem()">
          <mat-icon>add</mat-icon>
          Novo item
        </button>
      </app-page-header>

      @if (itens().length === 0) {
        <app-empty-state
          icon="inventory_2"
          title="Nenhum item de estoque cadastrado"
          description="Registre itens para acompanhar compra, consumo e rendimento."
        >
          <button action mat-flat-button color="primary" (click)="novoItem()">+ Novo item</button>
        </app-empty-state>
      } @else {
        <div class="surface-card tabela-card">
          <table mat-table [dataSource]="itens()" class="full-width">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Item</th>
              <td mat-cell *matCellDef="let i">{{ i.name }}</td>
            </ng-container>

            <ng-container matColumnDef="unit">
              <th mat-header-cell *matHeaderCellDef>Unidade</th>
              <td mat-cell *matCellDef="let i">{{ i.unit }}</td>
            </ng-container>

            <ng-container matColumnDef="compra">
              <th mat-header-cell *matHeaderCellDef>Compra</th>
              <td mat-cell *matCellDef="let i">
                {{ i.purchase_quantity ?? '—' }} {{ i.unit }} / {{ i.purchase_cost | currency: 'BRL' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="consumo">
              <th mat-header-cell *matHeaderCellDef>Consumo</th>
              <td mat-cell *matCellDef="let i">{{ i.consumption_quantity ?? '—' }} {{ i.consumption_unit ?? '' }}</td>
            </ng-container>

            <ng-container matColumnDef="venda">
              <th mat-header-cell *matHeaderCellDef>Valor de venda</th>
              <td mat-cell *matCellDef="let i">{{ i.sale_value | currency: 'BRL' }}</td>
            </ng-container>

            <ng-container matColumnDef="fornecedor">
              <th mat-header-cell *matHeaderCellDef>Fornecedor</th>
              <td mat-cell *matCellDef="let i">{{ nomeFornecedor(i.supplier_id) }}</td>
            </ng-container>

            <ng-container matColumnDef="active">
              <th mat-header-cell *matHeaderCellDef>Ativo</th>
              <td mat-cell *matCellDef="let i">
                <mat-slide-toggle [checked]="i.active" (change)="alternar(i)" />
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="colunas"></tr>
            <tr mat-row *matRowDef="let row; columns: colunas"></tr>
          </table>
        </div>
      }
    </div>
  `,
  styles: `
    .tabela-card {
      padding: 0;
      overflow: hidden;
    }
    .full-width {
      width: 100%;
    }
  `,
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
