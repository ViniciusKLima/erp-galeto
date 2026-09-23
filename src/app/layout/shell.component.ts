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
        <div class="sidebar-brand">
          <img src="favicon.png" alt="" class="brand-mark" />
          <span class="brand-name">Galeto do Fofão</span>
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

        <div class="sidebar-account">
          @if (auth.profile(); as profile) {
            <div class="account-avatar">{{ profile.name.charAt(0).toUpperCase() }}</div>
            <div class="user-info">
              <span class="user-name">{{ profile.name }}</span>
              <span class="user-role">{{ profile.role === 'admin' ? 'Administrador' : 'Operador' }}</span>
            </div>
          }
          <button class="sair-btn" (click)="signOut()" aria-label="Sair" title="Sair">
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
            <img src="favicon.png" alt="" class="mobile-mark" />
            <span class="mobile-name">Galeto do Fofão</span>
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
      width: 260px;
      display: flex;
      flex-direction: column;
      background: var(--brand-primary);
      padding: 0;
    }

    /* marca — ícone da identidade (mesmo azul do fundo, some no fundo) + nome em texto.
       Testamos usar logo.png inteiro em branco sólido (filtro brightness(0) invert(1)),
       mas o desenho entrelaça o galo com as letras usando a própria cor pra separar as
       formas — virou uma mancha ilegível quando achatado pra uma cor só. O ícone isolado
       (favicon.png) é a mesma arte, sem esse problema. */
    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 22px 20px 18px;
      flex: 0 0 auto;
    }
    .brand-mark {
      height: 30px;
      width: 30px;
      border-radius: 7px;
      display: block;
      flex: none;
    }
    .brand-name {
      color: #fff;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.01em;
      line-height: 1.15;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* navegação — itens alinhados à esquerda, centralizada verticalmente no espaço
       disponível entre a marca e a conta, sem fundo próprio fora dos estados */
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: center;
      gap: 4px;
      padding: 8px 12px;
      flex: 1 1 auto;
      overflow-y: auto;
    }
    .nav-item {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.72);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      position: relative;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .nav-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex: none;
    }
    .nav-item:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }
    .nav-item:focus-visible {
      outline: 2px solid rgba(255, 255, 255, 0.85);
      outline-offset: -2px;
      color: #fff;
    }
    .nav-item-active {
      background: rgba(255, 255, 255, 0.14);
      color: #fff;
      font-weight: 600;
    }
    .nav-item-active::before {
      content: '';
      position: absolute;
      left: -12px;
      top: 8px;
      bottom: 8px;
      width: 3px;
      border-radius: 0 3px 3px 0;
      background: var(--brand-amber);
    }
    .nav-item[aria-disabled='true'] {
      color: rgba(255, 255, 255, 0.35);
      pointer-events: none;
    }

    /* conta do usuário — mesmo fundo da sidebar, só um separador sutil */
    .sidebar-account {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.16);
      flex: 0 0 auto;
    }
    .account-avatar {
      flex: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.16);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .user-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      flex: 1 1 auto;
      min-width: 0;
    }
    .user-name {
      font-size: 0.825rem;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-role {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.65);
    }
    .sair-btn {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: transparent;
      color: rgba(255, 255, 255, 0.75);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .sair-btn:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
    }
    .sair-btn:focus-visible {
      outline: 2px solid rgba(255, 255, 255, 0.85);
      outline-offset: 1px;
    }
    .sair-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .mobile-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
      background: var(--brand-primary);
      position: sticky;
      top: 0;
      z-index: 5;
    }
    .mobile-bar ::ng-deep .mat-mdc-icon-button {
      color: #fff;
    }
    .mobile-mark {
      height: 24px;
      width: 24px;
      border-radius: 6px;
      display: block;
    }
    .mobile-name {
      color: #fff;
      font-size: 0.9rem;
      font-weight: 700;
    }

    .app-content {
      padding: 24px 20px;
      min-height: 100%;
      box-sizing: border-box;
    }
    @media (min-width: 900px) {
      .app-content {
        padding: 32px 40px;
      }
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
