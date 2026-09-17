import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfiguracoesService } from './configuracoes.service';
import { Tables } from '../../core/types/database.types';

const CICLO_PROXIMO_STATUS: Record<string, string | null> = {
  aberto: 'em_andamento',
  em_andamento: 'fechamento',
  fechamento: 'fechado',
  fechado: null,
};

const CICLO_STATUS_LABEL: Record<string, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  fechamento: 'Em fechamento',
  fechado: 'Fechado',
};

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-configuracoes-page',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    MatTabsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <h1>Configurações</h1>

    <mat-tab-group>
      <mat-tab label="Categorias">
        <div class="tab-content">
          <form [formGroup]="categoriaForm" (ngSubmit)="salvarCategoria()" class="inline-form">
            <mat-form-field appearance="outline">
              <mat-label>Nome</mat-label>
              <input matInput formControlName="name" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Tipo</mat-label>
              <mat-select formControlName="type">
                <mat-option value="income">Receita</mat-option>
                <mat-option value="expense">Despesa</mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit" [disabled]="categoriaForm.invalid">Adicionar</button>
          </form>

          <table mat-table [dataSource]="categorias()" class="full-width">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nome</th>
              <td mat-cell *matCellDef="let c">{{ c.name }}</td>
            </ng-container>
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Tipo</th>
              <td mat-cell *matCellDef="let c">{{ c.type === 'income' ? 'Receita' : 'Despesa' }}</td>
            </ng-container>
            <ng-container matColumnDef="active">
              <th mat-header-cell *matHeaderCellDef>Ativa</th>
              <td mat-cell *matCellDef="let c">
                <mat-slide-toggle [checked]="c.active" (change)="alternarCategoria(c)" />
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="['name', 'type', 'active']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['name', 'type', 'active']"></tr>
          </table>
        </div>
      </mat-tab>

      <mat-tab label="Subcategorias">
        <div class="tab-content">
          <form [formGroup]="subcategoriaForm" (ngSubmit)="salvarSubcategoria()" class="inline-form">
            <mat-form-field appearance="outline">
              <mat-label>Categoria</mat-label>
              <mat-select formControlName="category_id">
                @for (cat of categorias(); track cat.id) {
                  <mat-option [value]="cat.id">{{ cat.name }} ({{ cat.type === 'income' ? 'Receita' : 'Despesa' }})</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Nome</mat-label>
              <input matInput formControlName="name" />
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit" [disabled]="subcategoriaForm.invalid">Adicionar</button>
          </form>

          <table mat-table [dataSource]="subcategorias()" class="full-width">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nome</th>
              <td mat-cell *matCellDef="let s">{{ s.name }}</td>
            </ng-container>
            <ng-container matColumnDef="categoria">
              <th mat-header-cell *matHeaderCellDef>Categoria</th>
              <td mat-cell *matCellDef="let s">{{ nomeCategoria(s.category_id) }}</td>
            </ng-container>
            <ng-container matColumnDef="active">
              <th mat-header-cell *matHeaderCellDef>Ativa</th>
              <td mat-cell *matCellDef="let s">
                <mat-slide-toggle [checked]="s.active" (change)="alternarSubcategoria(s)" />
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="['name', 'categoria', 'active']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['name', 'categoria', 'active']"></tr>
          </table>
        </div>
      </mat-tab>

      <mat-tab label="Contas financeiras">
        <div class="tab-content">
          <form [formGroup]="contaForm" (ngSubmit)="salvarConta()" class="inline-form">
            <mat-form-field appearance="outline">
              <mat-label>Nome</mat-label>
              <input matInput formControlName="name" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Tipo</mat-label>
              <mat-select formControlName="type">
                <mat-option value="bank">Banco</mat-option>
                <mat-option value="cash">Dinheiro</mat-option>
                <mat-option value="other">Outro</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Saldo inicial (R$)</mat-label>
              <input matInput type="number" step="0.01" formControlName="initial_balance" />
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit" [disabled]="contaForm.invalid">Adicionar</button>
          </form>

          <table mat-table [dataSource]="contas()" class="full-width">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nome</th>
              <td mat-cell *matCellDef="let c">{{ c.name }}</td>
            </ng-container>
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Tipo</th>
              <td mat-cell *matCellDef="let c">{{ c.type }}</td>
            </ng-container>
            <ng-container matColumnDef="saldo">
              <th mat-header-cell *matHeaderCellDef>Saldo inicial</th>
              <td mat-cell *matCellDef="let c">{{ c.initial_balance | currency: 'BRL' }}</td>
            </ng-container>
            <ng-container matColumnDef="active">
              <th mat-header-cell *matHeaderCellDef>Ativa</th>
              <td mat-cell *matCellDef="let c">
                <mat-slide-toggle [checked]="c.active" (change)="alternarConta(c)" />
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="['name', 'type', 'saldo', 'active']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['name', 'type', 'saldo', 'active']"></tr>
          </table>
        </div>
      </mat-tab>

      <mat-tab label="Formas de pagamento">
        <div class="tab-content">
          <form [formGroup]="formaPagamentoForm" (ngSubmit)="salvarFormaPagamento()" class="inline-form">
            <mat-form-field appearance="outline">
              <mat-label>Nome</mat-label>
              <input matInput formControlName="name" />
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit" [disabled]="formaPagamentoForm.invalid">Adicionar</button>
          </form>

          <table mat-table [dataSource]="formasPagamento()" class="full-width">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nome</th>
              <td mat-cell *matCellDef="let f">{{ f.name }}</td>
            </ng-container>
            <ng-container matColumnDef="active">
              <th mat-header-cell *matHeaderCellDef>Ativa</th>
              <td mat-cell *matCellDef="let f">
                <mat-slide-toggle [checked]="f.active" (change)="alternarFormaPagamento(f)" />
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="['name', 'active']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['name', 'active']"></tr>
          </table>
        </div>
      </mat-tab>

      <mat-tab label="Ciclos">
        <div class="tab-content">
          <form [formGroup]="cicloForm" (ngSubmit)="salvarCiclo()" class="inline-form">
            <mat-form-field appearance="outline">
              <mat-label>Rótulo</mat-label>
              <input matInput formControlName="label" placeholder="Ex: Ciclo 18-20/09" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Início</mat-label>
              <input matInput [matDatepicker]="pickerInicio" formControlName="start_date" />
              <mat-datepicker-toggle matSuffix [for]="pickerInicio" />
              <mat-datepicker #pickerInicio />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Fim</mat-label>
              <input matInput [matDatepicker]="pickerFim" formControlName="end_date" />
              <mat-datepicker-toggle matSuffix [for]="pickerFim" />
              <mat-datepicker #pickerFim />
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit" [disabled]="cicloForm.invalid">Criar ciclo</button>
          </form>

          @if (cicloError()) {
            <p class="error">{{ cicloError() }}</p>
          }

          <table mat-table [dataSource]="ciclos()" class="full-width">
            <ng-container matColumnDef="label">
              <th mat-header-cell *matHeaderCellDef>Ciclo</th>
              <td mat-cell *matCellDef="let c">{{ c.label }}</td>
            </ng-container>
            <ng-container matColumnDef="periodo">
              <th mat-header-cell *matHeaderCellDef>Período</th>
              <td mat-cell *matCellDef="let c">{{ c.start_date | date: 'dd/MM' }} — {{ c.end_date | date: 'dd/MM/yyyy' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let c">{{ statusLabel(c.status) }}</td>
            </ng-container>
            <ng-container matColumnDef="acoes">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let c">
                @if (proximoStatus(c.status); as proximo) {
                  <button mat-button (click)="avancarCiclo(c)">Avançar para "{{ statusLabel(proximo) }}"</button>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="['label', 'periodo', 'status', 'acoes']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['label', 'periodo', 'status', 'acoes']"></tr>
          </table>
        </div>
      </mat-tab>
    </mat-tab-group>
  `,
  styles: `
    .tab-content {
      padding: 16px 4px;
    }
    .inline-form {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .full-width {
      width: 100%;
    }
    .error {
      color: #c62828;
      font-size: 0.85rem;
    }
  `,
})
export class ConfiguracoesPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ConfiguracoesService);
  private readonly snackBar = inject(MatSnackBar);

  readonly categorias = signal<Tables<'transaction_categories'>[]>([]);
  readonly subcategorias = signal<Tables<'transaction_subcategories'>[]>([]);
  readonly contas = signal<Tables<'financial_accounts'>[]>([]);
  readonly formasPagamento = signal<Tables<'payment_methods'>[]>([]);
  readonly ciclos = signal<Tables<'cycles'>[]>([]);
  readonly cicloError = signal<string | null>(null);

  readonly categoriaForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    type: ['income' as 'income' | 'expense', Validators.required],
  });

  readonly subcategoriaForm = this.fb.nonNullable.group({
    category_id: ['', Validators.required],
    name: ['', Validators.required],
  });

  readonly contaForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    type: ['bank' as 'bank' | 'cash' | 'other', Validators.required],
    initial_balance: [0, Validators.required],
  });

  readonly formaPagamentoForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  readonly cicloForm = this.fb.nonNullable.group({
    label: ['', Validators.required],
    start_date: [new Date(), Validators.required],
    end_date: [new Date(), Validators.required],
  });

  async ngOnInit(): Promise<void> {
    await this.recarregarTudo();
  }

  private async recarregarTudo(): Promise<void> {
    const [categorias, subcategorias, contas, formasPagamento, ciclos] = await Promise.all([
      this.service.listarCategorias(),
      this.service.listarSubcategorias(),
      this.service.listarContas(),
      this.service.listarFormasPagamento(),
      this.service.listarCiclos(),
    ]);
    this.categorias.set(categorias);
    this.subcategorias.set(subcategorias);
    this.contas.set(contas);
    this.formasPagamento.set(formasPagamento);
    this.ciclos.set(ciclos);
  }

  nomeCategoria(categoryId: string): string {
    return this.categorias().find((c) => c.id === categoryId)?.name ?? '—';
  }

  statusLabel(status: string): string {
    return CICLO_STATUS_LABEL[status] ?? status;
  }

  proximoStatus(status: string): string | null {
    return CICLO_PROXIMO_STATUS[status] ?? null;
  }

  async salvarCategoria(): Promise<void> {
    if (this.categoriaForm.invalid) return;
    await this.service.criarCategoria(this.categoriaForm.getRawValue());
    this.categoriaForm.reset({ name: '', type: 'income' });
    this.categorias.set(await this.service.listarCategorias());
    this.snackBar.open('Categoria criada.', 'OK', { duration: 2500 });
  }

  async alternarCategoria(categoria: Tables<'transaction_categories'>): Promise<void> {
    await this.service.atualizarCategoria(categoria.id, { active: !categoria.active });
    this.categorias.set(await this.service.listarCategorias());
  }

  async salvarSubcategoria(): Promise<void> {
    if (this.subcategoriaForm.invalid) return;
    await this.service.criarSubcategoria(this.subcategoriaForm.getRawValue());
    this.subcategoriaForm.reset({ category_id: '', name: '' });
    this.subcategorias.set(await this.service.listarSubcategorias());
    this.snackBar.open('Subcategoria criada.', 'OK', { duration: 2500 });
  }

  async alternarSubcategoria(subcategoria: Tables<'transaction_subcategories'>): Promise<void> {
    await this.service.atualizarSubcategoria(subcategoria.id, { active: !subcategoria.active });
    this.subcategorias.set(await this.service.listarSubcategorias());
  }

  async salvarConta(): Promise<void> {
    if (this.contaForm.invalid) return;
    await this.service.criarConta(this.contaForm.getRawValue());
    this.contaForm.reset({ name: '', type: 'bank', initial_balance: 0 });
    this.contas.set(await this.service.listarContas());
    this.snackBar.open('Conta financeira criada.', 'OK', { duration: 2500 });
  }

  async alternarConta(conta: Tables<'financial_accounts'>): Promise<void> {
    await this.service.atualizarConta(conta.id, { active: !conta.active });
    this.contas.set(await this.service.listarContas());
  }

  async salvarFormaPagamento(): Promise<void> {
    if (this.formaPagamentoForm.invalid) return;
    await this.service.criarFormaPagamento(this.formaPagamentoForm.getRawValue());
    this.formaPagamentoForm.reset({ name: '' });
    this.formasPagamento.set(await this.service.listarFormasPagamento());
    this.snackBar.open('Forma de pagamento criada.', 'OK', { duration: 2500 });
  }

  async alternarFormaPagamento(forma: Tables<'payment_methods'>): Promise<void> {
    await this.service.atualizarFormaPagamento(forma.id, { active: !forma.active });
    this.formasPagamento.set(await this.service.listarFormasPagamento());
  }

  async salvarCiclo(): Promise<void> {
    if (this.cicloForm.invalid) return;
    this.cicloError.set(null);
    const value = this.cicloForm.getRawValue();

    try {
      await this.service.criarCiclo({
        label: value.label,
        start_date: toIsoDate(value.start_date),
        end_date: toIsoDate(value.end_date),
      });
      this.cicloForm.reset({ label: '', start_date: new Date(), end_date: new Date() });
      this.ciclos.set(await this.service.listarCiclos());
      this.snackBar.open('Ciclo criado.', 'OK', { duration: 2500 });
    } catch (err) {
      this.cicloError.set(
        err instanceof Error ? err.message : 'Erro ao criar ciclo (datas podem estar sobrepondo outro ciclo).',
      );
    }
  }

  async avancarCiclo(ciclo: Tables<'cycles'>): Promise<void> {
    const proximo = this.proximoStatus(ciclo.status);
    if (!proximo) return;
    await this.service.atualizarStatusCiclo(ciclo.id, proximo);
    this.ciclos.set(await this.service.listarCiclos());
  }
}
