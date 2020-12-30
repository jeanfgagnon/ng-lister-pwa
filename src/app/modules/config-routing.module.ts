import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DumpDatabaseComponent } from '../components/management/dump-database/dump-database.component';
import { ManageCategoryComponent } from '../components/management/manage-category/manage-category.component';
import { EditItemComponent } from '../components/management/manage-item/edit-item/edit-item.component';
import { ManageItemComponent } from '../components/management/manage-item/manage-item.component';
import { ManageListComponent } from '../components/management/manage-list/manage-list.component';
import { RestoreDatabaseComponent } from '../components/management/restore-database/restore-database.component';
import { EditSettingsComponent } from '../components/management/edit-settings/edit-settings.component';
import { FreshInstallComponent } from '../components/management/fresh-install/fresh-install.component';

const routes: Routes = [
  { path: 'ManageLists', component: ManageListComponent },
  { path: 'ManageCategories', component: ManageCategoryComponent },
  { path: 'ManageItem/:id', component: ManageItemComponent },
  { path: 'EditItem/:id/:itemid', component: EditItemComponent },
  { path: 'BackupDatabase', component: DumpDatabaseComponent },
  { path: 'RestoreDatabase', component: RestoreDatabaseComponent },
  { path: 'EditSettings', component: EditSettingsComponent },
  { path: 'FreshInstall', component: FreshInstallComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigRoutingModule { }
