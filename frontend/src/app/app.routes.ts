import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/verify/verify-page').then((m) => m.VerifyPage),
  },
];
