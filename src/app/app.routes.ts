import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'movimentacoes',
        loadComponent: () =>
          import('./features/movimentacoes/movimentacoes-list.page').then((m) => m.MovimentacoesListPage),
      },
      {
        path: 'estoque',
        loadComponent: () => import('./features/estoque/estoque.page').then((m) => m.EstoquePage),
      },
      {
        path: 'dividas',
        loadComponent: () => import('./features/dividas/dividas-hub.page').then((m) => m.DividasHubPage),
      },
      {
        path: 'relatorios',
        loadComponent: () => import('./features/relatorios/relatorios.page').then((m) => m.RelatoriosPage),
      },
      {
        path: 'configuracoes',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/configuracoes/configuracoes.page').then((m) => m.ConfiguracoesPage),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
