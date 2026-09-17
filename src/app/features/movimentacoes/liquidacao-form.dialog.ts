import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MovimentacoesService } from './movimentacoes.service';
import { Tables } from '../../core/types/database.types';

export type LiquidacaoDialogData = {
  transactionId: string;
  installmentId: string | null;
  valorPendente: number;
};

@Component({
  selector: 'app-liquidacao-form-dialog',
  standalone: true,
  imports: [
    DecimalPipe,
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
    <h2 mat-dialog-title>Registrar liquidação</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-dialog-content>
        <p>Saldo pendente: {{ data.valorPendente | number: '1.2-2' }}</p>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Valor recebido/pago agora (R$)</mat-label>
          <input matInput type="number" step="0.01" min="0.01" [max]="data.valorPendente" formControlName="amount" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Data</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="settled_at" />
          <mat-datepicker-toggle matSuffix [for]="picker" />
          <mat-datepicker #picker />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Conta financeira</mat-label>
          <mat-select formControlName="financial_account_id">
            @for (conta of contas(); track conta.id) {
              <mat-option [value]="conta.id">{{ conta.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        @if (errorMessage()) {
          <p class="error">{{ errorMessage() }}</p>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">Confirmar</button>
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
export class LiquidacaoFormDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MovimentacoesService);
  private readonly dialogRef = inject(MatDialogRef<LiquidacaoFormDialog>);
  readonly data = inject<LiquidacaoDialogData>(MAT_DIALOG_DATA);

  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly contas = signal<Tables<'financial_accounts'>[]>([]);

  readonly form = this.fb.nonNullable.group({
    amount: [this.data.valorPendente, [Validators.required, Validators.min(0.01)]],
    settled_at: [new Date(), Validators.required],
    financial_account_id: ['', Validators.required],
  });

  async ngOnInit(): Promise<void> {
    this.contas.set(await this.service.listarContasFinanceiras());
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set(null);

    const value = this.form.getRawValue();

    try {
      await this.service.registrarLiquidacao({
        p_transaction_id: this.data.transactionId,
        p_installment_id: this.data.installmentId,
        p_amount: value.amount,
        p_settled_at: value.settled_at.toISOString().slice(0, 10),
        p_financial_account_id: value.financial_account_id,
      });
      this.dialogRef.close(true);
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Erro ao registrar liquidação.');
    } finally {
      this.saving.set(false);
    }
  }
}
