import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListeComponent } from './components/list/liste-menu/liste-menu.component';
import { ConsolidatedViewComponent } from './components/list/consolidated-view/consolidated-view.component';

const routes: Routes = [
  { path: '', redirectTo: 'Consolidated', pathMatch: 'full' },
  { path: 'Liste', component: ListeComponent },
  { path: 'Liste/:id', component: ListeComponent },
  { path: 'Consolidated', component: ConsolidatedViewComponent },

  { path: 'Manage', loadChildren: () => import('./modules/config.module').then(m => m.ConfigModule) },

  { path: '**', redirectTo: 'Consolidated' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
