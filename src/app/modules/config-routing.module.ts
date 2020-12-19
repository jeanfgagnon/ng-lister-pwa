import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageComponent } from 'src/app/components/management/manage/manage.component';
import { EditItemComponent } from '../components/management/manage-item/edit-item/edit-item.component';
import { ManageItemComponent } from '../components/management/manage-item/manage-item.component';

const routes: Routes = [
  { path: '', component: ManageComponent },
  { path: 'ManageItem/:id', component: ManageItemComponent },
  { path: 'EditItem/:id/:itemid', component: EditItemComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigRoutingModule { }
