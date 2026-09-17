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
import { MovimentacoesService } from './movimentacoes.service';
import { MovimentacaoFormDialog } from './movimentacao-form.dialog';
import { MovimentacaoDetailDialog } from './movimentacao-detail.dialog';
import { LiquidacaoFormDialog } from './liquidacao-form.dialog';
import { CancelarMovimentacaoDialog } from './cancelar-movimentacao.dialog';
import { ParcelasDialog } from './parcelas.dialog';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { Tables } from '../../core/types/database.types';

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
  template: `
    <div class="page-shell">
      <app-page-header title="Movimentações" subtitle="Registre e acompanhe as movimentações financeiras.">
        <button actions mat-flat-button color="primary" (click)="novaMovimentacao()">
          <mat-icon>add</mat-icon>
          Nova movimentação
        </button>
      </app-page-header>

      <div class="surface-card filtros-card">
        <mat-form-field appearance="outline" class="busca">
          <mat-label>Buscar movimentação</mat-label>
          <input matInput [formControl]="filtroForm.controls.busca" (keyup.enter)="aplicarFiltro()" />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filtro-curto">
          <mat-label>Tipo</mat-label>
          <mat-select [formControl]="filtroForm.controls.tipo">
            <mat-option [value]="null">Todos</mat-option>
            <mat-option value="income">Receita</mat-option>
            <mat-option value="expense">Despesa</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filtro-curto">
          <mat-label>Categoria</mat-label>
          <mat-select [formControl]="filtroForm.controls.categoriaId">
            <mat-option [value]="null">Todas</mat-option>
            @for (categoria of categorias(); track categoria.id) {
              <mat-option [value]="categoria.id">{{ categoria.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filtro-curto">
          <mat-label>Status</mat-label>
          <mat-select [formControl]="filtroForm.controls.status">
            <mat-option [value]="null">Todos</mat-option>
            <mat-option value="pendente">Pendente</mat-option>
            <mat-option value="pago">Pago</mat-option>
            <mat-option value="recebido">Recebido</mat-option>
            <mat-option value="cancelado">Cancelado</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-expansion-panel class="filtros-avancados">
          <mat-expansion-panel-header>
            <mat-panel-title>Filtros avançados</mat-panel-title>
          </mat-expansion-panel-header>
          <div class="filtros-avancados-conteudo">
            <mat-form-field appearance="outline">
              <mat-label>Ciclo</mat-label>
              <mat-select [formControl]="filtroForm.controls.cicloId">
                <mat-option [value]="null">Todos</mat-option>
                @for (ciclo of ciclos(); track ciclo.id) {
                  <mat-option [value]="ciclo.id">{{ ciclo.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Forma de pagamento</mat-label>
              <mat-select [formControl]="filtroForm.controls.formaPagamentoId">
                <mat-option [value]="null">Todas</mat-option>
                @for (fp of formasPagamento(); track fp.id) {
                  <mat-option [value]="fp.id">{{ fp.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>De</mat-label>
              <input matInput [matDatepicker]="pickerDe" [formControl]="filtroForm.controls.dataInicio" />
              <mat-datepicker-toggle matSuffix [for]="pickerDe" />
              <mat-datepicker #pickerDe />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Até</mat-label>
              <input matInput [matDatepicker]="pickerAte" [formControl]="filtroForm.controls.dataFim" />
              <mat-datepicker-toggle matSuffix [for]="pickerAte" />
              <mat-datepicker #pickerAte />
            </mat-form-field>
          </div>
        </mat-expansion-panel>

        <div class="filtros-acoes">
          <button mat-flat-button color="primary" (click)="aplicarFiltro()">Filtrar</button>
          @if (temFiltroAtivo()) {
            <button mat-button (click)="limparFiltro()">
              <mat-icon>close</mat-icon>
              Limpar filtros
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <mat-spinner diameter="32" />
      } @else if (movimentacoes().length === 0) {
        <app-empty-state
          [icon]="temFiltroAtivo() ? 'search_off' : 'receipt_long'"
          [title]="temFiltroAtivo() ? 'Nenhuma movimentação encontrada' : 'Nenhuma movimentação registrada'"
          [description]="temFiltroAtivo() ? 'Tente alterar ou limpar os filtros.' : 'Comece registrando a primeira movimentação.'"
        >
          @if (temFiltroAtivo()) {
            <button action mat-button (click)="limparFiltro()">Limpar filtros</button>
          } @else {
            <button action mat-flat-button color="primary" (click)="novaMovimentacao()">+ Nova movimentação</button>
          }
        </app-empty-state>
      } @else {
        <div class="surface-card tabela-card">
          <table mat-table [dataSource]="movimentacoes()" class="full-width">
            <ng-container matColumnDef="data">
              <th mat-header-cell *matHeaderCellDef>Data</th>
              <td mat-cell *matCellDef="let m">{{ m.transaction_date | date: 'dd/MM/yyyy' }}</td>
            </ng-container>

            <ng-container matColumnDef="tipo">
              <th mat-header-cell *matHeaderCellDef>Tipo</th>
              <td mat-cell *matCellDef="let m" [class.text-success]="m.type === 'income'" [class.text-danger]="m.type === 'expense'">
                {{ m.type === 'income' ? 'Receita' : 'Despesa' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="descricao">
              <th mat-header-cell *matHeaderCellDef>Descrição</th>
              <td mat-cell *matCellDef="let m" class="descricao-cell" (click)="verDetalhes(m)">
                {{ m.description }}
                @if (m.is_installment) {
                  <span class="tag-parcelado">{{ m.installments_total }}x</span>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="valor">
              <th mat-header-cell *matHeaderCellDef>Valor</th>
              <td mat-cell *matCellDef="let m" class="valor-cell">{{ m.amount | currency: 'BRL' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let m"><app-status-badge [status]="m.status" /></td>
            </ng-container>

            <ng-container matColumnDef="acoes">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let m" class="acoes-cell">
                @if (!m.is_installment && m.status === 'pendente') {
                  <button mat-icon-button (click)="editar(m)" aria-label="Editar" title="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                }
                <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Mais ações">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="verDetalhes(m)">
                    <mat-icon>visibility</mat-icon>
                    Ver detalhes
                  </button>
                  @if (m.is_installment) {
                    <button mat-menu-item (click)="verParcelas(m)">
                      <mat-icon>list</mat-icon>
                      Ver parcelas
                    </button>
                  } @else if (m.status === 'pendente') {
                    <button mat-menu-item (click)="liquidar(m)">
                      <mat-icon>check_circle</mat-icon>
                      Liquidar
                    </button>
                  }
                  @if (m.status === 'pendente') {
                    <button mat-menu-item (click)="cancelar(m)">
                      <mat-icon>cancel</mat-icon>
                      Cancelar
                    </button>
                  }
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="colunas"></tr>
            <tr mat-row *matRowDef="let row; columns: colunas"></tr>
          </table>
        </div>
      }

      @if (transferenciasRecentes().length > 0) {
        <div class="surface-card">
          <p class="section-title">Últimas transferências entre contas</p>
          <table mat-table [dataSource]="transferenciasRecentes()" class="full-width">
            <ng-container matColumnDef="data">
              <th mat-header-cell *matHeaderCellDef>Data</th>
              <td mat-cell *matCellDef="let t">{{ t.transfer_date | date: 'dd/MM/yyyy' }}</td>
            </ng-container>
            <ng-container matColumnDef="contas">
              <th mat-header-cell *matHeaderCellDef>Contas</th>
              <td mat-cell *matCellDef="let t">{{ nomeConta(t.source_account_id) }} → {{ nomeConta(t.destination_account_id) }}</td>
            </ng-container>
            <ng-container matColumnDef="valor">
              <th mat-header-cell *matHeaderCellDef>Valor</th>
              <td mat-cell *matCellDef="let t">{{ t.amount | currency: 'BRL' }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="['data', 'contas', 'valor']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['data', 'contas', 'valor']"></tr>
          </table>
        </div>
      }
    </div>
  `,
  styles: `
    .filtros-card {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 20px;
    }
    .busca {
      flex: 1 1 240px;
      min-width: 220px;
    }
    .filtro-curto {
      min-width: 160px;
    }
    .filtros-avancados {
      box-shadow: none !important;
      background: transparent;
      flex-basis: 100%;
    }
    .filtros-avancados-conteudo {
      display: flex;
      gap: 12px;
      padding-top: 8px;
      flex-wrap: wrap;
    }
    .filtros-acoes {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .tabela-card {
      padding: 0;
      overflow: hidden;
    }
    .full-width {
      width: 100%;
    }
    .descricao-cell {
      cursor: pointer;
    }
    .descricao-cell:hover {
      text-decoration: underline;
    }
    .tag-parcelado {
      margin-left: 8px;
      font-size: 0.72rem;
      color: var(--brand-ink-muted);
      background: var(--brand-background);
      padding: 1px 6px;
      border-radius: 999px;
    }
    .valor-cell {
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
    .acoes-cell {
      white-space: nowrap;
      text-align: right;
    }
  `,
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
