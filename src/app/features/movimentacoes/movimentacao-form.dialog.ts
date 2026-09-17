import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MovimentacoesService } from './movimentacoes.service';
import { Tables } from '../../core/types/database.types';

function toIsoDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-movimentacao-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>Nova movimentação</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-dialog-content>
        <mat-button-toggle-group formControlName="type" class="full-width" (change)="onTipoChange()">
          <mat-button-toggle value="income">Receita</mat-button-toggle>
          <mat-button-toggle value="expense">Despesa</mat-button-toggle>
        </mat-button-toggle-group>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descrição</mat-label>
          <input matInput formControlName="description" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Valor (R$)</mat-label>
          <input matInput type="number" step="0.01" min="0.01" formControlName="amount" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Data</mat-label>
          <input matInput [matDatepicker]="pickerData" formControlName="transaction_date" />
          <mat-datepicker-toggle matSuffix [for]="pickerData" />
          <mat-datepicker #pickerData />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Categoria</mat-label>
          <mat-select formControlName="category_id" (selectionChange)="onCategoriaChange($event.value)">
            @for (categoria of categorias(); track categoria.id) {
              <mat-option [value]="categoria.id">{{ categoria.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        @if (subcategorias().length > 0) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Subcategoria</mat-label>
            <mat-select formControlName="subcategory_id">
              @for (sub of subcategorias(); track sub.id) {
                <mat-option [value]="sub.id">{{ sub.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Forma de pagamento</mat-label>
          <mat-select formControlName="payment_method_id">
            @for (fp of formasPagamento(); track fp.id) {
              <mat-option [value]="fp.id">{{ fp.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Contraparte (opcional)</mat-label>
          <mat-select formControlName="counterparty_id">
            <mat-option [value]="null">—</mat-option>
            @for (contato of contatos(); track contato.id) {
              <mat-option [value]="contato.id">{{ contato.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Ciclo (opcional)</mat-label>
          <mat-select formControlName="cycle_id">
            <mat-option [value]="null">—</mat-option>
            @for (ciclo of ciclos(); track ciclo.id) {
              <mat-option [value]="ciclo.id">{{ ciclo.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-checkbox formControlName="is_installment">Parcelado</mat-checkbox>

        @if (form.controls.is_installment.value) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Quantidade de parcelas</mat-label>
            <input matInput type="number" min="2" formControlName="installments_total" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Vencimento da 1ª parcela</mat-label>
            <input matInput [matDatepicker]="pickerParcela" formControlName="first_due_date" />
            <mat-datepicker-toggle matSuffix [for]="pickerParcela" />
            <mat-datepicker #pickerParcela />
          </mat-form-field>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observações</mat-label>
          <textarea matInput formControlName="notes" rows="2"></textarea>
        </mat-form-field>

        @if (errorMessage()) {
          <p class="error">{{ errorMessage() }}</p>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">Salvar</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .full-width {
      width: 100%;
      margin-bottom: 12px;
      display: block;
    }
    .error {
      color: #c62828;
      font-size: 0.85rem;
    }
  `,
})
export class MovimentacaoFormDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MovimentacoesService);
  private readonly dialogRef = inject(MatDialogRef<MovimentacaoFormDialog>);

  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly categorias = signal<Tables<'transaction_categories'>[]>([]);
  readonly subcategorias = signal<Tables<'transaction_subcategories'>[]>([]);
  readonly formasPagamento = signal<Tables<'payment_methods'>[]>([]);
  readonly contatos = signal<Tables<'contacts'>[]>([]);
  readonly ciclos = signal<Tables<'cycles'>[]>([]);

  readonly form = this.fb.nonNullable.group({
    type: ['income' as 'income' | 'expense', Validators.required],
    description: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    transaction_date: [new Date(), Validators.required],
    category_id: ['', Validators.required],
    subcategory_id: [null as string | null],
    payment_method_id: ['', Validators.required],
    counterparty_id: [null as string | null],
    cycle_id: [null as string | null],
    is_installment: [false],
    installments_total: [2],
    first_due_date: [new Date()],
    notes: [''],
  });

  async ngOnInit(): Promise<void> {
    const [formas, contatos, ciclos] = await Promise.all([
      this.service.listarFormasPagamento(),
      this.service.listarContatos(),
      this.service.listarCiclos(),
    ]);
    this.formasPagamento.set(formas);
    this.contatos.set(contatos);
    this.ciclos.set(ciclos);
    await this.onTipoChange();
  }

  async onTipoChange(): Promise<void> {
    const tipo = this.form.controls.type.value;
    this.categorias.set(await this.service.listarCategorias(tipo));
    this.form.controls.category_id.setValue('');
    this.subcategorias.set([]);
    this.form.controls.subcategory_id.setValue(null);
  }

  async onCategoriaChange(categoriaId: string): Promise<void> {
    this.form.controls.subcategory_id.setValue(null);
    this.subcategorias.set(categoriaId ? await this.service.listarSubcategorias(categoriaId) : []);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set(null);

    const value = this.form.getRawValue();

    try {
      if (value.is_installment) {
        await this.service.criarParcelada({
          p_type: value.type,
          p_description: value.description,
          p_amount: value.amount,
          p_transaction_date: toIsoDate(value.transaction_date),
          p_category_id: value.category_id,
          p_subcategory_id: value.subcategory_id as string,
          p_payment_method_id: value.payment_method_id,
          p_counterparty_id: value.counterparty_id as string,
          p_notes: value.notes,
          p_installments_total: value.installments_total,
          p_first_due_date: toIsoDate(value.first_due_date),
          p_cycle_id: value.cycle_id ?? undefined,
        });
      } else {
        await this.service.criarSimples({
          type: value.type,
          description: value.description,
          amount: value.amount,
          transaction_date: toIsoDate(value.transaction_date),
          category_id: value.category_id,
          subcategory_id: value.subcategory_id,
          payment_method_id: value.payment_method_id,
          counterparty_id: value.counterparty_id,
          cycle_id: value.cycle_id,
          notes: value.notes,
        });
      }
      this.dialogRef.close(true);
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Erro ao salvar movimentação.');
    } finally {
      this.saving.set(false);
    }
  }
}
