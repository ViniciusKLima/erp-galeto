import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovimentacoesService } from './movimentacoes.service';
import { Tables } from '../../core/types/database.types';

function toIsoDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export type MovimentacaoFormDialogData = {
  existing?: Tables<'financial_transactions'>;
};

type TipoLancamento = 'income' | 'expense' | 'transfer';

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
    <h2 mat-dialog-title>{{ isEditing ? 'Editar movimentação' : 'Nova movimentação' }}</h2>
    <p class="subtitle" mat-dialog-subtitle>Preencha os dados abaixo</p>
    <form [formGroup]="form" (ngSubmit)="salvar(true)">
      <mat-dialog-content>
        @if (!isEditing) {
          <mat-button-toggle-group formControlName="type" class="full-width tipo-toggle" (change)="onTipoChange()">
            <mat-button-toggle value="income">Receita</mat-button-toggle>
            <mat-button-toggle value="expense">Despesa</mat-button-toggle>
            <mat-button-toggle value="transfer">Transferência</mat-button-toggle>
          </mat-button-toggle-group>
        }

        @if (form.controls.type.value === 'transfer') {
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Conta de origem</mat-label>
              <mat-select formControlName="source_account_id">
                @for (conta of contas(); track conta.id) {
                  <mat-option [value]="conta.id">{{ conta.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Conta de destino</mat-label>
              <mat-select formControlName="destination_account_id">
                @for (conta of contas(); track conta.id) {
                  <mat-option [value]="conta.id">{{ conta.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Valor (R$)</mat-label>
              <input matInput type="number" step="0.01" min="0.01" formControlName="transfer_amount" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Data</mat-label>
              <input matInput [matDatepicker]="pickerTransfer" formControlName="transfer_date" />
              <mat-datepicker-toggle matSuffix [for]="pickerTransfer" />
              <mat-datepicker #pickerTransfer />
            </mat-form-field>

            <mat-form-field appearance="outline" class="span-2">
              <mat-label>Observações</mat-label>
              <textarea matInput formControlName="transfer_notes" rows="2"></textarea>
            </mat-form-field>
          </div>
          <p class="hint">Transferência entre contas próprias — não altera receita, despesa nem resultado.</p>
        } @else {
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Data</mat-label>
              <input matInput [matDatepicker]="pickerData" formControlName="transaction_date" />
              <mat-datepicker-toggle matSuffix [for]="pickerData" />
              <mat-datepicker #pickerData />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Ciclo (opcional)</mat-label>
              <mat-select formControlName="cycle_id">
                <mat-option [value]="null">—</mat-option>
                @for (ciclo of ciclos(); track ciclo.id) {
                  <mat-option [value]="ciclo.id">{{ ciclo.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="span-2">
              <mat-label>Descrição</mat-label>
              <input matInput formControlName="description" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Categoria</mat-label>
              <mat-select formControlName="category_id" (selectionChange)="onCategoriaChange($event.value)">
                @for (categoria of categorias(); track categoria.id) {
                  <mat-option [value]="categoria.id">{{ categoria.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            @if (subcategorias().length > 0) {
              <mat-form-field appearance="outline">
                <mat-label>Subcategoria</mat-label>
                <mat-select formControlName="subcategory_id">
                  @for (sub of subcategorias(); track sub.id) {
                    <mat-option [value]="sub.id">{{ sub.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }

            <mat-form-field appearance="outline">
              <mat-label>Valor (R$)</mat-label>
              <input matInput type="number" step="0.01" min="0.01" formControlName="amount" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Forma de pagamento</mat-label>
              <mat-select formControlName="payment_method_id">
                @for (fp of formasPagamento(); track fp.id) {
                  <mat-option [value]="fp.id">{{ fp.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Entidade (opcional)</mat-label>
              <mat-select formControlName="counterparty_id">
                <mat-option [value]="null">—</mat-option>
                @for (contato of contatos(); track contato.id) {
                  <mat-option [value]="contato.id">{{ contato.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            @if (!isEditing) {
              <div class="parcelado-field">
                <mat-checkbox formControlName="is_installment">Parcelado</mat-checkbox>
              </div>
            }

            @if (form.controls.is_installment.value) {
              <mat-form-field appearance="outline">
                <mat-label>Quantidade de parcelas</mat-label>
                <input matInput type="number" min="2" formControlName="installments_total" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Vencimento da 1ª parcela</mat-label>
                <input matInput [matDatepicker]="pickerParcela" formControlName="first_due_date" />
                <mat-datepicker-toggle matSuffix [for]="pickerParcela" />
                <mat-datepicker #pickerParcela />
              </mat-form-field>
            }

            <mat-form-field appearance="outline" class="span-2">
              <mat-label>Observações</mat-label>
              <textarea matInput formControlName="notes" rows="2"></textarea>
            </mat-form-field>
          </div>
        }

        @if (errorMessage()) {
          <p class="error">{{ errorMessage() }}</p>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        @if (!isEditing) {
          <button mat-stroked-button type="button" [disabled]="saving()" (click)="salvar(false)">
            Salvar e continuar
          </button>
        }
        <button mat-flat-button color="primary" type="submit" [disabled]="saving()">Salvar</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .subtitle {
      color: var(--brand-ink-muted);
    }
    .tipo-toggle {
      margin-bottom: 16px;
      display: flex;
    }
    .tipo-toggle ::ng-deep .mat-button-toggle {
      flex: 1;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 16px;
    }
    .span-2 {
      grid-column: span 2;
    }
    .parcelado-field {
      display: flex;
      align-items: center;
      grid-column: span 2;
    }
    @media (max-width: 560px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
      .span-2 {
        grid-column: span 1;
      }
    }
    .hint {
      color: var(--brand-ink-muted);
      font-size: 0.85rem;
    }
    .error {
      color: var(--color-danger);
      font-size: 0.85rem;
    }
  `,
})
export class MovimentacaoFormDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MovimentacoesService);
  private readonly dialogRef = inject(MatDialogRef<MovimentacaoFormDialog>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly data = inject<MovimentacaoFormDialogData | null>(MAT_DIALOG_DATA, { optional: true });

  readonly isEditing = !!this.data?.existing;

  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly categorias = signal<Tables<'transaction_categories'>[]>([]);
  readonly subcategorias = signal<Tables<'transaction_subcategories'>[]>([]);
  readonly formasPagamento = signal<Tables<'payment_methods'>[]>([]);
  readonly contatos = signal<Tables<'contacts'>[]>([]);
  readonly ciclos = signal<Tables<'cycles'>[]>([]);
  readonly contas = signal<Tables<'financial_accounts'>[]>([]);

  readonly form = this.fb.nonNullable.group({
    type: ['income' as TipoLancamento, Validators.required],
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
    source_account_id: [null as string | null],
    destination_account_id: [null as string | null],
    transfer_amount: [0],
    transfer_date: [new Date()],
    transfer_notes: [''],
  });

  async ngOnInit(): Promise<void> {
    const [formas, contatos, ciclos, contas] = await Promise.all([
      this.service.listarFormasPagamento(),
      this.service.listarContatos(),
      this.service.listarCiclos(),
      this.service.listarContasFinanceiras(),
    ]);
    this.formasPagamento.set(formas);
    this.contatos.set(contatos);
    this.ciclos.set(ciclos);
    this.contas.set(contas);

    const existing = this.data?.existing;
    if (existing) {
      this.form.patchValue({
        type: existing.type as TipoLancamento,
        description: existing.description,
        amount: existing.amount,
        transaction_date: new Date(existing.transaction_date),
        category_id: existing.category_id,
        payment_method_id: existing.payment_method_id,
        counterparty_id: existing.counterparty_id,
        cycle_id: existing.cycle_id,
        notes: existing.notes ?? '',
      });
      this.categorias.set(await this.service.listarCategorias(existing.type as 'income' | 'expense'));
      if (existing.subcategory_id) {
        this.subcategorias.set(await this.service.listarSubcategorias(existing.category_id));
        this.form.controls.subcategory_id.setValue(existing.subcategory_id);
      }
    } else {
      await this.onTipoChange();
    }
  }

  async onTipoChange(): Promise<void> {
    const tipo = this.form.controls.type.value;
    if (tipo === 'transfer') return;
    this.categorias.set(await this.service.listarCategorias(tipo));
    this.form.controls.category_id.setValue('');
    this.subcategorias.set([]);
    this.form.controls.subcategory_id.setValue(null);
  }

  async onCategoriaChange(categoriaId: string): Promise<void> {
    this.form.controls.subcategory_id.setValue(null);
    this.subcategorias.set(categoriaId ? await this.service.listarSubcategorias(categoriaId) : []);
  }

  private resetParaNovoLancamento(): void {
    const tipo = this.form.controls.type.value;
    this.form.reset({
      type: tipo,
      description: '',
      amount: 0,
      transaction_date: new Date(),
      category_id: '',
      subcategory_id: null,
      payment_method_id: this.form.controls.payment_method_id.value,
      counterparty_id: null,
      cycle_id: this.form.controls.cycle_id.value,
      is_installment: false,
      installments_total: 2,
      first_due_date: new Date(),
      notes: '',
      source_account_id: null,
      destination_account_id: null,
      transfer_amount: 0,
      transfer_date: new Date(),
      transfer_notes: '',
    });
  }

  async salvar(fechar: boolean): Promise<void> {
    this.errorMessage.set(null);
    const value = this.form.getRawValue();

    if (value.type === 'transfer') {
      if (!value.source_account_id || !value.destination_account_id) {
        this.errorMessage.set('Selecione a conta de origem e a conta de destino.');
        return;
      }
      if (value.source_account_id === value.destination_account_id) {
        this.errorMessage.set('A conta de origem e a de destino devem ser diferentes.');
        return;
      }
      if (!value.transfer_amount || value.transfer_amount <= 0) {
        this.errorMessage.set('Informe um valor de transferência maior que zero.');
        return;
      }

      this.saving.set(true);
      try {
        await this.service.criarTransferencia({
          source_account_id: value.source_account_id,
          destination_account_id: value.destination_account_id,
          amount: value.transfer_amount,
          transfer_date: toIsoDate(value.transfer_date),
          notes: value.transfer_notes,
        });
        this.finalizarSalvar(fechar, 'Transferência registrada.');
      } catch (err) {
        this.errorMessage.set(err instanceof Error ? err.message : 'Erro ao registrar transferência.');
      } finally {
        this.saving.set(false);
      }
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    try {
      if (this.isEditing && this.data?.existing) {
        await this.service.atualizarSimples(this.data.existing.id, {
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
      } else if (value.is_installment) {
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
      this.finalizarSalvar(fechar, this.isEditing ? 'Movimentação atualizada.' : 'Movimentação registrada.');
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Erro ao salvar movimentação.');
    } finally {
      this.saving.set(false);
    }
  }

  private finalizarSalvar(fechar: boolean, mensagem: string): void {
    if (fechar || this.isEditing) {
      this.dialogRef.close(true);
      return;
    }
    this.snackBar.open('✓ ' + mensagem, 'OK', { duration: 2500 });
    this.resetParaNovoLancamento();
  }
}
