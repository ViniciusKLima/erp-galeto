import { Component, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';

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
  template: `
    <mat-sidenav-container class="app-container">
      <mat-sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        #sidenav
        class="sidebar"
      >
        <div class="sidebar-logo">
          <img src="logo.png" alt="Galeto do Fofão" />
        </div>

        <nav class="sidebar-nav">
          @for (item of navItens; track item.path) {
            @if (!item.adminOnly || auth.isAdmin()) {
              <a
                class="nav-item"
                [routerLink]="item.path"
                routerLinkActive="nav-item-active"
                (click)="fecharNoMobile()"
              >
                <mat-icon>{{ item.icon }}</mat-icon>
                <span>{{ item.label }}</span>
              </a>
            }
          }
        </nav>

        <div class="sidebar-footer">
          @if (auth.profile(); as profile) {
            <div class="user-info">
              <span class="user-name">{{ profile.name }}</span>
              <span class="user-role">{{ profile.role === 'admin' ? 'Administrador' : 'Operador' }}</span>
            </div>
          }
          <button mat-icon-button (click)="signOut()" aria-label="Sair" title="Sair">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        @if (isMobile()) {
          <div class="mobile-bar">
            <button mat-icon-button (click)="sidenav.toggle()" aria-label="Abrir menu">
              <mat-icon>menu</mat-icon>
            </button>
            <img src="logo.png" alt="Galeto do Fofão" class="mobile-logo" />
          </div>
        }

        <div class="app-content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .app-container {
      height: 100vh;
      background: var(--brand-background);
    }
    .sidebar {
      width: 248px;
      border-right: 1px solid var(--brand-border);
      display: flex;
      flex-direction: column;
      background: var(--brand-surface);
      padding: 0;
    }
    .sidebar-logo {
      padding: 24px 20px 16px;
      display: flex;
      align-items: center;
    }
    .sidebar-logo img {
      height: 40px;
      width: auto;
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 8px 12px;
      flex: 1 1 auto;
      overflow-y: auto;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      color: var(--brand-ink-muted);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      border-left: 3px solid transparent;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .nav-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .nav-item:hover {
      background: var(--brand-background);
      color: var(--brand-ink);
    }
    .nav-item-active {
      background: var(--brand-primary-light);
      color: var(--brand-primary-dark);
      border-left-color: var(--brand-primary);
      font-weight: 600;
    }
    .sidebar-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 16px 20px;
      border-top: 1px solid var(--brand-border);
    }
    .user-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .user-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--brand-ink);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-role {
      font-size: 0.75rem;
      color: var(--brand-ink-muted);
    }
    .mobile-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      background: var(--brand-surface);
      border-bottom: 1px solid var(--brand-border);
      position: sticky;
      top: 0;
      z-index: 5;
    }
    .mobile-logo {
      height: 28px;
    }
    .app-content {
      padding: 24px;
      min-height: 100%;
      box-sizing: border-box;
    }
    @media (max-width: 640px) {
      .app-content {
        padding: 16px;
      }
    }
  `,
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
