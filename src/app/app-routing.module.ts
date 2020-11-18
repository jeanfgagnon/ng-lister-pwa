import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListeComponent } from './components/liste/liste.component';
import { ManageItemComponent } from './components/manage-item/manage-item.component';
import { ManageListComponent } from './components/manage-list/manage-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'Liste', pathMatch: 'full' },
  { path: 'Liste', component: ListeComponent },
  { path: 'ManageList', component: ManageListComponent },
  { path: 'ManageItem/:id', component: ManageItemComponent },

  { path: '**', redirectTo: 'Liste' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
