import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EstoqueService, UNIDADES_ESTOQUE } from './estoque.service';
import { Tables } from '../../core/types/database.types';

@Component({
  selector: 'app-estoque-page',
  standalone: true,
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatExpansionModule,
  ],
  template: `
    <h1>Estoque e insumos</h1>
    <p class="hint">
      Primeira versão informacional — entender o comportamento real do negócio (compra, consumo, rendimento).
    </p>

    <mat-expansion-panel class="form-panel">
      <mat-expansion-panel-header>
        <mat-panel-title>Novo item</mat-panel-title>
      </mat-expansion-panel-header>

      <form [formGroup]="form" (ngSubmit)="salvar()" class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Item</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Unidade</mat-label>
          <mat-select formControlName="unit">
            @for (u of unidades; track u) {
              <mat-option [value]="u">{{ u }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Quantidade de compra</mat-label>
          <input matInput type="number" step="0.001" formControlName="purchase_quantity" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Custo da compra (R$)</mat-label>
          <input matInput type="number" step="0.01" formControlName="purchase_cost" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Consumo por unidade vendida</mat-label>
          <input matInput type="number" step="0.001" formControlName="consumption_quantity" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Unidade do consumo</mat-label>
          <input matInput formControlName="consumption_unit" placeholder="Ex: g por quentinha" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Rendimento</mat-label>
          <input matInput type="number" step="0.001" formControlName="yield" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Valor de venda (R$)</mat-label>
          <input matInput type="number" step="0.01" formControlName="sale_value" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Fornecedor</mat-label>
          <mat-select formControlName="supplier_id">
            <mat-option [value]="null">—</mat-option>
            @for (f of fornecedores(); track f.id) {
              <mat-option [value]="f.id">{{ f.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="span-2">
          <mat-label>Observações</mat-label>
          <input matInput formControlName="notes" />
        </mat-form-field>

        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Adicionar item</button>
      </form>
    </mat-expansion-panel>

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

    @if (itens().length === 0) {
      <p class="vazio">Nenhum item de estoque cadastrado ainda.</p>
    }
  `,
  styles: `
    .hint {
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 16px;
    }
    .form-panel {
      margin-bottom: 16px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
      align-items: start;
      padding-top: 12px;
    }
    .span-2 {
      grid-column: span 2;
    }
    .full-width {
      width: 100%;
    }
    .vazio {
      color: rgba(0, 0, 0, 0.6);
      margin-top: 16px;
    }
  `,
})
export class EstoquePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(EstoqueService);
  private readonly snackBar = inject(MatSnackBar);

  readonly unidades = UNIDADES_ESTOQUE;
  readonly itens = signal<Tables<'inventory_items'>[]>([]);
  readonly fornecedores = signal<Tables<'contacts'>[]>([]);
  readonly colunas = ['name', 'unit', 'compra', 'consumo', 'venda', 'fornecedor', 'active'];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    unit: ['un' as (typeof UNIDADES_ESTOQUE)[number], Validators.required],
    purchase_quantity: [null as number | null],
    purchase_cost: [null as number | null],
    consumption_quantity: [null as number | null],
    consumption_unit: [''],
    yield: [null as number | null],
    sale_value: [null as number | null],
    supplier_id: [null as string | null],
    notes: [''],
  });

  async ngOnInit(): Promise<void> {
    const [itens, fornecedores] = await Promise.all([this.service.listar(), this.service.listarFornecedores()]);
    this.itens.set(itens);
    this.fornecedores.set(fornecedores);
  }

  nomeFornecedor(id: string | null): string {
    if (!id) return '—';
    return this.fornecedores().find((f) => f.id === id)?.name ?? '—';
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) return;
    await this.service.criar(this.form.getRawValue());
    this.form.reset({
      name: '',
      unit: 'un',
      purchase_quantity: null,
      purchase_cost: null,
      consumption_quantity: null,
      consumption_unit: '',
      yield: null,
      sale_value: null,
      supplier_id: null,
      notes: '',
    });
    this.itens.set(await this.service.listar());
    this.snackBar.open('Item de estoque adicionado.', 'OK', { duration: 2500 });
  }

  async alternar(item: Tables<'inventory_items'>): Promise<void> {
    await this.service.atualizar(item.id, { active: !item.active });
    this.itens.set(await this.service.listar());
  }
}
