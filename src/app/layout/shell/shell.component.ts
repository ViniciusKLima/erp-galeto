import { Component, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
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
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MatSidenavModule, MatIconModule, MatButtonModule],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnDestroy {
  protected readonly auth = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly navItens = NAV_ITEMS;
  readonly isMobile = signal(false);

  private readonly subscription: Subscription;

  constructor() {
    this.subscription = this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape, Breakpoints.TabletPortrait])
      .subscribe((result) => this.isMobile.set(result.matches));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  fecharNoMobile(): void {
    // handled by routerLink navigation; sidenav em modo "over" fecha ao navegar via overlay backdrop.
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
    window.location.href = '/login';
  }
}
