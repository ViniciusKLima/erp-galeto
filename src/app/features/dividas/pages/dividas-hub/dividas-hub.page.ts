import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { ContasAPagarPage } from '../../components/contas-a-pagar/contas-a-pagar.page';
import { ContasAReceberPage } from '../../components/contas-a-receber/contas-a-receber.page';
import { DividasPage } from '../../components/dividas/dividas.page';

@Component({
  selector: 'app-dividas-hub-page',
  standalone: true,
  imports: [MatTabsModule, PageHeaderComponent, ContasAPagarPage, ContasAReceberPage, DividasPage],
  templateUrl: './dividas-hub.page.html',
  styleUrl: './dividas-hub.page.scss',
})
export class DividasHubPage {}
