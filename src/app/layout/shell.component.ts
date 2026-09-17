import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <mat-sidenav-container class="app-container">
      <mat-sidenav mode="side" opened class="app-sidenav">
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/movimentacoes" routerLinkActive="active-link">
            <mat-icon matListItemIcon>receipt_long</mat-icon>
            <span matListItemTitle>Movimentações</span>
          </a>
          <a mat-list-item routerLink="/contas-a-pagar" routerLinkActive="active-link">
            <mat-icon matListItemIcon>arrow_upward</mat-icon>
            <span matListItemTitle>Contas a pagar</span>
          </a>
          <a mat-list-item routerLink="/contas-a-receber" routerLinkActive="active-link">
            <mat-icon matListItemIcon>arrow_downward</mat-icon>
            <span matListItemTitle>Contas a receber</span>
          </a>
          <a mat-list-item routerLink="/estoque" routerLinkActive="active-link">
            <mat-icon matListItemIcon>inventory_2</mat-icon>
            <span matListItemTitle>Estoque</span>
          </a>
          <a mat-list-item routerLink="/dividas" routerLinkActive="active-link">
            <mat-icon matListItemIcon>account_balance</mat-icon>
            <span matListItemTitle>Dívidas e credores</span>
          </a>
          <a mat-list-item routerLink="/relatorios" routerLinkActive="active-link">
            <mat-icon matListItemIcon>bar_chart</mat-icon>
            <span matListItemTitle>Relatórios</span>
          </a>
          @if (auth.isAdmin()) {
            <a mat-list-item routerLink="/configuracoes" routerLinkActive="active-link">
              <mat-icon matListItemIcon>settings</mat-icon>
              <span matListItemTitle>Configurações</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span>Galeteria — Gestão Financeira</span>
          <span class="spacer"></span>
          @if (auth.profile(); as profile) {
            <span class="user-name">{{ profile.name }}</span>
          }
          <button mat-icon-button (click)="signOut()" aria-label="Sair">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>

        <div class="app-content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .app-container {
      height: 100vh;
    }
    .app-sidenav {
      width: 220px;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .user-name {
      margin-right: 12px;
      font-size: 0.9rem;
    }
    .app-content {
      padding: 24px;
    }
    .active-link {
      font-weight: 600;
    }
  `,
})
export class ShellComponent {
  protected readonly auth = inject(AuthService);

  async signOut(): Promise<void> {
    await this.auth.signOut();
    window.location.href = '/login';
  }
}
