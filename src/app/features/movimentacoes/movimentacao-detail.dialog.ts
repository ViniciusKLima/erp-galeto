import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MovimentacoesService } from './movimentacoes.service';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { Tables } from '../../core/types/database.types';

export type MovimentacaoDetailDialogData = {
  movimentacao: Tables<'financial_transactions'>;
};

@Component({
  selector: 'app-movimentacao-detail-dialog',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, MatDialogModule, MatButtonModule, MatIconModule, StatusBadgeComponent],
  template: `
    <div class="drawer">
      <div class="drawer-header">
        <button mat-icon-button mat-dialog-close aria-label="Fechar">
          <mat-icon>close</mat-icon>
        </button>
        <h2>Detalhes da movimentação</h2>
      </div>

      <div class="drawer-body">
        <p class="tipo" [class.text-success]="m.type === 'income'" [class.text-danger]="m.type === 'expense'">
          {{ m.type === 'income' ? 'Receita' : 'Despesa' }}
        </p>
        <p class="valor">{{ m.amount | currency: 'BRL' }}</p>
        <app-status-badge [status]="m.status" />

        <dl class="campos">
          <dt>Descrição</dt>
          <dd>{{ m.description }}</dd>

          <dt>Data</dt>
          <dd>{{ m.transaction_date | date: 'dd/MM/yyyy' }}</dd>

          @if (m.due_date) {
            <dt>Vencimento</dt>
            <dd>{{ m.due_date | date: 'dd/MM/yyyy' }}</dd>
          }

          <dt>Categoria</dt>
          <dd>{{ nomeCategoria() }}</dd>

          @if (m.subcategory_id) {
            <dt>Subcategoria</dt>
            <dd>{{ nomeSubcategoria() }}</dd>
          }

          <dt>Forma de pagamento</dt>
          <dd>{{ nomeFormaPagamento() }}</dd>

          @if (m.counterparty_id) {
            <dt>Entidade</dt>
            <dd>{{ nomeContato() }}</dd>
          }

          @if (m.cycle_id) {
            <dt>Ciclo</dt>
            <dd>{{ nomeCiclo() }}</dd>
          }

          <dt>Pago/Recebido</dt>
          <dd>{{ m.paid_amount | currency: 'BRL' }}</dd>

          @if (m.notes) {
            <dt>Observação</dt>
            <dd>{{ m.notes }}</dd>
          }
        </dl>
      </div>

      <div class="drawer-footer">
        @if (m.status === 'pendente' && !m.is_installment) {
          <button mat-flat-button color="primary" (click)="editar()">Editar</button>
        }
      </div>
    </div>
  `,
  styles: `
    .drawer {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 480px;
    }
    .drawer-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--brand-border);
    }
    .drawer-header h2 {
      font-size: 1.05rem;
      margin: 0;
    }
    .drawer-body {
      flex: 1 1 auto;
      overflow-y: auto;
      padding: 20px 24px;
    }
    .tipo {
      font-size: 0.85rem;
      font-weight: 600;
      margin: 0 0 4px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .valor {
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0 0 12px;
      color: var(--brand-ink);
    }
    .campos {
      margin: 24px 0 0;
    }
    .campos dt {
      font-size: 0.75rem;
      color: var(--brand-ink-muted);
      margin-top: 14px;
    }
    .campos dd {
      margin: 2px 0 0;
      font-size: 0.95rem;
      color: var(--brand-ink);
    }
    .drawer-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--brand-border);
      display: flex;
      justify-content: flex-end;
    }
  `,
})
export class MovimentacaoDetailDialog implements OnInit {
  private readonly service = inject(MovimentacoesService);
  private readonly dialogRef = inject(MatDialogRef<MovimentacaoDetailDialog>);
  private readonly data = inject<MovimentacaoDetailDialogData>(MAT_DIALOG_DATA);

  readonly m = this.data.movimentacao;

  private readonly categorias = signal<Tables<'transaction_categories'>[]>([]);
  private readonly subcategorias = signal<Tables<'transaction_subcategories'>[]>([]);
  private readonly formasPagamento = signal<Tables<'payment_methods'>[]>([]);
  private readonly contatos = signal<Tables<'contacts'>[]>([]);
  private readonly ciclos = signal<Tables<'cycles'>[]>([]);

  async ngOnInit(): Promise<void> {
    const [categorias, formasPagamento, contatos, ciclos] = await Promise.all([
      this.service.listarCategorias(),
      this.service.listarFormasPagamento(),
      this.service.listarContatos(),
      this.service.listarCiclos(),
    ]);
    this.categorias.set(categorias);
    this.formasPagamento.set(formasPagamento);
    this.contatos.set(contatos);
    this.ciclos.set(ciclos);
    if (this.m.subcategory_id) {
      this.subcategorias.set(await this.service.listarSubcategorias(this.m.category_id));
    }
  }

  nomeCategoria(): string {
    return this.categorias().find((c) => c.id === this.m.category_id)?.name ?? '—';
  }

  nomeSubcategoria(): string {
    return this.subcategorias().find((s) => s.id === this.m.subcategory_id)?.name ?? '—';
  }

  nomeFormaPagamento(): string {
    return this.formasPagamento().find((f) => f.id === this.m.payment_method_id)?.name ?? '—';
  }

  nomeContato(): string {
    return this.contatos().find((c) => c.id === this.m.counterparty_id)?.name ?? '—';
  }

  nomeCiclo(): string {
    return this.ciclos().find((c) => c.id === this.m.cycle_id)?.label ?? '—';
  }

  editar(): void {
    this.dialogRef.close({ action: 'editar' });
  }
}
