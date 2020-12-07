import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListeComponent } from './components/liste/liste.component';
import { ManageComponent } from './components/manage/manage.component';
import { ManageItemComponent } from './components/manage-item/manage-item.component';
import { EditItemComponent } from './components/manage-item/edit-item/edit-item.component';
import { DumpDatabaseComponent } from './components/dump-database/dump-database.component';

const routes: Routes = [
  { path: '', redirectTo: 'Liste', pathMatch: 'full' },
  { path: 'Liste', component: ListeComponent },
  { path: 'Liste/:id', component: ListeComponent },
  { path: 'Manage', component: ManageComponent },
  { path: 'ManageItem/:id', component: ManageItemComponent },
  { path: 'EditItem/:id/:itemid', component: EditItemComponent },
  { path: 'Dump', component: DumpDatabaseComponent },

  { path: '**', redirectTo: 'Liste' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
