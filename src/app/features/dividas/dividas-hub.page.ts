import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ContasAPagarPage } from '../contas/contas-a-pagar.page';
import { ContasAReceberPage } from '../contas/contas-a-receber.page';
import { DividasPage } from './dividas.page';

@Component({
  selector: 'app-dividas-hub-page',
  standalone: true,
  imports: [MatTabsModule, PageHeaderComponent, ContasAPagarPage, ContasAReceberPage, DividasPage],
  template: `
    <div class="page-shell">
      <app-page-header title="Dívidas" subtitle="Contas a pagar, a receber e dívidas com credores." />

      <div class="surface-card">
        <mat-tab-group animationDuration="150ms">
          <mat-tab label="A pagar">
            <div class="tab-content">
              <app-contas-a-pagar-page />
            </div>
          </mat-tab>
          <mat-tab label="A receber">
            <div class="tab-content">
              <app-contas-a-receber-page />
            </div>
          </mat-tab>
          <mat-tab label="Credores">
            <div class="tab-content">
              <app-dividas-page />
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: `
    .tab-content {
      padding: 20px 4px 4px;
    }
  `,
})
export class DividasHubPage {}
