import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DividasService } from './dividas.service';
import { DividaParcelasDialog } from './divida-parcelas.dialog';
import { Tables } from '../../core/types/database.types';

const STATUS_LABEL: Record<string, string> = {
  aberta: 'Aberta',
  quitada: 'Quitada',
  cancelada: 'Cancelada',
};

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-dividas-page',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
  ],
  template: `
    <h1>Dívidas e credores</h1>

    <mat-expansion-panel class="form-panel">
      <mat-expansion-panel-header>
        <mat-panel-title>Nova dívida</mat-panel-title>
      </mat-expansion-panel-header>

      <form [formGroup]="form" (ngSubmit)="salvar()" class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Credor</mat-label>
          <mat-select formControlName="creditor_id">
            @for (c of credores(); track c.id) {
              <mat-option [value]="c.id">{{ c.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="span-2">
          <mat-label>Descrição</mat-label>
          <input matInput formControlName="description" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Valor total (R$)</mat-label>
          <input matInput type="number" step="0.01" min="0.01" formControlName="total_amount" />
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

        <mat-form-field appearance="outline">
          <mat-label>Vencimento da 1ª parcela</mat-label>
          <input matInput [matDatepicker]="pickerVenc" formControlName="first_due_date" />
          <mat-datepicker-toggle matSuffix [for]="pickerVenc" />
          <mat-datepicker #pickerVenc />
        </mat-form-field>

        <mat-form-field appearance="outline" class="span-2">
          <mat-label>Observações</mat-label>
          <input matInput formControlName="notes" />
        </mat-form-field>

        @if (errorMessage()) {
          <p class="error">{{ errorMessage() }}</p>
        }

        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Registrar dívida</button>
      </form>
    </mat-expansion-panel>

    <table mat-table [dataSource]="dividas()" class="full-width">
      <ng-container matColumnDef="descricao">
        <th mat-header-cell *matHeaderCellDef>Descrição</th>
        <td mat-cell *matCellDef="let d">{{ d.description }}</td>
      </ng-container>

      <ng-container matColumnDef="credor">
        <th mat-header-cell *matHeaderCellDef>Credor</th>
        <td mat-cell *matCellDef="let d">{{ nomeCredor(d.creditor_id) }}</td>
      </ng-container>

      <ng-container matColumnDef="valor">
        <th mat-header-cell *matHeaderCellDef>Valor total</th>
        <td mat-cell *matCellDef="let d">{{ d.total_amount | currency: 'BRL' }}</td>
      </ng-container>

      <ng-container matColumnDef="inicio">
        <th mat-header-cell *matHeaderCellDef>Início</th>
        <td mat-cell *matCellDef="let d">{{ d.start_date | date: 'dd/MM/yyyy' }}</td>
      </ng-container>

      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef>Status</th>
        <td mat-cell *matCellDef="let d">
          <mat-chip [class]="'status-' + d.status">{{ statusLabel(d.status) }}</mat-chip>
        </td>
      </ng-container>

      <ng-container matColumnDef="acoes">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let d">
          <button mat-button (click)="verParcelas(d)">Ver parcelas</button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="colunas"></tr>
      <tr mat-row *matRowDef="let row; columns: colunas"></tr>
    </table>

    @if (dividas().length === 0) {
      <p class="vazio">Nenhuma dívida registrada ainda.</p>
    }
  `,
  styles: `
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
    .error {
      grid-column: 1 / -1;
      color: #c62828;
      font-size: 0.85rem;
    }
    .status-quitada {
      background: #c8e6c9;
    }
    .status-aberta {
      background: #fff3cd;
    }
    .status-cancelada {
      background: #eeeeee;
      text-decoration: line-through;
    }
  `,
})
export class DividasPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(DividasService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly dividas = signal<Tables<'debts'>[]>([]);
  readonly credores = signal<Tables<'contacts'>[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly colunas = ['descricao', 'credor', 'valor', 'inicio', 'status', 'acoes'];

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
    const [dividas, credores] = await Promise.all([this.service.listar(), this.service.listarCredores()]);
    this.dividas.set(dividas);
    this.credores.set(credores);
  }

  statusLabel(status: string): string {
    return STATUS_LABEL[status] ?? status;
  }

  nomeCredor(id: string): string {
    return this.credores().find((c) => c.id === id)?.name ?? '—';
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) return;
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
      this.form.reset({
        creditor_id: '',
        description: '',
        total_amount: 0,
        start_date: new Date(),
        installments_total: 1,
        first_due_date: new Date(),
        notes: '',
      });
      this.dividas.set(await this.service.listar());
      this.snackBar.open('Dívida registrada.', 'OK', { duration: 2500 });
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Erro ao registrar dívida.');
    }
  }

  verParcelas(divida: Tables<'debts'>): void {
    const ref = this.dialog.open(DividaParcelasDialog, {
      width: '560px',
      data: { debtId: divida.id, descricao: divida.description },
    });
    ref.afterClosed().subscribe(async () => {
      this.dividas.set(await this.service.listar());
    });
  }
}
