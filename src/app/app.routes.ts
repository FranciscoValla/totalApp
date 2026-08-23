import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import ( "./shared/dashboard/dashboard").then ( (p) => p.Dashboard),
    children: [
      {
        path: 'notes',
        loadComponent: ()=> import ("./notesApp/pages/notes/notes").then ( p => p.Notes),
      },
      {
        path: 'reminders',
        loadComponent: ()=> import ( "./notesApp/pages/reminders/reminders").then( (p) => p.Reminders),
      },
      {
        path: 'bin',
        loadComponent: ()=> import ( "./notesApp/pages/bin/bin").then( (p) => p.Bin),
      },
      {
        path: '**',
        redirectTo: 'notes'
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import ( "./notesApp/pages/login/login").then ( (p) => p.Login),
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
