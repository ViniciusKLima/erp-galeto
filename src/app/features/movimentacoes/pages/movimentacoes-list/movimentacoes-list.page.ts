import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MovimentacoesService } from '../../movimentacoes.service';
import { MovimentacaoFormDialog } from '../../components/movimentacao-form/movimentacao-form.dialog';
import { MovimentacaoDetailDialog } from '../../components/movimentacao-detail/movimentacao-detail.dialog';
import { LiquidacaoFormDialog } from '../../components/liquidacao-form/liquidacao-form.dialog';
import { CancelarMovimentacaoDialog } from '../../components/cancelar-movimentacao/cancelar-movimentacao.dialog';
import { ParcelasDialog } from '../../components/parcelas/parcelas.dialog';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../../shared/empty-state/empty-state.component';
import { Tables } from '../../../../core/types/database.types';

function toIsoDate(value: Date | null): string | undefined {
  return value ? value.toISOString().slice(0, 10) : undefined;
}

@Component({
  selector: 'app-movimentacoes-list-page',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
  ],
  templateUrl: './movimentacoes-list.page.html',
  styleUrl: './movimentacoes-list.page.scss',
})
export class MovimentacoesListPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MovimentacoesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly movimentacoes = signal<Tables<'financial_transactions'>[]>([]);
  readonly categorias = signal<Tables<'transaction_categories'>[]>([]);
  readonly ciclos = signal<Tables<'cycles'>[]>([]);
  readonly formasPagamento = signal<Tables<'payment_methods'>[]>([]);
  readonly contas = signal<Tables<'financial_accounts'>[]>([]);
  readonly transferenciasRecentes = signal<Tables<'transfers'>[]>([]);
  readonly colunas = ['data', 'descricao', 'tipo', 'valor', 'status', 'acoes'];

  readonly filtroForm = this.fb.group({
    busca: this.fb.control(''),
    tipo: this.fb.control<'income' | 'expense' | null>(null),
    categoriaId: this.fb.control<string | null>(null),
    status: this.fb.control<string | null>(null),
    cicloId: this.fb.control<string | null>(null),
    formaPagamentoId: this.fb.control<string | null>(null),
    dataInicio: this.fb.control<Date | null>(null),
    dataFim: this.fb.control<Date | null>(null),
  });

  async ngOnInit(): Promise<void> {
    const [categorias, ciclos, formasPagamento, contas] = await Promise.all([
      this.service.listarCategorias(),
      this.service.listarCiclos(),
      this.service.listarFormasPagamento(),
      this.service.listarContasFinanceiras(),
    ]);
    this.categorias.set(categorias);
    this.ciclos.set(ciclos);
    this.formasPagamento.set(formasPagamento);
    this.contas.set(contas);
    await this.carregar();
  }

  async carregar(): Promise<void> {
    this.loading.set(true);
    const valores = this.filtroForm.getRawValue();
    const [movimentacoes, transferencias] = await Promise.all([
      this.service.listar({
        busca: valores.busca || undefined,
        tipo: valores.tipo ?? undefined,
        status: valores.status ?? undefined,
        categoriaId: valores.categoriaId ?? undefined,
        cicloId: valores.cicloId ?? undefined,
        formaPagamentoId: valores.formaPagamentoId ?? undefined,
        dataInicio: toIsoDate(valores.dataInicio),
        dataFim: toIsoDate(valores.dataFim),
      }),
      this.service.listarTransferenciasRecentes(),
    ]);
    this.movimentacoes.set(movimentacoes);
    this.transferenciasRecentes.set(transferencias);
    this.loading.set(false);
  }

  temFiltroAtivo(): boolean {
    const v = this.filtroForm.getRawValue();
    return !!(v.busca || v.tipo || v.categoriaId || v.status || v.cicloId || v.formaPagamentoId || v.dataInicio || v.dataFim);
  }

  async aplicarFiltro(): Promise<void> {
    await this.carregar();
  }

  async limparFiltro(): Promise<void> {
    this.filtroForm.reset({
      busca: '',
      tipo: null,
      categoriaId: null,
      status: null,
      cicloId: null,
      formaPagamentoId: null,
      dataInicio: null,
      dataFim: null,
    });
    await this.carregar();
  }

  nomeConta(id: string): string {
    return this.contas().find((c) => c.id === id)?.name ?? '—';
  }

  novaMovimentacao(): void {
    const ref = this.dialog.open(MovimentacaoFormDialog, { width: '640px', maxWidth: '95vw' });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackBar.open('✓ Salvo com sucesso.', 'OK', { duration: 3000 });
        this.carregar();
      }
    });
  }

  editar(movimentacao: Tables<'financial_transactions'>): void {
    const ref = this.dialog.open(MovimentacaoFormDialog, {
      width: '640px',
      maxWidth: '95vw',
      data: { existing: movimentacao },
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackBar.open('✓ Movimentação atualizada.', 'OK', { duration: 3000 });
        this.carregar();
      }
    });
  }

  verDetalhes(movimentacao: Tables<'financial_transactions'>): void {
    const ref = this.dialog.open(MovimentacaoDetailDialog, {
      position: { right: '0', top: '0' },
      width: '420px',
      maxWidth: '95vw',
      height: '100vh',
      panelClass: 'drawer-panel',
      data: { movimentacao },
    });
    ref.afterClosed().subscribe((resultado) => {
      if (resultado?.action === 'editar') {
        this.editar(movimentacao);
      }
    });
  }

  liquidar(movimentacao: Tables<'financial_transactions'>): void {
    const ref = this.dialog.open(LiquidacaoFormDialog, {
      width: '420px',
      data: {
        transactionId: movimentacao.id,
        installmentId: null,
        valorPendente: movimentacao.amount - movimentacao.paid_amount,
      },
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackBar.open('✓ Liquidação registrada.', 'OK', { duration: 3000 });
        this.carregar();
      }
    });
  }

  cancelar(movimentacao: Tables<'financial_transactions'>): void {
    const ref = this.dialog.open(CancelarMovimentacaoDialog, {
      width: '420px',
      data: { transactionId: movimentacao.id, descricao: movimentacao.description },
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackBar.open('Movimentação cancelada.', 'OK', { duration: 3000 });
        this.carregar();
      }
    });
  }

  verParcelas(movimentacao: Tables<'financial_transactions'>): void {
    const ref = this.dialog.open(ParcelasDialog, {
      width: '640px',
      data: { transactionId: movimentacao.id, descricao: movimentacao.description },
    });
    ref.afterClosed().subscribe(() => this.carregar());
  }
}
