import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { EstoqueService, UNIDADES_ESTOQUE } from '../../estoque.service';
import { Tables } from '../../../../core/types/database.types';

@Component({
  selector: 'app-novo-item-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './novo-item.dialog.html',
  styleUrl: './novo-item.dialog.scss',
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
