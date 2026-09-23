import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';

type NavItem = {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'space_dashboard' },
  { path: '/movimentacoes', label: 'Movimentações', icon: 'receipt_long' },
  { path: '/estoque', label: 'Estoque e Insumos', icon: 'inventory_2' },
  { path: '/dividas', label: 'Dívidas', icon: 'account_balance_wallet' },
  { path: '/relatorios', label: 'Relatórios', icon: 'bar_chart' },
  { path: '/configuracoes', label: 'Configurações', icon: 'settings', adminOnly: true },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  protected readonly auth = inject(AuthService);

  readonly navItens = NAV_ITEMS;

  fecharNoMobile(): void {
    // handled by routerLink navigation; sidenav em modo "over" fecha ao navegar via overlay backdrop.
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
    window.location.href = '/login';
  }
}
