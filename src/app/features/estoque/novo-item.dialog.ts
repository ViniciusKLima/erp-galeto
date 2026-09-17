import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { EstoqueService, UNIDADES_ESTOQUE } from './estoque.service';
import { Tables } from '../../core/types/database.types';

@Component({
  selector: 'app-novo-item-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Novo item de estoque</h2>
    <p class="subtitle" mat-dialog-subtitle>Preencha os dados abaixo</p>
    <form [formGroup]="form" (ngSubmit)="salvar()">
      <mat-dialog-content>
        <div class="form-grid">
          <mat-form-field appearance="outline" class="span-2">
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
            <mat-label>Fornecedor</mat-label>
            <mat-select formControlName="supplier_id">
              <mat-option [value]="null">—</mat-option>
              @for (f of fornecedores(); track f.id) {
                <mat-option [value]="f.id">{{ f.name }}</mat-option>
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

          <mat-form-field appearance="outline" class="span-2">
            <mat-label>Observações</mat-label>
            <input matInput formControlName="notes" />
          </mat-form-field>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">Adicionar item</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .subtitle {
      color: var(--brand-ink-muted);
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 16px;
    }
    .span-2 {
      grid-column: span 2;
    }
    @media (max-width: 560px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class NovoItemDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(EstoqueService);
  private readonly dialogRef = inject(MatDialogRef<NovoItemDialog>);

  readonly saving = signal(false);
  readonly unidades = UNIDADES_ESTOQUE;
  readonly fornecedores = signal<Tables<'contacts'>[]>([]);

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
    this.fornecedores.set(await this.service.listarFornecedores());
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) return;
    this.saving.set(true);
    try {
      await this.service.criar(this.form.getRawValue());
      this.dialogRef.close(true);
    } finally {
      this.saving.set(false);
    }
  }
}
