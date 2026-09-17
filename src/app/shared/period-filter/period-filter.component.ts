import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

export type PeriodoSelecionado = {
  inicio: string;
  fim: string;
  rotulo: string;
};

type Preset = 'hoje' | 'semana' | 'mes' | '30d' | '90d' | 'ano' | 'personalizado';

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function calcularIntervalo(preset: Preset): { inicio: Date; fim: Date } {
  const hoje = new Date();
  const fim = new Date(hoje);
  let inicio = new Date(hoje);

  switch (preset) {
    case 'hoje':
      break;
    case 'semana':
      inicio.setDate(hoje.getDate() - hoje.getDay());
      break;
    case 'mes':
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      break;
    case '30d':
      inicio.setDate(hoje.getDate() - 29);
      break;
    case '90d':
      inicio.setDate(hoje.getDate() - 89);
      break;
    case 'ano':
      inicio = new Date(hoje.getFullYear(), 0, 1);
      break;
  }
  return { inicio, fim };
}

const PRESET_LABEL: Record<Preset, string> = {
  hoje: 'Hoje',
  semana: 'Esta semana',
  mes: 'Este mês',
  '30d': 'Últimos 30 dias',
  '90d': 'Últimos 90 dias',
  ano: 'Este ano',
  personalizado: 'Personalizado',
};

@Component({
  selector: 'app-period-filter',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
  ],
  template: `
    <form [formGroup]="form" class="period-filter">
      <mat-form-field appearance="outline" class="preset-field">
        <mat-label>Período</mat-label>
        <mat-select formControlName="preset" (selectionChange)="onPresetChange()">
          <mat-option value="hoje">Hoje</mat-option>
          <mat-option value="semana">Esta semana</mat-option>
          <mat-option value="mes">Este mês</mat-option>
          <mat-option value="30d">Últimos 30 dias</mat-option>
          <mat-option value="90d">Últimos 90 dias</mat-option>
          <mat-option value="ano">Este ano</mat-option>
          <mat-option value="personalizado">Personalizado</mat-option>
        </mat-select>
      </mat-form-field>

      @if (form.controls.preset.value === 'personalizado') {
        <mat-form-field appearance="outline">
          <mat-label>De</mat-label>
          <input matInput [matDatepicker]="pickerDe" formControlName="dataInicio" (dateChange)="emitir()" />
          <mat-datepicker-toggle matSuffix [for]="pickerDe" />
          <mat-datepicker #pickerDe />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Até</mat-label>
          <input matInput [matDatepicker]="pickerAte" formControlName="dataFim" (dateChange)="emitir()" />
          <mat-datepicker-toggle matSuffix [for]="pickerAte" />
          <mat-datepicker #pickerAte />
        </mat-form-field>
      }
    </form>
  `,
  styles: `
    .period-filter {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .preset-field {
      min-width: 180px;
    }
  `,
})
export class PeriodFilterComponent implements OnInit {
  @Output() readonly periodoAlterado = new EventEmitter<PeriodoSelecionado>();

  readonly form = new FormBuilder().nonNullable.group({
    preset: 'mes' as Preset,
    dataInicio: new Date(),
    dataFim: new Date(),
  });

  ngOnInit(): void {
    this.emitir();
  }

  onPresetChange(): void {
    if (this.form.controls.preset.value !== 'personalizado') {
      this.emitir();
    }
  }

  emitir(): void {
    const preset = this.form.controls.preset.value;
    if (preset === 'personalizado') {
      const inicio = this.form.controls.dataInicio.value;
      const fim = this.form.controls.dataFim.value;
      this.periodoAlterado.emit({ inicio: toIso(inicio), fim: toIso(fim), rotulo: 'Personalizado' });
      return;
    }
    const { inicio, fim } = calcularIntervalo(preset);
    this.periodoAlterado.emit({ inicio: toIso(inicio), fim: toIso(fim), rotulo: PRESET_LABEL[preset] });
  }
}
