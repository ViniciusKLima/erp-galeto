import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DividasService } from './dividas.service';
import { Tables } from '../../core/types/database.types';

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-nova-divida-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>Nova dívida</h2>
    <p class="subtitle" mat-dialog-subtitle>Preencha os dados abaixo</p>
    <form [formGroup]="form" (ngSubmit)="salvar()">
      <mat-dialog-content>
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Credor</mat-label>
            <mat-select formControlName="creditor_id">
              @for (c of credores(); track c.id) {
                <mat-option [value]="c.id">{{ c.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Valor total (R$)</mat-label>
            <input matInput type="number" step="0.01" min="0.01" formControlName="total_amount" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="span-2">
            <mat-label>Descrição</mat-label>
            <input matInput formControlName="description" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Data de início</mat-label>
            <input matInput [matDatepicker]="pickerInicio" formControlName="start_date" />
            <mat-datepicker-toggle matSuffix [for]="pickerInicio" />
            <mat-datepicker #pickerInicio />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Quantidade de parcelas</mat-label>
            <input matInput type="number" min="1" formControlName="installments_total" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="span-2">
            <mat-label>Vencimento da 1ª parcela</mat-label>
            <input matInput [matDatepicker]="pickerVenc" formControlName="first_due_date" />
            <mat-datepicker-toggle matSuffix [for]="pickerVenc" />
            <mat-datepicker #pickerVenc />
          </mat-form-field>

          <mat-form-field appearance="outline" class="span-2">
            <mat-label>Observações</mat-label>
            <input matInput formControlName="notes" />
          </mat-form-field>
        </div>

        @if (errorMessage()) {
          <p class="error">{{ errorMessage() }}</p>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
          Registrar dívida
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
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
    .error {
      color: var(--color-danger);
      font-size: 0.85rem;
    }
  `,
})
export class NovaDividaDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(DividasService);
  private readonly dialogRef = inject(MatDialogRef<NovaDividaDialog>);

  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly credores = signal<Tables<'contacts'>[]>([]);

  readonly form = this.fb.nonNullable.group({
    creditor_id: ['', Validators.required],
    description: ['', Validators.required],
    total_amount: [0, [Validators.required, Validators.min(0.01)]],
    start_date: [new Date(), Validators.required],
    installments_total: [1, [Validators.required, Validators.min(1)]],
    first_due_date: [new Date(), Validators.required],
    notes: [''],
  });

  async ngOnInit(): Promise<void> {
    this.credores.set(await this.service.listarCredores());
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set(null);
    const value = this.form.getRawValue();

    try {
      await this.service.criarDividaParcelada({
        p_creditor_id: value.creditor_id,
        p_description: value.description,
        p_total_amount: value.total_amount,
        p_start_date: toIsoDate(value.start_date),
        p_notes: value.notes,
        p_installments_total: value.installments_total,
        p_first_due_date: toIsoDate(value.first_due_date),
      });
      this.dialogRef.close(true);
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Erro ao registrar dívida.');
    } finally {
      this.saving.set(false);
    }
  }
}
