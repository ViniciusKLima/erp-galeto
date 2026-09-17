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
          <div class="logo-plate">
            <img src="logo.png" alt="Galeto do Fofão" />
          </div>

          @if (auth.profile(); as profile) {
            <div class="user-info">
              <span class="user-name">{{ profile.name }}</span>
              <span class="user-role">{{ profile.role === 'admin' ? 'Administrador' : 'Operador' }}</span>
            </div>
          }

          <button class="sair-btn" (click)="signOut()" aria-label="Sair" title="Sair">
            <mat-icon>logout</mat-icon>
            <span>Sair</span>
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        @if (isMobile()) {
          <div class="mobile-bar">
            <button mat-icon-button (click)="sidenav.toggle()" aria-label="Abrir menu">
              <mat-icon>menu</mat-icon>
            </button>
            <div class="mobile-logo-plate">
              <img src="logo.png" alt="Galeto do Fofão" class="mobile-logo" />
            </div>
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
      display: flex;
      flex-direction: column;
      background: var(--brand-primary);
      padding: 0;
      box-shadow: 2px 0 8px rgba(28, 74, 99, 0.15);
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: stretch;
      gap: 4px;
      padding: 24px 16px;
      flex: 1 1 auto;
      overflow-y: auto;
    }
    .nav-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 11px 14px;
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.82);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .nav-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .nav-item:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
    }
    .nav-item-active {
      background: #fff;
      color: var(--brand-primary-dark);
      font-weight: 600;
      box-shadow: 0 2px 6px rgba(28, 74, 99, 0.25);
    }
    .sidebar-footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 20px 16px 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      text-align: center;
    }
    .logo-plate {
      background: #fff;
      border-radius: 14px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(28, 74, 99, 0.2);
    }
    .logo-plate img {
      height: 36px;
      width: auto;
      display: block;
    }
    .user-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow: hidden;
      max-width: 100%;
    }
    .user-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .user-role {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.75);
    }
    .sair-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 7px 16px;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .sair-btn:hover {
      background: rgba(255, 255, 255, 0.22);
    }
    .sair-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .mobile-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      background: var(--brand-primary);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      position: sticky;
      top: 0;
      z-index: 5;
    }
    .mobile-bar ::ng-deep .mat-mdc-icon-button {
      color: #fff;
    }
    .mobile-logo-plate {
      background: #fff;
      border-radius: 10px;
      padding: 4px 10px;
      display: flex;
      align-items: center;
    }
    .mobile-logo {
      height: 24px;
      width: auto;
      display: block;
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
