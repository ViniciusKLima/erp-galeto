import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MovimentacoesService } from '../../movimentacoes.service';

export type CancelarMovimentacaoDialogData = {
  transactionId: string;
  descricao: string;
};

@Component({
  selector: 'app-cancelar-movimentacao-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './cancelar-movimentacao.dialog.html',
  styleUrl: './cancelar-movimentacao.dialog.scss',
})
export class CancelarMovimentacaoDialog {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MovimentacoesService);
  private readonly dialogRef = inject(MatDialogRef<CancelarMovimentacaoDialog>);
  readonly data = inject<CancelarMovimentacaoDialogData>(MAT_DIALOG_DATA);

  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    motivo: ['', Validators.required],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set(null);

    try {
      await this.service.cancelar(this.data.transactionId, this.form.getRawValue().motivo);
      this.dialogRef.close(true);
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Erro ao cancelar movimentação.');
    } finally {
      this.saving.set(false);
    }
  }
}
