import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DividasService } from '../../dividas.service';
import { Tables } from '../../../../core/types/database.types';

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
  templateUrl: './nova-divida.dialog.html',
  styleUrl: './nova-divida.dialog.scss',
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
