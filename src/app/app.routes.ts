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
        path: 'contas-a-pagar',
        loadComponent: () => import('./features/contas/contas-a-pagar.page').then((m) => m.ContasAPagarPage),
      },
      {
        path: 'contas-a-receber',
        loadComponent: () => import('./features/contas/contas-a-receber.page').then((m) => m.ContasAReceberPage),
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
